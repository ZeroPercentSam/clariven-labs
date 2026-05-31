'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/roles';
import { supabaseEnvConfigured } from '@/lib/supabase/env';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Mark every currently-earned commission paid under one batch id. Plain
 * authenticated UPDATE gated by the rep_commissions admin RLS (0018); audited.
 */
export async function markEarnedPaidBatch(formData: FormData): Promise<void> {
  if (!supabaseEnvConfigured()) redirect('/admin/commissions?error=unavailable');
  const admin = await requireAdmin();
  const note = String(formData.get('note') ?? '').trim() || null;

  const now = new Date();
  const batchId = `PO-${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}-${Math.floor(
    Math.random() * 1e6,
  )
    .toString(36)
    .padStart(4, '0')}`;

  const supabase = await createClient();
  const { data: updated, error } = await supabase
    .from('rep_commissions')
    .update({
      status: 'paid',
      paid_at: now.toISOString(),
      paid_batch_id: batchId,
      paid_note: note,
    })
    .eq('status', 'earned')
    .select('id');
  if (error) redirect(`/admin/commissions?error=${encodeURIComponent(error.message)}`);

  if ((updated ?? []).length === 0) {
    redirect('/admin/commissions?error=nothing_to_pay');
  }

  await supabase.from('admin_audit_log').insert({
    actor_id: admin.id,
    action: 'rep_commissions.batch_paid',
    target_type: 'rep_commission_batch',
    target_id: batchId,
    payload: { count: (updated ?? []).length, note },
  });

  revalidatePath('/admin/commissions');
  revalidatePath('/admin/commissions/payouts');
  redirect(`/admin/commissions/payouts?batch=${encodeURIComponent(batchId)}`);
}

/** Void a single commission (clawback / correction). */
export async function voidCommission(formData: FormData): Promise<void> {
  if (!supabaseEnvConfigured()) redirect('/admin/commissions?error=unavailable');
  const admin = await requireAdmin();
  const id = String(formData.get('commission_id') ?? '');
  const reason = String(formData.get('reason') ?? '').trim() || 'admin void';
  if (!id) redirect('/admin/commissions?error=missing');

  const supabase = await createClient();
  const { error } = await supabase
    .from('rep_commissions')
    .update({ status: 'void', reversed_at: new Date().toISOString(), reversed_reason: reason })
    .eq('id', id);
  if (error) redirect(`/admin/commissions?error=${encodeURIComponent(error.message)}`);

  await supabase.from('admin_audit_log').insert({
    actor_id: admin.id,
    action: 'rep_commission.voided',
    target_type: 'rep_commission',
    target_id: id,
    payload: { reason },
  });

  revalidatePath('/admin/commissions');
  redirect('/admin/commissions?ok=voided');
}
