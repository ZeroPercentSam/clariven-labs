'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { supabaseEnvConfigured } from '@/lib/supabase/env';

// Start/stop impersonation. Both run as the authenticated admin; the DB RPCs are
// the authoritative gate (start_impersonation re-checks real-admin via a direct
// profiles read, since is_admin() is impersonation-overridden). Form-action
// shape mirrors lib/team/actions.ts.

function friendlyStartError(msg: string): string {
  if (msg.includes('CANNOT_IMPERSONATE_SELF')) return 'You cannot impersonate yourself.';
  if (msg.includes('CANNOT_IMPERSONATE_ADMIN')) return 'Admins cannot be impersonated.';
  if (msg.includes('JUSTIFICATION_TOO_SHORT')) return 'A justification of at least 10 characters is required.';
  if (msg.includes('IMPERSONATION_ALREADY_ACTIVE')) return 'End your current impersonation session first.';
  if (msg.includes('FORBIDDEN_NOT_ADMIN')) return 'Not permitted.';
  if (msg.includes('TARGET_NOT_FOUND')) return 'That user no longer exists.';
  return 'Could not start impersonation.';
}

export async function startImpersonation(formData: FormData) {
  const orgId = String(formData.get('org_id') ?? '');
  const back = orgId ? `/admin/organizations/${orgId}` : '/admin/organizations';
  if (!supabaseEnvConfigured()) redirect(`${back}?error=unavailable`);

  const target = String(formData.get('target_user_id') ?? '');
  const justification = String(formData.get('justification') ?? '').trim();
  if (!target) redirect(`${back}?error=${encodeURIComponent('Missing target user.')}`);

  const supabase = await createClient();
  const { error } = await supabase.rpc('start_impersonation', {
    p_target: target,
    p_justification: justification,
  });
  if (error) redirect(`${back}?error=${encodeURIComponent(friendlyStartError(error.message))}`);

  // Clear cached customer data everywhere so the impersonated view renders.
  revalidatePath('/', 'layout');
  redirect('/portal?impersonating=1');
}

// No redirect: the banner is a client island that clears its own state +
// router.refresh()es after this resolves. (A redirect to /portal wouldn't change
// the pathname the banner keys its refetch on, so it could show stale.)
export async function endImpersonation() {
  if (!supabaseEnvConfigured()) return;
  const supabase = await createClient();
  await supabase.rpc('end_impersonation');
  revalidatePath('/', 'layout');
}
