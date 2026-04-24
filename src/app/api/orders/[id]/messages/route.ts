import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { messageCreateSchema } from '@/lib/schemas/order';

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: orderId } = await ctx.params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = messageCreateSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', auth.user.id)
    .single();
  const role = profile?.role === 'admin' ? 'admin' : 'customer';

  const { data, error } = await supabase
    .from('order_messages')
    .insert({
      order_id: orderId,
      author_id: auth.user.id,
      author_role: role,
      body: parsed.data.body,
    })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, message: data });
}
