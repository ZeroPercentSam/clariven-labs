import { expect, test } from '@playwright/test';
import {
  CUSTOMER_EMAIL,
  SECONDARY_CUSTOMER_EMAIL,
  TEST_PASSWORD,
} from './helpers';

async function loginAs(page: import('@playwright/test').Page, email: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/portal/);
}

test('user B cannot view user A\'s order detail', async ({ browser }) => {
  // User A places an order (assume the cart-and-order test has already run).
  const ctxA = await browser.newContext();
  const pageA = await ctxA.newPage();
  await loginAs(pageA, CUSTOMER_EMAIL);
  await pageA.goto('/portal');

  // Grab any order link from A's list
  const links = await pageA.getByRole('link', { name: /order #/i }).all();
  if (links.length === 0) test.skip(true, 'No order for customer A — cart-and-order must run first');
  const href = await links[0].getAttribute('href');
  expect(href).toBeTruthy();
  const orderId = href!.split('/').pop();

  // User B attempts to fetch the order via API
  const ctxB = await browser.newContext();
  const pageB = await ctxB.newPage();
  await loginAs(pageB, SECONDARY_CUSTOMER_EMAIL);
  const res = await pageB.request.get(`/api/orders/${orderId}`);
  // RLS returns empty row; route returns 404
  expect([403, 404]).toContain(res.status());

  await ctxA.close();
  await ctxB.close();
});
