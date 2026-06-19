import Link from 'next/link';
import { ArrowRight, CircleAlert, Rocket, Users } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/roles';
import { listClients, type ClientListRow } from '@/lib/clients/queries';
import { formatDate } from '@/lib/format-datetime';
import {
  ENGAGEMENT_STATUSES,
  ENGAGEMENT_STATUS_LABELS,
  ENGAGEMENT_STATUS_STYLES,
  type EngagementStatus,
} from '@/lib/clients/constants';

export const metadata = { title: 'Overview — Admin' };
export const dynamic = 'force-dynamic';

type AttentionTone = 'red' | 'gold' | 'gray';
const CHIP: Record<AttentionTone, string> = {
  red: 'bg-red-500/10 text-red-700 ring-1 ring-red-600/20',
  gold: 'bg-cl-gold/15 text-cl-navy ring-1 ring-cl-gold/30',
  gray: 'bg-cl-gray-200 text-cl-gray-600 ring-1 ring-cl-gray-300',
};

function nextStepLabel(c: ClientListRow): string {
  if (c.currentPhaseTitle) return c.currentPhaseTitle;
  if (c.itemsTotal > 0 && c.itemsDone >= c.itemsTotal) return 'All steps complete';
  return 'Not started';
}

function attentionReasons(c: ClientListRow): { label: string; tone: AttentionTone }[] {
  const out: { label: string; tone: AttentionTone }[] = [];
  if (c.itemsBlocked > 0)
    out.push({ label: `${c.itemsBlocked} blocked item${c.itemsBlocked === 1 ? '' : 's'}`, tone: 'red' });
  if (c.status === 'launch_ready' || (c.pctComplete >= 100 && c.status !== 'live'))
    out.push({ label: 'Ready to go live', tone: 'gold' });
  if (c.status === 'paused') out.push({ label: 'Paused', tone: 'gray' });
  return out;
}

