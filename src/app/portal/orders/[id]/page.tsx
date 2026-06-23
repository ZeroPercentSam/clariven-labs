import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMyOrderRequest } from '@/lib/orders/queries';
import {
  ORDER_REQUEST_STATUS_LABELS,
  ORDER_REQUEST_STATUS_STYLES,
  ORDER_REQUEST_KIND_LABELS,
  prettifyProductName,
  type OrderRequestStatus,
} from '@/lib/orders/constants';
import { formatDate } from '@/lib/format-datetime';

export const dynamic = 'force-dynamic';

export default async function PortalOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const req = await getMyOrderRequest(id);
  if (!req) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href="/portal/orders" className="text-sm text-cl-teal hover:text-cl-teal/80">
          &larr; Orders
        </Link>
        <div className="flex items-center gap-3 mt-2">
          <h1 className="text-2xl font-bold text-cl-navy">
            {ORDER_REQUEST_KIND_LABELS[req.kind as 'initial' | 'reorder']}
          </h1>
          <span
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${ORDER_REQUEST_STATUS_STYLES[req.status as OrderRequestStatus]}`}
          >
            {ORDER_REQUEST_STATUS_LABELS[req.status as OrderRequestStatus]}
          </span>
        </div>
        <p className="text-xs text-cl-gray-400 mt-1">Submitted {formatDate(req.created_at)}</p>
      </div>

      {req.note ? (
        <div className="bg-white border border-cl-gray-200 rounded-xl p-4">
          <p className="text-[11px] font-semibold tracking-wider uppercase text-cl-gray-400 mb-2">Note</p>
          <p className="text-sm text-cl-gray-700 whitespace-pre-wrap">{req.note}</p>
        </div>
      ) : null}

      <div>
        <h2 className="text-sm font-semibold text-cl-navy mb-3">Items ({req.items.length})</h2>
        <div className="bg-white border border-cl-gray-200 rounded-xl divide-y divide-cl-gray-100">
          {req.items.map((it) => (
            <div key={it.id} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-cl-navy">
                {prettifyProductName(it.product_slug)}{' '}
                <span className="text-cl-gray-400">· {it.strength_label}</span>
              </span>
              <span className="text-sm text-cl-gray-500 tabular-nums">×{it.quantity}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
