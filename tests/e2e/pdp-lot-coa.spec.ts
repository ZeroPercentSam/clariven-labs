import { expect, test } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../src/lib/database.types';
import { admin } from './helpers';

// Phase 7 fast-follow (migration 0024): the customer PDP surfaces lot-level COAs
// via the anon SECURITY DEFINER RPC list_public_lot_coas. This is a permanent CI
// lock on that exposure boundary: only ACTIVE lots that HAVE a COA are returned,
// the projection carries ONLY safe public columns (never notes/received_at/
// uploaded_by/ids), and the product_lots base table stays admin-only to anon.

const SLUG = 'e2e-lotcoa-product'; // synthetic — never collides with a real catalog slug

function anonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase env missing — set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  return createClient<Database>(url, key, { auth: { persistSession: false } });
}

test.describe('public lot COA exposure (list_public_lot_coas)', () => {
  test.beforeAll(async () => {
    const supa = admin();
    await supa.from('product_lots').delete().eq('product_slug', SLUG);
    await supa.from('product_lots').insert([
      {
        product_slug: SLUG,
        strength_label: '10 mg',
        lot_number: 'LOT-ACTIVE-COA',
        expiration_date: '2027-01-01',
        coa_file_path: 'lots/e2e/active.pdf',
        coa_file_name: 'active.pdf',
        notes: 'internal-only-should-never-leak',
        received_at: '2026-01-01',
        active: true,
      },
      {
        product_slug: SLUG,
        strength_label: '10 mg',
        lot_number: 'LOT-INACTIVE-COA',
        expiration_date: '2027-01-01',
        coa_file_path: 'lots/e2e/inactive.pdf',
        active: false, // inactive → must be excluded
      },
      {
        product_slug: SLUG,
        strength_label: '5 mg',
        lot_number: 'LOT-ACTIVE-NOCOA',
        expiration_date: '2027-01-01',
        active: true, // no coa_file_path → must be excluded
      },
    ]);
  });

  test.afterAll(async () => {
    await admin().from('product_lots').delete().eq('product_slug', SLUG);
  });

  test('returns only active lots with a COA, safe columns only', async () => {
    const supa = anonClient();
    const { data, error } = await supa.rpc('list_public_lot_coas', { p_slug: SLUG });
    expect(error).toBeNull();
    expect(data ?? []).toHaveLength(1);
    const row = (data ?? [])[0];
    expect(row.lot_number).toBe('LOT-ACTIVE-COA');
    expect(row.coa_file_path).toBeTruthy();
    // Safe projection — no internal/ops columns ever reach an anon caller.
    expect(row).not.toHaveProperty('notes');
    expect(row).not.toHaveProperty('received_at');
    expect(row).not.toHaveProperty('uploaded_by');
    expect(row).not.toHaveProperty('id');
    expect(row).not.toHaveProperty('coa_file_bytes');
  });

  test('anon cannot read the product_lots base table', async () => {
    const supa = anonClient();
    const { data } = await supa.from('product_lots').select('*').eq('product_slug', SLUG);
    // admin-only RLS (migration 0023) → anon sees zero rows.
    expect(data ?? []).toHaveLength(0);
  });
});
