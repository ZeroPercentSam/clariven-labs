import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/roles';
import { listClients } from '@/lib/clients/queries';
import {
  ENGAGEMENT_STATUSES,
  ENGAGEMENT_STATUS_LABELS,
  ENGAGEMENT_STATUS_STYLES,
  type EngagementStatus,
} from '@/lib/clients/constants';

export const metadata = { title: 'Clients — Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminClientsPage() {
  await requireAdmin();
  const clients = await listClients();

  const counts: Record<EngagementStatus, number> = {
    onboarding: 0,
    launch_ready: 0,
    live: 0,
    paused: 0,
  };
  for (const c of clients) counts[c.status] += 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-cl-navy">Clients</h1>
        <Link
          href="/admin/clients/new"
          className="px-4 py-2 text-[12px] font-semibold tracking-wider text-white bg-cl-teal rounded-lg hover:bg-cl-teal/90 transition uppercase"
        >
          Add client
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {ENGAGEMENT_STATUSES.map((s) => (
          <div key={s} className="bg-white border border-cl-gray-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-cl-navy">{counts[s]}</p>
            <p className="text-xs text-cl-gray-500 mt-1">{ENGAGEMENT_STATUS_LABELS[s]}</p>
          </div>
        ))}
      </div>

      <h2 className="text-sm font-semibold text-cl-navy mb-3">All clients ({clients.length})</h2>
      {clients.length === 0 ? (
        <div className="bg-white border border-cl-gray-200 rounded-xl p-10 text-center text-cl-gray-500 text-sm">
          No clients yet. Add one to provision their portal login and onboarding checklist.
        </div>
      ) : (
        <div className="bg-white border border-cl-gray-200 rounded-xl divide-y divide-cl-gray-100">
          {clients.map((c) => (
            <Link
              key={c.orgId}
              href={`/admin/clients/${c.orgId}`}
              className="flex items-center gap-4 px-4 py-4 hover:bg-cl-gray-50 transition"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <p className="text-sm text-cl-navy font-semibold truncate">{c.name}</p>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${ENGAGEMENT_STATUS_STYLES[c.status]}`}
                  >
                    {ENGAGEMENT_STATUS_LABELS[c.status]}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 flex-1 max-w-xs rounded-full bg-cl-gray-100 overflow-hidden">
                    <div className="h-full bg-cl-teal rounded-full" style={{ width: `${c.pctComplete}%` }} />
                  </div>
                  <span className="text-xs text-cl-gray-500 tabular-nums whitespace-nowrap">
                    {c.itemsDone}/{c.itemsTotal}
                  </span>
                </div>
                {c.currentPhaseTitle ? (
                  <p className="text-xs text-cl-gray-400 mt-1.5 truncate">Up next: {c.currentPhaseTitle}</p>
                ) : (
                  <p className="text-xs text-cl-teal mt-1.5">Onboarding complete 🎉</p>
                )}
              </div>
              <span className="text-cl-gray-300 text-lg shrink-0">→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
