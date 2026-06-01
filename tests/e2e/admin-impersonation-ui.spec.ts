// Customer impersonation — UI flow (Phase 5 (a), d2). Drives the real admin UI:
// Impersonate button on /admin/organizations/[id] → justification modal → Start
// → /portal with the global banner → End session → banner gone + session ended
// in the DB. Seeds a customer + approved org (e2e-impui- prefix); self-cleaning.

import { expect, test, type Page } from '@playwright/test';
import { ADMIN_EMAIL, TEST_EMAIL_DOMAIN, TEST_PASSWORD, admin } from './helpers';

const CUST_EMAIL = `e2e-impui-cust@${TEST_EMAIL_DOMAIN}`;
let adminUid = '';
let custUid = '';
let orgId = '';

async function endActiveFor(uid: string) {
  if (!uid) return;
  await admin()
    .from('impersonation_sessions')
    .update({ ended_at: new Date().toISOString(), ended_reason: 'revoked' })
    .eq('admin_user_id', uid)
    .is('ended_at', null);
}

async function cleanup() {
  const supa = admin();
  if (adminUid) await supa.from('impersonation_sessions').delete().eq('admin_user_id', adminUid);
  const { data: list } = await supa.auth.admin.listUsers({ perPage: 200 });
  const uids = (list?.users ?? [])
    .filter((u) => u.email?.startsWith('e2e-impui-') && u.email.endsWith(`@${TEST_EMAIL_DOMAIN}`))
    .map((u) => u.id);
  if (uids.length) await supa.from('impersonation_sessions').delete().in('impersonated_user_id', uids);
  await supa.from('admin_audit_log').delete().like('action', 'impersonation.%');
  const { data: orgs } = await supa.from('organizations').select('id').like('slug', 'e2e-impui-%');
  const oids = (orgs ?? []).map((o) => o.id);
  if (oids.length) {
    await supa.from('org_members').delete().in('organization_id', oids);
    await supa.from('organizations').delete().in('id', oids);
  }
  for (const id of uids) await supa.auth.admin.deleteUser(id);
}

async function login(page: Page, email: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'));
}

test.describe.serial('customer impersonation — UI', () => {
  test.beforeAll(async () => {
    await cleanup();
    const supa = admin();
    const { data: ap } = await supa.from('profiles').select('id').eq('email', ADMIN_EMAIL).single();
    adminUid = ap!.id;
    const { data, error } = await supa.auth.admin.createUser({ email: CUST_EMAIL, password: TEST_PASSWORD, email_confirm: true });
    if (error || !data.user) throw new Error(`createUser: ${error?.message}`);
    custUid = data.user.id;
    await supa.from('profiles').update({ full_name: 'Impui Customer' }).eq('id', custUid);
    const slug = `e2e-impui-${Math.random().toString(36).slice(2, 8)}`;
    const { data: org } = await supa
      .from('organizations')
      .insert({ name: 'E2E ImpUI', slug, approval_status: 'approved' })
      .select('id')
      .single();
    orgId = org!.id;
    await supa.from('profiles').update({ organization_id: orgId }).eq('id', custUid);
    await supa.from('org_members').insert({ organization_id: orgId, user_id: custUid, org_role: 'owner' });
  });

  test.afterAll(cleanup);
  test.beforeEach(() => endActiveFor(adminUid));

  test('admin impersonates a member, sees the banner, then ends the session', async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    await page.goto(`/admin/organizations/${orgId}`);

    // Impersonate the (only) member → modal → justification → start.
    await page.getByRole('button', { name: /^impersonate$/i }).click();
    await page.getByPlaceholder(/reason/i).fill('Support ticket 123 — debugging checkout');
    await page.getByRole('button', { name: /start session/i }).click();

    // Lands in the customer view with the global banner showing the target.
    await page.waitForURL(/\/portal/);
    const banner = page.getByTestId('impersonation-banner');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText(CUST_EMAIL);

    // The session is live in the DB.
    await expect
      .poll(async () => {
        const { data } = await admin()
          .from('impersonation_sessions')
          .select('ended_at')
          .eq('admin_user_id', adminUid)
          .eq('impersonated_user_id', custUid)
          .is('ended_at', null);
        return data?.length ?? 0;
      })
      .toBe(1);

    // End session → banner disappears + the row is ended.
    await banner.getByRole('button', { name: /end session/i }).click();
    await expect(page.getByTestId('impersonation-banner')).toHaveCount(0);
    await expect
      .poll(async () => {
        const { data } = await admin()
          .from('impersonation_sessions')
          .select('ended_at')
          .eq('admin_user_id', adminUid)
          .eq('impersonated_user_id', custUid)
          .is('ended_at', null);
        return data?.length ?? 0;
      })
      .toBe(0);
  });
});
