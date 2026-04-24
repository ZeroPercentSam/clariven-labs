import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { adminOrderPatchSchema } from '@/lib/schemas/admin';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: 'unauthorized' as const, status: 401 as const };
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', auth.user.id)
    .single();
  if (profile?.role !== 'admin') return { error: 'forbidden' as const, status: 403 as const };
  return { user: auth.user };
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const gate = await requireAdmin();
  if ('error' in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const json = await req.json().catch(() => null);
  const parsed = adminOrderPatchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'bad_request', details: parsed.error.issues },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const patch = parsed.data;

  const { data, error } = await admin
    .from('orders')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await admin.from('admin_audit_log').insert({
    actor_id: gate.user.id,
    action: 'order.patch',
    target_type: 'order',
    target_id: id,
    payload: patch,
  });

  return NextResponse.json({ ok: true, order: data });
}
