import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/roles';
import { getRepDetail, listApprovedOrgs } from '@/lib/rep/admin-queries';
import {
  approveRep,
  suspendRep,
  reactivateRep,
  createAssignment,
  endAssignment,
} from '@/lib/rep/admin-actions';
import {
  REP_STATUS_LABELS,
  REP_PAYOUT_METHOD_LABELS,
  TAX_ID_KIND_LABELS,
  REP_BUSINESS_TYPE_LABELS,
  type RepStatus,
  type RepPayoutMethod,
  type TaxIdKind,
  type RepBusinessType,
} from '@/lib/rep/constants';
import { formatDate } from '@/lib/format-datetime';

export const metadata = { title: 'Rep detail — Admin' };
export const dynamic = 'force-dynamic';

function pctLabel(pct: number | null): string {
  return pct === null ? 'Default (20%)' : `${(pct * 100).toFixed(2)}%`;
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-cl-gray-400">{label}</p>
      <p className="text-sm text-cl-navy">{value || '—'}</p>
    </div>
  );
}

export default async function AdminRepDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { ok, error } = await searchParams;
  const detail = await getRepDetail(id);
  if (!detail) notFound();
  const { rep, assignments, consents } = detail;
  const status = (rep.status as RepStatus) ?? 'pending_invite';

  const orgs = status === 'active' ? await listApprovedOrgs() : [];
  const assignableOrgs = orgs.filter((o) => o.active_rep_id === null);

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/reps" className="text-sm text-cl-teal hover:text-cl-teal/80">
          &larr; Reps
        </Link>
        <h1 className="text-2xl font-bold text-cl-navy mt-2">
          {rep.legal_name || rep.email || 'Rep'}
        </h1>
        <p className="text-cl-gray-500 text-sm mt-1 font-mono">{rep.email}</p>
      </div>

      {ok ? (
        <p className="mb-4 text-sm text-cl-teal bg-cl-teal/5 border border-cl-teal/30 rounded-lg px-3 py-2">
          Done: {ok}
        </p>
      ) : null}
      {error ? (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error === 'reason'
            ? 'A reason is required.'
            : error === 'pct'
              ? 'Commission must be a percentage between 0 and 100.'
              : error}
        </p>
      ) : null}

      {/* Status + actions */}
      <div className="bg-white border border-cl-gray-200 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-cl-gray-400">Status</p>
            <p className="text-lg font-semibold text-cl-navy">{REP_STATUS_LABELS[status]}</p>
            {rep.suspended_reason ? (
              <p className="text-xs text-red-600 mt-1">{rep.suspended_reason}</p>
            ) : null}
          </div>
        </div>

        {status === 'pending_invite' ? (
          <p className="text-sm text-cl-gray-500">
            This rep accepted the invitation but hasn&apos;t submitted onboarding yet. You can
            approve once they reach &ldquo;Awaiting approval&rdquo;.
          </p>
        ) : null}

        {status === 'pending_review' ? (
          <div className="flex flex-wrap gap-3">
            <form action={approveRep}>
              <input type="hidden" name="rep_id" value={rep.id ?? ''} />
              <button
                type="submit"
                className="px-4 py-2 text-[12px] font-semibold tracking-wider text-white bg-cl-teal rounded-lg hover:bg-cl-teal/90 transition uppercase"
              >
                Approve
              </button>
            </form>
            <form action={suspendRep} className="flex items-center gap-2">
              <input type="hidden" name="rep_id" value={rep.id ?? ''} />
              <input
                name="reason"
                placeholder="Decline reason"
                className="bg-white border border-cl-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cl-teal/60"
              />
              <button type="submit" className="text-sm text-red-500 hover:text-red-600">
                Decline
              </button>
            </form>
          </div>
        ) : null}

        {status === 'active' ? (
          <form action={suspendRep} className="flex items-center gap-2">
            <input type="hidden" name="rep_id" value={rep.id ?? ''} />
            <input
              name="reason"
              placeholder="Suspension reason"
              className="bg-white border border-cl-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cl-teal/60"
            />
            <button type="submit" className="text-sm text-red-500 hover:text-red-600">
              Suspend
            </button>
          </form>
        ) : null}

        {status === 'suspended' ? (
          <form action={reactivateRep}>
            <input type="hidden" name="rep_id" value={rep.id ?? ''} />
            <button
              type="submit"
              className="px-4 py-2 text-[12px] font-semibold tracking-wider text-white bg-cl-teal rounded-lg hover:bg-cl-teal/90 transition uppercase"
            >
              Reactivate
            </button>
          </form>
        ) : null}
      </div>

      {/* Profile (masked) */}
      <div className="bg-white border border-cl-gray-200 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-cl-navy mb-4">Profile &amp; payout</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="Legal name" value={rep.legal_name} />
          <Field
            label="Tax ID type"
            value={rep.tax_id_kind ? TAX_ID_KIND_LABELS[rep.tax_id_kind as TaxIdKind] : null}
          />
          <Field
            label="Business type"
            value={
              rep.business_type ? REP_BUSINESS_TYPE_LABELS[rep.business_type as RepBusinessType] : null
            }
          />
          <Field
            label="Payout method"
            value={rep.payout_method ? REP_PAYOUT_METHOD_LABELS[rep.payout_method as RepPayoutMethod] : null}
          />
          <Field label="Payout account" value={rep.payout_account_masked} />
          <Field label="Phone" value={rep.phone} />
          <Field
            label="Address"
            value={
              rep.address_line1
                ? `${rep.address_line1}, ${rep.address_city ?? ''} ${rep.address_state ?? ''} ${rep.address_postal_code ?? ''}`
                : null
            }
          />
          <Field label="Onboarded" value={rep.onboarding_completed_at ? formatDate(rep.onboarding_completed_at) : null} />
          <Field label="Approved" value={rep.approved_at ? formatDate(rep.approved_at) : null} />
        </div>
        <p className="text-[11px] text-cl-gray-400 mt-4">
          Tax ID + payout reference are masked (never shown in admin). Stored encrypted-at-rest;
          locked after onboarding.
        </p>
      </div>

      {/* Org assignments */}
      <div className="bg-white border border-cl-gray-200 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-cl-navy mb-4">Organization assignments</h2>
        {assignments.length === 0 ? (
          <p className="text-sm text-cl-gray-500 mb-4">No assignments yet.</p>
        ) : (
          <div className="divide-y divide-cl-gray-100 mb-4">
            {assignments.map((a) => (
              <div key={a.id} className="flex items-center gap-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-cl-navy font-semibold truncate">
                    {a.org_name || a.organization_id}
                  </p>
                  <p className="text-xs text-cl-gray-400">
                    {pctLabel(a.commission_pct)} · started {formatDate(a.started_at)}
                    {a.ended_at ? ` · ended ${formatDate(a.ended_at)}` : ''}
                    {!a.commission_enabled ? ' · commissions disabled' : ''}
                  </p>
                </div>
                {a.ended_at ? (
                  <span className="text-[11px] text-cl-gray-400">Ended</span>
                ) : (
                  <form action={endAssignment} className="flex items-center gap-2">
                    <input type="hidden" name="assignment_id" value={a.id} />
                    <input type="hidden" name="rep_id" value={rep.id ?? ''} />
                    <input
                      name="reason"
                      placeholder="reason"
                      className="bg-white border border-cl-gray-200 rounded-lg px-2 py-1 text-xs w-28 focus:outline-none focus:border-cl-teal/60"
                    />
                    <button type="submit" className="text-xs text-red-500 hover:text-red-600">
                      End
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}

        {status === 'active' ? (
          assignableOrgs.length > 0 ? (
            <form
              action={createAssignment}
              className="flex flex-wrap items-end gap-3 border-t border-cl-gray-100 pt-4"
            >
              <input type="hidden" name="rep_id" value={rep.id ?? ''} />
              <label className="block">
                <span className="block text-[11px] uppercase tracking-wide text-cl-gray-400 mb-1">
                  Organization
                </span>
                <select
                  name="organization_id"
                  required
                  className="bg-white border border-cl-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cl-teal/60"
                >
                  {assignableOrgs.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="block text-[11px] uppercase tracking-wide text-cl-gray-400 mb-1">
                  Commission % (blank = default 20)
                </span>
                <input
                  name="commission_pct"
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  placeholder="20"
                  className="w-32 bg-white border border-cl-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cl-teal/60"
                />
              </label>
              <button
                type="submit"
                className="px-4 py-2 text-[12px] font-semibold tracking-wider text-white bg-cl-teal rounded-lg hover:bg-cl-teal/90 transition uppercase"
              >
                Assign org
              </button>
            </form>
          ) : (
            <p className="text-xs text-cl-gray-400 border-t border-cl-gray-100 pt-4">
              Every approved org already has an active rep. End an existing assignment to reassign.
            </p>
          )
        ) : (
          <p className="text-xs text-cl-gray-400 border-t border-cl-gray-100 pt-4">
            Approve the rep before assigning organizations.
          </p>
        )}
      </div>

      {/* Agreement consents */}
      <div className="bg-white border border-cl-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-cl-navy mb-4">Agreement consents</h2>
        {consents.length === 0 ? (
          <p className="text-sm text-cl-gray-500">No signed agreement on file.</p>
        ) : (
          <ul className="space-y-2">
            {consents.map((c, i) => (
              <li key={i} className="text-sm text-cl-navy">
                <span className="font-mono">{c.signed_legal_name}</span>{' '}
                <span className="text-cl-gray-400 text-xs">
                  signed {c.label ?? 'agreement'} on {formatDate(c.signed_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
