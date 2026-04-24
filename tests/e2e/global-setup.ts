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

  // Seed prices for a handful of real peptides (must match products.ts slugs).
  const supa = admin();
  await supa.from('product_prices').insert([
    { product_slug: 'semaglutide', strength_label: '5 mg', price_cents: 19900 },
    { product_slug: 'semaglutide', strength_label: '10 mg', price_cents: 34900 },
    { product_slug: 'bpc-157', strength_label: '5 mg', price_cents: 8900 },
    { product_slug: 'cjc-1295-dac', strength_label: '5 mg', price_cents: 9900 },
    { product_slug: 'epitalon', strength_label: '20 mg', price_cents: 4900 },
  ]);

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
