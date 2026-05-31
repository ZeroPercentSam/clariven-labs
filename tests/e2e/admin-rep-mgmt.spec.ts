// Admin rep management (Phase 4, commit 3). Drives the real /admin/reps UI:
// admin mints an invitation, approves a pending_review rep, and assigns an
// approved org with a commission override — asserting the resulting rows +
// admin_audit_log entries. Self-contained: `e2e-repc3-` users + `e2e-repasgn-`
// org, torn down after.

import { expect, test, type Page } from '@playwright/test';
import { ADMIN_EMAIL, TEST_EMAIL_DOMAIN, TEST_PASSWORD, admin } from './helpers';

const REP_EMAIL = `e2e-repc3-rep@${TEST_EMAIL_DOMAIN}`;
const INVITEE_EMAIL = `e2e-repc3-invitee@${TEST_EMAIL_DOMAIN}`;
let repUid = '';
let adminUid = '';
let orgId = '';

async function cleanup() {
  const supa = admin();
  const { data: list } = await supa.auth.admin.listUsers({ perPage: 200 });
  const repIds = (list?.users ?? [])
    .filter((u) => u.email?.startsWith('e2e-repc3-') && u.email.endsWith(`@${TEST_EMAIL_DOMAIN}`))
    .map((u) => u.id);
  if (repIds.length) {
    await supa.from('rep_org_assignments').delete().in('rep_user_id', repIds);
    await supa.from('rep_agreement_consents').delete().in('rep_user_id', repIds);
    await supa.from('sales_reps').delete().in('id', repIds);
  }
  await supa.from('rep_invitations').delete().like('email', 'e2e-repc3-%');
  const { data: orgs } = await supa.from('organizations').select('id').like('slug', 'e2e-repasgn-%');
  const oids = (orgs ?? []).map((o) => o.id);
  if (oids.length) {
    await supa.from('rep_org_assignments').delete().in('organization_id', oids);
    await supa.from('organizations').delete().in('id', oids);
  }
  for (const id of repIds) await supa.auth.admin.deleteUser(id);
}

async function login(page: Page, email: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'));
}

test.describe.serial('admin rep management', () => {
  test.beforeAll(async () => {
    await cleanup();
    const supa = admin();

    const { data: rep, error: repErr } = await supa.auth.admin.createUser({
      email: REP_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
    });
    if (repErr || !rep.user) throw new Error(`createUser rep: ${repErr?.message}`);
    repUid = rep.user.id;

    // Seed the rep at pending_review (simulates a completed c2 onboarding).
    const { error: srErr } = await supa.from('sales_reps').insert({
      id: repUid,
      status: 'pending_review',
      legal_name: 'Casey Rep',
      tax_id: '111-22-3333',
      tax_id_kind: 'SSN',
      business_type: 'individual',
      payout_method: 'ACH',
      payout_account_masked: '**** 9999',
      onboarding_completed_at: new Date().toISOString(),
    });
    if (srErr) throw new Error(`seed sales_rep: ${srErr.message}`);

    const { data: prof } = await supa.from('profiles').select('id').eq('email', ADMIN_EMAIL).single();
    adminUid = prof!.id;

    const slug = `e2e-repasgn-${Math.random().toString(36).slice(2, 8)}`;
    const { data: org, error: orgErr } = await supa
      .from('organizations')
      .insert({ name: 'E2E RepAsgn Org', slug, approval_status: 'approved' })
      .select('id')
      .single();
    if (orgErr || !org) throw new Error(`create org: ${orgErr?.message}`);
    orgId = org.id;
  });

  test.afterAll(cleanup);

  test('admin mints a rep invitation', async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    await page.goto('/admin/reps/invite');
    await page.getByLabel(/Rep email/i).fill(INVITEE_EMAIL);
    await page.getByRole('button', { name: /create invitation/i }).click();

    await expect(page.getByText(/Invitation created/i)).toBeVisible();
    await expect(page.getByText(/\/rep-invite\//)).toBeVisible();

    const supa = admin();
    const { data: inv } = await supa
      .from('rep_invitations')
      .select('status, invited_by_admin_id')
      .eq('email', INVITEE_EMAIL)
      .single();
    expect(inv?.status).toBe('pending');
    expect(inv?.invited_by_admin_id).toBe(adminUid);
  });

  test('admin approves a pending_review rep → active + audit', async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    await page.goto(`/admin/reps/${repUid}`);
    await expect(page.getByText(/Awaiting approval/i)).toBeVisible();

    await page.getByRole('button', { name: /^approve$/i }).click();
    await page.waitForURL(/ok=approved/);
    await expect(page.getByText('Active', { exact: true })).toBeVisible();

    const supa = admin();
    const { data: rep } = await supa
      .from('sales_reps')
      .select('status, approved_by, approved_at')
      .eq('id', repUid)
      .single();
    expect(rep?.status).toBe('active');
    expect(rep?.approved_by).toBe(adminUid);
    expect(rep?.approved_at).toBeTruthy();

    const { data: auditRows } = await supa
      .from('admin_audit_log')
      .select('action')
      .eq('target_id', repUid)
      .eq('action', 'sales_rep.approved');
    expect((auditRows ?? []).length).toBeGreaterThan(0);
  });

  test('admin assigns an approved org with a commission override → assignment + audit', async ({
    page,
  }) => {
    await login(page, ADMIN_EMAIL);
    await page.goto(`/admin/reps/${repUid}`);

    await page.locator('select[name="organization_id"]').selectOption(orgId);
    await page.locator('input[name="commission_pct"]').fill('25');
    await page.getByRole('button', { name: /assign org/i }).click();
    await page.waitForURL(/ok=assigned/);
    await expect(page.getByText('E2E RepAsgn Org')).toBeVisible();

    const supa = admin();
    const { data: asg } = await supa
      .from('rep_org_assignments')
      .select('commission_pct, ended_at, created_by_admin_id')
      .eq('rep_user_id', repUid)
      .eq('organization_id', orgId)
      .single();
    expect(asg?.commission_pct).toBe(0.25);
    expect(asg?.ended_at).toBeNull();
    expect(asg?.created_by_admin_id).toBe(adminUid);

    const { data: auditRows } = await supa
      .from('admin_audit_log')
      .select('action')
      .eq('action', 'rep_assignment.created')
      .contains('payload', { rep_id: repUid });
    expect((auditRows ?? []).length).toBeGreaterThan(0);
  });
});
