import { requireAdmin } from '@/lib/auth/roles';
import { getSalesDashboard } from '@/lib/admin/sales-analytics';
import { parseRange } from '@/lib/admin/sales-analytics-constants';
import { SalesRangeChips } from '@/components/admin/SalesRangeChips';

export const metadata = { title: 'Sales dashboard — Admin' };
export const dynamic = 'force-dynamic';

const usd = (c: number) => `$${(c / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default async function AdminSalesDashboard({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  await requireAdmin();
  const { range: rangeParam } = await searchParams;
  const range = parseRange(rangeParam);
  const { summary, series } = await getSalesDashboard(range);

  const peak = series.reduce((m, p) => Math.max(m, p.revenueCents), 0);

  const cards = [
    { label: `Revenue (paid, ${range}d)`, value: usd(summary.revenueCents) },
    { label: 'Paid orders', value: String(summary.paidOrders) },
    { label: 'Avg order value', value: usd(summary.avgOrderCents) },
    { label: 'Discounts given', value: usd(summary.discountCents) },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-cl-navy">Sales dashboard</h1>
        <SalesRangeChips current={range} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border border-cl-gray-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-cl-navy font-mono">{c.value}</p>
            <p className="text-xs text-cl-gray-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-cl-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-cl-navy">Daily paid revenue</h2>
          <p className="text-xs text-cl-gray-400">
            {summary.totalOrders} order{summary.totalOrders === 1 ? '' : 's'} placed in range
          </p>
        </div>

        {peak === 0 ? (
          <p className="py-10 text-center text-sm text-cl-gray-500">
            No paid orders in the last {range} days.
          </p>
        ) : (
          <>
            <div className="flex items-end gap-px h-36" role="img" aria-label="Daily paid revenue bars">
              {series.map((p) => (
                <div
                  key={p.date}
                  className="flex-1 min-w-[2px] bg-cl-teal/70 hover:bg-cl-teal rounded-t-sm transition-colors"
                  style={{ height: `${peak > 0 ? Math.max((p.revenueCents / peak) * 100, p.revenueCents > 0 ? 3 : 0) : 0}%` }}
                  title={`${p.date} — ${usd(p.revenueCents)} · ${p.orders} order${p.orders === 1 ? '' : 's'}`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between mt-2 text-[11px] text-cl-gray-400 font-mono">
              <span>{series[0]?.date}</span>
              <span>{series[series.length - 1]?.date}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
