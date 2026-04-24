import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { resendInvoiceNotification } from '@/lib/gbp/invoices';

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: order } = await supabase
    .from('orders')
    .select('id, user_id, gbp_invoice_id, status')
    .eq('id', id)
    .maybeSingle();
  if (!order) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  // Admin or owner only
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', auth.user.id)
    .single();
  const isOwner = order.user_id === auth.user.id;
  const isAdmin = profile?.role === 'admin';
  if (!isOwner && !isAdmin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  if (!order.gbp_invoice_id) {
    return NextResponse.json({ error: 'no_invoice' }, { status: 409 });
  }
  if (order.status !== 'pending_payment' && order.status !== 'processing') {
    return NextResponse.json({ error: 'not_pending' }, { status: 409 });
  }

  const result = await resendInvoiceNotification(order.gbp_invoice_id);
  if (!result.ok) return NextResponse.json({ error: result.error ?? 'failed' }, { status: 502 });
  return NextResponse.json({ ok: true });
}
