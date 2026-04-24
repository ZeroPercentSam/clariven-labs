import { expect, test } from '@playwright/test';
import { ADMIN_EMAIL, TEST_PASSWORD, admin } from './helpers';

test('admin sets a price via the pricing page', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(ADMIN_EMAIL);
  await page.getByLabel('Password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.goto('/admin/pricing');

  // Filter to a specific product + strength we know is unpriced in seed
  await page.getByPlaceholder(/Filter/i).fill('thymosin-alpha-1');
  const row = page.getByText('thymosin-alpha-1').first();
  await expect(row).toBeVisible();

  // First numeric input in the filtered view
  const priceInput = page.locator('input[type="number"]').first();
  await priceInput.fill('149.00');
  await page.getByRole('button', { name: /save/i }).first().click();
  await expect(page.getByRole('button', { name: /^saved/i }).first()).toBeVisible({ timeout: 5000 });

  const supa = admin();
  const { data } = await supa
    .from('product_prices')
    .select('price_cents')
    .eq('product_slug', 'thymosin-alpha-1')
    .limit(1)
    .single();
  expect(data?.price_cents).toBe(14900);
});
