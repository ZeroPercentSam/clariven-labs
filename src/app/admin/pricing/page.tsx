import { products } from '@/lib/products';
import { createClient } from '@/lib/supabase/server';
import { PricingEditor } from '@/components/admin/PricingEditor';

export const dynamic = 'force-dynamic';

export default async function AdminPricingPage() {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from('product_prices')
    .select('*')
    .order('product_slug', { ascending: true });

  const priceBySku = new Map<string, (typeof existing extends (infer T)[] | null ? T : never) | undefined>();
  for (const row of existing ?? []) priceBySku.set(`${row.product_slug}::${row.strength_label}`, row);

  const rows = products.flatMap((p) =>
    p.strengths.map((s) => {
      const price = priceBySku.get(`${p.slug}::${s}`);
      return {
        productSlug: p.slug,
        productName: p.name,
        strengthLabel: s,
        priceCents: price?.price_cents ?? null,
        active: price?.active ?? false,
      };
    }),
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-cl-navy mb-2">Pricing</h1>
      <p className="text-cl-gray-500 text-sm mb-6">
        Set a price per strength. Inactive rows aren't shown to customers.
      </p>
      <PricingEditor initialRows={rows} />
    </div>
  );
}
