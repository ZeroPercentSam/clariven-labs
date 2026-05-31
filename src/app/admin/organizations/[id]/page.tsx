import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Check, FileText, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatDateTime } from '@/lib/format-datetime';
import { approveOrganization, rejectOrganization } from '@/lib/admin/organizations-actions';

export const dynamic = 'force-dynamic';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-cl-teal/10 text-cl-teal',
  approved: 'bg-emerald-50 text-emerald-600',
  rejected: 'bg-red-50 text-red-600',
  suspended: 'bg-amber-50 text-amber-600',
};

export default async function AdminOrganizationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, slug, legal_name, approval_status, billing_email, phone, created_at')
    .eq('id', id)
    .maybeSingle();
  if (!org) notFound();

  const [{ data: members }, { data: attestations }] = await Promise.all([
    supabase.from('org_members').select('org_role, user_id').eq('organization_id', id),
    supabase
      .from('org_attestations')
      .select(
        'id, legal_entity_name, research_context, institutional_affiliation, orcid_or_inst_id, file_path, file_name, status, rejection_reason, created_at',
      )
      .eq('organization_id', id)
      .order('created_at', { ascending: false }),
  ]);

  const memberIds = (members ?? []).map((m) => m.user_id);
  const { data: memberProfiles } = memberIds.length
    ? await supabase.from('profiles').select('id, email, full_name').in('id', memberIds)
    : { data: [] };
  const profileById = new Map((memberProfiles ?? []).map((p) => [p.id, p]));

  // Short-lived signed URLs for any uploaded attestation PDFs (private bucket).
  const atts = await Promise.all(
    (attestations ?? []).map(async (a) => {
      let signedUrl: string | null = null;
      if (a.file_path) {
        const { data } = await supabase.storage
          .from('org-attestations')
          .createSignedUrl(a.file_path, 600);
        signedUrl = data?.signedUrl ?? null;
      }
      return { ...a, signedUrl };
    }),
  );

  const isFinal = org.approval_status === 'approved';

  return (
    <div>
      <Link
        href="/admin/organizations"
        className="inline-flex items-center gap-1 text-sm text-cl-gray-500 hover:text-cl-navy mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Organizations
      </Link>

      <div className="flex items-center gap-3 mb-1">
        <h1 className="text-2xl font-bold text-cl-navy">{org.name}</h1>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[org.approval_status] ?? 'bg-cl-gray-100 text-cl-gray-600'}`}
        >
          {org.approval_status}
        </span>
      </div>
      <p className="text-cl-gray-500 text-xs font-mono mb-6">{org.slug}</p>

      {error === 'reason' ? (
        <p className="mb-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          A short reason is required to reject.
        </p>
      ) : null}

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-cl-gray-200 rounded-xl p-4">
          <h2 className="text-xs font-semibold tracking-wider text-cl-gray-500 uppercase mb-3">
            Organization
          </h2>
          <dl className="text-sm space-y-1.5">
            <Row label="Legal name" value={org.legal_name} />
            <Row label="Billing email" value={org.billing_email} />
            <Row label="Phone" value={org.phone} />
            <Row label="Created" value={formatDateTime(org.created_at)} />
          </dl>
        </div>
        <div className="bg-white border border-cl-gray-200 rounded-xl p-4">
          <h2 className="text-xs font-semibold tracking-wider text-cl-gray-500 uppercase mb-3">
            Members ({members?.length ?? 0})
          </h2>
          <ul className="text-sm space-y-1.5">
            {(members ?? []).map((m) => {
              const profile = profileById.get(m.user_id);
              return (
                <li key={m.user_id} className="flex items-center justify-between gap-2">
                  <span className="text-cl-navy truncate">
                    {profile?.full_name || profile?.email || m.user_id}
                  </span>
                  <span className="text-xs text-cl-gray-400 font-mono">{m.org_role}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <h2 className="text-sm font-semibold tracking-wider text-cl-gray-500 uppercase mb-3">
        Research-use attestation
      </h2>
      {atts.length === 0 ? (
        <p className="text-cl-gray-500 text-sm mb-6">No attestation submitted yet.</p>
      ) : (
        <div className="space-y-3 mb-8">
          {atts.map((a) => (
            <div key={a.id} className="bg-white border border-cl-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-cl-navy font-semibold">{a.legal_entity_name}</span>
                <span className="text-xs text-cl-gray-400">{formatDateTime(a.created_at)}</span>
              </div>
              <p className="text-sm text-cl-gray-600 whitespace-pre-wrap mb-2">
                {a.research_context}
              </p>
              <dl className="text-sm space-y-1">
                <Row label="Affiliation" value={a.institutional_affiliation} />
                <Row label="ORCID / inst. ID" value={a.orcid_or_inst_id} />
              </dl>
              {a.signedUrl ? (
                <a
                  href={a.signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-2 text-sm text-cl-teal hover:text-cl-teal-light"
                >
                  <FileText className="w-4 h-4" /> {a.file_name || 'View document'}
                </a>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {isFinal ? (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          This organization is approved — its members can order.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          <form action={approveOrganization} className="bg-white border border-cl-gray-200 rounded-xl p-4">
            <input type="hidden" name="org_id" value={org.id} />
            <h3 className="text-sm font-semibold text-cl-navy mb-2">Approve</h3>
            <p className="text-xs text-cl-gray-500 mb-3">Opens ordering for this organization.</p>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition"
            >
              <Check className="w-4 h-4" /> Approve organization
            </button>
          </form>

          <form action={rejectOrganization} className="bg-white border border-cl-gray-200 rounded-xl p-4">
            <input type="hidden" name="org_id" value={org.id} />
            <h3 className="text-sm font-semibold text-cl-navy mb-2">Reject</h3>
            <textarea
              name="reason"
              required
              minLength={3}
              maxLength={500}
              rows={2}
              placeholder="Reason shown to the organization owner."
              className="w-full px-3 py-2 mb-3 rounded-lg border border-cl-gray-200 text-sm text-cl-navy focus:outline-none focus:border-cl-teal/60"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition"
            >
              <X className="w-4 h-4" /> Reject
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-cl-gray-400 text-xs">{label}</dt>
      <dd className="text-cl-navy text-right truncate">{value || '—'}</dd>
    </div>
  );
}
