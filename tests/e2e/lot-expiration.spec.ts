// Lot / COA-lite (Phase 5 c). Three layers:
//   1. Pure selectLotsToNotify unit cases (no creds — threshold/window/idempotency).
//   2. Cron auth (401 without the bearer, 200 with).
//   3. Integration: seed an active lot 14 days out → cron emits the 14 tuple +
//      writes the dedupe row → re-run is idempotent.
//   4. Admin UI smoke: admin adds a lot at /admin/lots and sees it.
// Email no-ops without RESEND_API_KEY, so we assert on tuples/dedupe, not delivery.

import { expect, test, type Page } from '@playwright/test';
import { ADMIN_EMAIL, TEST_EMAIL_DOMAIN, TEST_PASSWORD, admin } from './helpers';
import { selectLotsToNotify } from '../../src/lib/inventory/lot-expiration-alerts';

function isoPlusDays(base: Date, days: number): string {
  const d = new Date(base);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const TODAY = new Date('2026-06-01T12:00:00Z');

test.describe('lot-expiration — pure selection helper', () => {
  test('fires exactly the matching threshold; respects window + active + idempotency', () => {
    const lots = [
      { id: 'a', expirationDate: isoPlusDays(TODAY, 14), active: true },
      { id: 'b', expirationDate: isoPlusDays(TODAY, 90), active: true },
      { id: 'c', expirationDate: isoPlusDays(TODAY, 45), active: true }, // between windows
      { id: 'd', expirationDate: isoPlusDays(TODAY, 14), active: false }, // inactive
    ];
    const got = selectLotsToNotify(lots, [], TODAY);
    expect(got).toEqual(
      expect.arrayContaining([
        { lotId: 'a', thresholdDays: 14 },
        { lotId: 'b', thresholdDays: 90 },
      ]),
    );
    expect(got).toHaveLength(2); // c (45d) and d (inactive) excluded

    // Idempotency: an already-sent (a,14) is not re-emitted.
    const suppressed = selectLotsToNotify(lots, [{ lot_id: 'a', threshold_days: 14 }], TODAY);
    expect(suppressed.find((t) => t.lotId === 'a')).toBeUndefined();
    expect(suppressed).toHaveLength(1); // only b remains
  });
});

test.describe('lot-expiration — cron auth', () => {
  test('401 without the bearer, 200 with it', async ({ request }) => {
    const noAuth = await request.get('/api/cron/lot-expiration');
    expect(noAuth.status()).toBe(401);

    const ok = await request.get('/api/cron/lot-expiration', {
      headers: { authorization: 'Bearer test-cron-secret' },
    });
    expect(ok.status()).toBe(200);
    const body = await ok.json();
    expect(body.ok).toBe(true);
  });
});

test.describe.serial('lot-expiration — cron integration + admin UI', () => {
  let lotId = '';
  const lotNumber = `E2E-LOT-${Math.random().toString(36).slice(2, 8)}`;

  test.beforeAll(async () => {
    const supa = admin();
    // Deterministic candidate set.
    await supa.from('lot_alert_notifications').delete().gt('sent_at', '1970-01-01');
    await supa.from('product_lots').delete().gt('created_at', '1970-01-01');
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const { data, error } = await supa
      .from('product_lots')
      .insert({
        product_slug: 'single-regulator',
        strength_label: '10 mg',
        lot_number: lotNumber,
        expiration_date: isoPlusDays(today, 14),
        active: true,
      })
      .select('id')
      .single();
    if (error || !data) throw new Error(`seed lot: ${error?.message}`);
    lotId = data.id;
  });

  test.afterAll(async () => {
    const supa = admin();
    await supa.from('lot_alert_notifications').delete().gt('sent_at', '1970-01-01');
    await supa.from('product_lots').delete().like('lot_number', 'E2E-LOT-%');
  });

  test('cron emits the 14-day tuple, writes the dedupe row, and is idempotent', async ({ request }) => {
    const first = await request.get('/api/cron/lot-expiration', {
      headers: { authorization: 'Bearer test-cron-secret' },
    });
    expect(first.status()).toBe(200);
    const body = await first.json();
    expect(body.summary.tuples_emitted).toBeGreaterThanOrEqual(1);

    const { data: rows } = await admin()
      .from('lot_alert_notifications')
      .select('threshold_days')
      .eq('lot_id', lotId);
    expect((rows ?? []).some((r) => r.threshold_days === 14)).toBe(true);

    // Re-run: already-sent → no new tuples for our lot.
    const second = await request.get('/api/cron/lot-expiration', {
      headers: { authorization: 'Bearer test-cron-secret' },
    });
    const body2 = await second.json();
    expect(body2.summary.tuples_emitted).toBe(0);
  });

  test('admin can add a lot at /admin/lots and see it', async ({ page }: { page: Page }) => {
    await login(page, ADMIN_EMAIL);
    await page.goto('/admin/lots');
    const uiLot = `E2E-LOT-UI-${Math.random().toString(36).slice(2, 7)}`;
    await page.getByLabel('Lot number').fill(uiLot);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    await page.getByLabel('Expiration date').fill(isoPlusDays(today, 60));
    await page.getByRole('button', { name: /add lot/i }).click();
    await expect(page.getByText(uiLot)).toBeVisible();
  });
});

async function login(page: Page, email: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'));
}
