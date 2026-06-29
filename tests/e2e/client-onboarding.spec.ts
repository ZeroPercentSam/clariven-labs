// Consulting client onboarding (consulting pivot). Drives the real
// /admin/clients UI: admin provisions a client account with a generated
// password (asserting org + owner membership + seeded checklist + audit), then
// checks an item off; finally the provisioned client logs in to
// /portal/onboarding, sees progress, and ticks an item themselves. Self-
// contained: `e2e-clionb-` user + `e2e-clionb-…` org slug, torn down after.

import { expect, test, type Page } from '@playwright/test';
import { ADMIN_EMAIL, TEST_EMAIL_DOMAIN, TEST_PASSWORD, admin } from './helpers';

const CLIENT_EMAIL = `e2e-clionb-client@${TEST_EMAIL_DOMAIN}`;
const ORG_NAME = 'E2E CliOnb Lab';
let adminUid = '';
let orgId = '';
let clientUid = '';

async function cleanup() {
  const supa = admin();
  const { data: list } = await supa.auth.admin.listUsers({ perPage: 200 });
  const ids = (list?.users ?? [])
    .filter((u) => u.email?.startsWith('e2e-clionb-') && u.email.endsWith(`@${TEST_EMAIL_DOMAIN}`))
    .map((u) => u.id);
  const { data: orgs } = await supa.from('organizations').select('id').like('slug', 'e2e-clionb-%');
  const oids = (orgs ?? []).map((o) => o.id);
  if (oids.length) {
    // client_* tables cascade on org delete; org_members + the org explicitly.
    await supa.from('org_members').delete().in('organization_id', oids);
    await supa.from('organizations').delete().in('id', oids);
  }
  for (const id of ids) await supa.auth.admin.deleteUser(id);
  await supa.from('admin_audit_log').delete().eq('action', 'client.created');
}

async function login(page: Page, email: string, password = TEST_PASSWORD) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'));
}

