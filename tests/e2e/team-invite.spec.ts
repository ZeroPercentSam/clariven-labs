// Team invitations (Phase 3, commit 6). An org owner invites a colleague via
// /portal/team; the invitee accepts via /invite/[token], joins the existing
// approved org (no attestation), and can immediately order. Drives the real UI
// for both invite + accept, then verifies the joined member + order via the DB
// and the order RPC.

import { expect, test } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../src/lib/database.types';
import { TEST_EMAIL_DOMAIN, TEST_PASSWORD, admin } from './helpers';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const PREFIX = 'e2e-inv';

const ownerEmail = `${PREFIX}-owner@${TEST_EMAIL_DOMAIN}`;
const buyerEmail = `${PREFIX}-buyer@${TEST_EMAIL_DOMAIN}`;
let orgId = '';

const SKU = { product_slug: 'single-regulator', product_name: 'Single Regulator', strength_label: '10 mg' };
const SHIPPING = { full_name: 'Lab', line1: '1 Way', city: 'Cheyenne', state: 'WY', postal_code: '82001', country: 'US' };

async function signIn(email: string): Promise<SupabaseClient<Database>> {
  const client = createClient<Database>(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await client.auth.signInWithPassword({ email, password: TEST_PASSWORD });
  if (error) throw new Error(`signIn ${email}: ${error.message}`);
  return client;
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
    await supa.from('org_invitations').delete().in('organization_id', ids);
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

test.describe.serial('team invitations', () => {
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
    const ownerUid = await mkUser(ownerEmail);
    await mkUser(buyerEmail); // intentionally org-less until they accept

    const { data: org, error } = await supa
      .from('organizations')
      .insert({ name: 'Invite Lab', slug: `${PREFIX}-${Date.now().toString(36)}`, approval_status: 'approved' })
      .select('id')
      .single();
    if (error || !org) throw new Error(`createOrg: ${error?.message}`);
    orgId = org.id;
    await supa.from('profiles').update({ organization_id: orgId }).eq('id', ownerUid);
    await supa.from('org_members').insert({ organization_id: orgId, user_id: ownerUid, org_role: 'owner' });
  });

  test.afterAll(cleanup);

  test('owner invites a buyer → buyer accepts → joins the org and can order', async ({ browser }) => {
    // Owner creates the invitation through /portal/team.
    const ownerCtx = await browser.newContext();
    const ownerPage = await ownerCtx.newPage();
    await ownerPage.goto('/login');
    await ownerPage.getByLabel('Email').fill(ownerEmail);
    await ownerPage.getByLabel('Password').fill(TEST_PASSWORD);
    await ownerPage.getByRole('button', { name: /sign in/i }).click();
    await ownerPage.waitForURL(/\/(admin|portal)/);

    await ownerPage.goto('/portal/team');
    await ownerPage.getByLabel('Email').fill(buyerEmail);
    await ownerPage.getByRole('button', { name: /send invite/i }).click();
    await ownerPage.waitForURL(/\/portal\/team\?invited=/);
    await ownerCtx.close();

    // Grab the pending invitation token.
    const supa = admin();
    const { data: inv } = await supa
      .from('org_invitations')
      .select('token, org_role, status')
      .eq('organization_id', orgId)
      .eq('email', buyerEmail)
      .single();
    expect(inv?.token).toBeTruthy();
    expect(inv?.org_role).toBe('buyer');

    // Buyer accepts via /invite/[token].
    const buyerCtx = await browser.newContext();
    const buyerPage = await buyerCtx.newPage();
    await buyerPage.goto('/login');
    await buyerPage.getByLabel('Email').fill(buyerEmail);
    await buyerPage.getByLabel('Password').fill(TEST_PASSWORD);
    await buyerPage.getByRole('button', { name: /sign in/i }).click();
    // Org-less → bounced to onboarding; that's fine, we go straight to the invite.
    await buyerPage.waitForURL(/\/(portal|onboarding)/);
    await buyerPage.goto(`/invite/${inv!.token}`);
    await buyerPage.getByRole('button', { name: /accept/i }).click();
    await buyerPage.waitForURL(/\/portal/);
    await buyerCtx.close();

    // DB: the buyer joined the org as buyer; the invitation is accepted.
    const buyerUser = (await supa.auth.admin.listUsers({ perPage: 200 })).data.users.find(
      (u) => u.email === buyerEmail,
    );
    const { data: buyerProfile } = await supa
      .from('profiles')
      .select('organization_id')
      .eq('id', buyerUser!.id)
      .single();
    expect(buyerProfile?.organization_id).toBe(orgId);

    const { data: membership } = await supa
      .from('org_members')
      .select('org_role')
      .eq('organization_id', orgId)
      .eq('user_id', buyerUser!.id)
      .single();
    expect(membership?.org_role).toBe('buyer');

    const { data: invAfter } = await supa
      .from('org_invitations')
      .select('status')
      .eq('organization_id', orgId)
      .eq('email', buyerEmail)
      .single();
    expect(invAfter?.status).toBe('accepted');

    // The buyer can order immediately (org is approved).
    const buyerClient = await signIn(buyerEmail);
    const { data: order, error: orderErr } = await buyerClient.rpc('create_order_with_items', {
      p_items: [{ ...SKU, quantity: 1 }],
      p_shipping: SHIPPING,
      p_code: '',
    });
    expect(orderErr).toBeNull();
    expect(order?.[0]?.order_id).toBeTruthy();
  });
});
