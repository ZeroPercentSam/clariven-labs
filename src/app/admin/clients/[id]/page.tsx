import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { requireAdmin } from '@/lib/auth/roles';
import { getClientOnboarding, getClientMembers, getClientOrg } from '@/lib/clients/queries';
import { getClientIntake } from '@/lib/clients/intake-queries';
import { BrandResearchForm } from '@/components/clients/BrandResearchForm';
import { BusinessDetailsForm } from '@/components/clients/BusinessDetailsForm';
import { setEngagementStatus, startOnboarding } from '@/lib/clients/actions';
import { AddClientForm } from '@/components/clients/AddClientForm';
import { OnboardingChecklist } from '@/components/clients/OnboardingChecklist';
import { OnboardingProgressRing } from '@/components/clients/OnboardingProgressRing';
import {
  ENGAGEMENT_STATUSES,
  ENGAGEMENT_STATUS_LABELS,
  ENGAGEMENT_STATUS_STYLES,
  CLIENT_MEMBER_ROLE_LABELS,
  type ClientMemberRole,
} from '@/lib/clients/constants';
import { formatDate } from '@/lib/format-datetime';

export const dynamic = 'force-dynamic';

export default async function AdminClientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { ok, error } = await searchParams;

  const [view, members, intake] = await Promise.all([
    getClientOnboarding(id),
    getClientMembers(id),
    getClientIntake(id),
  ]);
  const org = view?.org ?? (await getClientOrg(id));
  if (!org) notFound();

  const hdrs = await headers();
  const proto = hdrs.get('x-forwarded-proto') ?? 'https';
  const host = hdrs.get('host') ?? 'localhost:3000';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${proto}://${host}`;
  const loginUrl = `${siteUrl}/login`;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/clients" className="text-sm text-cl-teal hover:text-cl-teal/80">
          &larr; Clients
        </Link>
        <div className="flex items-center gap-3 mt-2">
          <h1 className="text-2xl font-bold text-cl-navy">{org.name}</h1>
          {view ? (
            <span
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${ENGAGEMENT_STATUS_STYLES[view.status]}`}
            >
              {ENGAGEMENT_STATUS_LABELS[view.status]}
            </span>
          ) : null}
        </div>
      </div>

      {ok ? (
        <p className="text-sm text-cl-teal bg-cl-teal/5 border border-cl-teal/30 rounded-lg px-3 py-2">
          {ok === 'status' ? 'Engagement status updated.' : ok === 'started' ? 'Onboarding started.' : 'Saved.'}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      ) : null}

      {!view ? (
        <div className="bg-white border border-cl-gray-200 rounded-xl p-6">
          <p className="text-sm text-cl-navy font-semibold mb-1">Onboarding not started</p>
          <p className="text-xs text-cl-gray-500 mb-4">
            Seed this client&apos;s 9-phase onboarding checklist to begin tracking progress.
          </p>
          <form action={startOnboarding}>
            <input type="hidden" name="org_id" value={org.id} />
            <button
              type="submit"
              className="px-4 py-2 text-[12px] font-semibold tracking-wider text-white bg-cl-teal rounded-lg hover:bg-cl-teal/90 transition uppercase"
            >
              Start onboarding
            </button>
          </form>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[200px_1fr] gap-6 items-start">
          {/* Progress + engagement control */}
          <div className="bg-white border border-cl-gray-200 rounded-xl p-5 flex flex-col items-center">
            <OnboardingProgressRing
              pct={view.pctComplete}
              caption={`${view.doneCount}/${view.totalCount} done`}
            />
            <p className="text-[11px] text-cl-gray-400 mt-2 text-center">
              Started {formatDate(view.startedAt)}
              {view.launchedAt ? ` · Live ${formatDate(view.launchedAt)}` : ''}
            </p>
            <form action={setEngagementStatus} className="w-full mt-4">
              <input type="hidden" name="org_id" value={org.id} />
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-cl-gray-500 mb-1.5">
                Engagement status
              </label>
              <select
                name="status"
                defaultValue={view.status}
                className="w-full bg-white border border-cl-gray-200 rounded-lg px-3 py-2 text-sm text-cl-navy focus:outline-none focus:border-cl-teal/60"
              >
                {ENGAGEMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {ENGAGEMENT_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="mt-2 w-full px-3 py-2 text-[11px] font-semibold tracking-wider text-cl-navy border border-cl-gray-200 rounded-lg hover:bg-cl-gray-50 transition uppercase"
              >
                Update status
              </button>
            </form>
          </div>

          {/* Checklist */}
          <div>
            {view.currentPhaseTitle ? (
              <p className="text-sm text-cl-gray-500 mb-3">
                Current phase: <span className="font-semibold text-cl-navy">{view.currentPhaseTitle}</span>
              </p>
            ) : (
              <p className="text-sm text-cl-teal mb-3 font-semibold">All onboarding steps complete 🎉</p>
            )}
            <OnboardingChecklist orgId={org.id} phases={view.phases} />
          </div>
        </div>
      )}

      {/* Client intake — editable by admin (writes the client's org via org_id). */}
      <div>
        <h2 className="text-sm font-semibold text-cl-navy mb-3">Client intake</h2>
        <div className="grid lg:grid-cols-2 gap-6 items-start">
          <BrandResearchForm intake={intake} orgId={org.id} />
          <BusinessDetailsForm intake={intake} orgId={org.id} />
        </div>
      </div>

      {/* Members + add member */}
      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <div>
          <h2 className="text-sm font-semibold text-cl-navy mb-3">Members ({members.length})</h2>
          {members.length === 0 ? (
            <p className="bg-white border border-cl-gray-200 rounded-xl p-5 text-sm text-cl-gray-500">
              No members yet.
            </p>
          ) : (
            <div className="bg-white border border-cl-gray-200 rounded-xl divide-y divide-cl-gray-100">
              {members.map((m) => (
                <div key={m.userId} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-cl-navy font-medium truncate">{m.fullName || '(no name)'}</p>
                    <p className="text-xs text-cl-gray-400 font-mono truncate">{m.email}</p>
                  </div>
                  <span className="text-[11px] text-cl-gray-500">
                    {CLIENT_MEMBER_ROLE_LABELS[(m.orgRole as ClientMemberRole) ?? 'buyer']}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-sm font-semibold text-cl-navy mb-3">Add a member</h2>
          <AddClientForm orgId={org.id} loginUrl={loginUrl} />
        </div>
      </div>
    </div>
  );
}
