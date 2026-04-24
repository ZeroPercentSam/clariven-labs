import { expect, test } from '@playwright/test';
import { admin } from './helpers';

// Simulates a status transition by mutating the mock-log scenario:
// the poll-invoices cron calls GBP getInvoiceStatus which in GBP_MOCK returns
// PaymentResult=3 (pending). We'll manually set an order's gbp_invoice_id then
// call the cron with CRON_SECRET.

test('poll-invoices cron is authed and touches pending orders', async ({ request }) => {
  const supa = admin();

  // Ensure at least one polled order exists
  const { data: users } = await supa.auth.admin.listUsers({ perPage: 50 });
  const firstUser = users?.users.find((u) => u.email?.includes('e2e-customer@'));
  if (!firstUser) test.skip(true, 'seeded user missing');

  // Manually create an order row with a mock invoice id
  const { data: order } = await supa
    .from('orders')
    .insert({
      user_id: firstUser!.id,
      shipping_address: { full_name: 'x', line1: 'x', city: 'x', state: 'x', postal_code: 'x' },
      subtotal_cents: 1000,
      total_cents: 1000,
      gbp_invoice_id: 'mock_cron_test',
    })
    .select('id')
    .single();

  // Unauth rejected
  const bad = await request.get('/api/cron/poll-invoices');
  expect(bad.status()).toBe(403);

  // Authorized hit
  const ok = await request.get('/api/cron/poll-invoices', {
    headers: { authorization: 'Bearer test-cron-secret' },
  });
  expect(ok.ok()).toBe(true);
  const json = (await ok.json()) as { examined?: number; ok?: boolean };
  expect(json.ok).toBe(true);

  // Mock returns PaymentResult=3 so status stays pending_payment and last_polled_at is set.
  const { data: after } = await supa
    .from('orders')
    .select('gbp_last_polled_at, gbp_payment_result, status')
    .eq('id', order!.id)
    .single();
  expect(after?.gbp_last_polled_at).not.toBeNull();
  expect(after?.status).toBe('pending_payment');

  // cleanup
  await supa.from('orders').delete().eq('id', order!.id);
});
