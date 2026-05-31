// /admin/orders power tools (Phase 5 c2): multi-select bulk status change,
// inline mark-shipped (with tracking), CSV export. Seeds its own approved org +
// customer + a few orders via service-role, drives the real admin UI, asserts
// DB state. Self-contained cleanup (`e2e-ordtools-` users + org slug).

import { expect, test, type Page } from '@playwright/test';
import { ADMIN_EMAIL, TEST_EMAIL_DOMAIN, TEST_PASSWORD, admin } from './helpers';

const CUST_EMAIL = `e2e-ordtools-cust@${TEST_EMAIL_DOMAIN}`;
let custUid = '';
let orgId = '';
const orders: { id: string; order_number: number }[] = [];

const SHIPPING = {
  full_name: 'Lab',
  line1: '1 Research Way',
  city: 'Cheyenne',
  state: 'WY',
  postal_code: '82001',
  country: 'US',
};

async function cleanup() {
  const supa = admin();
  const { data: orgs } = await supa.from('organizations').select('id').like('slug', 'e2e-ordtools-%');
  const oids = (orgs ?? []).map((o) => o.id);
  if (oids.length) {
    const { data: ords } = await supa.from('orders').select('id').in('organization_id', oids);
    const ordIds = (ords ?? []).map((o) => o.id);
    if (ordIds.length) {
      await supa.from('rep_commissions').delete().in('order_id', ordIds);
      await supa.from('order_items').delete().in('order_id', ordIds);
      await supa.from('orders').delete().in('id', ordIds);
    }
    await supa.from('organizations').delete().in('id', oids);
  }
  const { data: list } = await supa.auth.admin.listUsers({ perPage: 200 });
  for (const u of list?.users ?? []) {
    if (u.email?.startsWith('e2e-ordtools-') && u.email.endsWith(`@${TEST_EMAIL_DOMAIN}`)) {
      await supa.auth.admin.deleteUser(u.id);
    }
  }
}

async function statusOf(orderId: string) {
  const supa = admin();
  const { data } = await supa
    .from('orders')
    .select('status, tracking_carrier, tracking_number')
    .eq('id', orderId)
    .single();
  return data;
}

async function login(page: Page, email: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'));
}

test.describe.serial('admin orders power tools', () => {
  test.beforeAll(async () => {
    await cleanup();
    const supa = admin();
    const { data, error } = await supa.auth.admin.createUser({
      email: CUST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
    });
    if (error || !data.user) throw new Error(`createUser: ${error?.message}`);
    custUid = data.user.id;

    const slug = `e2e-ordtools-${Math.random().toString(36).slice(2, 8)}`;
    const { data: org } = await supa
      .from('organizations')
      .insert({ name: 'E2E OrdTools', slug, approval_status: 'approved' })
      .select('id')
      .single();
    orgId = org!.id;

    // Three 'processing' orders so bulk → paid is a real transition and the
    // inline Ship control is offered (hidden once shipped/delivered).
    for (let i = 0; i < 3; i++) {
      const { data: o } = await supa
        .from('orders')
        .insert({
          user_id: custUid,
          organization_id: orgId,
          shipping_address: SHIPPING,
          subtotal_cents: 5000 + i * 1000,
          discount_cents: 0,
          total_cents: 5000 + i * 1000,
          status: 'processing',
        })
        .select('id, order_number')
        .single();
      orders.push({ id: o!.id, order_number: o!.order_number });
    }
  });

  test.afterAll(cleanup);

  test('bulk status change marks selected orders paid', async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    await page.goto('/admin/orders?status=processing');

    await page.getByLabel(`Select order ${orders[0].order_number}`).check();
    await page.getByLabel(`Select order ${orders[1].order_number}`).check();
    await expect(page.getByText('2 selected')).toBeVisible();

    await page.getByLabel('Bulk status').selectOption('paid');
    await page.getByRole('button', { name: /apply to 2/i }).click();

    await expect.poll(async () => (await statusOf(orders[0].id))?.status).toBe('paid');
    expect((await statusOf(orders[1].id))?.status).toBe('paid');
    // The unselected third order is untouched.
    expect((await statusOf(orders[2].id))?.status).toBe('processing');
  });

  test('inline mark-shipped sets status + tracking', async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    await page.goto('/admin/orders?status=processing');

    // Third order is still 'processing' → its row offers Ship.
    const row = page.locator('tr', { hasText: `Order #${orders[2].order_number}` });
    await row.getByRole('button', { name: /^ship$/i }).click();
    await page.getByPlaceholder(/carrier/i).fill('UPS');
    await page.getByPlaceholder(/tracking/i).fill('1Z-E2E-ORDTOOLS');
    await page.getByRole('button', { name: /mark shipped/i }).click();

    await expect.poll(async () => (await statusOf(orders[2].id))?.status).toBe('shipped');
    const o = await statusOf(orders[2].id);
    expect(o?.tracking_carrier).toBe('UPS');
    expect(o?.tracking_number).toBe('1Z-E2E-ORDTOOLS');
  });

  test('CSV export returns the orders', async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    const resp = await page.request.get('/admin/orders/export');
    expect(resp.status()).toBe(200);
    expect(resp.headers()['content-type']).toContain('text/csv');
    const body = await resp.text();
    expect(body).toContain('order_number');
    expect(body).toContain(String(orders[0].order_number));
  });
});
