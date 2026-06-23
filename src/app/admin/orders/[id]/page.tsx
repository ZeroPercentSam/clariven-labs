import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/roles';
import { getOrderRequest } from '@/lib/orders/queries';
import { setOrderRequestStatus } from '@/lib/orders/admin-actions';
import {
  ORDER_REQUEST_STATUSES,
  ORDER_REQUEST_STATUS_LABELS,
  ORDER_REQUEST_STATUS_STYLES,
  ORDER_REQUEST_KIND_LABELS,
  prettifyProductName,
  type OrderRequestStatus,
} from '@/lib/orders/constants';
import { formatDate } from '@/lib/format-datetime';

export const dynamic = 'force-dynamic';

export default async function AdminOrderDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { ok, error } = await searchParams;
  const req = await getOrderRequest(id);
  if (!req) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href="/admin/orders" className="text-sm text-cl-teal hover:text-cl-teal/80">
          &larr; Order requests
        </Link>
        <div className="flex items-center gap-3 mt-2">
          <h1 className="text-2xl font-bold text-cl-navy">{req.orgName ?? 'Unknown client'}</h1>
          <span
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${ORDER_REQUEST_STATUS_STYLES[req.status as OrderRequestStatus]}`}
          >
            {ORDER_REQUEST_STATUS_LABELS[req.status as OrderRequestStatus]}
          </span>
        </div>
        <p className="text-xs text-cl-gray-400 mt-1">
          {ORDER_REQUEST_KIND_LABELS[req.kind as 'initial' | 'reorder']} · submitted{' '}
          {formatDate(req.created_at)}
        </p>
      </div>

      {ok ? (
        <p className="text-sm text-cl-teal bg-cl-teal/5 border border-cl-teal/30 rounded-lg px-3 py-2">
          Status updated.
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      ) : null}

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
                <span className="text-cl-gray-400">· {it.strength_label}</span>{' '}
                <span className="text-cl-gray-300 font-mono text-xs">({it.product_slug})</span>
              </span>
              <span className="text-sm text-cl-gray-500 tabular-nums">×{it.quantity}</span>
            </div>
          ))}
        </div>
      </div>

      <form action={setOrderRequestStatus} className="bg-white border border-cl-gray-200 rounded-xl p-5">
        <input type="hidden" name="id" value={req.id} />
        <label className="block text-[11px] font-semibold tracking-wider uppercase text-cl-gray-500 mb-1.5">
          Status
        </label>
        <div className="flex gap-2">
          <select
            name="status"
            defaultValue={req.status}
            className="flex-1 bg-white border border-cl-gray-200 rounded-lg px-3 py-2 text-sm text-cl-navy focus:outline-none focus:border-cl-teal/60"
          >
            {ORDER_REQUEST_STATUSES.map((s) => (
              <option key={s} value={s}>
                {ORDER_REQUEST_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-4 py-2 text-[12px] font-semibold tracking-wider text-white bg-cl-teal rounded-lg hover:bg-cl-teal/90 transition uppercase"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
