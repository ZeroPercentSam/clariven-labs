// Nav perf hardening (Phase 6c). The admin sidebar uses the client NavLink with
// a rapid-click guard (useTransition + pending guard + prefetch={false}). This
// verifies the sidebar renders, highlights the active route via aria-current,
// and that navigation works + the page stays responsive under quick clicks.

import { expect, test, type Page } from '@playwright/test';
import { ADMIN_EMAIL, TEST_PASSWORD } from './helpers';

async function login(page: Page, email: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'));
}

test('admin sidebar renders, marks the active route, and navigates under quick clicks', async ({
  page,
}) => {
  await login(page, ADMIN_EMAIL);
  await page.goto('/admin');

  const nav = page.getByRole('navigation');
  await expect(nav.getByRole('link', { name: 'Orders' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Lots' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Support' })).toBeVisible();

  // Overview (exact match) is the active row on /admin.
  await expect(nav.getByRole('link', { name: 'Overview' })).toHaveAttribute('aria-current', 'page');

  // Navigate → active highlight follows.
  await nav.getByRole('link', { name: 'Orders' }).click();
  await page.waitForURL(/\/admin\/orders/);
  await expect(nav.getByRole('link', { name: 'Orders' })).toHaveAttribute('aria-current', 'page');

  // Quick successive clicks must not freeze the page — land on a valid route,
  // then a follow-up click still navigates cleanly (page is responsive).
  await nav.getByRole('link', { name: 'Lots' }).click();
  await page.waitForURL(/\/admin\/lots/);
  await nav.getByRole('link', { name: 'Pricing' }).click();
  await page.waitForURL(/\/admin\/pricing/);
  await expect(page.getByRole('heading').first()).toBeVisible();
});
