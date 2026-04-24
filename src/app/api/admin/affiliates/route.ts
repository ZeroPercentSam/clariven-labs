import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { affiliateUpsertSchema } from '@/lib/schemas/affiliate';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: 'unauthorized' as const, status: 401 as const };
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', auth.user.id).single();
  if (profile?.role !== 'admin') return { error: 'forbidden' as const, status: 403 as const };
  return { user: auth.user, supabase };
}

export async function POST(req: Request) {
  const gate = await requireAdmin();
  if ('error' in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const json = await req.json().catch(() => null);
  const parsed = affiliateUpsertSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const payload = {
    name: parsed.data.name,
    email: parsed.data.email ?? null,
    commission_pct: parsed.data.commission_pct ?? null,
    active: parsed.data.active ?? true,
  };

  const query = parsed.data.id
    ? gate.supabase.from('affiliates').update(payload).eq('id', parsed.data.id).select('*').single()
    : gate.supabase.from('affiliates').insert(payload).select('*').single();
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await gate.supabase.from('admin_audit_log').insert({
    actor_id: gate.user.id,
    action: parsed.data.id ? 'affiliate.update' : 'affiliate.create',
    target_type: 'affiliate',
    target_id: data.id,
    payload,
  });
  return NextResponse.json({ ok: true, affiliate: data });
}

export async function DELETE(req: Request) {
  const gate = await requireAdmin();
  if ('error' in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const { error } = await gate.supabase.from('affiliates').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await gate.supabase.from('admin_audit_log').insert({
    actor_id: gate.user.id,
    action: 'affiliate.delete',
    target_type: 'affiliate',
    target_id: id,
  });
  return NextResponse.json({ ok: true });
}
