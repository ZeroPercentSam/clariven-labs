import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { adminOrderBulkSchema } from '@/lib/schemas/admin';

// Bulk status change for selected orders on /admin/orders. Admin-gated (same
// shape as the single-order PATCH). Writes one audit row for the batch.
//
// No email/side-effects here by design: the branded shipped email needs a
// tracking number, which bulk has none — the per-order inline "Ship" control
// (single PATCH) is the email path. Bulk is a pure status transition (e.g.
// processing → paid, → preparing, → cancelled).
export async function PATCH(req: Request) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', auth.user.id)
    .single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const json = await req.json().catch(() => null);
  const parsed = adminOrderBulkSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'bad_request', details: parsed.error.issues }, { status: 400 });
  }

  const { ids, status } = parsed.data;
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .in('id', ids)
    .select('id');
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const updatedIds = (data ?? []).map((r) => r.id);
  await supabase.from('admin_audit_log').insert({
    actor_id: auth.user.id,
    action: 'order.bulk_patch',
    target_type: 'order',
    target_id: `bulk:${updatedIds.length}`,
    payload: { status, count: updatedIds.length, ids: updatedIds },
  });

  return NextResponse.json({ ok: true, count: updatedIds.length });
}
