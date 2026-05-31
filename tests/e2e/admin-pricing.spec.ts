import { expect, test } from '@playwright/test';
import { ADMIN_EMAIL, TEST_PASSWORD, admin } from './helpers';

test('admin sets a price via the pricing page', async ({ page }) => {
  const supa = admin();
  // product_prices is the real catalog seed — capture the original so we can
  // restore it (the test mutates a live SKU; the lifecycle no longer truncates).
  const SLUG = 'thymosin-alpha-1';
  const STRENGTH = '5 mg';
  const { data: orig } = await supa
    .from('product_prices')
    .select('price_cents')
    .eq('product_slug', SLUG)
    .eq('strength_label', STRENGTH)
    .maybeSingle();

  try {
    await page.goto('/login');
    await page.getByLabel('Email').fill(ADMIN_EMAIL);
    await page.getByLabel('Password').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.goto('/admin/pricing');

    // Filter to a known SKU; the first numeric input is its lowest strength (5 mg).
    await page.getByPlaceholder(/Filter/i).fill(SLUG);
    const row = page.getByText(SLUG).first();
    await expect(row).toBeVisible();

    const priceInput = page.locator('input[type="number"]').first();
    await priceInput.fill('149.00');
    await page.getByRole('button', { name: /save/i }).first().click();
    await expect(page.getByRole('button', { name: /^saved/i }).first()).toBeVisible({ timeout: 5000 });

    const { data } = await supa
      .from('product_prices')
      .select('price_cents')
      .eq('product_slug', SLUG)
      .eq('strength_label', STRENGTH)
      .maybeSingle();
    expect(data?.price_cents).toBe(14900);
  } finally {
    // Restore the real catalog price so the seed stays intact.
    if (orig) {
      await supa
        .from('product_prices')
        .update({ price_cents: orig.price_cents })
        .eq('product_slug', SLUG)
        .eq('strength_label', STRENGTH);
    }
  }
});