export default async function AdminHome() {
  await requireAdmin();
  const clients = await listClients();

  const counts: Record<EngagementStatus, number> = {
    onboarding: 0,
    launch_ready: 0,
    live: 0,
    paused: 0,
  };
  for (const c of clients) counts[c.status] += 1;

  const attention = clients
    .map((c) => ({ c, reasons: attentionReasons(c) }))
    .filter((x) => x.reasons.length > 0);

  // "Where the new clients are" — everyone still working through onboarding,
  // newest first so freshly-provisioned clients surface at the top.
  const pipeline = clients
    .filter((c) => c.status === 'onboarding' || c.status === 'launch_ready')
    .sort(
      (a, b) =>
        (b.startedAt ?? '').localeCompare(a.startedAt ?? '') || a.name.localeCompare(b.name),
    );

  const live = clients
    .filter((c) => c.status === 'live')
    .sort((a, b) => (b.launchedAt ?? '').localeCompare(a.launchedAt ?? ''));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-cl-navy">Overview</h1>
        <Link
          href="/admin/clients/new"
          className="px-4 py-2 text-[12px] font-semibold tracking-wider text-white bg-cl-teal rounded-lg hover:bg-cl-teal/90 transition uppercase"
        >
          Add client
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="bg-white border border-cl-gray-200 rounded-xl p-10 text-center text-cl-gray-500 text-sm">
          No clients yet.{' '}
          <Link href="/admin/clients/new" className="text-cl-teal hover:text-cl-teal/80 font-medium">
            Add your first client
          </Link>{' '}
          to provision their portal login and seed the onboarding checklist.
        </div>
      ) : (
        <>
          {/* Status strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {ENGAGEMENT_STATUSES.map((s) => (
              <Link
                key={s}
                href="/admin/clients"
                className="bg-white border border-cl-gray-200 rounded-xl p-4 hover:shadow-sm transition"
              >
                <p className="text-2xl font-bold text-cl-navy">{counts[s]}</p>
                <p className="text-xs text-cl-gray-500 mt-1">{ENGAGEMENT_STATUS_LABELS[s]}</p>
              </Link>
            ))}
          </div>

          {/* Needs attention */}
          {attention.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-cl-navy mb-3 inline-flex items-center gap-1.5">
                <CircleAlert className="w-4 h-4 text-amber-600" /> Needs attention
              </h2>
              <div className="bg-white border border-cl-gray-200 rounded-xl divide-y divide-cl-gray-100">
                {attention.map(({ c, reasons }) => (
                  <Link
                    key={c.orgId}
                    href={`/admin/clients/${c.orgId}`}
                    className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-cl-gray-50 transition"
                  >
                    <p className="text-sm text-cl-navy font-medium truncate">{c.name}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      {reasons.map((r) => (
                        <span
                          key={r.label}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${CHIP[r.tone]}`}
                        >
                          {r.label}
                        </span>
                      ))}
                      <span className="text-cl-gray-300">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Active onboarding pipeline */}
          <div className="bg-white rounded-xl border border-cl-gray-200 overflow-hidden mb-8">
            <div className="flex items-center justify-between px-5 py-3 border-b border-cl-gray-200">
              <h2 className="text-cl-navy font-semibold text-sm">
                Onboarding pipeline ({pipeline.length})
              </h2>
              <Link
                href="/admin/clients"
                className="text-xs text-cl-teal inline-flex items-center gap-1 hover:text-cl-teal/80"
              >
                All clients <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {pipeline.length === 0 ? (
              <p className="px-5 py-6 text-sm text-cl-gray-500">
                No clients are mid-onboarding. New clients appear here the moment you provision them.
              </p>
            ) : (
              <ul className="divide-y divide-cl-gray-100">
                {pipeline.map((c) => (
                  <li key={c.orgId}>
                    <Link
                      href={`/admin/clients/${c.orgId}`}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-cl-gray-50 transition"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <p className="text-sm text-cl-navy font-semibold truncate">{c.name}</p>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${ENGAGEMENT_STATUS_STYLES[c.status]}`}
                          >
                            {ENGAGEMENT_STATUS_LABELS[c.status]}
                          </span>
                          {c.itemsBlocked > 0 && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${CHIP.red}`}>
                              {c.itemsBlocked} blocked
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 flex-1 max-w-xs rounded-full bg-cl-gray-100 overflow-hidden">
                            <div className="h-full bg-cl-teal rounded-full" style={{ width: `${c.pctComplete}%` }} />
                          </div>
                          <span className="text-xs text-cl-gray-500 tabular-nums whitespace-nowrap">
                            {c.itemsDone}/{c.itemsTotal}
                          </span>
                        </div>
                        <p className="text-xs text-cl-gray-400 mt-1.5 truncate">
                          Next: {nextStepLabel(c)}
                        </p>
                      </div>
                      <span className="text-cl-gray-300 text-lg shrink-0">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recently live */}
          {live.length > 0 && (
            <div className="bg-white rounded-xl border border-cl-gray-200 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-cl-gray-200">
                <Rocket className="w-4 h-4 text-emerald-600" />
                <h2 className="text-cl-navy font-semibold text-sm">Live clients ({live.length})</h2>
              </div>
              <ul className="divide-y divide-cl-gray-100">
                {live.map((c) => (
                  <li key={c.orgId} className="flex items-center justify-between px-5 py-3">
                    <Link
                      href={`/admin/clients/${c.orgId}`}
                      className="text-sm text-cl-navy hover:text-cl-teal font-medium truncate"
                    >
                      {c.name}
                    </Link>
                    <span className="text-xs text-cl-gray-500 shrink-0">
                      {c.launchedAt ? `Live since ${formatDate(c.launchedAt)}` : 'Live'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <p className="mt-8 text-xs text-cl-gray-400 inline-flex items-center gap-1">
        <Users className="w-3.5 h-3.5" /> Admin seats: sam@ovington.io, katie@puritybiolabs.com
      </p>
    </div>
  );
}
