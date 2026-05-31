// /admin/sales-dashboard (Phase 5 c3): KPI cards + range chips (7/30/90d) +
// daily paid-revenue bars. Seeds an approved org + customer + paid orders via
// service-role, then drives the real admin UI. Revenue is NOT asserted exactly
// (shared DB — other orders only add); instead we prove the seeded paid orders
// register (chart non-empty) and the range chip re-navigates. Self-contained
// cleanup (`e2e-sales-` users + org slug).

import { expect, test, type Page } from '@playwright/test';
import { ADMIN_EMAIL, CUSTOMER_EMAIL, TEST_EMAIL_DOMAIN, TEST_PASSWORD, admin } from './helpers';

const CUST_EMAIL = `e2e-sales-cust@${TEST_EMAIL_DOMAIN}`;
let custUid = '';
let orgId = '';

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
  const { data: orgs } = await supa.from('organizations').select('id').like('slug', 'e2e-sales-%');
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
    if (u.email?.startsWith('e2e-sales-') && u.email.endsWith(`@${TEST_EMAIL_DOMAIN}`)) {
      await supa.auth.admin.deleteUser(u.id);
    }
  }
}

async function login(page: Page, email: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'));
}

test.describe.serial('admin sales dashboard', () => {
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

    const slug = `e2e-sales-${Math.random().toString(36).slice(2, 8)}`;
    const { data: org } = await supa
      .from('organizations')
      .insert({ name: 'E2E Sales', slug, approval_status: 'approved' })
      .select('id')
      .single();
    orgId = org!.id;

    // Two paid orders placed now → counted in every range; makes the chart
    // non-empty for the "registers" assertion.
    for (let i = 0; i < 2; i++) {
      await supa.from('orders').insert({
        user_id: custUid,
        organization_id: orgId,
        shipping_address: SHIPPING,
        subtotal_cents: 25000,
        discount_cents: 0,
        total_cents: 25000,
        status: 'paid',
      });
    }
  });

  test.afterAll(cleanup);

  test('renders KPI cards + non-empty chart at the default 30d range', async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    await page.goto('/admin/sales-dashboard');
    await expect(page.getByRole('heading', { name: 'Sales dashboard' })).toBeVisible();
    await expect(page.getByText('Revenue (paid, 30d)')).toBeVisible();
    await expect(page.getByText('Avg order value')).toBeVisible();
    // Seeded paid orders → chart is rendered (empty-state absent).
    await expect(page.getByRole('img', { name: /daily paid revenue/i })).toBeVisible();
  });

  test('range chip re-navigates to the selected window', async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    await page.goto('/admin/sales-dashboard');
    await page.getByRole('button', { name: '7d' }).click();
    await page.waitForURL(/range=7/);
    await expect(page.getByText('Revenue (paid, 7d)')).toBeVisible();
    await expect(page.getByRole('button', { name: '7d' })).toHaveAttribute('data-active', 'true');
  });

  test('non-admin is bounced from the sales dashboard', async ({ page }) => {
    await login(page, CUSTOMER_EMAIL);
    const resp = await page.request.get('/admin/sales-dashboard', { maxRedirects: 0 });
    expect([302, 303, 307, 308, 403]).toContain(resp.status());
    if (resp.status() !== 403) {
      expect(resp.headers()['location'] ?? '').toContain('/portal');
    }
  });
});
