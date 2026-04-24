import { expect, test } from '@playwright/test';
import { CUSTOMER_EMAIL, TEST_PASSWORD, admin, readMockLog } from './helpers';

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(CUSTOMER_EMAIL);
  await page.getByLabel('Password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/portal/);
}

test('add to cart, apply affiliate code, submit order → GBP + Twilio mocks fire', async ({ page }) => {
  // Seed a known price + state handled in global-setup.
  await login(page);

  await page.goto('/products/semaglutide');
  await expect(page.getByText(/Available Strengths/i)).toBeVisible();
  await page.getByRole('button', { name: /5 mg/i }).first().click();
  await page.getByRole('button', { name: /add to order/i }).click();

  await page.goto('/cart');
  await page.getByPlaceholder('ENTER CODE').fill('KATIE10');
  await page.getByRole('button', { name: /apply/i }).click();
  await expect(page.getByText(/Discount/i)).toBeVisible();

  await page.getByRole('button', { name: /continue to checkout/i }).click();
  await expect(page).toHaveURL(/\/checkout/);

  await page.getByLabel('Full name').fill('E2E Buyer');
  await page.getByLabel('Street address').fill('123 Test St');
  await page.getByLabel('City').fill('Miami');
  await page.getByLabel('State').fill('FL');
  await page.getByLabel(/ZIP/).fill('33101');

  await page.getByRole('button', { name: /submit order/i }).click();
  await page.waitForURL(/\/portal\/orders\//);

  // Assert mocks fired
  const gbp = await readMockLog('gbp');
  expect(gbp.some((r) => r.method === 'OneTimeInvoice')).toBeTruthy();
  const twilio = await readMockLog('twilio');
  expect(twilio.length).toBeGreaterThanOrEqual(1);

  // Assert DB row
  const supa = admin();
  const { data: orders } = await supa
    .from('orders')
    .select('status, applied_code_id, discount_cents')
    .order('created_at', { ascending: false })
    .limit(1);
  expect(orders?.[0].status).toBe('pending_payment');
  expect(orders?.[0].applied_code_id).toBeTruthy();
  expect(orders?.[0].discount_cents).toBeGreaterThan(0);
});

test('expired code is rejected', async ({ page }) => {
  await login(page);
  await page.goto('/cart');
  // Nothing in cart if previous test cleared, but affiliate input is not gated on items
  await page.getByPlaceholder('ENTER CODE').fill('EXPIRED5');
  await page.getByRole('button', { name: /apply/i }).click();
  await expect(page.getByText(/isn't active/i)).toBeVisible();
});
