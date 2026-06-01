// Customer impersonation — DB security core (Phase 5 (a), migration 0021).
// API-level adversarial verification: drives start/end_impersonation via authed
// supabase clients and asserts the effective-user RLS scoping directly (no UI —
// that lands in d2). Seeds admin2 + customers A & B (each an approved org + one
// order) via service-role; `e2e-imp-` prefix; self-cleaning.

import { expect, test } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../src/lib/database.types';
import { ADMIN_EMAIL, TEST_EMAIL_DOMAIN, TEST_PASSWORD, admin } from './helpers';

const ADMIN2_EMAIL = `e2e-imp-admin2@${TEST_EMAIL_DOMAIN}`;
const A_EMAIL = `e2e-imp-custa@${TEST_EMAIL_DOMAIN}`;
const B_EMAIL = `e2e-imp-custb@${TEST_EMAIL_DOMAIN}`;

let adminUid = '';
let admin2Uid = '';
let aUid = '';
let bUid = '';
let aOrderId = '';
let bOrderId = '';

const SHIPPING = { full_name: 'Lab', line1: '1 Way', city: 'Cheyenne', state: 'WY', postal_code: '82001', country: 'US' };

function anonClient(): SupabaseClient<Database> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function signedIn(email: string): Promise<SupabaseClient<Database>> {
  const c = anonClient();
  const { error } = await c.auth.signInWithPassword({ email, password: TEST_PASSWORD });
  if (error) throw new Error(`signin ${email}: ${error.message}`);
  return c;
}

async function seedOrg(uid: string, name: string): Promise<string> {
  const supa = admin();
  const slug = `e2e-imp-${name}-${Math.random().toString(36).slice(2, 8)}`;
  const { data: org } = await supa
    .from('organizations')
    .insert({ name: `E2E Imp ${name}`, slug, approval_status: 'approved' })
    .select('id')
    .single();
  await supa.from('profiles').update({ organization_id: org!.id }).eq('id', uid);
  await supa.from('org_members').insert({ organization_id: org!.id, user_id: uid, org_role: 'owner' });
  const { data: order } = await supa
    .from('orders')
    .insert({ user_id: uid, organization_id: org!.id, shipping_address: SHIPPING, subtotal_cents: 5000, total_cents: 5000, status: 'paid' })
    .select('id')
    .single();
  return order!.id; // the order id (the org link + membership are side-effects)
}

async function endActiveFor(uid: string) {
  const supa = admin();
  await supa
    .from('impersonation_sessions')
    .update({ ended_at: new Date().toISOString(), ended_reason: 'revoked' })
    .eq('admin_user_id', uid)
    .is('ended_at', null);
}

async function cleanup() {
  const supa = admin();
  const { data: orgs } = await supa.from('organizations').select('id').like('slug', 'e2e-imp-%');
  const oids = (orgs ?? []).map((o) => o.id);
  if (oids.length) {
    const { data: ords } = await supa.from('orders').select('id').in('organization_id', oids);
    const ordIds = (ords ?? []).map((o) => o.id);
    if (ordIds.length) {
      await supa.from('order_items').delete().in('order_id', ordIds);
      await supa.from('orders').delete().in('id', ordIds);
    }
  }
  const { data: list } = await supa.auth.admin.listUsers({ perPage: 200 });
  const uids = (list?.users ?? [])
    .filter((u) => u.email?.startsWith('e2e-imp-') && u.email.endsWith(`@${TEST_EMAIL_DOMAIN}`))
    .map((u) => u.id);
  if (uids.length) {
    await supa.from('impersonation_sessions').delete().in('admin_user_id', uids);
    await supa.from('impersonation_sessions').delete().in('impersonated_user_id', uids);
  }
  // The real shared admin may hold sessions targeting our seeded users — clear by target too.
  if (adminUid) await supa.from('impersonation_sessions').delete().eq('admin_user_id', adminUid);
  await supa.from('admin_audit_log').delete().like('action', 'impersonation.%');
  if (oids.length) await supa.from('organizations').delete().in('id', oids);
  for (const id of uids) await supa.auth.admin.deleteUser(id);
}

