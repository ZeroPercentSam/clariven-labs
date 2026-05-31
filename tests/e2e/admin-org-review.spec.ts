// Admin organization review (Phase 3, commit 5). An admin approves a pending
// org → its owner can order (the approval gate opens); an admin rejects with a
// reason → the org is rejected, the reason is recorded on the attestation, and
// the owner stays blocked. Drives the real /admin/organizations UI for the
// decision, then verifies the authoritative effect via the order RPC.

import { expect, test, type Page } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../src/lib/database.types';
import { ADMIN_EMAIL, TEST_EMAIL_DOMAIN, TEST_PASSWORD, admin } from './helpers';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const PREFIX = 'e2e-orev';

const SKU = { product_slug: 'single-regulator', product_name: 'Single Regulator', strength_label: '10 mg' };
const SHIPPING = { full_name: 'Lab', line1: '1 Way', city: 'Cheyenne', state: 'WY', postal_code: '82001', country: 'US' };

let orgApprove = '';
let orgReject = '';

const emailApproveOwner = `${PREFIX}-approve-owner@${TEST_EMAIL_DOMAIN}`;
const emailRejectOwner = `${PREFIX}-reject-owner@${TEST_EMAIL_DOMAIN}`;

async function signIn(email: string): Promise<SupabaseClient<Database>> {
  const client = createClient<Database>(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await client.auth.signInWithPassword({ email, password: TEST_PASSWORD });
  if (error) throw new Error(`signIn ${email}: ${error.message}`);
  return client;
}

async function placeOrder(client: SupabaseClient<Database>) {
  return client.rpc('create_order_with_items', {
    p_items: [{ ...SKU, quantity: 1 }],
    p_shipping: SHIPPING,
    p_code: '',
  });
}

async function cleanup() {
  const supa = admin();
  const { data: orgs } = await supa.from('organizations').select('id').like('slug', `${PREFIX}-%`);
  const ids = (orgs ?? []).map((o) => o.id);
  if (ids.length) {
    const { data: ords } = await supa.from('orders').select('id').in('organization_id', ids);
    const ordIds = (ords ?? []).map((o) => o.id);
    if (ordIds.length) {
      await supa.from('order_items').delete().in('order_id', ordIds);
      await supa.from('orders').delete().in('id', ordIds);
    }
    await supa.from('org_attestations').delete().in('organization_id', ids);
    await supa.from('org_members').delete().in('organization_id', ids);
  }
  const { data: list } = await supa.auth.admin.listUsers({ perPage: 200 });
  for (const u of list?.users ?? []) {
    if (u.email?.startsWith(`${PREFIX}-`) && u.email.endsWith(`@${TEST_EMAIL_DOMAIN}`)) {
      await supa.auth.admin.deleteUser(u.id);
    }
  }
  if (ids.length) await supa.from('organizations').delete().in('id', ids);
}

async function seedPendingOrg(email: string, slug: string, name: string) {
  const supa = admin();
  const { data: user, error: uErr } = await supa.auth.admin.createUser({
    email,
    password: TEST_PASSWORD,
    email_confirm: true,
  });
  if (uErr || !user.user) throw new Error(`createUser ${email}: ${uErr?.message}`);
  const { data: org, error: oErr } = await supa
    .from('organizations')
    .insert({ name, slug, approval_status: 'pending' })
    .select('id')
    .single();
  if (oErr || !org) throw new Error(`createOrg ${slug}: ${oErr?.message}`);
  await supa.from('profiles').update({ organization_id: org.id }).eq('id', user.user.id);
  await supa.from('org_members').insert({ organization_id: org.id, user_id: user.user.id, org_role: 'owner' });
  await supa.from('org_attestations').insert({
    organization_id: org.id,
    legal_entity_name: `${name} LLC`,
    research_context: 'In-vitro assay development (research use only).',
    status: 'pending',
  });
  return org.id;
}

async function loginAdmin(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(ADMIN_EMAIL);
  await page.getByLabel('Password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/(admin|portal)/);
}

test.describe.serial('admin organization review', () => {
  test.beforeAll(async () => {
    await cleanup();
    const stamp = Date.now().toString(36);
    orgApprove = await seedPendingOrg(emailApproveOwner, `${PREFIX}-approve-${stamp}`, 'ORev Approve Lab');
    orgReject = await seedPendingOrg(emailRejectOwner, `${PREFIX}-reject-${stamp}`, 'ORev Reject Lab');
  });

  test.afterAll(cleanup);

  test('approve → the org owner can place an order', async ({ page }) => {
    // Owner is blocked before approval.
    const before = await placeOrder(await signIn(emailApproveOwner));
    expect(before.error?.message ?? '').toMatch(/organization not approved/i);

    await loginAdmin(page);
    await page.goto(`/admin/organizations/${orgApprove}`);
    await page.getByRole('button', { name: /approve organization/i }).click();
    await page.waitForURL(/\/admin\/organizations\?reviewed=approved/);

    const supa = admin();
    const { data: org } = await supa
      .from('organizations')
      .select('approval_status')
      .eq('id', orgApprove)
      .single();
    expect(org?.approval_status).toBe('approved');

    // Gate is now open for the owner.
    const after = await placeOrder(await signIn(emailApproveOwner));
    expect(after.error).toBeNull();
    expect(after.data?.[0]?.order_id).toBeTruthy();
  });

  test('reject → sets a reason and the owner stays blocked', async ({ page }) => {
    await loginAdmin(page);
    await page.goto(`/admin/organizations/${orgReject}`);
    await page.getByPlaceholder(/Reason shown/i).fill('Could not verify the institutional affiliation.');
    await page.getByRole('button', { name: /^reject$/i }).click();
    await page.waitForURL(/\/admin\/organizations\?reviewed=rejected/);

    const supa = admin();
    const { data: org } = await supa
      .from('organizations')
      .select('approval_status')
      .eq('id', orgReject)
      .single();
    expect(org?.approval_status).toBe('rejected');

    const { data: att } = await supa
      .from('org_attestations')
      .select('status, rejection_reason')
      .eq('organization_id', orgReject)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    expect(att?.status).toBe('rejected');
    expect(att?.rejection_reason).toMatch(/institutional affiliation/i);

    const blocked = await placeOrder(await signIn(emailRejectOwner));
    expect(blocked.error?.message ?? '').toMatch(/organization not approved/i);
  });
});
