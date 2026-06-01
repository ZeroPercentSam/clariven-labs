import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/database.types';
import type { RepStatus } from '@/lib/rep/constants';

type RepSafe = Database['public']['Views']['sales_reps_safe']['Row'];
type Assignment = Database['public']['Tables']['rep_org_assignments']['Row'];

export type RepListRow = RepSafe & { email: string | null };

/** All reps (tax/payout-masked via sales_reps_safe) joined to their email. */
export async function listReps(): Promise<RepListRow[]> {
  const supabase = await createClient();
  const { data: reps } = await supabase
    .from('sales_reps_safe')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  if (!reps?.length) return [];
  const ids = reps.map((r) => r.id).filter((x): x is string => !!x);
  const { data: profiles } = await supabase.from('profiles').select('id, email').in('id', ids);
  const emailById = new Map((profiles ?? []).map((p) => [p.id, p.email]));
  return reps.map((r) => ({ ...r, email: r.id ? (emailById.get(r.id) ?? null) : null }));
}

export function countByStatus(reps: RepListRow[]): Record<RepStatus, number> {
  const counts: Record<RepStatus, number> = {
    pending_invite: 0,
    pending_review: 0,
    active: 0,
    suspended: 0,
  };
  for (const r of reps) {
    if (r.status && r.status in counts) counts[r.status as RepStatus] += 1;
  }
  return counts;
}

export type RepDetail = {
  rep: RepListRow;
  assignments: (Assignment & { org_name: string | null; org_slug: string | null })[];
  consents: { signed_legal_name: string; signed_at: string; label: string | null }[];
};

/** One rep (masked) + their org assignments (with org names) + agreement consents. */
export async function getRepDetail(id: string): Promise<RepDetail | null> {
  const supabase = await createClient();
  const { data: rep } = await supabase.from('sales_reps_safe').select('*').eq('id', id).maybeSingle();
  if (!rep) return null;
  const { data: profile } = await supabase.from('profiles').select('email').eq('id', id).maybeSingle();

  const { data: assignmentsRaw } = await supabase
    .from('rep_org_assignments')
    .select('*')
    .eq('rep_user_id', id)
    .order('started_at', { ascending: false });
  const orgIds = (assignmentsRaw ?? []).map((a) => a.organization_id);
  let orgs: { id: string; name: string; slug: string }[] = [];
  if (orgIds.length) {
    const { data } = await supabase.from('organizations').select('id, name, slug').in('id', orgIds);
    orgs = data ?? [];
  }
  const orgById = new Map(orgs.map((o) => [o.id, o]));
  const assignments = (assignmentsRaw ?? []).map((a) => ({
    ...a,
    org_name: orgById.get(a.organization_id)?.name ?? null,
    org_slug: orgById.get(a.organization_id)?.slug ?? null,
  }));

  const { data: consentsRaw } = await supabase
    .from('rep_agreement_consents')
    .select('signed_legal_name, signed_at, version_id')
    .eq('rep_user_id', id)
    .order('signed_at', { ascending: false });
  const verIds = (consentsRaw ?? []).map((c) => c.version_id);
  let versions: { id: string; label: string }[] = [];
  if (verIds.length) {
    const { data } = await supabase.from('rep_agreement_versions').select('id, label').in('id', verIds);
    versions = data ?? [];
  }
  const labelById = new Map(versions.map((v) => [v.id, v.label]));
  const consents = (consentsRaw ?? []).map((c) => ({
    signed_legal_name: c.signed_legal_name,
    signed_at: c.signed_at,
    label: labelById.get(c.version_id) ?? null,
  }));

  return { rep: { ...rep, email: profile?.email ?? null }, assignments, consents };
}

export type RepInvitationRow = Database['public']['Tables']['rep_invitations']['Row'];

export async function listRepInvitations(): Promise<RepInvitationRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('rep_invitations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  return data ?? [];
}

export type AssignableOrg = {
  id: string;
  name: string;
  slug: string;
  active_rep_id: string | null;
};

/** Approved orgs + whoever currently has the active assignment (if any). */
export async function listApprovedOrgs(): Promise<AssignableOrg[]> {
  const supabase = await createClient();
  const { data: orgs } = await supabase
    .from('organizations')
    .select('id, name, slug')
    .eq('approval_status', 'approved')
    .order('name');
  if (!orgs?.length) return [];
  const { data: active } = await supabase
    .from('rep_org_assignments')
    .select('organization_id, rep_user_id')
    .is('ended_at', null);
  const activeByOrg = new Map((active ?? []).map((a) => [a.organization_id, a.rep_user_id]));
  return orgs.map((o) => ({ ...o, active_rep_id: activeByOrg.get(o.id) ?? null }));
}
