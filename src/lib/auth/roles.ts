import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/database.types';

type Organization = Database['public']['Tables']['organizations']['Row'];

export async function getSessionUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// The caller's organization row (via profiles.organization_id), or null if not
// signed in / not yet in an org. RLS lets a member read only their own org, so
// no extra guard is needed. Used by the onboarding flow + the cart/checkout
// approval-gate UX (the order RPC remains the authoritative enforcement).
export async function getOrg(): Promise<Organization | null> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', auth.user.id)
    .single();
  if (!profile?.organization_id) return null;
  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', profile.organization_id)
    .single();
  return org ?? null;
}

export async function getProfile() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', auth.user.id)
    .single();
  return profile;
}

export async function requireAdmin() {
  const profile = await getProfile();
  if (!profile || profile.role !== 'admin') {
    throw new Error('forbidden');
  }
  return profile;
}
