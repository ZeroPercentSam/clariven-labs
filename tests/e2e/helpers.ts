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
  await supa.from('product_prices').delete().gt('created_at', '1970-01-01');
  await supa.from('gbp_notifications').delete().gt('pulled_at', '1970-01-01');
  await supa.from('admin_audit_log').delete().gt('created_at', '1970-01-01');
}
