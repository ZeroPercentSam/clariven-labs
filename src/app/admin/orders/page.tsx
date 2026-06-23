import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/roles';
import { listAllOrderRequests } from '@/lib/orders/queries';
import {
  ORDER_REQUEST_STATUSES,
  ORDER_REQUEST_STATUS_LABELS,
  ORDER_REQUEST_STATUS_STYLES,
  ORDER_REQUEST_KIND_LABELS,
  type OrderRequestStatus,
} from '@/lib/orders/constants';
import { formatDate } from '@/lib/format-datetime';

export const metadata = { title: 'Order requests — Admin' };
export const dynamic = 'force-dynamic';

function Chip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`text-xs px-3 py-1.5 rounded-full border transition ${
        active
          ? 'bg-cl-navy text-white border-cl-navy'
          : 'bg-white text-cl-gray-600 border-cl-gray-200 hover:border-cl-gray-300'
      }`}
    >
      {label}
    </Link>
  );
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status } = await searchParams;
  const active = (ORDER_REQUEST_STATUSES as readonly string[]).includes(status ?? '')
    ? (status as OrderRequestStatus)
    : null;

  const all = await listAllOrderRequests();
  const counts = Object.fromEntries(ORDER_REQUEST_STATUSES.map((s) => [s, 0])) as Record<
    OrderRequestStatus,
    number
  >;
  for (const r of all) if (r.status in counts) counts[r.status as OrderRequestStatus] += 1;
  const rows = active ? all.filter((r) => r.status === active) : all;

  return (
    <div>
      <h1 className="text-2xl font-bold text-cl-navy mb-6">Order requests</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        <Chip href="/admin/orders" label={`All (${all.length})`} active={!active} />
        {ORDER_REQUEST_STATUSES.map((s) => (
          <Chip
            key={s}
            href={`/admin/orders?status=${s}`}
            label={`${ORDER_REQUEST_STATUS_LABELS[s]} (${counts[s]})`}
            active={active === s}
          />
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="bg-white border border-cl-gray-200 rounded-xl p-10 text-center text-cl-gray-500 text-sm">
          No order requests{active ? ` with status “${ORDER_REQUEST_STATUS_LABELS[active]}”` : ' yet'}.
        </div>
      ) : (
        <div className="bg-white border border-cl-gray-200 rounded-xl divide-y divide-cl-gray-100">
          {rows.map((r) => (
            <Link
              key={r.id}
              href={`/admin/orders/${r.id}`}
              className="flex items-center gap-4 px-4 py-4 hover:bg-cl-gray-50 transition"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-cl-navy font-semibold truncate">{r.orgName ?? 'Unknown client'}</p>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${ORDER_REQUEST_STATUS_STYLES[r.status as OrderRequestStatus]}`}
                  >
                    {ORDER_REQUEST_STATUS_LABELS[r.status as OrderRequestStatus]}
                  </span>
                </div>
                <p className="text-xs text-cl-gray-500">
                  {ORDER_REQUEST_KIND_LABELS[r.kind as 'initial' | 'reorder']} · {r.itemCount} item
                  {r.itemCount === 1 ? '' : 's'}
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