test.describe.serial('consulting client onboarding', () => {
  test.beforeAll(async () => {
    await cleanup();
    const supa = admin();
    const { data: prof } = await supa.from('profiles').select('id').eq('email', ADMIN_EMAIL).single();
    adminUid = prof!.id;
  });

  test.afterAll(cleanup);

  test('admin provisions a client → org, owner, seeded checklist, password, audit', async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    await page.goto('/admin/clients/new');

    await page.getByLabel(/Client company name/i).fill(ORG_NAME);
    await page.getByLabel(/Contact name/i).fill('Jordan Client');
    await page.getByLabel(/Contact email/i).fill(CLIENT_EMAIL);
    await page.getByRole('button', { name: /create client account/i }).click();

    // Generated password is revealed once.
    await expect(page.getByText(/Account created/i)).toBeVisible();
    await expect(page.getByText(/Temporary password/i)).toBeVisible();

    const supa = admin();
    // Org created + approved.
    const { data: org } = await supa
      .from('organizations')
      .select('id, approval_status')
      .like('slug', 'e2e-clionb-%')
      .single();
    expect(org?.approval_status).toBe('approved');
    orgId = org!.id;

    // The client user exists, linked to the org as owner.
    const { data: list } = await supa.auth.admin.listUsers({ perPage: 200 });
    clientUid = (list?.users ?? []).find((u) => u.email === CLIENT_EMAIL)!.id;
    const { data: prof } = await supa
      .from('profiles')
      .select('organization_id, role')
      .eq('id', clientUid)
      .single();
    expect(prof?.organization_id).toBe(orgId);
    expect(prof?.role).toBe('customer');
    const { data: member } = await supa
      .from('org_members')
      .select('org_role')
      .eq('organization_id', orgId)
      .eq('user_id', clientUid)
      .single();
    expect(member?.org_role).toBe('owner');

    // The full checklist seeded (one status row per active template item).
    const { count: itemCount } = await supa
      .from('client_item_status')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId);
    const { count: templateCount } = await supa
      .from('onboarding_items')
      .select('*', { count: 'exact', head: true })
      .eq('active', true);
    expect(itemCount).toBe(templateCount);
    expect(itemCount ?? 0).toBeGreaterThan(100);

    // Header row + audit.
    const { data: header } = await supa
      .from('client_onboarding')
      .select('status')
      .eq('organization_id', orgId)
      .single();
    expect(header?.status).toBe('onboarding');
    const { data: audit } = await supa
      .from('admin_audit_log')
      .select('action')
      .eq('action', 'client.created')
      .eq('target_id', orgId);
    expect((audit ?? []).length).toBeGreaterThan(0);
  });

  test('admin checks an item off → done + done_by = admin', async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    await page.goto(`/admin/clients/${orgId}`);

    const firstItem = page.getByRole('button', { name: /Review and sign all Clariven Labs agreements/i });
    await expect(firstItem).toBeVisible();
    await firstItem.click();

    const supa = admin();
    await expect
      .poll(async () => {
        const { count } = await supa
          .from('client_item_status')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', orgId)
          .eq('status', 'done')
          .eq('done_by', adminUid);
        return count ?? 0;
      })
      .toBeGreaterThan(0);
  });

  test('admin fills client intake (LLC + brand) → persists to client_intake', async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    await page.goto(`/admin/clients/${orgId}`);

    // Business details form — admin writes the client's org via the hidden org_id.
    await page.locator('input[name="legal_name"]').fill('E2E CliOnb Lab LLC');
    await page.locator('input[name="llc_state"]').fill('Wyoming');
    await page.locator('form:has(input[name="legal_name"]) button[type="submit"]').click();

    // Brand research form (separate form on the same page).
    await page.locator('input[name="proposed_name"]').fill('E2E Brand');
    await page.locator('form:has(input[name="proposed_name"]) button[type="submit"]').click();

    const supa = admin();
    await expect
      .poll(async () => {
        const { data } = await supa
          .from('client_intake')
          .select('legal_name, llc_state, proposed_name')
          .eq('organization_id', orgId)
          .maybeSingle();
        return `${data?.legal_name ?? ''}|${data?.llc_state ?? ''}|${data?.proposed_name ?? ''}`;
      })
      .toBe('E2E CliOnb Lab LLC|Wyoming|E2E Brand');
  });

  test('provisioned client logs in → sees progress, ticks an item themselves', async ({ page }) => {
    // Reset to the known test password so we can sign in as the client (the
    // generated one is shown once and not captured here).
    const supa = admin();
    await supa.auth.admin.updateUserById(clientUid, { password: TEST_PASSWORD });

    await login(page, CLIENT_EMAIL);
    await page.goto('/portal/onboarding');

    await expect(page.getByRole('heading', { name: /Your onboarding/i })).toBeVisible();
    await expect(page.getByText(/Phase 1 of 9/i)).toBeVisible();

    // Tick an item the admin did NOT already complete.
    const item = page.getByRole('button', { name: /Submit executed contracts/i });
    await expect(item).toBeVisible();
    await item.click();

    await expect
      .poll(async () => {
        const { count } = await supa
          .from('client_item_status')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', orgId)
          .eq('status', 'done')
          .eq('done_by', clientUid);
        return count ?? 0;
      })
      .toBeGreaterThan(0);
  });

  test('client e-signs the consulting agreement → consent recorded', async ({ page }) => {
    const supa = admin();
    await supa.auth.admin.updateUserById(clientUid, { password: TEST_PASSWORD });
    await login(page, CLIENT_EMAIL);
    await page.goto('/portal/onboarding');

    // Agreements dropdown is open by default while unsigned.
    await page.locator('input[name="signed_legal_name"]').first().fill('Jordan Client');
    await page.locator('input[name="agree"]').first().check();
    await page.locator('form:has(input[name="signed_legal_name"]) button[type="submit"]').first().click();

    await expect
      .poll(async () => {
        const { count } = await supa
          .from('client_agreement_consents')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', orgId);
        return count ?? 0;
      })
      .toBeGreaterThan(0);
  });
});
