'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { supabaseEnvConfigured } from '@/lib/supabase/env';

// Org-admin team management. Inserts/updates run as the authenticated user and
// are gated by the org_invitations RLS (write = is_admin OR own-org org-admin),
// so a buyer/viewer cannot invite even if they reach the action.

const INVITE_ROLES = new Set(['admin', 'buyer', 'viewer']);

export async function inviteMember(formData: FormData) {
  if (!supabaseEnvConfigured()) redirect('/portal/team?error=unavailable');
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const role = String(formData.get('org_role') ?? '').trim();
  if (!email || !email.includes('@')) redirect('/portal/team?error=email');
  if (!INVITE_ROLES.has(role)) redirect('/portal/team?error=role');

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect('/login?next=/portal/team');
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', auth.user.id)
    .single();
  if (!profile?.organization_id) redirect('/onboarding/attest');

  const { error } = await supabase.from('org_invitations').insert({
    organization_id: profile.organization_id,
    email,
    org_role: role,
    invited_by: auth.user.id,
  });
  if (error) redirect(`/portal/team?error=${encodeURIComponent(error.message)}`);

  revalidatePath('/portal/team');
  redirect(`/portal/team?invited=${encodeURIComponent(email)}`);
}

export async function revokeInvitation(formData: FormData) {
  if (!supabaseEnvConfigured()) redirect('/portal/team?error=unavailable');
  const id = String(formData.get('invitation_id') ?? '');
  if (!id) redirect('/portal/team?error=missing');

  const supabase = await createClient();
  const { error } = await supabase
    .from('org_invitations')
    .update({ status: 'revoked' })
    .eq('id', id)
    .eq('status', 'pending');
  if (error) redirect(`/portal/team?error=${encodeURIComponent(error.message)}`);

  revalidatePath('/portal/team');
  redirect('/portal/team?revoked=1');
}
