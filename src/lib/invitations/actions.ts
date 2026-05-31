'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { supabaseEnvConfigured } from '@/lib/supabase/env';

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
