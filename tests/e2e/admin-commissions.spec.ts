// Admin commissions ledger + payouts (Phase 4 c6). Drives the real
// /admin/commissions UI: batch-pay all earned (→ paid + batch id + payout
// batch), void a commission, and CSV export. Self-contained: `e2e-repc6-`
// users + `e2e-repasgn-` org.

import { expect, test, type Page } from '@playwright/test';
import { ADMIN_EMAIL, TEST_EMAIL_DOMAIN, TEST_PASSWORD, admin } from './helpers';

const REP_EMAIL = `e2e-repc6-rep@${TEST_EMAIL_DOMAIN}`;
const CUST_EMAIL = `e2e-repc6-cust@${TEST_EMAIL_DOMAIN}`;
let repUid = '';
let custUid = '';
let orgId = '';

const SHIPPING = { full_name: 'Lab', line1: '1 Way', city: 'Cheyenne', state: 'WY', postal_code: '82001', country: 'US' };

async function makePaidOrder(subtotal: number, cogs: number): Promise<string> {
  const supa = admin();
  const { data: order } = await supa
    .from('orders')
    .insert({
      user_id: custUid,
      organization_id: orgId,
      shipping_address: SHIPPING,
      subtotal_cents: subtotal,
      discount_cents: 0,
      total_cents: subtotal,
      status: 'pending_payment',
    })
    .select('id')
    .single();
  await supa.from('order_items').insert({
    order_id: order!.id,
    product_slug: 'single-regulator',
    product_name: 'Single Regulator',
    strength_label: '10 mg',
    quantity: 1,
    unit_price_cents: 1000,
    unit_cost_cents: cogs,
    line_total_cents: 1000,
  });
  await supa.from('orders').update({ status: 'paid' }).eq('id', order!.id);
  return order!.id;
}

async function commissionFor(orderId: string) {
  const supa = admin();
  const { data } = await supa.from('rep_commissions').select('*').eq('order_id', orderId).maybeSingle();
  return data;
}

async function cleanup() {
  const supa = admin();
  const { data: list } = await supa.auth.admin.listUsers({ perPage: 200 });
  const uids = (list?.users ?? [])
    .filter((u) => u.email?.startsWith('e2e-repc6-') && u.email.endsWith(`@${TEST_EMAIL_DOMAIN}`))
    .map((u) => u.id);
  const { data: orgs } = await supa.from('organizations').select('id').like('slug', 'e2e-repasgn-%');
  const oids = (orgs ?? []).map((o) => o.id);
  if (oids.length) {
    const { data: ords } = await supa.from('orders').select('id').in('organization_id', oids);
    const ordIds = (ords ?? []).map((o) => o.id);
    if (ordIds.length) {
      await supa.from('rep_commissions').delete().in('order_id', ordIds);
      await supa.from('order_items').delete().in('order_id', ordIds);
      await supa.from('orders').delete().in('id', ordIds);
    }
    await supa.from('rep_org_assignments').delete().in('organization_id', oids);
  }
  if (uids.length) {
    await supa.from('rep_commissions').delete().in('rep_user_id', uids);
    await supa.from('rep_org_assignments').delete().in('rep_user_id', uids);
    await supa.from('sales_reps').delete().in('id', uids);
  }
  if (oids.length) await supa.from('organizations').delete().in('id', oids);
  for (const id of uids) await supa.auth.admin.deleteUser(id);
}

async function login(page: Page, email: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'));
}

test.describe.serial('admin commissions + payouts', () => {
  test.beforeAll(async () => {
    await cleanup();
    const supa = admin();
    const mk = async (email: string) => {
      const { data, error } = await supa.auth.admin.createUser({ email, password: TEST_PASSWORD, email_confirm: true });
      if (error || !data.user) throw new Error(`createUser ${email}: ${error?.message}`);
      return data.user.id;
    };
    repUid = await mk(REP_EMAIL);
    custUid = await mk(CUST_EMAIL);
    await supa.from('sales_reps').insert({
      id: repUid, status: 'active', legal_name: 'Rep', onboarding_completed_at: new Date().toISOString(),
    });
    const slug = `e2e-repasgn-${Math.random().toString(36).slice(2, 8)}`;
    const { data: org } = await supa
      .from('organizations')
      .insert({ name: 'E2E RepAsgn C6', slug, approval_status: 'approved' })
      .select('id')
      .single();
    orgId = org!.id;
    await supa.from('rep_org_assignments').insert({ rep_user_id: repUid, organization_id: orgId, commission_pct: null });
  });

  test.afterAll(cleanup);

  test('admin marks all earned commissions paid as a batch', async ({ page }) => {
    const orderId = await makePaidOrder(100000, 40000); // base 60000 → 12000 earned
    const before = await commissionFor(orderId);
    expect(before?.status).toBe('earned');

    await login(page, ADMIN_EMAIL);
    await page.goto('/admin/commissions');
    await page.getByRole('button', { name: /mark all earned paid/i }).click();
    await page.waitForURL(/\/admin\/commissions\/payouts/);
    await expect(page.getByText(/batch .* created/i)).toBeVisible();

    const after = await commissionFor(orderId);
    expect(after?.status).toBe('paid');
    expect(after?.paid_batch_id).toBeTruthy();
    expect(after?.paid_at).toBeTruthy();

    // Audit row for the batch.
    const supa = admin();
    const { data: auditRows } = await supa
      .from('admin_audit_log')
      .select('action')
      .eq('action', 'rep_commissions.batch_paid')
      .eq('target_id', after!.paid_batch_id!);
    expect((auditRows ?? []).length).toBe(1);
  });

  test('admin voids a commission', async ({ page }) => {
    const orderId = await makePaidOrder(50000, 10000); // base 40000 → 8000 earned
    await login(page, ADMIN_EMAIL);
    await page.goto('/admin/commissions?status=earned');
    // Void the first (only) earned row.
    await page.getByRole('button', { name: /^void$/i }).first().click();
    await page.waitForURL(/ok=voided/);

    const c = await commissionFor(orderId);
    expect(c?.status).toBe('void');
    expect(c?.reversed_at).toBeTruthy();
  });

  test('CSV export returns the ledger', async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    const resp = await page.request.get('/admin/commissions/export');
    expect(resp.status()).toBe(200);
    expect(resp.headers()['content-type']).toContain('text/csv');
    const body = await resp.text();
    expect(body).toContain('commission_cents');
    expect(body).toContain(REP_EMAIL);
  });
});
