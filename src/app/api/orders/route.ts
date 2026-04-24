import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { orderCreateSchema } from '@/lib/schemas/order';
import { createOneTimeInvoice } from '@/lib/gbp/invoices';
import { sendKatieNewOrderSms } from '@/lib/twilio';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = orderCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'bad_request', details: parsed.error.issues }, { status: 400 });
  }

  // 1. Atomic order creation via RPC. The RPC validates items, snapshots
  //    prices + names, applies the affiliate code, and enforces self-referral.
  const { data: rpc, error: rpcErr } = await supabase.rpc('create_order_with_items', {
    p_items: parsed.data.items.map((i) => ({
      product_slug: i.product_slug,
      product_name: i.product_name,
      strength_label: i.strength_label,
      quantity: i.quantity,
    })),
    p_shipping: parsed.data.shipping_address,
    p_code: parsed.data.affiliate_code ?? '',
  });

  if (rpcErr || !rpc || rpc.length === 0) {
    return NextResponse.json(
      { error: rpcErr?.message ?? 'order_create_failed' },
      { status: 400 },
    );
  }

  const { order_id: orderId, total_cents: totalCents } = rpc[0];

  // 2. Fetch the order + profile to build invoice args.
  const admin = createAdminClient();
  const [{ data: order }, { data: profile }] = await Promise.all([
    admin.from('orders').select('order_number').eq('id', orderId).single(),
    admin.from('profiles').select('email, full_name').eq('id', auth.user.id).single(),
  ]);

  const itemSummary = parsed.data.items
    .slice(0, 6)
    .map((i) => `${i.product_name} ${i.strength_label} ×${i.quantity}`)
    .join('; ');

  const customerName =
    parsed.data.shipping_address.full_name ||
    profile?.full_name ||
    profile?.email ||
    'Clariven customer';

  // 3. Create GBP invoice. Failure is non-fatal — we still persist the order,
  //    customer can retry via "Resend invoice" in the portal.
  const invoice = await createOneTimeInvoice({
    orderNumber: order?.order_number ?? 0,
    customerName: customerName.slice(0, 100),
    customerEmail: profile?.email ?? auth.user.email ?? '',
    amountCents: totalCents,
    itemSummary,
  });

  if (invoice.ok) {
    await admin
      .from('orders')
      .update({
        gbp_invoice_id: invoice.invoiceId ?? null,
        gbp_check_id: invoice.checkId ?? null,
        gbp_payment_result: invoice.paymentResult ?? null,
      })
      .eq('id', orderId);
  }

  // 4. Fire-and-forget SMS to Katie.
  void sendKatieNewOrderSms({
    orderNumber: order?.order_number ?? 0,
    customerName,
    itemCount: parsed.data.items.reduce((s, i) => s + i.quantity, 0),
    totalCents,
  });

  return NextResponse.json({
    ok: true,
    orderId,
    orderNumber: order?.order_number ?? 0,
    invoiceCreated: invoice.ok,
  });
}

export async function GET() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('orders')
    .select('id, order_number, status, total_cents, created_at, gbp_paid_at')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ orders: data });
}
