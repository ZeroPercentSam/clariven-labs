// Commission engine — the permanent CI lock for Phase 4 c4 (migration 0018).
// Asserts the money core directly against Postgres (no UI): a paid order writes
// exactly one commission at margin base × rate (penny-exact, floor-truncated),
// the default 0.20 vs a per-assignment override, idempotency on re-paid, the
// max(0, …) margin floor, void-on-cancel, and rep↔rep RLS isolation.
//
// Drives via the service-role client (insert orders/items, flip status → the
// trigger fires) + an authenticated rep client (RLS read). Self-contained:
// `e2e-repcomm-` users + `e2e-repasgn-` orgs, torn down after.

import { expect, test } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../src/lib/database.types';
import { admin, TEST_EMAIL_DOMAIN, TEST_PASSWORD } from './helpers';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const EMAIL_A = `e2e-repcomm-a@${TEST_EMAIL_DOMAIN}`;
const EMAIL_B = `e2e-repcomm-b@${TEST_EMAIL_DOMAIN}`;
const EMAIL_CUST = `e2e-repcomm-cust@${TEST_EMAIL_DOMAIN}`;

let repAUid = '';
let repBUid = '';
let custUid = '';
let orgA = '';
let orgB = '';
let orderA1 = '';
let orderA2 = '';
let orderB = '';

const SHIPPING = { full_name: 'Lab', line1: '1 Way', city: 'Cheyenne', state: 'WY', postal_code: '82001', country: 'US' };

