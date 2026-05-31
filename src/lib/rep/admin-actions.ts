'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/roles';
import { supabaseEnvConfigured } from '@/lib/supabase/env';
import type { Database, Json } from '@/lib/database.types';

type SalesRepUpdate = Database['public']['Tables']['sales_reps']['Update'];

// Admin rep-program management. Plain authenticated mutations gated by the
// is_admin() RLS on sales_reps / rep_invitations / rep_org_assignments (admin
// also bypasses the sales_reps locked-columns trigger). Every decision writes
// admin_audit_log — mirrors organizations-actions.ts.

async function audit(
  actorId: string,
  action: string,
  targetType: string,
  targetId: string,
  payload: Json = {},
) {
  const supabase = await createClient();
  await supabase.from('admin_audit_log').insert({
    actor_id: actorId,
    action,
    target_type: targetType,
    target_id: targetId,
    payload,
  });
}

export async function inviteRep(formData: FormData): Promise<void> {
  if (!supabaseEnvConfigured()) redirect('/admin/reps/invite?error=unavailable');
  const admin = await requireAdmin();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const note = String(formData.get('invitation_note') ?? '').trim();
  if (!email || !email.includes('@')) redirect('/admin/reps/invite?error=email');

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('rep_invitations')
    .insert({
      email,
      invitation_note: note || null,
      invited_by_admin_id: admin.id,
    })
    .select('id, token')
    .single();
  if (error || !data) redirect(`/admin/reps/invite?error=${encodeURIComponent(error?.message ?? 'failed')}`);

  await audit(admin.id, 'rep_invitation.created', 'rep_invitation', data.id, { email });
  revalidatePath('/admin/reps');
  redirect(`/admin/reps/invite?token=${data.token}`);
}

export async function revokeRepInvitation(formData: FormData): Promise<void> {
  if (!supabaseEnvConfigured()) redirect('/admin/reps?error=unavailable');
  const admin = await requireAdmin();
  const id = String(formData.get('invitation_id') ?? '');
  if (!id) redirect('/admin/reps?error=missing');

  const supabase = await createClient();
  const { error } = await supabase
    .from('rep_invitations')
    .update({ status: 'revoked', revoked_at: new Date().toISOString(), revoked_reason: 'admin revoked' })
    .eq('id', id)
    .eq('status', 'pending');
  if (error) redirect(`/admin/reps?error=${encodeURIComponent(error.message)}`);

  await audit(admin.id, 'rep_invitation.revoked', 'rep_invitation', id);
  revalidatePath('/admin/reps');
  redirect('/admin/reps?ok=revoked');
}

async function setRepStatus(
  repId: string,
  patch: SalesRepUpdate,
  action: string,
  payload: Json = {},
) {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from('sales_reps').update(patch).eq('id', repId);
  if (error) redirect(`/admin/reps/${repId}?error=${encodeURIComponent(error.message)}`);
  await audit(admin.id, action, 'sales_rep', repId, payload);
  revalidatePath('/admin/reps');
  revalidatePath(`/admin/reps/${repId}`);
}

export async function approveRep(formData: FormData): Promise<void> {
  if (!supabaseEnvConfigured()) redirect('/admin/reps?error=unavailable');
  const admin = await requireAdmin();
  const repId = String(formData.get('rep_id') ?? '');
  if (!repId) redirect('/admin/reps?error=missing');
  await setRepStatus(
    repId,
    {
      status: 'active',
      approved_at: new Date().toISOString(),
      approved_by: admin.id,
      suspended_at: null,
      suspended_reason: null,
    },
    'sales_rep.approved',
  );
  redirect(`/admin/reps/${repId}?ok=approved`);
}

export async function suspendRep(formData: FormData): Promise<void> {
  if (!supabaseEnvConfigured()) redirect('/admin/reps?error=unavailable');
  const repId = String(formData.get('rep_id') ?? '');
  const reason = String(formData.get('reason') ?? '').trim();
  if (!repId) redirect('/admin/reps?error=missing');
  if (reason.length < 3) redirect(`/admin/reps/${repId}?error=reason`);
  await setRepStatus(
    repId,
    { status: 'suspended', suspended_at: new Date().toISOString(), suspended_reason: reason },
    'sales_rep.suspended',
    { reason },
  );
  redirect(`/admin/reps/${repId}?ok=suspended`);
}

export async function reactivateRep(formData: FormData): Promise<void> {
  if (!supabaseEnvConfigured()) redirect('/admin/reps?error=unavailable');
  const repId = String(formData.get('rep_id') ?? '');
  if (!repId) redirect('/admin/reps?error=missing');
  await setRepStatus(
    repId,
    { status: 'active', suspended_at: null, suspended_reason: null },
    'sales_rep.reactivated',
  );
  redirect(`/admin/reps/${repId}?ok=reactivated`);
}

export async function createAssignment(formData: FormData): Promise<void> {
  if (!supabaseEnvConfigured()) redirect('/admin/reps?error=unavailable');
  const admin = await requireAdmin();
  const repId = String(formData.get('rep_id') ?? '');
  const orgId = String(formData.get('organization_id') ?? '');
  const pctRaw = String(formData.get('commission_pct') ?? '').trim();
  if (!repId || !orgId) redirect(`/admin/reps/${repId}?error=missing`);

  // Optional override: admin enters a percentage (0–100) → store as 0.0000–1.0000.
  let commissionPct: number | null = null;
  if (pctRaw.length > 0) {
    const n = Number(pctRaw);
    if (!Number.isFinite(n) || n < 0 || n > 100) {
      redirect(`/admin/reps/${repId}?error=pct`);
    }
    commissionPct = Math.round((n / 100) * 10000) / 10000;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('rep_org_assignments')
    .insert({
      rep_user_id: repId,
      organization_id: orgId,
      commission_pct: commissionPct,
      created_by_admin_id: admin.id,
    })
    .select('id')
    .single();
  if (error) {
    // 23505 = the partial-unique (one active per org) violation.
    const msg =
      error.code === '23505'
        ? 'That organization already has an active rep assignment. End it first.'
        : error.message;
    redirect(`/admin/reps/${repId}?error=${encodeURIComponent(msg)}`);
  }

  await audit(admin.id, 'rep_assignment.created', 'rep_org_assignment', data!.id, {
    rep_id: repId,
    org_id: orgId,
    commission_pct: commissionPct,
  });
  revalidatePath(`/admin/reps/${repId}`);
  redirect(`/admin/reps/${repId}?ok=assigned`);
}

export async function endAssignment(formData: FormData): Promise<void> {
  if (!supabaseEnvConfigured()) redirect('/admin/reps?error=unavailable');
  const admin = await requireAdmin();
  const assignmentId = String(formData.get('assignment_id') ?? '');
  const repId = String(formData.get('rep_id') ?? '');
  const reason = String(formData.get('reason') ?? '').trim();
  if (!assignmentId || !repId) redirect(`/admin/reps/${repId}?error=missing`);

  const supabase = await createClient();
  const { error } = await supabase
    .from('rep_org_assignments')
    .update({ ended_at: new Date().toISOString(), ended_reason: reason || 'admin ended' })
    .eq('id', assignmentId)
    .is('ended_at', null);
  if (error) redirect(`/admin/reps/${repId}?error=${encodeURIComponent(error.message)}`);

  await audit(admin.id, 'rep_assignment.ended', 'rep_org_assignment', assignmentId, { reason });
  revalidatePath(`/admin/reps/${repId}`);
  redirect(`/admin/reps/${repId}?ok=ended`);
}
