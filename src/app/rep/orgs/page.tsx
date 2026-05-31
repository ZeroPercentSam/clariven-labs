import { requireActiveRep, listMyAssignments, myOrgNames } from '@/lib/rep/portal-queries';
import { formatDate } from '@/lib/format-datetime';

export const metadata = { title: 'My organizations — Clariven Labs' };
export const dynamic = 'force-dynamic';

export default async function RepOrgsPage() {
  await requireActiveRep();
  const assignments = await listMyAssignments();
  const orgNames = await myOrgNames();

  return (
    <div>
      <h1 className="text-2xl font-bold text-cl-navy mb-6">My organizations</h1>
      {assignments.length === 0 ? (
        <div className="bg-white border border-cl-gray-200 rounded-xl p-10 text-center text-cl-gray-500 text-sm">
          No organization assignments yet. An admin assigns organizations to you.
        </div>
      ) : (
        <div className="bg-white border border-cl-gray-200 rounded-xl divide-y divide-cl-gray-100">
          {assignments.map((a) => (
            <div key={a.id} className="flex items-center gap-4 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-cl-navy font-semibold truncate">
                  {orgNames.get(a.organization_id) ?? '(organization)'}
                </p>
                <p className="text-xs text-cl-gray-400">
                  {a.commission_pct === null
                    ? 'Default rate (20%)'
                    : `${(Number(a.commission_pct) * 100).toFixed(2)}%`}{' '}
                  · since {formatDate(a.started_at)}
                  {a.ended_at ? ` · ended ${formatDate(a.ended_at)}` : ''}
                </p>
              </div>
              <span
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                  a.ended_at
                    ? 'bg-cl-gray-100 text-cl-gray-500'
                    : 'bg-cl-teal/10 text-cl-teal'
                }`}
              >
                {a.ended_at ? 'Ended' : 'Active'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
