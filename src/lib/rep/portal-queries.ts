import 'server-only';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/database.types';
import type { SalesRep } from '@/lib/rep/queries';

type Commission = Database['public']['Tables']['rep_commissions']['Row'];
type Assignment = Database['public']['Tables']['rep_org_assignments']['Row'];
type RepCode = Database['public']['Tables']['affiliate_codes']['Row'];

/**
 * Gate a /rep/* portal page on an ACTIVE rep. Not a rep → home; a rep mid-flow
 * (pending_invite/pending_review/suspended) → the onboarding status page. Returns
 * the active sales_reps row.
 */
export async function requireActiveRep(): Promise<SalesRep> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect('/login?next=/rep/dashboard');
  const { data: rep } = await supabase
    .from('sales_reps')
    .select('*')
    .eq('id', auth.user.id)
    .maybeSingle();
  if (!rep) redirect('/');
  if (rep.status !== 'active') redirect('/rep/onboarding/pending');
  return rep;
}

/** id → name map for the caller's assigned orgs (definer helper bypasses org RLS). */
export async function myOrgNames(): Promise<Map<string, string>> {
  const supabase = await createClient();
  const { data } = await supabase.rpc('rep_my_orgs');
  return new Map((data ?? []).map((o) => [o.id, o.name]));
}

export type CommissionSummary = {
  earnedCents: number;
  paidCents: number;
  voidCount: number;
  earnedCount: number;
  total: number;
};

/** Summary over the rep's own commissions (RLS scopes to self). */
export async function getCommissionSummary(): Promise<CommissionSummary> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('rep_commissions')
    .select('commission_cents, status')
    .limit(5000);
  const rows = data ?? [];
  let earnedCents = 0;
  let paidCents = 0;
  let voidCount = 0;
  let earnedCount = 0;
  for (const r of rows) {
    if (r.status === 'earned') {
      earnedCents += r.commission_cents;
      earnedCount += 1;
    } else if (r.status === 'paid') {
      paidCents += r.commission_cents;
    } else if (r.status === 'void') {
      voidCount += 1;
    }
  }
  return { earnedCents, paidCents, voidCount, earnedCount, total: rows.length };
}

export type CommissionRow = Pick<
  Commission,
  | 'id'
  | 'order_id'
  | 'organization_id'
  | 'source'
  | 'base_cents'
  | 'commission_cents'
  | 'rate'
  | 'status'
  | 'earned_at'
  | 'paid_at'
>;

export async function listMyCommissions(limit = 200): Promise<{ rows: CommissionRow[]; total: number }> {
  const supabase = await createClient();
  const { count } = await supabase
    .from('rep_commissions')
    .select('id', { count: 'exact', head: true });
  const { data } = await supabase
    .from('rep_commissions')
    .select('id, order_id, organization_id, source, base_cents, commission_cents, rate, status, earned_at, paid_at')
    .order('earned_at', { ascending: false })
    .limit(limit);
  return { rows: data ?? [], total: count ?? 0 };
}

export async function listMyAssignments(): Promise<Assignment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('rep_org_assignments')
    .select('*')
    .order('started_at', { ascending: false });
  return data ?? [];
}

export async function listMyCodes(): Promise<RepCode[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('affiliate_codes')
    .select('*')
    .order('created_at', { ascending: false });
  return data ?? [];
}
