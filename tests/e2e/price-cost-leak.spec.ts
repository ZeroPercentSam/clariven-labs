import { expect, test } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../src/lib/database.types';
import { CUSTOMER_EMAIL, TEST_PASSWORD } from './helpers';

// Contract test (Phase 2B / M2B.4): cogs_cents is business-critical and must
// NEVER reach a customer payload. These assertions are a permanent CI lock on
// the cost-hiding posture: base-table SELECT is admin-only + anon SELECT is
// revoked, and the public retail reader (list_public_prices) projects only safe
// columns.

function anonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase env missing — set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  return createClient<Database>(url, key, { auth: { persistSession: false } });
}

test('anon cannot read cogs_cents from product_prices base table', async () => {
  const supa = anonClient();
  const { data } = await supa.from('product_prices').select('cogs_cents').limit(10);
  // anon SELECT is revoked + RLS is admin-only → permission denied (data null)
  // or zero rows. Either way: no cost leaks to anonymous callers.
  expect(data ?? []).toHaveLength(0);
});

test('list_public_prices returns retail with NO cost field', async () => {
  const supa = anonClient();
  const { data, error } = await supa.rpc('list_public_prices');
  expect(error).toBeNull();
  expect((data ?? []).length).toBeGreaterThan(0);
  for (const row of data ?? []) {
    expect(row).not.toHaveProperty('cogs_cents');
    expect(typeof row.price_cents).toBe('number');
    expect(row.price_cents).toBeGreaterThan(0);
  }
});

test('authenticated customer cannot read cogs_cents either', async () => {
  const supa = anonClient();
  const { error: signInErr } = await supa.auth.signInWithPassword({
    email: CUSTOMER_EMAIL,
    password: TEST_PASSWORD,
  });
  expect(signInErr).toBeNull();
  // RLS price_admin_read → a non-admin session sees zero base rows, so no
  // cogs_cents is ever returned to a logged-in customer.
  const { data } = await supa.from('product_prices').select('cogs_cents').limit(10);
  expect(data ?? []).toHaveLength(0);
});
