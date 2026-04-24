'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, ShoppingCart } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/lib/cart/store';

type Price = { strength_label: string; price_cents: number };

export function AddToCartControl({
  productSlug,
  productName,
  strengths,
}: {
  productSlug: string;
  productName: string;
  strengths: string[];
}) {
  const [prices, setPrices] = useState<Price[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStrength, setSelectedStrength] = useState<string>(strengths[0] ?? '');
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const { addLine } = useCart();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('product_prices')
          .select('strength_label, price_cents')
          .eq('product_slug', productSlug)
          .eq('active', true);
        if (!cancelled) setPrices(data ?? []);
      } catch {
        if (!cancelled) setPrices([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productSlug]);

  const priceMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of prices ?? []) m.set(p.strength_label, p.price_cents);
    return m;
  }, [prices]);

  const unitPriceCents = priceMap.get(selectedStrength);
  const canAdd = typeof unitPriceCents === 'number' && qty > 0;

  const handleAdd = () => {
    if (!canAdd || unitPriceCents === undefined) return;
    addLine({
      productSlug,
      productName,
      strengthLabel: selectedStrength,
      quantity: qty,
      unitPriceCents,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  if (loading) {
    return (
      <div className="h-40 rounded-xl bg-cl-gray-50 border border-cl-gray-200 animate-pulse" />
    );
  }

  const hasAnyPrice = (prices ?? []).length > 0;

  return (
    <div className="rounded-xl bg-cl-gray-50 border border-cl-gray-200 p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-cl-gray-400 uppercase tracking-wider mb-3">
          Available Strengths
        </h3>
        <div className="flex flex-wrap gap-2">
          {strengths.map((str) => {
            const priced = priceMap.has(str);
            const selected = str === selectedStrength;
            return (
              <button
                key={str}
                type="button"
                onClick={() => priced && setSelectedStrength(str)}
                disabled={!priced}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
                  selected
                    ? 'bg-cl-teal text-white border-cl-teal'
                    : priced
                      ? 'bg-white text-cl-navy border-cl-gray-200 hover:border-cl-teal/30 hover:bg-cl-teal/5'
                      : 'bg-cl-gray-100 text-cl-gray-400 border-cl-gray-200 cursor-not-allowed'
                }`}
                aria-pressed={selected}
              >
                {str}
                {!priced && <span className="ml-2 text-[10px] uppercase tracking-wider">No price</span>}
              </button>
            );
          })}
        </div>
      </div>

      {hasAnyPrice && typeof unitPriceCents === 'number' ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold text-cl-navy">
              ${(unitPriceCents / 100).toFixed(2)}
            </div>
            <div className="flex items-center border border-cl-gray-200 rounded-lg overflow-hidden bg-white">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-9 h-10 text-cl-gray-500 hover:bg-cl-gray-50"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                max={99}
                value={qty}
                onChange={(e) => {
                  const v = Number.parseInt(e.target.value, 10);
                  if (!Number.isFinite(v)) return;
                  setQty(Math.min(99, Math.max(1, v)));
                }}
                className="w-12 h-10 text-center text-sm text-cl-navy bg-white outline-none"
              />
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQty((q) => Math.min(99, q + 1))}
                className="w-9 h-10 text-cl-gray-500 hover:bg-cl-gray-50"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleAdd}
              disabled={!canAdd}
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cl-teal text-white font-semibold hover:bg-cl-teal-light transition-all duration-300 shadow-lg shadow-cl-teal/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {justAdded ? (
                <>
                  <Check className="w-5 h-5" />
                  Added
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Add to order
                </>
              )}
            </button>
            <Link
              href="/cart"
              className="inline-flex items-center gap-1 text-cl-teal text-sm font-medium hover:text-cl-teal-light"
            >
              View cart
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm text-cl-gray-500">
            Pricing is set by our team. Request a quote and we'll get back to you with strengths and availability.
          </p>
          <Link
            href="/contact"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cl-teal text-white font-semibold text-sm hover:bg-cl-teal-light transition"
          >
            Request a quote
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
