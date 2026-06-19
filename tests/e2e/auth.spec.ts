import { expect, test } from '@playwright/test';
import { ADMIN_EMAIL, CUSTOMER_EMAIL, TEST_PASSWORD } from './helpers';

test('anon hitting /portal is redirected to /login', async ({ page }) => {
  const resp = await page.goto('/portal');
  expect(resp?.status()).toBeLessThan(500);
  await expect(page).toHaveURL(/\/login/);
});

test('customer signs in and lands on portal', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(CUSTOMER_EMAIL);
  await page.getByLabel('Password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  // Clients land on /portal, which routes straight to their onboarding checklist.
  await expect(page).toHaveURL(/\/portal\/onboarding/);
  await expect(page.getByText(/onboarding/i).first()).toBeVisible();
});

test('customer cannot reach /admin', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(CUSTOMER_EMAIL);
  await page.getByLabel('Password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  // Wait for the server-action sign-in to land (Set-Cookie persisted) before
  // navigating — otherwise the session cookie races page.goto and /admin bounces
  // to /login. Login defaults next=/portal for every role.
  await page.waitForURL(/\/portal/);
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/portal/);
});

test('admin signs in and reaches /admin', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(ADMIN_EMAIL);
  await page.getByLabel('Password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  // Admins sign in with next=/portal; /portal routes admins straight to /admin.
  await page.waitForURL(/\/admin/);
  await expect(page.getByRole('heading', { name: /overview/i })).toBeVisible();
});
