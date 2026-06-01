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
    // Wait for the server-action sign-in to land before navigating, else the
    // session cookie races page.goto and /admin/pricing bounces to /login.
    await page.waitForURL(/\/portal/);
    await page.goto('/admin/pricing');

    // Filter to a known SKU, then scope to the exact (slug, strength) row via its
    // data-sku hook. Targeting Retail.first() raced the filter re-render (could
    // grab an unfiltered input) and the row-scoped save+confirm avoids the weak
    // "Saved" wait that a never-dirty sibling row satisfies immediately.
    await page.getByPlaceholder(/Filter/i).fill(SLUG);
    const row = page.locator(`[data-sku="${SLUG}::${STRENGTH}"]`);
    await expect(row).toBeVisible();

    // Target the Retail input specifically (the row also has a Cost input now).
    await row.getByLabel('Retail').fill('149.00');
    await row.getByRole('button', { name: /^save$/i }).click();
    await expect(row.getByRole('button', { name: /^saved$/i })).toBeVisible({ timeout: 5000 });

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
