import 'dotenv/config';
import {
  ADMIN_EMAIL,
  CUSTOMER_EMAIL,
  SECONDARY_CUSTOMER_EMAIL,
  admin,
  clearMockLogs,
  createTestUser,
  deleteTestUsers,
  truncateTestData,
} from './helpers';

export default async function globalSetup() {
  await deleteTestUsers();
  await truncateTestData();
  await clearMockLogs();

  await createTestUser(CUSTOMER_EMAIL, 'customer');
  await createTestUser(SECONDARY_CUSTOMER_EMAIL, 'customer');
  await createTestUser(ADMIN_EMAIL, 'admin');

  // product_prices is the real 60-SKU catalog seeded by migration 0008. The
  // test lifecycle no longer truncates or re-seeds it, so specs read real
  // prices (e.g. single-regulator 10 mg). Price-mutating specs restore.
  const supa = admin();

  // Seed affiliates + codes.
  const { data: aff } = await supa
    .from('affiliates')
    .insert({ name: 'Katie E2E', email: 'katie-e2e@clariven-e2e.test', commission_pct: 20 })
    .select('id')
    .single();
  if (aff) {
    await supa.from('affiliate_codes').insert([
      { affiliate_id: aff.id, code: 'KATIE10', discount_pct: 10 },
      {
        affiliate_id: aff.id,
        code: 'EXPIRED5',
        discount_pct: 5,
        expires_at: new Date(Date.now() - 86_400_000).toISOString(),
      },
    ]);
  }
}
