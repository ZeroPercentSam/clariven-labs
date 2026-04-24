import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { adminOrderPatchSchema } from '@/lib/schemas/admin';

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
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
  const parsed = adminOrderPatchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'bad_request', details: parsed.error.issues },
      { status: 400 },
    );
  }

  const patch = parsed.data;
  const { data, error } = await supabase
    .from('orders')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from('admin_audit_log').insert({
    actor_id: auth.user.id,
    action: 'order.patch',
    target_type: 'order',
    target_id: id,
    payload: patch,
  });

  return NextResponse.json({ ok: true, order: data });
}
