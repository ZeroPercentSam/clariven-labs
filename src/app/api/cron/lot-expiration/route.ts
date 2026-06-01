import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/send';
import { lotExpirationWarningEmail } from '@/lib/email/templates/lot-expiration-warning';
import {
  LOT_THRESHOLDS,
  selectLotsToNotify,
  type CandidateLot,
} from '@/lib/inventory/lot-expiration-alerts';
import { products } from '@/lib/products';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Phase 5 (c) — daily lot-expiration cron.
 *
 * For every ACTIVE product_lot whose expiration_date crosses a 90/60/30/14-day
 * threshold, fan out a warning email to every admin. Idempotency is per-lot via
 * lot_alert_notifications (migration 0023), not per-recipient, so adding an
 * admin doesn't backfill missed warnings. Emails no-op cleanly until Resend
 * creds land (Phase 7) — identical to the order emails.
 *
 * Auth: Vercel injects `Authorization: Bearer <CRON_SECRET>` for /api/cron/*.
 */
function isAuthorized(request: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  return request.headers.get('authorization') === `Bearer ${expected}`;
}

const productName = (slug: string): string => products.find((p) => p.slug === slug)?.name ?? slug;

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }

  const summary: Record<string, number> = {
    candidates_scanned: 0,
    tuples_emitted: 0,
    emails_sent: 0,
    email_errors: 0,
  };

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const horizon = new Date(today);
  horizon.setUTCDate(horizon.getUTCDate() + Math.max(...LOT_THRESHOLDS));

  const { data: lots, error: lotErr } = await admin
    .from('product_lots')
    .select('id, lot_number, expiration_date, product_slug, strength_label, active')
    .eq('active', true)
    .gte('expiration_date', isoDate(today))
    .lte('expiration_date', isoDate(horizon));
  if (lotErr) {
    return NextResponse.json({ ok: false, stage: 'fetch_lots', error: lotErr.message }, { status: 500 });
  }

  const lotRows = lots ?? [];
  summary.candidates_scanned = lotRows.length;
  if (lotRows.length === 0) return NextResponse.json({ ok: true, summary });

  const candidates: CandidateLot[] = lotRows.map((l) => ({
    id: l.id,
    expirationDate: l.expiration_date,
    active: l.active,
  }));

  const lotIds = lotRows.map((l) => l.id);
  const { data: sent, error: sentErr } = await admin
    .from('lot_alert_notifications')
    .select('lot_id, threshold_days')
    .in('lot_id', lotIds);
  if (sentErr) {
    return NextResponse.json({ ok: false, stage: 'fetch_sent', error: sentErr.message }, { status: 500 });
  }

  const tuples = selectLotsToNotify(candidates, sent ?? [], today);
  summary.tuples_emitted = tuples.length;
  if (tuples.length === 0) return NextResponse.json({ ok: true, summary });

  // Recipients: every admin with an email. Per-lot dedupe (below) means a new
  // admin doesn't get backfilled past warnings.
  const { data: admins, error: adminErr } = await admin
    .from('profiles')
    .select('email')
    .eq('role', 'admin')
    .not('email', 'is', null);
  if (adminErr) {
    return NextResponse.json({ ok: false, stage: 'fetch_admins', error: adminErr.message }, { status: 500 });
  }
  const recipients = (admins ?? [])
    .map((a) => a.email)
    .filter((e): e is string => typeof e === 'string' && e.length > 0);
  if (recipients.length === 0) return NextResponse.json({ ok: true, summary });

  const lotsById = new Map(lotRows.map((l) => [l.id, l]));

  for (const tuple of tuples) {
    const lot = lotsById.get(tuple.lotId);
    if (!lot) continue;

    // Insert the idempotency row first; on a duplicate race, skip the send so we
    // never double-email (mirrors poll-invoices' best-effort posture).
    const { error: insErr } = await admin
      .from('lot_alert_notifications')
      .insert({ lot_id: tuple.lotId, threshold_days: tuple.thresholdDays });
    if (insErr) {
      if (insErr.code === '23505' || insErr.message.includes('duplicate key')) continue;
      return NextResponse.json(
        { ok: false, stage: 'insert_dedupe', lot_id: tuple.lotId, error: insErr.message },
        { status: 500 },
      );
    }

    const tmpl = lotExpirationWarningEmail({
      lotNumber: lot.lot_number,
      productName: productName(lot.product_slug),
      strengthLabel: lot.strength_label,
      thresholdDays: tuple.thresholdDays,
      expirationDate: lot.expiration_date,
      adminLotUrl: `${siteUrl()}/admin/lots`,
    });

    for (const to of recipients) {
      const send = await sendEmail({ to, ...tmpl, kind: 'lot-expiration-warning' }, { logClient: admin });
      if (send.ok) summary.emails_sent += 1;
      else summary.email_errors += 1;
    }
  }

  return NextResponse.json({ ok: true, summary });
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}
