'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { supabaseEnvConfigured } from '@/lib/supabase/env';

function inviteError(token: string, message: string): never {
  redirect(`/invite/${token}?error=${encodeURIComponent(message)}`);
}

// Accept a team invitation. The accept_invitation RPC (SECURITY DEFINER) does
// the gating — email match, pending/unexpired, not already in a different org —
// and links the caller into the org (joining an existing org needs no
// attestation). On success the user lands in /portal with their new org.
export async function acceptInvitation(formData: FormData) {
  const token = String(formData.get('token') ?? '');
  if (!supabaseEnvConfigured()) redirect(`/invite/${token}?error=unavailable`);
  if (!token) redirect('/portal');

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect(`/login?next=/invite/${token}`);

  const { error } = await supabase.rpc('accept_invitation', { p_token: token });
  if (error) redirect(`/invite/${token}?error=${encodeURIComponent(error.message)}`);

  redirect('/portal');
}

// Invite-locked password signup for an invitee with no account yet. The email is
// taken from the invitation preview (NEVER the form) and locked, so a visitor can
// only create the exact invited account — preserving the "no public self-serve
// signup" pivot. With email verification on, Supabase sends a confirmation link →
// /auth/callback?next=/invite/<token>, landing the now-signed-in user back here to
// accept. Mirrors signUpRepFromInvite (src/lib/rep/actions.ts).
export async function signUpFromInvite(formData: FormData) {
  const token = String(formData.get('token') ?? '');
  const password = String(formData.get('password') ?? '');
  if (!token) redirect('/login');
  if (!supabaseEnvConfigured()) inviteError(token, "Can't reach the server right now. Try again shortly.");
  if (password.length < 10) inviteError(token, 'Password must be at least 10 characters.');

  const supabase = await createClient();

  const { data: previewRaw } = await supabase.rpc('get_invitation_preview', { p_token: token });
  const preview = previewRaw as unknown as { email: string; status: string; is_expired: boolean } | null;
  if (!preview) inviteError(token, 'We could not find that invitation.');
  if (preview.status !== 'pending' || preview.is_expired) {
    inviteError(token, 'This invitation is no longer open.');
  }

  const hdrs = await headers();
  const proto = hdrs.get('x-forwarded-proto') ?? 'https';
  const host = hdrs.get('host') ?? 'localhost:3000';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${proto}://${host}`;
  const next = `/invite/${token}`;

  // Email comes from the invitation, never the form.
  const { data, error } = await supabase.auth.signUp({
    email: preview.email,
    password,
    options: { emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.user) {
    inviteError(token, error?.message ?? 'Could not create the account.');
  }

  // Session present (email-verify off, e.g. local) → straight back to accept.
  // Otherwise show the check-your-email state on the invite page.
  if (data.session) redirect(next);
  redirect(`/invite/${token}?signup=check_email`);
}
