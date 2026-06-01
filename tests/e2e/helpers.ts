import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../src/lib/database.types';
import fs from 'node:fs/promises';
import path from 'node:path';

export const TEST_EMAIL_DOMAIN = 'clariven-e2e.test';
export const CUSTOMER_EMAIL = `e2e-customer@${TEST_EMAIL_DOMAIN}`;
export const ADMIN_EMAIL = `e2e-admin@${TEST_EMAIL_DOMAIN}`;
export const SECONDARY_CUSTOMER_EMAIL = `e2e-customer2@${TEST_EMAIL_DOMAIN}`;
export const TEST_PASSWORD = 'E2ETest-Password-123!';

export function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase env missing — set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY');
  return createClient<Database>(url, key, { auth: { persistSession: false } });
}

export async function deleteTestUsers() {
  const supa = admin();
  const { data: list } = await supa.auth.admin.listUsers({ perPage: 200 });
  for (const u of list?.users ?? []) {
    if (u.email?.endsWith(`@${TEST_EMAIL_DOMAIN}`)) {
      await supa.auth.admin.deleteUser(u.id);
    }
  }
}

export async function createTestUser(email: string, role: 'customer' | 'admin' = 'customer') {
  const supa = admin();
  const { data, error } = await supa.auth.admin.createUser({
    email,
    password: TEST_PASSWORD,
    email_confirm: true,
  });
  if (error || !data.user) throw new Error(`createUser ${email}: ${error?.message}`);
  if (role === 'admin') {
    await supa.from('profiles').update({ role: 'admin' }).eq('id', data.user.id);
  }
  return data.user;
}

// Bootstrap a customer into a personal, APPROVED org + owner membership —
// mirrors what migration 0010 did for every real customer. Required post-0011:
// the order RPC's approval gate refuses checkout from a no-org / unapproved
// org. Slug prefix `e2e-std-` so truncateTestData() can reclaim it. Keep each
// test customer in its OWN org so cross-user order isolation still holds.
export async function createApprovedOrgFor(userId: string, name: string) {
  const supa = admin();
  const slug = `e2e-std-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  const { data, error } = await supa
    .from('organizations')
    .insert({ name, slug, approval_status: 'approved' })
    .select('id')
    .single();
  if (error || !data) throw new Error(`createApprovedOrgFor ${name}: ${error?.message}`);
  await supa.from('profiles').update({ organization_id: data.id }).eq('id', userId);
  await supa
    .from('org_members')
    .insert({ organization_id: data.id, user_id: userId, org_role: 'owner' });
  return data.id;
}

export async function readMockLog(kind: 'gbp' | 'twilio') {
  const file = path.resolve(process.cwd(), `.${kind}-log.jsonl`);
  try {
    const raw = await fs.readFile(file, 'utf8');
    return raw.trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
  } catch {
    return [];
  }
}

export async function clearMockLogs() {
  for (const k of ['gbp', 'twilio']) {
    const file = path.resolve(process.cwd(), `.${k}-log.jsonl`);
    try { await fs.rm(file); } catch {
      /* ignore */
    }
  }
}

export async function truncateTestData() {
  const supa = admin();
  // Order matters (FKs)
  await supa.from('order_messages').delete().gt('created_at', '1970-01-01');
  await supa.from('order_items').delete().gt('created_at', '1970-01-01');
  await supa.from('orders').delete().gt('created_at', '1970-01-01');
  await supa.from('affiliate_codes').delete().gt('created_at', '1970-01-01');
  await supa.from('affiliates').delete().gt('created_at', '1970-01-01');
  // Test-created orgs only (slug prefixes `e2e-std-`/`e2e-orgiso-`). The 9 real
  // backfilled customer orgs (migration 0010) use `<emaillocal>-<hex>` slugs and
  // are NEVER matched. Orders above are already cleared, releasing
  // orders.organization_id (ON DELETE RESTRICT).
  for (const prefix of [
    'e2e-std-%',
    'e2e-orgiso-%',
    'e2e-gate-%',
    'e2e-onb-%',
    'e2e-orev-%',
    'e2e-inv-%',
    'e2e-repasgn-%',
    'e2e-ordtools-%',
    'e2e-sales-%',
    'e2e-imp-%',
  ]) {
    const { data: orgs } = await supa.from('organizations').select('id').like('slug', prefix);
    const ids = (orgs ?? []).map((o) => o.id);
    if (ids.length) {
      await supa.from('rep_org_assignments').delete().in('organization_id', ids);
      await supa.from('org_attestations').delete().in('organization_id', ids);
      await supa.from('org_invitations').delete().in('organization_id', ids);
      await supa.from('org_members').delete().in('organization_id', ids);
      await supa.from('organizations').delete().in('id', ids);
    }
  }
  // Phase 4 rep tables. sales_reps + consents cascade from a test-user delete,
  // but truncateTestData runs independently of user deletion — clean explicitly,
  // scoped to test-domain profiles. NEVER touch rep_agreement_versions (the
  // seeded current ICA, like product_prices). FK-safe order: consents →
  // sales_reps → invitations (assignments/commissions get added in c3/c4).
  const { data: testProfiles } = await supa
    .from('profiles')
    .select('id')
    .like('email', `%@${TEST_EMAIL_DOMAIN}`);
  const repIds = (testProfiles ?? []).map((p) => p.id);
  if (repIds.length) {
    await supa.from('rep_commissions').delete().in('rep_user_id', repIds);
    await supa.from('rep_org_assignments').delete().in('rep_user_id', repIds);
    await supa.from('affiliate_codes').delete().in('rep_user_id', repIds); // rep-minted codes
    await supa.from('rep_agreement_consents').delete().in('rep_user_id', repIds);
    await supa.from('sales_reps').delete().in('id', repIds);
  }
  await supa.from('rep_invitations').delete().like('email', `%@${TEST_EMAIL_DOMAIN}`);
  // NOTE: product_prices is the real 60-SKU catalog (seeded by migration 0008).
  // Do NOT truncate it here — that would wipe production pricing on every
  // `npm run test:e2e`. Specs read the real seed; price-mutating specs restore.
  await supa.from('gbp_notifications').delete().gt('pulled_at', '1970-01-01');
  await supa.from('admin_audit_log').delete().gt('created_at', '1970-01-01');
}