function signInClient(email: string): Promise<SupabaseClient<Database>> {
  const client = createClient<Database>(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client.auth
    .signInWithPassword({ email, password: TEST_PASSWORD })
    .then(({ error }) => {
      if (error) throw new Error(`signIn ${email}: ${error.message}`);
      return client;
    });
}

// Insert an order (status pending_payment) + items, with explicit subtotal /
// discount / per-line COGS so the margin base is fully controlled.
async function makeOrder(
  orgId: string,
  opts: { subtotal: number; discount: number; items: { cost: number; qty: number }[] },
): Promise<string> {
  const supa = admin();
  const { data: order, error } = await supa
    .from('orders')
    .insert({
      user_id: custUid,
      organization_id: orgId,
      shipping_address: SHIPPING,
      subtotal_cents: opts.subtotal,
      discount_cents: opts.discount,
      total_cents: opts.subtotal - opts.discount,
      status: 'pending_payment',
    })
    .select('id')
    .single();
  if (error || !order) throw new Error(`makeOrder: ${error?.message}`);
  for (const it of opts.items) {
    const { error: iErr } = await supa.from('order_items').insert({
      order_id: order.id,
      product_slug: 'single-regulator',
      product_name: 'Single Regulator',
      strength_label: '10 mg',
      quantity: it.qty,
      unit_price_cents: 1000,
      unit_cost_cents: it.cost,
      line_total_cents: 1000 * it.qty,
    });
    if (iErr) throw new Error(`makeOrder item: ${iErr.message}`);
  }
  return order.id;
}

async function setStatus(orderId: string, status: string) {
  const supa = admin();
  const { error } = await supa.from('orders').update({ status }).eq('id', orderId);
  if (error) throw new Error(`setStatus ${status}: ${error.message}`);
}

async function commissionsFor(orderId: string) {
  const supa = admin();
  const { data } = await supa.from('rep_commissions').select('*').eq('order_id', orderId);
  return data ?? [];
}

async function cleanup() {
  const supa = admin();
  const { data: list } = await supa.auth.admin.listUsers({ perPage: 200 });
  const uids = (list?.users ?? [])
    .filter((u) => u.email?.startsWith('e2e-repcomm-') && u.email.endsWith(`@${TEST_EMAIL_DOMAIN}`))
    .map((u) => u.id);
  const { data: orgs } = await supa.from('organizations').select('id').like('slug', 'e2e-repasgn-%');
  const oids = (orgs ?? []).map((o) => o.id);
  if (oids.length) {
    const { data: ords } = await supa.from('orders').select('id').in('organization_id', oids);
    const ordIds = (ords ?? []).map((o) => o.id);
    if (ordIds.length) {
      await supa.from('rep_commissions').delete().in('order_id', ordIds);
      await supa.from('order_items').delete().in('order_id', ordIds);
      await supa.from('orders').delete().in('id', ordIds);
    }
    await supa.from('rep_org_assignments').delete().in('organization_id', oids);
  }
  if (uids.length) {
    await supa.from('rep_commissions').delete().in('rep_user_id', uids);
    await supa.from('rep_org_assignments').delete().in('rep_user_id', uids);
    await supa.from('sales_reps').delete().in('id', uids);
  }
  if (oids.length) await supa.from('organizations').delete().in('id', oids);
  for (const id of uids) await supa.auth.admin.deleteUser(id);
}

test.describe.serial('rep commission engine (0018 money-core lock)', () => {
  test.beforeAll(async () => {
    await cleanup();
    const supa = admin();

    const mk = async (email: string) => {
      const { data, error } = await supa.auth.admin.createUser({
        email,
        password: TEST_PASSWORD,
        email_confirm: true,
      });
      if (error || !data.user) throw new Error(`createUser ${email}: ${error?.message}`);
      return data.user.id;
    };
    repAUid = await mk(EMAIL_A);
    repBUid = await mk(EMAIL_B);
    custUid = await mk(EMAIL_CUST);

    // Active reps.
    for (const id of [repAUid, repBUid]) {
      const { error } = await supa.from('sales_reps').insert({
        id,
        status: 'active',
        legal_name: 'Rep',
        onboarding_completed_at: new Date().toISOString(),
        approved_at: new Date().toISOString(),
      });
      if (error) throw new Error(`seed rep: ${error.message}`);
    }

    // Two approved orgs.
    const mkOrg = async (name: string) => {
      const slug = `e2e-repasgn-${Math.random().toString(36).slice(2, 8)}`;
      const { data, error } = await supa
        .from('organizations')
        .insert({ name, slug, approval_status: 'approved' })
        .select('id')
        .single();
      if (error || !data) throw new Error(`mkOrg: ${error?.message}`);
      return data.id;
    };
    orgA = await mkOrg('E2E RepAsgn A');
    orgB = await mkOrg('E2E RepAsgn B');

    // repA → orgA at default rate (commission_pct null); repB → orgB at 25%.
    const { error: aErr } = await supa
      .from('rep_org_assignments')
      .insert({ rep_user_id: repAUid, organization_id: orgA, commission_pct: null });
    if (aErr) throw new Error(`assign A: ${aErr.message}`);
    const { error: bErr } = await supa
      .from('rep_org_assignments')
      .insert({ rep_user_id: repBUid, organization_id: orgB, commission_pct: 0.25 });
    if (bErr) throw new Error(`assign B: ${bErr.message}`);
  });

  test.afterAll(cleanup);

  test('paid order writes one commission at margin base × default 0.20 (penny-exact)', async () => {
    // base = 100000 − 0 − (20000×2) = 60000; 0.20 → 12000.
    orderA1 = await makeOrder(orgA, { subtotal: 100000, discount: 0, items: [{ cost: 20000, qty: 2 }] });
    await setStatus(orderA1, 'paid');

    const rows = await commissionsFor(orderA1);
    expect(rows.length).toBe(1);
    const c = rows[0];
    expect(c.rep_user_id).toBe(repAUid);
    expect(c.source).toBe('org_assignment');
    expect(c.base_cents).toBe(60000);
    expect(c.cogs_cents).toBe(40000);
    expect(Number(c.rate)).toBe(0.2);
    expect(c.commission_cents).toBe(12000);
    expect(c.status).toBe('earned');
  });

  test('per-assignment override + floor truncation', async () => {
    // base = 40001 − 0 − (10000×3) = 10001; 0.25 → floor(2500.25) = 2500.
    orderB = await makeOrder(orgB, { subtotal: 40001, discount: 0, items: [{ cost: 10000, qty: 3 }] });
    await setStatus(orderB, 'paid');

    const rows = await commissionsFor(orderB);
    expect(rows.length).toBe(1);
    expect(rows[0].rep_user_id).toBe(repBUid);
    expect(rows[0].base_cents).toBe(10001);
    expect(Number(rows[0].rate)).toBe(0.25);
    expect(rows[0].commission_cents).toBe(2500);
  });

  test('idempotent — a second paid transition does not double-write', async () => {
    await setStatus(orderA1, 'preparing');
    await setStatus(orderA1, 'paid'); // second paid transition
    const rows = await commissionsFor(orderA1);
    expect(rows.length).toBe(1);
    expect(rows[0].commission_cents).toBe(12000);
  });

  test('margin floor — COGS ≥ revenue yields base 0, commission 0', async () => {
    // base = max(0, 10000 − 0 − (5000×3)) = 0.
    orderA2 = await makeOrder(orgA, { subtotal: 10000, discount: 0, items: [{ cost: 5000, qty: 3 }] });
    await setStatus(orderA2, 'paid');
    const rows = await commissionsFor(orderA2);
    expect(rows.length).toBe(1);
    expect(rows[0].base_cents).toBe(0);
    expect(rows[0].commission_cents).toBe(0);
  });

  test('rep↔rep RLS isolation — a rep reads only their own commissions', async () => {
    const aClient = await signInClient(EMAIL_A);
    const { data: aRows } = await aClient.from('rep_commissions').select('rep_user_id, order_id');
    expect((aRows ?? []).length).toBeGreaterThan(0);
    for (const r of aRows ?? []) expect(r.rep_user_id).toBe(repAUid);
    // repA cannot see repB's (orderB) commission.
    expect((aRows ?? []).some((r) => r.order_id === orderB)).toBe(false);

    const bClient = await signInClient(EMAIL_B);
    const { data: bRows } = await bClient.from('rep_commissions').select('rep_user_id, order_id');
    expect((bRows ?? []).length).toBeGreaterThan(0);
    for (const r of bRows ?? []) expect(r.rep_user_id).toBe(repBUid);
  });

  test('void on cancel — cancelling a paid order voids its earned commission', async () => {
    await setStatus(orderB, 'cancelled');
    const rows = await commissionsFor(orderB);
    expect(rows.length).toBe(1);
    expect(rows[0].status).toBe('void');
    expect(rows[0].reversed_at).toBeTruthy();
    expect(rows[0].reversed_reason).toBe('order_cancelled');
  });
});
