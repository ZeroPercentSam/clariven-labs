import { createClient } from '@/lib/supabase/server';
import { AdminOrdersTable } from '@/components/admin/AdminOrdersTable';

export const dynamic = 'force-dynamic';

const STATUS_FILTERS = [
  'all',
  'pending_payment',
  'processing',
  'paid',
  'preparing',
  'shipped',
  'delivered',
  'cancelled',
  'failed',
] as const;

export default async function AdminOrdersList({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const supabase = await createClient();
  let query = supabase
    .from('orders')
    .select('id, order_number, status, total_cents, created_at')
    .order('created_at', { ascending: false })
    .limit(200);
  if (status && status !== 'all') query = query.eq('status', status);
  if (q) {
    const asNum = Number.parseInt(q, 10);
    if (Number.isFinite(asNum)) query = query.eq('order_number', asNum);
  }
  const { data: orders } = await query;

  // CSV export carries the active filter so it exports what's on screen.
  const exportParams = new URLSearchParams();
  if (status && status !== 'all') exportParams.set('status', status);
  if (q) exportParams.set('q', q);
  const exportHref = `/admin/orders/export${
    exportParams.toString() ? `?${exportParams.toString()}` : ''
  }`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-cl-navy">Orders</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <form className="flex items-center gap-2">
            <select
              name="status"
              defaultValue={status ?? 'all'}
              className="px-3 py-1.5 rounded-lg border border-cl-gray-200 text-sm bg-white"
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              type="text"
              name="q"
              defaultValue={q ?? ''}
              placeholder="Order #"
              className="px-3 py-1.5 rounded-lg border border-cl-gray-200 text-sm bg-white"
            />
            <button type="submit" className="px-3 py-1.5 rounded-lg bg-cl-navy text-white text-sm">
              Filter
            </button>
          </form>
          <a
            href={exportHref}
            className="text-xs px-3 py-2 rounded-lg border border-cl-gray-200 text-cl-navy hover:bg-white"
          >
            Export CSV
          </a>
        </div>
      </div>

      <AdminOrdersTable orders={orders ?? []} />
    </div>
  );
}
