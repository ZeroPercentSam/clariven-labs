import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/roles';
import { getMembershipRequest } from '@/lib/memberships/queries';
import { setMembershipStatus } from '@/lib/memberships/admin-actions';
import {
  MEMBERSHIP_STATUSES,
  MEMBERSHIP_STATUS_LABELS,
  MEMBERSHIP_STATUS_STYLES,
  type MembershipStatus,
} from '@/lib/memberships/constants';
import { formatDate } from '@/lib/format-datetime';

export const dynamic = 'force-dynamic';

export default async function AdminMembershipDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { ok, error } = await searchParams;
  const req = await getMembershipRequest(id);
  if (!req) notFound();

  const fields: [string, string | null][] = [
    ['Email', req.email],
    ['Phone', req.phone],
    ['Proposed brand', req.proposed_brand],
    ['Source', req.source],
    ['Submitted', formatDate(req.created_at)],
  ];

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <Link href="/admin/memberships" className="text-sm text-cl-teal hover:text-cl-teal/80">
          &larr; Applications
        </Link>
        <div className="flex items-center gap-3 mt-2">
          <h1 className="text-2xl font-bold text-cl-navy">{req.full_name}</h1>
          <span
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${MEMBERSHIP_STATUS_STYLES[req.status as MembershipStatus]}`}
          >
            {MEMBERSHIP_STATUS_LABELS[req.status as MembershipStatus] ?? req.status}
          </span>
        </div>
      </div>

      {ok ? (
        <p className="text-sm text-cl-teal bg-cl-teal/5 border border-cl-teal/30 rounded-lg px-3 py-2">
          Application updated.
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      ) : null}

      <div className="bg-white border border-cl-gray-200 rounded-xl divide-y divide-cl-gray-100">
        {fields.map(([label, value]) => (
          <div key={label} className="flex gap-4 px-4 py-3">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-cl-gray-400 w-32 shrink-0 pt-0.5">
              {label}
            </span>
            <span className="text-sm text-cl-navy break-words">{value || '—'}</span>
          </div>
        ))}
      </div>

      {req.message ? (
        <div className="bg-white border border-cl-gray-200 rounded-xl p-4">
          <p className="text-[11px] font-semibold tracking-wider uppercase text-cl-gray-400 mb-2">Message</p>
          <p className="text-sm text-cl-gray-700 whitespace-pre-wrap">{req.message}</p>
        </div>
      ) : null}

      <form action={setMembershipStatus} className="bg-white border border-cl-gray-200 rounded-xl p-5 space-y-4">
        <input type="hidden" name="id" value={req.id} />
        <div>
          <label className="block text-[11px] font-semibold tracking-wider uppercase text-cl-gray-500 mb-1.5">
            Status
          </label>
          <select
            name="status"
            defaultValue={req.status}
            className="w-full bg-white border border-cl-gray-200 rounded-lg px-3 py-2 text-sm text-cl-navy focus:outline-none focus:border-cl-teal/60"
          >
            {MEMBERSHIP_STATUSES.map((s) => (
              <option key={s} value={s}>
                {MEMBERSHIP_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold tracking-wider uppercase text-cl-gray-500 mb-1.5">
            Internal notes
          </label>
          <textarea
            name="notes"
            rows={3}
            defaultValue={req.notes ?? ''}
            className="w-full bg-white border border-cl-gray-200 rounded-lg px-3 py-2 text-sm text-cl-navy focus:outline-none focus:border-cl-teal/60 resize-none"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 text-[12px] font-semibold tracking-wider text-white bg-cl-teal rounded-lg hover:bg-cl-teal/90 transition uppercase"
        >
          Save
        </button>
      </form>
    </div>
  );
}
