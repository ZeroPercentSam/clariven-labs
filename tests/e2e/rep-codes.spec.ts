// Rep-minted codes + the commission code-path (Phase 4 c5, migration 0019).
// Asserts: a paid order applying a rep's APPROVED code earns that rep a
// code-path commission; an active org_assignment takes precedence over a code;
// a PENDING rep code does not validate at checkout; and the rep portal shows
// the rep their own commission. Self-contained: `e2e-repcode-` users +
// `e2e-repasgn-` orgs.

import { expect, test, type Page } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../src/lib/database.types';
import { admin, TEST_EMAIL_DOMAIN, TEST_PASSWORD } from './helpers';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const EMAIL_A = `e2e-repcode-a@${TEST_EMAIL_DOMAIN}`;
const EMAIL_B = `e2e-repcode-b@${TEST_EMAIL_DOMAIN}`;
const EMAIL_CUST = `e2e-repcode-cust@${TEST_EMAIL_DOMAIN}`;
const CODE_B = 'E2EREPCODEB';
const CODE_PENDING = 'E2EREPPEND';

let repAUid = '';
let repBUid = '';
let custUid = '';
let orgNoAssign = '';
let orgAssigned = '';
let codeBId = '';

const SHIPPING = { full_name: 'Lab', line1: '1 Way', city: 'Cheyenne', state: 'WY', postal_code: '82001', country: 'US' };

function anonClient(): SupabaseClient<Database> {
  return createClient<Database>(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function makeOrder(
  orgId: string,
  opts: { subtotal: number; discount: number; codeId: string | null; items: { cost: number; qty: number }[] },
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
      applied_code_id: opts.codeId,
      status: 'pending_payment',
    })
    .select('id')
    .single();
  if (error || !order) throw new Error(`makeOrder: ${error?.message}`);
  for (const it of opts.items) {
    await supa.from('order_items').insert({
      order_id: order.id,
      product_slug: 'single-regulator',
      product_name: 'Single Regulator',
      strength_label: '10 mg',
      quantity: it.qty,
      unit_price_cents: 1000,
      unit_cost_cents: it.cost,
      line_total_cents: 1000 * it.qty,
    });
  }
  return order.id;
}

async function pay(orderId: string) {
  const supa = admin();
  await supa.from('orders').update({ status: 'paid' }).eq('id', orderId);
}

async function commissionFor(orderId: string) {
  const supa = admin();
  const { data } = await supa.from('rep_commissions').select('*').eq('order_id', orderId).maybeSingle();
  return data;
}

async function cleanup() {
  const supa = admin();
  const { data: list } = await supa.auth.admin.listUsers({ perPage: 200 });
  const uids = (list?.users ?? [])
    .filter((u) => u.email?.startsWith('e2e-repcode-') && u.email.endsWith(`@${TEST_EMAIL_DOMAIN}`))
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
    await supa.from('affiliate_codes').delete().in('rep_user_id', uids);
    await supa.from('rep_org_assignments').delete().in('rep_user_id', uids);
    await supa.from('sales_reps').delete().in('id', uids);
  }
  if (oids.length) await supa.from('organizations').delete().in('id', oids);
  for (const id of uids) await supa.auth.admin.deleteUser(id);
}

async function login(page: Page, email: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'));
}

test.describe.serial('rep codes + commission code-path', () => {
  test.beforeAll(async () => {
    await cleanup();
    const supa = admin();
    const mk = async (email: string) => {
      const { data, error } = await supa.auth.admin.createUser({ email, password: TEST_PASSWORD, email_confirm: true });
      if (error || !data.user) throw new Error(`createUser ${email}: ${error?.message}`);
      return data.user.id;
    };
    repAUid = await mk(EMAIL_A);
    repBUid = await mk(EMAIL_B);
    custUid = await mk(EMAIL_CUST);
    for (const id of [repAUid, repBUid]) {
      await supa.from('sales_reps').insert({
        id, status: 'active', legal_name: 'Rep', onboarding_completed_at: new Date().toISOString(),
      });
    }
    const mkOrg = async (name: string) => {
      const slug = `e2e-repasgn-${Math.random().toString(36).slice(2, 8)}`;
      const { data, error } = await supa.from('organizations').insert({ name, slug, approval_status: 'approved' }).select('id').single();
      if (error || !data) throw new Error(`mkOrg: ${error?.message}`);
      return data.id;
    };
    orgNoAssign = await mkOrg('E2E RepAsgn NoAssign');
    orgAssigned = await mkOrg('E2E RepAsgn Assigned');
    // repA gets the assigned org (default rate); orgNoAssign has none.
    await supa.from('rep_org_assignments').insert({ rep_user_id: repAUid, organization_id: orgAssigned, commission_pct: null });
    // repB owns an ACTIVE code + a PENDING code.
    const { data: codeB, error: cErr } = await supa
      .from('affiliate_codes')
      .insert({ code: CODE_B, discount_pct: 10, rep_user_id: repBUid, affiliate_id: null, approval_status: 'active', active: true })
      .select('id')
      .single();
    if (cErr || !codeB) throw new Error(`code B: ${cErr?.message}`);
    codeBId = codeB.id;
    await supa
      .from('affiliate_codes')
      .insert({ code: CODE_PENDING, discount_pct: 15, rep_user_id: repBUid, affiliate_id: null, approval_status: 'pending', active: true });
  });

  test.afterAll(cleanup);

  test('approved rep code on an unassigned org earns a code-path commission', async () => {
    // base = 50000 − 5000 − (10000×1) = 35000; default 0.20 → 7000.
    const orderId = await makeOrder(orgNoAssign, { subtotal: 50000, discount: 5000, codeId: codeBId, items: [{ cost: 10000, qty: 1 }] });
    await pay(orderId);
    const c = await commissionFor(orderId);
    expect(c?.source).toBe('code');
    expect(c?.rep_user_id).toBe(repBUid);
    expect(c?.code_id).toBe(codeBId);
    expect(c?.base_cents).toBe(35000);
    expect(c?.commission_cents).toBe(7000);
  });

  test('an active org_assignment takes precedence over an applied code', async () => {
    const orderId = await makeOrder(orgAssigned, { subtotal: 50000, discount: 5000, codeId: codeBId, items: [{ cost: 10000, qty: 1 }] });
    await pay(orderId);
    const c = await commissionFor(orderId);
    expect(c?.source).toBe('org_assignment'); // org wins
    expect(c?.rep_user_id).toBe(repAUid); // the assigned rep, not the code's rep
  });

  test('a pending rep code does not validate at checkout', async () => {
    const client = anonClient();
    const { data } = await client.rpc('validate_affiliate_code', { p_code: CODE_PENDING });
    expect((data ?? []).length).toBe(0); // active-only guard
    // the active code still validates
    const { data: ok } = await client.rpc('validate_affiliate_code', { p_code: CODE_B });
    expect((ok ?? []).length).toBe(1);
    expect(Number(ok![0].discount_pct)).toBe(10);
  });

  test('rep portal shows the rep their own commission', async ({ page }) => {
    await login(page, EMAIL_B);
    await page.goto('/rep/commissions');
    await expect(page.getByRole('heading', { name: /commissions/i })).toBeVisible();
    await expect(page.getByText('$70.00').first()).toBeVisible(); // the code commission
  });
});
