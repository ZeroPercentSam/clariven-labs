// /admin/audit log viewer (Phase 5 c1). Seeds two audit rows via service-role
// (admin_audit_log SELECT is admin-only RLS), then proves the viewer renders
// them, the target-type filter narrows, CSV exports, and a non-admin is 403'd.
// Markers use unique `e2e-audit-*` target_ids so cleanup is precise and the
// freshly-inserted rows sort to the top (created_at DESC) regardless of volume.

import { expect, test, type Page } from '@playwright/test';
import { ADMIN_EMAIL, CUSTOMER_EMAIL, TEST_PASSWORD, admin } from './helpers';

const SUFFIX = Math.random().toString(36).slice(2, 8);
const ORDER_MARKER = `e2e-audit-order-${SUFFIX}`;
const ORG_MARKER = `e2e-audit-org-${SUFFIX}`;
const NOTE_MARKER = `e2e audit marker ${SUFFIX}`;

let adminUid = '';

async function cleanup() {
  const supa = admin();
  await supa.from('admin_audit_log').delete().like('target_id', 'e2e-audit-%');
}

async function login(page: Page, email: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'));
}

test.describe.serial('admin audit log viewer', () => {
  test.beforeAll(async () => {
    await cleanup();
    const supa = admin();
    const { data: prof } = await supa.from('profiles').select('id').eq('email', ADMIN_EMAIL).single();
    adminUid = prof!.id;
    await supa.from('admin_audit_log').insert([
      {
        actor_id: adminUid,
        action: 'order.patch',
        target_type: 'order',
        target_id: ORDER_MARKER,
        payload: { status: 'shipped', note: NOTE_MARKER },
      },
      {
        actor_id: adminUid,
        action: 'organization.approved',
        target_type: 'organization',
        target_id: ORG_MARKER,
        payload: {},
      },
    ]);
  });

  test.afterAll(cleanup);

  test('viewer renders the seeded events with actor + payload', async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    await page.goto('/admin/audit');
    // Freshly inserted rows are newest → top of the list.
    await expect(page.getByText(ORDER_MARKER)).toBeVisible();
    await expect(page.getByText('order.patch').first()).toBeVisible();
    await expect(page.getByText(NOTE_MARKER)).toBeVisible();
    // Actor hydrated to the admin email.
    await expect(page.getByText(ADMIN_EMAIL).first()).toBeVisible();
  });

  test('target-type filter narrows the list', async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    // Organizations only: org marker shows, order marker hidden.
    await page.goto('/admin/audit?target=organization');
    await expect(page.getByText(ORG_MARKER)).toBeVisible();
    await expect(page.getByText(ORDER_MARKER)).toHaveCount(0);
    // Orders only: order marker shows, org marker hidden.
    await page.goto('/admin/audit?target=order');
    await expect(page.getByText(ORDER_MARKER)).toBeVisible();
    await expect(page.getByText(ORG_MARKER)).toHaveCount(0);
  });

  test('CSV export returns the audit rows', async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    const resp = await page.request.get('/admin/audit/export');
    expect(resp.status()).toBe(200);
    expect(resp.headers()['content-type']).toContain('text/csv');
    const body = await resp.text();
    expect(body).toContain('order.patch');
    expect(body).toContain(ORDER_MARKER);
    expect(body).toContain(NOTE_MARKER);
  });

  test('non-admin is bounced from the audit export', async ({ page }) => {
    await login(page, CUSTOMER_EMAIL);
    const resp = await page.request.get('/admin/audit/export', { maxRedirects: 0 });
    // The proxy admin-gate redirects a logged-in non-admin to /portal (307)
    // before the route's own getProfile() 403 (defense-in-depth) can run.
    // Either way the CSV is never served.
    expect([302, 303, 307, 308, 403]).toContain(resp.status());
    if (resp.status() !== 403) {
      expect(resp.headers()['location'] ?? '').toContain('/portal');
    }
  });
});
