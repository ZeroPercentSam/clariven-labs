import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/roles';
import { listMembershipRequests } from '@/lib/memberships/queries';
import {
  MEMBERSHIP_STATUSES,
  MEMBERSHIP_STATUS_LABELS,
  MEMBERSHIP_STATUS_STYLES,
  type MembershipStatus,
} from '@/lib/memberships/constants';
import { formatDate } from '@/lib/format-datetime';

export const metadata = { title: 'Applications — Admin' };
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

export default async function AdminMembershipsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status } = await searchParams;
  const active = (MEMBERSHIP_STATUSES as readonly string[]).includes(status ?? '')
    ? (status as MembershipStatus)
    : null;

  const all = await listMembershipRequests();
  const counts = Object.fromEntries(MEMBERSHIP_STATUSES.map((s) => [s, 0])) as Record<
    MembershipStatus,
    number
  >;
  for (const r of all) if (r.status in counts) counts[r.status as MembershipStatus] += 1;
  const rows = active ? all.filter((r) => r.status === active) : all;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-cl-navy">Applications</h1>
        <a
          href={`/admin/memberships/export${active ? `?status=${active}` : ''}`}
          className="px-4 py-2 text-[12px] font-semibold tracking-wider text-cl-navy border border-cl-gray-200 rounded-lg hover:bg-cl-gray-50 transition uppercase"
        >
          Export CSV
        </a>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Chip href="/admin/memberships" label={`All (${all.length})`} active={!active} />
        {MEMBERSHIP_STATUSES.map((s) => (
          <Chip
            key={s}
            href={`/admin/memberships?status=${s}`}
            label={`${MEMBERSHIP_STATUS_LABELS[s]} (${counts[s]})`}
            active={active === s}
          />
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="bg-white border border-cl-gray-200 rounded-xl p-10 text-center text-cl-gray-500 text-sm">
          No applications{active ? ` with status “${MEMBERSHIP_STATUS_LABELS[active]}”` : ' yet'}.
        </div>
      ) : (
        <div className="bg-white border border-cl-gray-200 rounded-xl divide-y divide-cl-gray-100">
          {rows.map((r) => (
            <Link
              key={r.id}
              href={`/admin/memberships/${r.id}`}
              className="flex items-center gap-4 px-4 py-4 hover:bg-cl-gray-50 transition"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-cl-navy font-semibold truncate">{r.full_name}</p>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${MEMBERSHIP_STATUS_STYLES[r.status as MembershipStatus]}`}
                  >
                    {MEMBERSHIP_STATUS_LABELS[r.status as MembershipStatus] ?? r.status}
                  </span>
                </div>
                <p className="text-xs text-cl-gray-400 font-mono truncate">{r.email}</p>
                {r.proposed_brand ? (
                  <p className="text-xs text-cl-gray-500 mt-0.5 truncate">Brand: {r.proposed_brand}</p>
                ) : null}
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
