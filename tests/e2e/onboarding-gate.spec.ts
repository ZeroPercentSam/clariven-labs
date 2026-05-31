// Proxy org-onboarding gate (Phase 3, commit 3). A signed-in customer must
// belong to an APPROVED org to reach /cart or /checkout; otherwise the proxy
// redirects them into onboarding. This is the UX layer of the approval gate —
// create_order_with_items is the authoritative enforcement (see
// org-isolation.spec.ts), so this spec only asserts the *redirect*, which is
// observable from the URL even before the onboarding pages render real content.
//
// Self-contained: creates its own `e2e-gate-` users + pending org and tears
// them down (truncateTestData also reclaims `e2e-gate-` orgs as a backstop).

import { expect, test, type Page } from '@playwright/test';
import { ADMIN_EMAIL, CUSTOMER_EMAIL, TEST_EMAIL_DOMAIN, TEST_PASSWORD, admin } from './helpers';

const NOORG_EMAIL = `e2e-gate-noorg@${TEST_EMAIL_DOMAIN}`;
const PENDING_EMAIL = `e2e-gate-pending@${TEST_EMAIL_DOMAIN}`;
const SLUG_PREFIX = 'e2e-gate';

async function login(page: Page, email: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  // A no-org customer is bounced from /portal into onboarding, so accept either.
  await page.waitForURL(/\/(admin|portal|onboarding)/);
}

async function cleanup() {
  const supa = admin();
  const { data: orgs } = await supa.from('organizations').select('id').like('slug', `${SLUG_PREFIX}-%`);
  const ids = (orgs ?? []).map((o) => o.id);
  if (ids.length) await supa.from('org_members').delete().in('organization_id', ids);
  const { data: list } = await supa.auth.admin.listUsers({ perPage: 200 });
  for (const u of list?.users ?? []) {
    if (u.email?.startsWith('e2e-gate-') && u.email.endsWith(`@${TEST_EMAIL_DOMAIN}`)) {
      await supa.auth.admin.deleteUser(u.id);
    }
  }
  if (ids.length) await supa.from('organizations').delete().in('id', ids);
}

test.describe.serial('org onboarding gate (proxy redirect)', () => {
  test.beforeAll(async () => {
    await cleanup();
    const supa = admin();
    const mkUser = async (email: string) => {
      const { data, error } = await supa.auth.admin.createUser({
        email,
        password: TEST_PASSWORD,
        email_confirm: true,
      });
      if (error || !data.user) throw new Error(`createUser ${email}: ${error?.message}`);
      return data.user.id;
    };
    await mkUser(NOORG_EMAIL); // intentionally org-less
    const pendingUid = await mkUser(PENDING_EMAIL);

    const { data: org, error } = await supa
      .from('organizations')
      .insert({
        name: 'Gate Pending Lab',
        slug: `${SLUG_PREFIX}-${Date.now().toString(36)}`,
        approval_status: 'pending',
      })
      .select('id')
      .single();
    if (error || !org) throw new Error(`createOrg: ${error?.message}`);
    await supa.from('profiles').update({ organization_id: org.id }).eq('id', pendingUid);
    await supa.from('org_members').insert({ organization_id: org.id, user_id: pendingUid, org_role: 'owner' });
  });

  test.afterAll(cleanup);

  test('no-org customer is redirected from /checkout to /onboarding/attest', async ({ page }) => {
    await login(page, NOORG_EMAIL);
    await page.goto('/checkout');
    await expect(page).toHaveURL(/\/onboarding\/attest/);
  });

  test('pending-org customer is redirected from /checkout to /onboarding/pending', async ({ page }) => {
    await login(page, PENDING_EMAIL);
    await page.goto('/checkout');
    await expect(page).toHaveURL(/\/onboarding\/pending/);
  });

  test('pending-org customer is redirected from /cart to /onboarding/pending', async ({ page }) => {
    await login(page, PENDING_EMAIL);
    await page.goto('/cart');
    await expect(page).toHaveURL(/\/onboarding\/pending/);
  });

  test('approved customer reaches /cart (not gated)', async ({ page }) => {
    await login(page, CUSTOMER_EMAIL);
    await page.goto('/cart');
    await expect(page).toHaveURL(/\/cart$/);
  });

  test('admin (staff, no org) reaches /cart — exempt from the org gate', async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    await page.goto('/cart');
    await expect(page).toHaveURL(/\/cart$/);
  });
});
