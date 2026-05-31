'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/roles';
import { supabaseEnvConfigured } from '@/lib/supabase/env';

// Admin approve/reject of an organization's research-use attestation. Plain
// authenticated UPDATEs gated by the is_admin() RLS on organizations +
// org_attestations (no dedicated RPC needed); every decision writes
// admin_audit_log. Approving flips the approval gate open for that org's
// members; rejecting records a reviewer note the owner sees on /onboarding/pending.

async function review(orgId: string, decision: 'approved' | 'rejected', reason: string | null) {
  const adminProfile = await requireAdmin(); // throws unless staff
  const supabase = await createClient();

  const { error: orgErr } = await supabase
    .from('organizations')
    .update({ approval_status: decision })
    .eq('id', orgId);
  if (orgErr) throw new Error(orgErr.message);

  // Mirror the decision onto the org's attestation(s) + stamp the reviewer.
  await supabase
    .from('org_attestations')
    .update({
      status: decision,
      rejection_reason: decision === 'rejected' ? reason : null,
      reviewed_by: adminProfile.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('organization_id', orgId);

  await supabase.from('admin_audit_log').insert({
    actor_id: adminProfile.id,
    action: `organization.${decision}`,
    target_type: 'organization',
    target_id: orgId,
    payload: reason ? { reason } : {},
  });

  revalidatePath('/admin/organizations');
  revalidatePath(`/admin/organizations/${orgId}`);
}

export async function approveOrganization(formData: FormData) {
  if (!supabaseEnvConfigured()) redirect('/admin/organizations?error=unavailable');
  const orgId = String(formData.get('org_id') ?? '');
  if (!orgId) redirect('/admin/organizations?error=missing');
  await review(orgId, 'approved', null);
  redirect('/admin/organizations?reviewed=approved');
}

export async function rejectOrganization(formData: FormData) {
  if (!supabaseEnvConfigured()) redirect('/admin/organizations?error=unavailable');
  const orgId = String(formData.get('org_id') ?? '');
  const reason = String(formData.get('reason') ?? '').trim();
  if (!orgId) redirect('/admin/organizations?error=missing');
  if (reason.length < 3) redirect(`/admin/organizations/${orgId}?error=reason`);
  await review(orgId, 'rejected', reason);
  redirect('/admin/organizations?reviewed=rejected');
}
