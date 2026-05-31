import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/roles';
import { listReps, countByStatus, listRepInvitations } from '@/lib/rep/admin-queries';
import { revokeRepInvitation } from '@/lib/rep/admin-actions';
import { REP_STATUS_LABELS, type RepStatus } from '@/lib/rep/constants';
import { formatDate } from '@/lib/format-datetime';

export const metadata = { title: 'Reps — Admin' };
export const dynamic = 'force-dynamic';

const STATUS_STYLES: Record<RepStatus, string> = {
  pending_invite: 'bg-cl-gray-100 text-cl-gray-600',
  pending_review: 'bg-amber-100 text-amber-700',
  active: 'bg-cl-teal/10 text-cl-teal',
  suspended: 'bg-red-100 text-red-700',
};

const KPI_ORDER: RepStatus[] = ['pending_review', 'active', 'pending_invite', 'suspended'];

export default async function AdminRepsPage() {
  await requireAdmin();
  const reps = await listReps();
  const counts = countByStatus(reps);
  const invitations = await listRepInvitations();
  const pendingInvites = invitations.filter((i) => i.status === 'pending');

  // pending_review first, then active, then the rest.
  const order: Record<string, number> = { pending_review: 0, active: 1, pending_invite: 2, suspended: 3 };
  const sorted = [...reps].sort(
    (a, b) => (order[a.status ?? ''] ?? 9) - (order[b.status ?? ''] ?? 9),
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-cl-navy">Sales reps</h1>
        <Link
          href="/admin/reps/invite"
          className="px-4 py-2 text-[12px] font-semibold tracking-wider text-white bg-cl-teal rounded-lg hover:bg-cl-teal/90 transition uppercase"
        >
          Invite a rep
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {KPI_ORDER.map((s) => (
          <div key={s} className="bg-white border border-cl-gray-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-cl-navy">{counts[s]}</p>
            <p className="text-xs text-cl-gray-500 mt-1">{REP_STATUS_LABELS[s]}</p>
          </div>
        ))}
      </div>

      {pendingInvites.length > 0 ? (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-cl-navy mb-3">
            Pending invitations ({pendingInvites.length})
          </h2>
          <div className="bg-white border border-cl-gray-200 rounded-xl divide-y divide-cl-gray-100">
            {pendingInvites.map((inv) => (
              <div key={inv.id} className="flex items-center gap-4 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-cl-navy font-mono truncate">{inv.email}</p>
                  <p className="text-xs text-cl-gray-400">
                    Sent {formatDate(inv.created_at)} · expires {formatDate(inv.expires_at)}
                  </p>
                </div>
                <Link
                  href={`/admin/reps/invite?token=${inv.token}`}
                  className="text-xs text-cl-teal hover:text-cl-teal/80"
                >
                  Link
                </Link>
                <form action={revokeRepInvitation}>
                  <input type="hidden" name="invitation_id" value={inv.id} />
                  <button type="submit" className="text-xs text-cl-gray-400 hover:text-red-500">
                    Revoke
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <h2 className="text-sm font-semibold text-cl-navy mb-3">Reps ({reps.length})</h2>
      {sorted.length === 0 ? (
        <div className="bg-white border border-cl-gray-200 rounded-xl p-10 text-center text-cl-gray-500 text-sm">
          No reps yet. Invite one to get started.
        </div>
      ) : (
        <div className="bg-white border border-cl-gray-200 rounded-xl divide-y divide-cl-gray-100">
          {sorted.map((r) => (
            <Link
              key={r.id}
              href={`/admin/reps/${r.id}`}
              className="flex items-center gap-4 px-4 py-3 hover:bg-cl-gray-50 transition"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-cl-navy font-semibold truncate">
                  {r.legal_name || r.email || '(no name yet)'}
                </p>
                <p className="text-xs text-cl-gray-400 font-mono truncate">{r.email}</p>
              </div>
              <span
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                  STATUS_STYLES[(r.status as RepStatus) ?? 'pending_invite']
                }`}
              >
                {REP_STATUS_LABELS[(r.status as RepStatus) ?? 'pending_invite']}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
