// Org RLS isolation — the permanent CI lock that gates the Phase-3 commit-2
// cutover (migration 0011). Asserts the org-scoped RLS contract directly
// against Postgres via authenticated supabase-js clients (no UI), because the
// guarantee we care about is row-level, not page-level:
//
//   • an org-A member cannot read org-B orders / items / messages / org /
//     members / attestation;
//   • a *second* org-A member (not the order's user_id) CAN read the org's
//     order — proving the cutover is genuinely ORG-scoped, not just user-scoped
//     (this assertion only holds AFTER 0011 flips the policies);
//   • staff (is_admin) see every org;
//   • anon sees no orders/orgs/attestations but can still read the global
//     catalog via list_public_prices.
//
// The spec creates and tears down its own orgs + users (prefixed
// `e2e-orgiso-`) so it is safe against the shared prod Supabase project. It
// always cleans up orders BEFORE deleting users (orders.user_id is ON DELETE
// RESTRICT), so it never strands rows that would break global-setup's
// deleteTestUsers() on the next run.

import { expect, test } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../src/lib/database.types';
import { admin, TEST_EMAIL_DOMAIN, TEST_PASSWORD } from './helpers';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const PREFIX = 'e2e-orgiso';
const emailA = `${PREFIX}-a-owner@${TEST_EMAIL_DOMAIN}`;
const emailA2 = `${PREFIX}-a-member@${TEST_EMAIL_DOMAIN}`;
const emailB = `${PREFIX}-b-owner@${TEST_EMAIL_DOMAIN}`;
const emailAdmin = `${PREFIX}-admin@${TEST_EMAIL_DOMAIN}`;
const emailPending = `${PREFIX}-pending-owner@${TEST_EMAIL_DOMAIN}`;
const emailNoOrg = `${PREFIX}-noorg@${TEST_EMAIL_DOMAIN}`;

// A real active SKU (seeded by migration 0008) for exercising the order RPC.
const SKU = { product_slug: 'single-regulator', product_name: 'Single Regulator', strength_label: '10 mg' };
const SHIPPING = {
  full_name: 'Lab Receiving',
  line1: '1 Research Way',
  city: 'Cheyenne',
  state: 'WY',
  postal_code: '82001',
  country: 'US',
};

// Shared state populated in beforeAll.
let orgA = '';
let orgB = '';
let orderA = '';
let orderB = '';
let attestationA = '';
let attestationB = '';

