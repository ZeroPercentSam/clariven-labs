import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/database.types';

type Commission = Database['public']['Tables']['rep_commissions']['Row'];

export type AdminCommissionRow = Commission & {
  rep_email: string | null;
  org_name: string | null;
};

export type CommissionFilter = 'all' | 'earned' | 'paid' | 'void';

/** All reps' commissions (admin RLS), filtered by status, with rep email + org name. */
export async function listAllCommissions(
  status: CommissionFilter = 'all',
  limit = 200,
): Promise<{ rows: AdminCommissionRow[]; total: number }> {
  const supabase = await createClient();

  let countQ = supabase.from('rep_commissions').select('id', { count: 'exact', head: true });
  if (status !== 'all') countQ = countQ.eq('status', status);
  const { count } = await countQ;

  let rowQ = supabase
    .from('rep_commissions')
    .select('*')
    .order('earned_at', { ascending: false })
    .limit(limit);
  if (status !== 'all') rowQ = rowQ.eq('status', status);
  const { data: commissions } = await rowQ;
  const rows = commissions ?? [];

  const repIds = [...new Set(rows.map((r) => r.rep_user_id))];
  const orgIds = [...new Set(rows.map((r) => r.organization_id))];
  const [{ data: profiles }, { data: orgs }] = await Promise.all([
    repIds.length
      ? supabase.from('profiles').select('id, email').in('id', repIds)
      : Promise.resolve({ data: [] as { id: string; email: string }[] }),
    orgIds.length
      ? supabase.from('organizations').select('id, name').in('id', orgIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ]);
  const emailById = new Map((profiles ?? []).map((p) => [p.id, p.email]));
  const nameById = new Map((orgs ?? []).map((o) => [o.id, o.name]));

  return {
    rows: rows.map((r) => ({
      ...r,
      rep_email: emailById.get(r.rep_user_id) ?? null,
      org_name: nameById.get(r.organization_id) ?? null,
    })),
    total: count ?? 0,
  };
}

export type CommissionTotals = { earnedCents: number; paidCents: number; voidCount: number };

export async function commissionTotals(): Promise<CommissionTotals> {
  const supabase = await createClient();
  const { data } = await supabase.from('rep_commissions').select('commission_cents, status').limit(10000);
  let earnedCents = 0;
  let paidCents = 0;
  let voidCount = 0;
  for (const r of data ?? []) {
    if (r.status === 'earned') earnedCents += r.commission_cents;
    else if (r.status === 'paid') paidCents += r.commission_cents;
    else if (r.status === 'void') voidCount += 1;
  }
  return { earnedCents, paidCents, voidCount };
}

export type PayoutBatch = {
  batch_id: string;
  count: number;
  total_cents: number;
  paid_at: string | null;
};

/** Paid commissions grouped by paid_batch_id. */
export async function listPayoutBatches(): Promise<PayoutBatch[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('rep_commissions')
    .select('paid_batch_id, commission_cents, paid_at')
    .eq('status', 'paid')
    .not('paid_batch_id', 'is', null)
    .order('paid_at', { ascending: false })
    .limit(5000);
  const byBatch = new Map<string, PayoutBatch>();
  for (const r of data ?? []) {
    const id = r.paid_batch_id as string;
    const b = byBatch.get(id) ?? { batch_id: id, count: 0, total_cents: 0, paid_at: r.paid_at };
    b.count += 1;
    b.total_cents += r.commission_cents;
    byBatch.set(id, b);
  }
  return [...byBatch.values()];
}
