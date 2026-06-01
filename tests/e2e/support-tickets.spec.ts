// Support tickets — full round-trip (Phase 5 (b)). Drives the real UI:
// customer opens a ticket → admin triages (reply + internal note + resolve) →
// customer sees the reply but NOT the internal note → customer reply reopens it
// → a second customer in another org cannot read it (RLS). Seeds two customers
// in two approved orgs + uses the seeded admin (e2e-support- prefix);
// self-cleaning.

import { expect, test, type Page } from '@playwright/test';
import { ADMIN_EMAIL, TEST_EMAIL_DOMAIN, TEST_PASSWORD, admin } from './helpers';

const CUST_A = `e2e-support-a@${TEST_EMAIL_DOMAIN}`;
const CUST_B = `e2e-support-b@${TEST_EMAIL_DOMAIN}`;

let aUid = '';
let bUid = '';
let aOrg = '';
let bOrg = '';
let ticketId = '';

const SUBJECT = 'E2E — research-use shipment question';
const VISIBLE_REPLY = 'Here is our customer-visible answer.';
const INTERNAL_NOTE = 'INTERNAL diagnostic note — staff only';
const CUSTOMER_REPLY = 'Thanks, one more follow-up question.';

async function seedCustomer(email: string, orgName: string, fullName: string) {
  const supa = admin();
  const { data, error } = await supa.auth.admin.createUser({
    email,
    password: TEST_PASSWORD,
    email_confirm: true,
  });
  if (error || !data.user) throw new Error(`createUser ${email}: ${error?.message}`);
  const uid = data.user.id;
  await supa.from('profiles').update({ full_name: fullName }).eq('id', uid);
  const slug = `e2e-support-${Math.random().toString(36).slice(2, 8)}`;
  const { data: org, error: orgErr } = await supa
    .from('organizations')
    .insert({ name: orgName, slug, approval_status: 'approved' })
    .select('id')
    .single();
  if (orgErr || !org) throw new Error(`createOrg ${orgName}: ${orgErr?.message}`);
  await supa.from('profiles').update({ organization_id: org.id }).eq('id', uid);
  await supa.from('org_members').insert({ organization_id: org.id, user_id: uid, org_role: 'owner' });
  return { uid, orgId: org.id };
}

async function cleanup() {
  const supa = admin();
  const { data: list } = await supa.auth.admin.listUsers({ perPage: 200 });
  const uids = (list?.users ?? [])
    .filter((u) => u.email?.startsWith('e2e-support-') && u.email.endsWith(`@${TEST_EMAIL_DOMAIN}`))
    .map((u) => u.id);
  // tickets cascade from the org delete, but clear explicitly first to be safe.
  if (uids.length) await supa.from('support_tickets').delete().in('created_by', uids);
  const { data: orgs } = await supa.from('organizations').select('id').like('slug', 'e2e-support-%');
  const oids = (orgs ?? []).map((o) => o.id);
  if (oids.length) {
    await supa.from('support_tickets').delete().in('organization_id', oids);
    await supa.from('org_members').delete().in('organization_id', oids);
    await supa.from('organizations').delete().in('id', oids);
  }
  await supa.from('admin_audit_log').delete().like('action', 'support_ticket.%');
  for (const id of uids) await supa.auth.admin.deleteUser(id);
}

async function login(page: Page, email: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'));
}

async function ticketStatus(): Promise<string | null> {
  const { data } = await admin().from('support_tickets').select('status').eq('id', ticketId).maybeSingle();
  return data?.status ?? null;
}

test.describe.serial('support tickets — round-trip', () => {
  test.beforeAll(async () => {
    await cleanup();
    ({ uid: aUid, orgId: aOrg } = await seedCustomer(CUST_A, 'E2E Support Org A', 'Alice Researcher'));
    ({ uid: bUid, orgId: bOrg } = await seedCustomer(CUST_B, 'E2E Support Org B', 'Bob Researcher'));
    void aUid;
    void bUid;
    void bOrg;
  });

  test.afterAll(cleanup);

  test('customer opens a ticket', async ({ page }) => {
    await login(page, CUST_A);
    await page.goto('/portal/support/new');
    await page.getByPlaceholder(/short summary/i).fill(SUBJECT);
    await page.getByPlaceholder(/describe your question/i).fill('My order has a research-use question.');
    await page.getByRole('button', { name: /open ticket/i }).click();

    await page.waitForURL(/\/portal\/support\/[0-9a-f-]{36}/);
    ticketId = page.url().split('/portal/support/')[1];
    expect(ticketId).toMatch(/[0-9a-f-]{36}/);
    await expect(page.getByRole('heading', { name: SUBJECT })).toBeVisible();
  });

  test('admin sees it, replies, adds an internal note, resolves', async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    await page.goto('/admin/support');
    await expect(page.getByRole('link', { name: SUBJECT })).toBeVisible();

    await page.goto(`/admin/support/${ticketId}`);

    // Customer-visible reply.
    await page.getByPlaceholder(/reply to the customer/i).fill(VISIBLE_REPLY);
    await page.getByRole('button', { name: /send reply/i }).click();
    await expect(page.getByText(VISIBLE_REPLY)).toBeVisible();

    // Internal note (checkbox).
    await page.getByPlaceholder(/reply to the customer/i).fill(INTERNAL_NOTE);
    await page.getByLabel(/internal note/i).check();
    await page.getByRole('button', { name: /send reply/i }).click();
    await expect(page.getByText(INTERNAL_NOTE)).toBeVisible();

    // Resolve via the triage select.
    await page.getByLabel('Status').selectOption('resolved');
    await expect.poll(ticketStatus).toBe('resolved');
  });

  test('customer sees the reply but not the internal note', async ({ page }) => {
    await login(page, CUST_A);
    await page.goto(`/portal/support/${ticketId}`);
    await expect(page.getByText(VISIBLE_REPLY)).toBeVisible();
    await expect(page.getByText(INTERNAL_NOTE)).toHaveCount(0);
  });

  test('customer reply reopens the resolved ticket', async ({ page }) => {
    await login(page, CUST_A);
    await page.goto(`/portal/support/${ticketId}`);
    await page.getByPlaceholder(/add a reply/i).fill(CUSTOMER_REPLY);
    await page.getByRole('button', { name: /send reply/i }).click();
    await expect(page.getByText(CUSTOMER_REPLY)).toBeVisible();
    await expect.poll(ticketStatus).toBe('open');
  });

  test('a customer in another org cannot read the ticket', async ({ page }) => {
    await login(page, CUST_B);
    const resp = await page.goto(`/portal/support/${ticketId}`);
    expect(resp?.status()).toBe(404);
  });
});
