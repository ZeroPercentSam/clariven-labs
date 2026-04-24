import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getInvoiceStatus } from '@/lib/gbp/invoices';
import { GBP_PAYMENT_RESULT } from '@/lib/gbp/types';

// Vercel Cron hits this every 15 minutes. Updates status based on Green.Money
// `InvoiceStatus`. Guarded by CRON_SECRET.

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const BATCH = 50;

function isAuthorized(request: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  // Vercel Cron sends "Authorization: Bearer <secret>"
  const header = request.headers.get('authorization');
  return header === `Bearer ${expected}`;
}

function statusFromPaymentResult(code: number): string | null {
  switch (code) {
    case GBP_PAYMENT_RESULT.PAID:
      return 'paid';
    case GBP_PAYMENT_RESULT.PROCESSING:
      return 'processing';
    case GBP_PAYMENT_RESULT.DELETED:
      return 'cancelled';
    case GBP_PAYMENT_RESULT.PENDING:
      return 'pending_payment';
    default:
      return null;
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const admin = createAdminClient();
  const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

  const { data: orders, error } = await admin
    .from('orders')
    .select('id, gbp_invoice_id, status, gbp_last_polled_at')
    .in('status', ['pending_payment', 'processing'])
    .not('gbp_invoice_id', 'is', null)
    .or(`gbp_last_polled_at.is.null,gbp_last_polled_at.lt.${tenMinAgo}`)
    .order('gbp_last_polled_at', { ascending: true, nullsFirst: true })
    .limit(BATCH);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let updated = 0;
  let paid = 0;

  for (const order of orders ?? []) {
    if (!order.gbp_invoice_id) continue;
    const status = await getInvoiceStatus(order.gbp_invoice_id);
    if (!status.ok || typeof status.paymentResult !== 'number') {
      // Record the attempt even on failure so we don't hammer a broken invoice
      await admin
        .from('orders')
        .update({ gbp_last_polled_at: new Date().toISOString() })
        .eq('id', order.id);
      continue;
    }

    const mapped = statusFromPaymentResult(status.paymentResult);
    const nowIso = new Date().toISOString();
    const changed = mapped && mapped !== order.status;
    const becamePaid = changed && mapped === 'paid';
    if (changed) {
      updated += 1;
      if (becamePaid) paid += 1;
    }
    await admin
      .from('orders')
      .update({
        gbp_last_polled_at: nowIso,
        gbp_payment_result: status.paymentResult,
        ...(changed ? { status: mapped } : {}),
        ...(becamePaid ? { gbp_paid_at: nowIso } : {}),
      })
      .eq('id', order.id);
  }

  return NextResponse.json({
    ok: true,
    examined: orders?.length ?? 0,
    updated,
    paid,
  });
}
