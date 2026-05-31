import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/database.types';

export type SalesRep = Database['public']['Tables']['sales_reps']['Row'];

export type RepInvitationPreview = {
  email: string;
  status: string;
  expires_at: string;
  invitation_note: string | null;
  is_expired: boolean;
};

export type RepAgreementVersion = {
  id: string;
  label: string;
  body_md: string;
  effective_at: string;
};

/** Anon-callable sanitized invite preview (via the SECURITY DEFINER RPC). */
export async function getRepInvitationPreview(
  token: string,
): Promise<RepInvitationPreview | null> {
  const supabase = await createClient();
  const { data } = await supabase.rpc('get_rep_invitation_preview', { p_token: token });
  return data ? (data as unknown as RepInvitationPreview) : null;
}

/** The single current (non-retired) rep agreement version, or null. */
export async function getCurrentRepAgreement(): Promise<RepAgreementVersion | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('rep_agreement_versions')
    .select('id, label, body_md, effective_at')
    .is('retired_at', null)
    .maybeSingle();
  return data ?? null;
}

/** The caller's own sales_reps row (RLS scopes to self), or null if not a rep. */
export async function getMyRep(): Promise<SalesRep | null> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data } = await supabase
    .from('sales_reps')
    .select('*')
    .eq('id', auth.user.id)
    .maybeSingle();
  return data ?? null;
}
