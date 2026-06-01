import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { orderCreateSchema } from '@/lib/schemas/order';
import { createOneTimeInvoice } from '@/lib/gbp/invoices';
import { sendKatieNewOrderSms } from '@/lib/twilio';
import { sendEmail } from '@/lib/email/send';
import { orderPlacedEmail } from '@/lib/email/templates/order-placed';
import { clientIp, rateLimit } from '@/lib/ratelimit';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // Throttle order placement (no-op until Upstash is configured) — order spam
  // fans out to GBP invoices + ops SMS, so cap it per user.
  const limited = await rateLimit(auth.user.id ?? clientIp(req), {
    name: 'orders',
    limit: 5,
    windowSec: 60,
  });
  if (limited) return limited;

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

  // 2. Fetch order + profile via user-auth client (own rows via RLS).
  const [{ data: order }, { data: profile }] = await Promise.all([
    supabase.from('orders').select('order_number').eq('id', orderId).single(),
    supabase.from('profiles').select('email, full_name').eq('id', auth.user.id).single(),
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

  // 3. Create GBP invoice + attach to order via user-auth RPC
  //    (SECURITY DEFINER function verifies the caller owns this order).
  const invoice = await createOneTimeInvoice({
    orderNumber: order?.order_number ?? 0,
    customerName: customerName.slice(0, 100),
    customerEmail: profile?.email ?? auth.user.email ?? '',
    amountCents: totalCents,
    itemSummary,
  });

  if (invoice.ok) {
    await supabase.rpc('attach_invoice_to_order', {
      p_order_id: orderId,
      p_invoice_id: invoice.invoiceId ?? '',
      p_check_id: invoice.checkId ?? '',
      p_payment_result: invoice.paymentResult ?? 3,
    });
  }

  // 4. Fire-and-forget SMS to Katie.
  void sendKatieNewOrderSms({
    orderNumber: order?.order_number ?? 0,
    customerName,
    itemCount: parsed.data.items.reduce((s, i) => s + i.quantity, 0),
    totalCents,
  });

  // 5. Fire-and-forget order-received email (best-effort; invariant 7 — never
  //    rolls back the order; no-ops cleanly until RESEND_API_KEY is set).
  const customerEmail = profile?.email ?? auth.user.email ?? '';
  if (customerEmail) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
    void sendEmail({
      to: customerEmail,
      kind: 'order-placed',
      ...orderPlacedEmail({
        customerName,
        orderNumber: order?.order_number ?? 0,
        totalCents,
        itemSummary,
        ctaUrl: `${siteUrl}/portal/orders/${orderId}`,
      }),
    });
  }

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
