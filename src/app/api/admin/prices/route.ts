import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { priceUpsertSchema } from '@/lib/schemas/price';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: 'unauthorized', status: 401 as const };
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email')
    .eq('id', auth.user.id)
    .single();
  if (profile?.role !== 'admin') return { error: 'forbidden', status: 403 as const };
  return { user: auth.user, profile };
}

export async function POST(req: Request) {
  const gate = await requireAdmin();
  if ('error' in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const json = await req.json().catch(() => null);
  const parsed = priceUpsertSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'bad_request', details: parsed.error.issues }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('product_prices')
    .upsert(
      {
        product_slug: parsed.data.product_slug,
        strength_label: parsed.data.strength_label,
        price_cents: parsed.data.price_cents,
        active: parsed.data.active ?? true,
      },
      { onConflict: 'product_slug,strength_label' },
    )
    .select('id, product_slug, strength_label, price_cents, active')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await admin.from('admin_audit_log').insert({
    actor_id: gate.user.id,
    action: 'price.upsert',
    target_type: 'product_price',
    target_id: data.id,
    payload: data,
  });

  return NextResponse.json({ ok: true, row: data });
}

export async function DELETE(req: Request) {
  const gate = await requireAdmin();
  if ('error' in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin.from('product_prices').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await admin.from('admin_audit_log').insert({
    actor_id: gate.user.id,
    action: 'price.delete',
    target_type: 'product_price',
    target_id: id,
  });

  return NextResponse.json({ ok: true });
}
