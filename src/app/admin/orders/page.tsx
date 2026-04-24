import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { OrderStatusBadge } from '@/components/portal/OrderStatusBadge';

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
    .select(
      'id, order_number, status, total_cents, created_at, gbp_paid_at, user_id, affiliate_id',
    )
    .order('created_at', { ascending: false })
    .limit(200);
  if (status && status !== 'all') query = query.eq('status', status);
  if (q) {
    const asNum = Number.parseInt(q, 10);
    if (Number.isFinite(asNum)) query = query.eq('order_number', asNum);
  }
  const { data: orders } = await query;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-cl-navy">Orders</h1>
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
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-cl-navy text-white text-sm"
          >
            Filter
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-cl-gray-200 overflow-hidden">
        {!orders || orders.length === 0 ? (
          <p className="px-5 py-8 text-sm text-cl-gray-500 text-center">No orders match.</p>
        ) : (
          <ul className="divide-y divide-cl-gray-100">
            {orders.map((o) => (
              <li key={o.id} className="flex items-center gap-4 px-5 py-3">
                <Link
                  href={`/admin/orders/${o.id}`}
                  className="flex-1 text-cl-navy hover:text-cl-teal font-medium text-sm"
                >
                  Order #{o.order_number}
                </Link>
                <div className="w-24 text-right text-sm text-cl-navy">
                  ${(o.total_cents / 100).toFixed(2)}
                </div>
                <div className="w-44 text-xs text-cl-gray-500 text-right">
                  {new Date(o.created_at).toLocaleString()}
                </div>
                <OrderStatusBadge status={o.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