test.describe.serial('customer impersonation — security core', () => {
  test.beforeAll(async () => {
    await cleanup();
    const supa = admin();
    const { data: ap } = await supa.from('profiles').select('id').eq('email', ADMIN_EMAIL).single();
    adminUid = ap!.id;
    const mk = async (email: string, role: 'customer' | 'admin') => {
      const { data, error } = await supa.auth.admin.createUser({ email, password: TEST_PASSWORD, email_confirm: true });
      if (error || !data.user) throw new Error(`createUser ${email}: ${error?.message}`);
      if (role === 'admin') await supa.from('profiles').update({ role: 'admin' }).eq('id', data.user.id);
      return data.user.id;
    };
    admin2Uid = await mk(ADMIN2_EMAIL, 'admin');
    aUid = await mk(A_EMAIL, 'customer');
    bUid = await mk(B_EMAIL, 'customer');
    aOrderId = await seedOrg(aUid, 'a');
    bOrderId = await seedOrg(bUid, 'b');
  });

  test.afterAll(cleanup);
  test.beforeEach(async () => {
    await endActiveFor(adminUid);
  });

  test('scoping: impersonating A drops admin powers + scopes orders to A’s org, then restores', async () => {
    const c = await signedIn(ADMIN_EMAIL);
    expect((await c.rpc('is_admin')).data).toBe(true); // real admin, no session

    const sid = (await c.rpc('start_impersonation', { p_target: aUid, p_justification: 'support debug A order' })).data;
    expect(sid).toBeTruthy();

    // Admin powers drop → is_admin() resolves the effective (customer) user.
    expect((await c.rpc('is_admin')).data).toBe(false);
    // orders read is now scoped to A's org (NOT admin-all): A's order, not B's.
    const orders = (await c.from('orders').select('id')).data ?? [];
    expect(orders.map((o) => o.id)).toContain(aOrderId);
    expect(orders.map((o) => o.id)).not.toContain(bOrderId);
    // profiles self-read follows the effective user → A's profile is readable.
    expect((await c.from('profiles').select('id').eq('id', aUid)).data?.length).toBe(1);

    await c.rpc('end_impersonation');
    // Identity restored: admin powers back (is_admin true again).
    expect((await c.rpc('is_admin')).data).toBe(true);
  });

  test('isolation: impersonating A cannot read B’s profile or order', async () => {
    const c = await signedIn(ADMIN_EMAIL);
    await c.rpc('start_impersonation', { p_target: aUid, p_justification: 'support debug isolation' });

    // effective = A (not a superuser): B's profile + order are filtered out by RLS.
    expect((await c.from('profiles').select('id').eq('id', bUid)).data?.length ?? 0).toBe(0);
    const orders = (await c.from('orders').select('id')).data ?? [];
    expect(orders.map((o) => o.id)).not.toContain(bOrderId);

    await c.rpc('end_impersonation');
  });

  test('guards: self / admin target / short justification / already-active are rejected', async () => {
    const c = await signedIn(ADMIN_EMAIL);
    expect((await c.rpc('start_impersonation', { p_target: adminUid, p_justification: 'trying to self impersonate' })).error?.message)
      .toMatch(/CANNOT_IMPERSONATE_SELF/);
    expect((await c.rpc('start_impersonation', { p_target: admin2Uid, p_justification: 'trying to impersonate an admin' })).error?.message)
      .toMatch(/CANNOT_IMPERSONATE_ADMIN/);
    expect((await c.rpc('start_impersonation', { p_target: aUid, p_justification: 'short' })).error?.message)
      .toMatch(/JUSTIFICATION_TOO_SHORT/);
    // One active per admin.
    expect((await c.rpc('start_impersonation', { p_target: aUid, p_justification: 'first valid session' })).data).toBeTruthy();
    expect((await c.rpc('start_impersonation', { p_target: bUid, p_justification: 'second concurrent session' })).error?.message)
      .toMatch(/IMPERSONATION_ALREADY_ACTIVE/);
    await c.rpc('end_impersonation');
  });

  test('RLS: a customer cannot start impersonation nor read the sessions ledger', async () => {
    const c = await signedIn(A_EMAIL);
    expect((await c.rpc('start_impersonation', { p_target: bUid, p_justification: 'customer trying to impersonate' })).error?.message)
      .toMatch(/FORBIDDEN_NOT_ADMIN/);
    expect((await c.from('impersonation_sessions').select('id')).data?.length ?? 0).toBe(0);
  });

  test('audit: start + end write impersonation rows attributed to the real admin', async () => {
    const c = await signedIn(ADMIN_EMAIL);
    await c.rpc('start_impersonation', { p_target: aUid, p_justification: 'audit trail check' });
    await c.rpc('end_impersonation');
    const supa = admin();
    const { data: rows } = await supa
      .from('admin_audit_log')
      .select('action, actor_id, target_id, impersonated_user_id')
      .in('action', ['impersonation.started', 'impersonation.ended'])
      .eq('target_id', aUid);
    const started = (rows ?? []).find((r) => r.action === 'impersonation.started');
    const ended = (rows ?? []).find((r) => r.action === 'impersonation.ended');
    expect(started).toBeTruthy();
    expect(started?.actor_id).toBe(adminUid); // real admin, not the customer
    expect(ended).toBeTruthy();
  });
});
