'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/lib/cart/store';
import { products } from '@/lib/products';

type Props = {
  orderId: string;
  variant?: 'compact' | 'wide';
};

/**
 * One-tap reorder: pulls the order's line items, re-adds each at the
 * current product_prices price (not the original snapshot — customers
 * expect "today's price"), then routes to /cart. Items whose SKU is no
 * longer priced/active are skipped and surfaced in the toast.
 */
export function ReorderButton({ orderId, variant = 'compact' }: Props) {
  const router = useRouter();
  const { addLine } = useCart();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleReorder = () => {
    setError(null);
    startTransition(async () => {
      try {
        const supabase = createClient();
        const { data: items, error: itemsErr } = await supabase
          .from('order_items')
          .select('product_slug, product_name, strength_label, quantity')
          .eq('order_id', orderId);
        if (itemsErr || !items || items.length === 0) {
          setError(itemsErr?.message ?? 'No items to reorder.');
          return;
        }

        // Cost-safe read: list_public_prices() exposes retail only, never cogs_cents.
        const { data: prices } = await supabase.rpc('list_public_prices');

        const priceMap = new Map<string, number>();
        for (const p of prices ?? []) {
          priceMap.set(`${p.product_slug}::${p.strength_label}`, p.price_cents);
        }

        const productNameBySlug = new Map(products.map((p) => [p.slug, p.name]));
        let addedCount = 0;
        let skippedCount = 0;
        for (const it of items) {
          const key = `${it.product_slug}::${it.strength_label}`;
          const currentPrice = priceMap.get(key);
          if (currentPrice == null) {
            skippedCount += 1;
            continue;
          }
          addLine({
            productSlug: it.product_slug,
            productName: productNameBySlug.get(it.product_slug) ?? it.product_name,
            strengthLabel: it.strength_label,
            quantity: it.quantity,
            unitPriceCents: currentPrice,
          });
          addedCount += 1;
        }

        if (addedCount === 0) {
          setError('None of these items are available at current prices.');
          return;
        }

        const skipNote =
          skippedCount > 0
            ? ` (${skippedCount} unavailable at current prices)`
            : '';
        // Use sessionStorage to pass a confirmation note to /cart for display.
        try {
          sessionStorage.setItem(
            'cl_reorder_toast',
            `Added ${addedCount} item${addedCount === 1 ? '' : 's'} to your cart${skipNote}.`,
          );
        } catch {
          /* no-op */
        }
        router.push('/cart');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Reorder failed.');
      }
    });
  };

  return (
    <div className={variant === 'wide' ? 'w-full' : 'inline-flex flex-col items-end'}>
      <button
        type="button"
        onClick={handleReorder}
        disabled={pending}
        className={`inline-flex items-center justify-center gap-1.5 ${
          variant === 'wide'
            ? 'w-full px-4 py-2.5 text-sm'
            : 'px-3 py-1.5 text-xs'
        } rounded-lg border border-cl-teal/30 text-cl-teal font-semibold hover:bg-cl-teal/5 hover:border-cl-teal/60 transition disabled:opacity-50 disabled:cursor-not-allowed`}
        title="Add these items to your cart at current prices"
      >
        <RotateCcw className={variant === 'wide' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
        {pending ? 'Reordering…' : 'Reorder'}
      </button>
      {error ? <p className="text-[10px] text-red-500 mt-1">{error}</p> : null}
    </div>
  );
}
