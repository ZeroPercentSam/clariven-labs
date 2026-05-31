// Rep invitation → accept → onboarding flow (Phase 4, commit 2). An admin-minted
// rep_invitation is accepted by the invited user (creating the sales_reps
// pending_invite shell), who then completes onboarding (W-9 + payout + address +
// a typed e-signature that must match the legal name) → status pending_review +
// onboarding_completed_at stamped + a rep_agreement_consent row written.
// Self-contained: `e2e-repc2-` user, torn down after.

import { expect, test, type Page } from '@playwright/test';
import { TEST_EMAIL_DOMAIN, TEST_PASSWORD, admin } from './helpers';

const REP_EMAIL = `e2e-repc2@${TEST_EMAIL_DOMAIN}`;
let repUid = '';
let token = '';

async function cleanup() {
  const supa = admin();
  const { data: list } = await supa.auth.admin.listUsers({ perPage: 200 });
  const ids = (list?.users ?? [])
    .filter((u) => u.email?.startsWith('e2e-repc2') && u.email.endsWith(`@${TEST_EMAIL_DOMAIN}`))
    .map((u) => u.id);
  if (ids.length) {
    await supa.from('rep_agreement_consents').delete().in('rep_user_id', ids);
    await supa.from('sales_reps').delete().in('id', ids);
  }
  await supa.from('rep_invitations').delete().like('email', 'e2e-repc2%');
  for (const id of ids) await supa.auth.admin.deleteUser(id);
}

async function login(page: Page, email: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'));
}

test.describe.serial('rep invitation + onboarding', () => {
  test.beforeAll(async () => {
    await cleanup();
    const supa = admin();
    const { data, error } = await supa.auth.admin.createUser({
      email: REP_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
    });
    if (error || !data.user) throw new Error(`createUser: ${error?.message}`);
    repUid = data.user.id;

    const { data: inv, error: invErr } = await supa
      .from('rep_invitations')
      .insert({ email: REP_EMAIL, status: 'pending', invitation_note: 'Welcome aboard (E2E).' })
      .select('token')
      .single();
    if (invErr || !inv) throw new Error(`insert invitation: ${invErr?.message}`);
    token = inv.token;
  });

  test.afterAll(cleanup);

  test('accept invitation → sales_reps pending_invite shell created', async ({ page }) => {
    await login(page, REP_EMAIL);

    await page.goto(`/rep-invite/${token}`);
    await expect(page.getByText(/Join the Clariven Labs rep program/i)).toBeVisible();
    await expect(page.getByText('Welcome aboard (E2E).')).toBeVisible();

    await page.getByRole('button', { name: /accept .* start onboarding/i }).click();
    await page.waitForURL(/\/rep\/onboarding$/);
    await expect(page.getByRole('heading', { name: /rep onboarding/i })).toBeVisible();

    const supa = admin();
    const { data: rep } = await supa
      .from('sales_reps')
      .select('status, onboarding_completed_at')
      .eq('id', repUid)
      .single();
    expect(rep?.status).toBe('pending_invite');
    expect(rep?.onboarding_completed_at).toBeNull();

    // Invitation marked accepted.
    const { data: inv } = await supa
      .from('rep_invitations')
      .select('status, accepted_user_id')
      .eq('token', token)
      .single();
    expect(inv?.status).toBe('accepted');
    expect(inv?.accepted_user_id).toBe(repUid);
  });

  test('onboarding rejects a signature that does not match the legal name', async ({ page }) => {
    await login(page, REP_EMAIL);
    await page.goto('/rep/onboarding');

    await page.getByLabel(/Full legal name/i).fill('Dana Researcher');
    await page.getByLabel(/^Tax ID$/i).fill('123-45-6789');
    await page.getByLabel(/Phone/i).fill('555-100-2000');
    await page.getByLabel(/Address line 1/i).fill('1 Lab Way');
    await page.getByLabel(/^City$/i).fill('Cheyenne');
    await page.getByLabel(/^State$/i).fill('WY');
    await page.getByLabel(/Postal code/i).fill('82001');
    await page.getByLabel(/Account \(last 4/i).fill('**** 4321');
    await page.getByLabel(/Type your legal name to sign/i).fill('Someone Else'); // mismatch
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: /submit for review/i }).click();

    await page.waitForURL(/\/rep\/onboarding\?error=/);
    await expect(page.getByText(/signature must match/i)).toBeVisible();

    // Still not onboarded.
    const supa = admin();
    const { data: rep } = await supa
      .from('sales_reps')
      .select('status, onboarding_completed_at')
      .eq('id', repUid)
      .single();
    expect(rep?.status).toBe('pending_invite');
    expect(rep?.onboarding_completed_at).toBeNull();
  });

  test('valid onboarding → pending_review + consent row written', async ({ page }) => {
    await login(page, REP_EMAIL);
    await page.goto('/rep/onboarding');

    await page.getByLabel(/Full legal name/i).fill('Dana Researcher');
    await page.getByLabel(/^Tax ID$/i).fill('123-45-6789');
    await page.getByLabel(/Phone/i).fill('555-100-2000');
    await page.getByLabel(/Address line 1/i).fill('1 Lab Way');
    await page.getByLabel(/^City$/i).fill('Cheyenne');
    await page.getByLabel(/^State$/i).fill('WY');
    await page.getByLabel(/Postal code/i).fill('82001');
    await page.getByLabel(/Account \(last 4/i).fill('**** 4321');
    await page.getByLabel(/Type your legal name to sign/i).fill('  dana   researcher '); // matches (normalized)
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: /submit for review/i }).click();

    await page.waitForURL(/\/rep\/onboarding\/pending/);
    await expect(page.getByRole('heading', { name: /submitted for review/i })).toBeVisible();

    const supa = admin();
    const { data: rep } = await supa
      .from('sales_reps')
      .select('status, onboarding_completed_at, legal_name, tax_id_kind, payout_method')
      .eq('id', repUid)
      .single();
    expect(rep?.status).toBe('pending_review');
    expect(rep?.onboarding_completed_at).toBeTruthy();
    expect(rep?.legal_name).toBe('Dana Researcher');
    expect(rep?.tax_id_kind).toBe('SSN');
    expect(rep?.payout_method).toBe('ACH');

    const { data: consent } = await supa
      .from('rep_agreement_consents')
      .select('signed_legal_name, version_id')
      .eq('rep_user_id', repUid)
      .single();
    expect(consent?.signed_legal_name).toBe('dana   researcher'); // trimmed, inner spacing preserved
    expect(consent?.version_id).toBeTruthy();
  });
});
