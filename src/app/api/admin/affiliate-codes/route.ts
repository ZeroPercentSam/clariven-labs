import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { affiliateCodeUpsertSchema } from '@/lib/schemas/affiliate';

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
  const parsed = affiliateCodeUpsertSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const payload = {
    affiliate_id: parsed.data.affiliate_id,
    code: parsed.data.code.toUpperCase(),
    discount_pct: parsed.data.discount_pct,
    active: parsed.data.active ?? true,
    expires_at: parsed.data.expires_at ?? null,
  };

  const query = parsed.data.id
    ? gate.supabase.from('affiliate_codes').update(payload).eq('id', parsed.data.id).select('*').single()
    : gate.supabase.from('affiliate_codes').insert(payload).select('*').single();
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await gate.supabase.from('admin_audit_log').insert({
    actor_id: gate.user.id,
    action: parsed.data.id ? 'affiliate_code.update' : 'affiliate_code.create',
    target_type: 'affiliate_code',
    target_id: data.id,
    payload,
  });
  return NextResponse.json({ ok: true, code: data });
}

export async function DELETE(req: Request) {
  const gate = await requireAdmin();
  if ('error' in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const { error } = await gate.supabase.from('affiliate_codes').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await gate.supabase.from('admin_audit_log').insert({
    actor_id: gate.user.id,
    action: 'affiliate_code.delete',
    target_type: 'affiliate_code',
    target_id: id,
  });
  return NextResponse.json({ ok: true });
}
