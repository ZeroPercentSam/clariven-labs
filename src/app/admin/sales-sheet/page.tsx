import { products, productCategories } from '@/lib/products';
import { createClient } from '@/lib/supabase/server';
import { marginCents, marginPct, RUO_MARKUP_MULTIPLIER } from '@/lib/pricing';
import { Lock } from 'lucide-react';

export const dynamic = 'force-dynamic';

function usd(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

type Line = {
  name: string;
  slug: string;
  strength: string;
  cogs: number;
  price: number;
};

export default async function AdminSalesSheetPage() {
  const supabase = await createClient();
  // Admin-only read (RLS price_admin_read). cogs_cents never leaves this surface.
  const { data: prices } = await supabase
    .from('product_prices')
    .select('product_slug, strength_label, price_cents, cogs_cents, active');

  const bySku = new Map<string, { price: number; cogs: number | null; active: boolean }>();
  for (const p of prices ?? []) {
    bySku.set(`${p.product_slug}::${p.strength_label}`, {
      price: p.price_cents,
      cogs: p.cogs_cents,
      active: p.active,
    });
  }

  // Group priced SKUs by category, in catalog order.
  const categoriesWithLines = productCategories
    .filter((c) => c.id !== 'all')
    .map((cat) => {
      const lines: Line[] = [];
      for (const product of products.filter((p) => p.category === cat.id)) {
        for (const strength of product.strengths) {
          const row = bySku.get(`${product.slug}::${strength}`);
          if (!row || row.cogs == null) continue;
          lines.push({
            name: product.name,
            slug: product.slug,
            strength,
            cogs: row.cogs,
            price: row.price,
          });
        }
      }
      return { cat, lines };
    })
    .filter((g) => g.lines.length > 0);

  const allLines = categoriesWithLines.flatMap((g) => g.lines);
  const grand = {
    cogs: allLines.reduce((s, l) => s + l.cogs, 0),
    price: allLines.reduce((s, l) => s + l.price, 0),
  };
  const grandMargin = grand.price - grand.cogs;
  const grandPct = grand.price > 0 ? (grandMargin / grand.price) * 100 : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-cl-navy mb-2">Sales Sheet</h1>
      <div className="flex items-start gap-2 rounded-lg bg-cl-navy/5 border border-cl-navy/10 p-3 mb-6">
        <Lock className="w-4 h-4 text-cl-navy/60 mt-0.5 shrink-0" />
        <p className="text-sm text-cl-navy/70">
          <strong>Internal — my eyes only.</strong> Cost of goods, retail (cost &times;{' '}
          {RUO_MARKUP_MULTIPLIER}), and profit per SKU. Never shown to customers. {allLines.length}{' '}
          priced SKUs across {categoriesWithLines.length} categories.
        </p>
      </div>

      {/* Grand totals */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total cost', value: usd(grand.cogs) },
          { label: 'Total retail', value: usd(grand.price) },
          { label: 'Total profit', value: usd(grandMargin) },
          { label: 'Blended margin', value: `${grandPct.toFixed(1)}%` },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-white border border-cl-gray-200 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-cl-gray-400 mb-1">
              {s.label}
            </p>
            <p className="text-xl font-bold text-cl-navy tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-8">
        {categoriesWithLines.map(({ cat, lines }) => {
          const catCogs = lines.reduce((s, l) => s + l.cogs, 0);
          const catPrice = lines.reduce((s, l) => s + l.price, 0);
          const catMargin = catPrice - catCogs;
          return (
            <section key={cat.id} className="bg-white border border-cl-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-cl-gray-200 bg-cl-gray-50">
                <h2 className="text-sm font-semibold text-cl-navy">{cat.name}</h2>
                <span className="text-xs text-cl-gray-400 tabular-nums">
                  profit {usd(catMargin)}
                </span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] font-semibold uppercase tracking-wider text-cl-gray-400">
                    <th className="text-left font-semibold px-4 py-2">Product</th>
                    <th className="text-left font-semibold px-2 py-2">Strength</th>
                    <th className="text-right font-semibold px-2 py-2">Cost</th>
                    <th className="text-right font-semibold px-2 py-2">Retail</th>
                    <th className="text-right font-semibold px-2 py-2">Profit</th>
                    <th className="text-right font-semibold px-4 py-2">Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cl-gray-100">
                  {lines.map((l) => {
                    const m = marginCents(l.price, l.cogs) ?? 0;
                    const pct = marginPct(l.price, l.cogs);
                    return (
                      <tr key={`${l.slug}::${l.strength}`} className="text-cl-navy">
                        <td className="px-4 py-2">
                          <span className="font-medium">{l.name}</span>
                          <span className="block text-xs text-cl-gray-400">{l.slug}</span>
                        </td>
                        <td className="px-2 py-2 text-cl-gray-600">{l.strength}</td>
                        <td className="px-2 py-2 text-right tabular-nums text-cl-gray-600">{usd(l.cogs)}</td>
                        <td className="px-2 py-2 text-right tabular-nums font-medium">{usd(l.price)}</td>
                        <td className="px-2 py-2 text-right tabular-nums text-cl-teal">{usd(m)}</td>
                        <td className="px-4 py-2 text-right tabular-nums text-cl-gray-500">
                          {pct == null ? '—' : `${pct.toFixed(0)}%`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-cl-gray-200 bg-cl-gray-50 font-semibold text-cl-navy">
                    <td className="px-4 py-2" colSpan={2}>
                      {lines.length} SKUs
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums">{usd(catCogs)}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{usd(catPrice)}</td>
                    <td className="px-2 py-2 text-right tabular-nums text-cl-teal">{usd(catMargin)}</td>
                    <td className="px-4 py-2" />
                  </tr>
                </tfoot>
              </table>
            </section>
          );
        })}
      </div>
    </div>
  );
}
