// Self-service RUO onboarding flow (Phase 3, commit 4). A fresh no-org customer
// fills the research-use attestation, which bootstraps a PENDING org + owner
// membership + attestation row (+ optional PDF in the private bucket) and leaves
// them blocked at checkout until an admin approves. Verifies the full UI flow +
// the resulting DB rows. Self-contained: `e2e-onb-` user + org, torn down after
// (including the storage folder).

import { expect, test, type Page } from '@playwright/test';
import { TEST_EMAIL_DOMAIN, TEST_PASSWORD, admin } from './helpers';

const FRESH_EMAIL = `e2e-onb-fresh@${TEST_EMAIL_DOMAIN}`;
let freshUid = '';

async function cleanup() {
  const supa = admin();
  const { data: orgs } = await supa.from('organizations').select('id').like('slug', 'e2e-onb-%');
  const ids = (orgs ?? []).map((o) => o.id);
  for (const orgId of ids) {
    const { data: files } = await supa.storage.from('org-attestations').list(orgId);
    if (files?.length) {
      await supa.storage.from('org-attestations').remove(files.map((f) => `${orgId}/${f.name}`));
    }
  }
  if (ids.length) {
    await supa.from('org_attestations').delete().in('organization_id', ids);
    await supa.from('org_members').delete().in('organization_id', ids);
  }
  const { data: list } = await supa.auth.admin.listUsers({ perPage: 200 });
  for (const u of list?.users ?? []) {
    if (u.email?.startsWith('e2e-onb-') && u.email.endsWith(`@${TEST_EMAIL_DOMAIN}`)) {
      await supa.auth.admin.deleteUser(u.id);
    }
  }
  if (ids.length) await supa.from('organizations').delete().in('id', ids);
}

async function login(page: Page, email: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/(portal|onboarding)/);
}

test.describe.serial('self-service RUO onboarding', () => {
  test.beforeAll(async () => {
    await cleanup();
    const supa = admin();
    const { data, error } = await supa.auth.admin.createUser({
      email: FRESH_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
    });
    if (error || !data.user) throw new Error(`createUser: ${error?.message}`);
    freshUid = data.user.id;
  });

  test.afterAll(cleanup);

  test('fresh customer attests → pending org + membership + attestation + PDF, blocked at checkout', async ({
    page,
  }) => {
    await login(page, FRESH_EMAIL);

    // No org yet → /portal bounces into onboarding.
    await page.goto('/onboarding/attest');
    await expect(page.getByText(/Set up your research account/i)).toBeVisible();

    await page.getByLabel(/Organization name/i).fill('E2E Onb Lab');
    await page.getByLabel(/Legal entity name/i).fill('E2E Onb Lab LLC');
    await page
      .getByLabel(/Research context/i)
      .fill('In-vitro receptor binding assays (research use only).');
    await page.locator('input[name="attestation_file"]').setInputFiles({
      name: 'attestation.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n'),
    });
    await page.locator('input[name="acknowledged"]').check();

    await page.getByRole('button', { name: /submit for review/i }).click();
    await page.waitForURL(/\/onboarding\/pending/);
    await expect(page.getByRole('heading', { name: /under review/i })).toBeVisible();

    // DB: the org was bootstrapped pending, with owner membership + attestation.
    const supa = admin();
    const { data: profile } = await supa
      .from('profiles')
      .select('organization_id')
      .eq('id', freshUid)
      .single();
    const orgId = profile?.organization_id;
    expect(orgId).toBeTruthy();

    const { data: org } = await supa
      .from('organizations')
      .select('approval_status')
      .eq('id', orgId!)
      .single();
    expect(org?.approval_status).toBe('pending');

    const { data: membership } = await supa
      .from('org_members')
      .select('org_role')
      .eq('organization_id', orgId!)
      .eq('user_id', freshUid)
      .single();
    expect(membership?.org_role).toBe('owner');

    const { data: attestation } = await supa
      .from('org_attestations')
      .select('status, file_path, legal_entity_name')
      .eq('organization_id', orgId!)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    expect(attestation?.status).toBe('pending');
    expect(attestation?.legal_entity_name).toBe('E2E Onb Lab LLC');
    expect(attestation?.file_path).toBeTruthy();

    // Still blocked at checkout (pending org → proxy redirect to pending).
    await page.goto('/checkout');
    await expect(page).toHaveURL(/\/onboarding\/pending/);
  });
});