function anonClient(): SupabaseClient<Database> {
  return createClient<Database>(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function signIn(email: string): Promise<SupabaseClient<Database>> {
  const client = anonClient();
  const { error } = await client.auth.signInWithPassword({ email, password: TEST_PASSWORD });
  if (error) throw new Error(`signIn ${email}: ${error.message}`);
  return client;
}

// Remove everything this spec creates, in FK-safe order. Idempotent: finds rows
// by the `e2e-orgiso-` slug/email prefix, so a prior crashed run is cleaned too.
async function cleanup() {
  const supa = admin();

  const { data: orgs } = await supa
    .from('organizations')
    .select('id')
    .like('slug', `${PREFIX}-%`);
  const orgIds = (orgs ?? []).map((o) => o.id);

  if (orgIds.length) {
    const { data: ords } = await supa.from('orders').select('id').in('organization_id', orgIds);
    const ordIds = (ords ?? []).map((o) => o.id);
    if (ordIds.length) {
      await supa.from('order_messages').delete().in('order_id', ordIds);
      await supa.from('order_items').delete().in('order_id', ordIds);
      await supa.from('orders').delete().in('id', ordIds);
    }
    await supa.from('org_attestations').delete().in('organization_id', orgIds);
    await supa.from('org_invitations').delete().in('organization_id', orgIds);
    await supa.from('org_members').delete().in('organization_id', orgIds);
  }

  // Delete our users (cascades profiles) only AFTER their orders are gone.
  const { data: list } = await supa.auth.admin.listUsers({ perPage: 200 });
  for (const u of list?.users ?? []) {
    if (u.email?.startsWith(`${PREFIX}-`) && u.email.endsWith(`@${TEST_EMAIL_DOMAIN}`)) {
      await supa.auth.admin.deleteUser(u.id);
    }
  }

  if (orgIds.length) await supa.from('organizations').delete().in('id', orgIds);
}

test.describe.serial('org RLS isolation (commit-2 cutover lock)', () => {
  test.beforeAll(async () => {
    await cleanup();
    const supa = admin();

    const mkUser = async (email: string, role: 'customer' | 'admin' = 'customer') => {
      const { data, error } = await supa.auth.admin.createUser({
        email,
        password: TEST_PASSWORD,
        email_confirm: true,
      });
      if (error || !data.user) throw new Error(`createUser ${email}: ${error?.message}`);
      if (role === 'admin') {
        await supa.from('profiles').update({ role: 'admin' }).eq('id', data.user.id);
      }
      return data.user.id;
    };

    const uidA = await mkUser(emailA);
    const uidA2 = await mkUser(emailA2);
    const uidB = await mkUser(emailB);
    await mkUser(emailAdmin, 'admin');
    const uidPending = await mkUser(emailPending);
    await mkUser(emailNoOrg); // intentionally left orgless (no membership, no profile.org)

    const mkOrg = async (slug: string, name: string, status = 'approved') => {
      const { data, error } = await supa
        .from('organizations')
        .insert({ name, slug, approval_status: status })
        .select('id')
        .single();
      if (error || !data) throw new Error(`createOrg ${slug}: ${error?.message}`);
      return data.id;
    };
    const stamp = Date.now().toString(36);
    orgA = await mkOrg(`${PREFIX}-a-${stamp}`, 'Org A Research Lab');
    orgB = await mkOrg(`${PREFIX}-b-${stamp}`, 'Org B Research Lab');
    const orgPending = await mkOrg(`${PREFIX}-pending-${stamp}`, 'Org Pending Lab', 'pending');

    await supa.from('profiles').update({ organization_id: orgA }).eq('id', uidA);
    await supa.from('profiles').update({ organization_id: orgA }).eq('id', uidA2);
    await supa.from('profiles').update({ organization_id: orgB }).eq('id', uidB);
    await supa.from('profiles').update({ organization_id: orgPending }).eq('id', uidPending);
    await supa.from('org_members').insert([
      { organization_id: orgA, user_id: uidA, org_role: 'owner' },
      { organization_id: orgA, user_id: uidA2, org_role: 'buyer' },
      { organization_id: orgB, user_id: uidB, org_role: 'owner' },
      { organization_id: orgPending, user_id: uidPending, org_role: 'owner' },
    ]);

    const mkAttestation = async (org: string, entity: string) => {
      const { data, error } = await supa
        .from('org_attestations')
        .insert({
          organization_id: org,
          legal_entity_name: entity,
          research_context: 'In-vitro assay development (research use only).',
          status: 'approved',
        })
        .select('id')
        .single();
      if (error || !data) throw new Error(`createAttestation ${org}: ${error?.message}`);
      return data.id;
    };
    attestationA = await mkAttestation(orgA, 'Org A Research Lab LLC');
    attestationB = await mkAttestation(orgB, 'Org B Research Lab LLC');

    const mkOrder = async (uid: string, org: string) => {
      const { data, error } = await supa
        .from('orders')
        .insert({
          user_id: uid,
          organization_id: org,
          status: 'paid',
          shipping_address: {
            full_name: 'Lab Receiving',
            line1: '1 Research Way',
            city: 'Cheyenne',
            state: 'WY',
            postal_code: '82001',
            country: 'US',
          },
          subtotal_cents: 10000,
          discount_cents: 0,
          total_cents: 10000,
        })
        .select('id')
        .single();
      if (error || !data) throw new Error(`createOrder ${org}: ${error?.message}`);
      await supa.from('order_items').insert({
        order_id: data.id,
        product_slug: 'bpc-157',
        product_name: 'BPC-157',
        strength_label: '10 mg',
        quantity: 1,
        unit_price_cents: 10000,
        line_total_cents: 10000,
      });
      await supa.from('order_messages').insert({
        order_id: data.id,
        author_id: uid,
        author_role: 'customer',
        body: 'Order note for isolation test.',
      });
      return data.id;
    };
    orderA = await mkOrder(uidA, orgA);
    orderB = await mkOrder(uidB, orgB);
  });

  test.afterAll(async () => {
    await cleanup();
  });

  test('org-A member cannot read org-B orders / items / messages', async () => {
    const a = await signIn(emailA);

    const { data: ownOrders } = await a.from('orders').select('id');
    const ownIds = (ownOrders ?? []).map((o) => o.id);
    expect(ownIds).toContain(orderA);
    expect(ownIds).not.toContain(orderB);

    const { data: bOrder } = await a.from('orders').select('id').eq('id', orderB);
    expect(bOrder ?? []).toHaveLength(0);

    const { data: bItems } = await a.from('order_items').select('id').eq('order_id', orderB);
    expect(bItems ?? []).toHaveLength(0);

    const { data: bMessages } = await a.from('order_messages').select('id').eq('order_id', orderB);
    expect(bMessages ?? []).toHaveLength(0);
  });

  test('org-A member cannot read org-B organization / members / attestation', async () => {
    const a = await signIn(emailA);

    const { data: bOrg } = await a.from('organizations').select('id').eq('id', orgB);
    expect(bOrg ?? []).toHaveLength(0);

    const { data: bMembers } = await a.from('org_members').select('user_id').eq('organization_id', orgB);
    expect(bMembers ?? []).toHaveLength(0);

    const { data: bAttestation } = await a
      .from('org_attestations')
      .select('id')
      .eq('id', attestationB);
    expect(bAttestation ?? []).toHaveLength(0);

    // Sanity: A *can* see its own org + attestation.
    const { data: ownOrg } = await a.from('organizations').select('id').eq('id', orgA);
    expect((ownOrg ?? []).map((o) => o.id)).toContain(orgA);
    const { data: ownAtt } = await a.from('org_attestations').select('id').eq('id', attestationA);
    expect((ownAtt ?? []).map((o) => o.id)).toContain(attestationA);
  });

  test('a second org-A member (not the order user) can read the org order — org-scoped, not user-scoped', async () => {
    const a2 = await signIn(emailA2);

    const { data: orderRow } = await a2.from('orders').select('id, user_id').eq('id', orderA);
    expect((orderRow ?? []).map((o) => o.id)).toContain(orderA);

    const { data: items } = await a2.from('order_items').select('id').eq('order_id', orderA);
    expect((items ?? []).length).toBeGreaterThan(0);

    const { data: messages } = await a2.from('order_messages').select('id').eq('order_id', orderA);
    expect((messages ?? []).length).toBeGreaterThan(0);

    // Isolation still holds for the buyer: org-B order invisible.
    const { data: bOrder } = await a2.from('orders').select('id').eq('id', orderB);
    expect(bOrder ?? []).toHaveLength(0);
  });

  test('staff (is_admin) sees both orgs', async () => {
    const adminClient = await signIn(emailAdmin);

    const { data: orders } = await adminClient
      .from('orders')
      .select('id')
      .in('id', [orderA, orderB]);
    expect((orders ?? []).map((o) => o.id).sort()).toEqual([orderA, orderB].sort());

    const { data: orgs } = await adminClient
      .from('organizations')
      .select('id')
      .in('id', [orgA, orgB]);
    expect((orgs ?? []).map((o) => o.id).sort()).toEqual([orgA, orgB].sort());

    const { data: attestations } = await adminClient
      .from('org_attestations')
      .select('id')
      .in('id', [attestationA, attestationB]);
    expect((attestations ?? []).map((o) => o.id).sort()).toEqual([attestationA, attestationB].sort());
  });

  test('anon sees no orders/orgs/attestations but can read the global catalog', async () => {
    const anon = anonClient();

    const { data: orders } = await anon.from('orders').select('id').in('id', [orderA, orderB]);
    expect(orders ?? []).toHaveLength(0);

    const { data: orgs } = await anon.from('organizations').select('id').in('id', [orgA, orgB]);
    expect(orgs ?? []).toHaveLength(0);

    const { data: attestations } = await anon
      .from('org_attestations')
      .select('id')
      .in('id', [attestationA, attestationB]);
    expect(attestations ?? []).toHaveLength(0);

    // Global catalog stays public (decision #3) — anon reads retail prices via
    // the cost-hiding RPC.
    const { data: prices, error: priceErr } = await anon.rpc('list_public_prices');
    expect(priceErr).toBeNull();
    expect((prices ?? []).length).toBeGreaterThan(0);
  });

  // ── Approval gate (the order RPC is the authoritative enforcement point) ──

  test('approval gate: an approved-org member can place an order via the RPC', async () => {
    const a = await signIn(emailA);
    const { data, error } = await a.rpc('create_order_with_items', {
      p_items: [{ ...SKU, quantity: 1 }],
      p_shipping: SHIPPING,
      p_code: '',
    });
    expect(error).toBeNull();
    expect(data?.[0]?.order_id).toBeTruthy();
  });

  test('approval gate: a pending-org member is blocked (organization not approved)', async () => {
    const p = await signIn(emailPending);
    const { error } = await p.rpc('create_order_with_items', {
      p_items: [{ ...SKU, quantity: 1 }],
      p_shipping: SHIPPING,
      p_code: '',
    });
    expect(error?.message ?? '').toMatch(/organization not approved/i);
  });

  test('approval gate: an org-less member is blocked (no organization)', async () => {
    const n = await signIn(emailNoOrg);
    const { error } = await n.rpc('create_order_with_items', {
      p_items: [{ ...SKU, quantity: 1 }],
      p_shipping: SHIPPING,
      p_code: '',
    });
    expect(error?.message ?? '').toMatch(/no organization/i);
  });
});
