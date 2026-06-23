import Link from 'next/link';
import { listMyOrderRequests } from '@/lib/orders/queries';
import {
  ORDER_REQUEST_STATUS_LABELS,
  ORDER_REQUEST_STATUS_STYLES,
  ORDER_REQUEST_KIND_LABELS,
  type OrderRequestStatus,
} from '@/lib/orders/constants';
import { formatDate } from '@/lib/format-datetime';

export const metadata = { title: 'Orders — Clariven Labs' };
export const dynamic = 'force-dynamic';

export default async function PortalOrdersPage() {
  const rows = await listMyOrderRequests();

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cl-navy">Orders</h1>
          <p className="text-sm text-cl-gray-500 mt-1">
            Request your initial product selection or a reorder. Clariven reviews and fulfills.
          </p>
        </div>
        <Link
          href="/portal/orders/new"
          className="px-4 py-2 text-[12px] font-semibold tracking-wider text-white bg-cl-teal rounded-lg hover:bg-cl-teal/90 transition uppercase whitespace-nowrap"
        >
          New request
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white border border-cl-gray-200 rounded-xl p-10 text-center">
          <p className="text-cl-navy font-semibold mb-1">No requests yet</p>
          <p className="text-sm text-cl-gray-500 mb-4">
            Pick your products to send Clariven your first order request.
          </p>
          <Link href="/portal/orders/new" className="text-sm text-cl-teal hover:text-cl-teal/80">
            Start a request →
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-cl-gray-200 rounded-xl divide-y divide-cl-gray-100">
          {rows.map((r) => (
            <Link
              key={r.id}
              href={`/portal/orders/${r.id}`}
              className="flex items-center gap-4 px-4 py-4 hover:bg-cl-gray-50 transition"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-cl-navy font-semibold">
                    {ORDER_REQUEST_KIND_LABELS[r.kind as 'initial' | 'reorder']}
                  </p>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ORDER_REQUEST_STATUS_STYLES[r.status as OrderRequestStatus]}`}
                  >
                    {ORDER_REQUEST_STATUS_LABELS[r.status as OrderRequestStatus]}
                  </span>
                </div>
                <p className="text-xs text-cl-gray-500">
                  {r.itemCount} item{r.itemCount === 1 ? '' : 's'}
                </p>
              </div>
              <span className="text-xs text-cl-gray-400 whitespace-nowrap">{formatDate(r.created_at)}</span>
              <span className="text-cl-gray-300 text-lg shrink-0">→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
