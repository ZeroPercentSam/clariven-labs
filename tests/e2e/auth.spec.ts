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
  await expect(page).toHaveURL(/\/portal/);
  await expect(page.getByText(/orders/i).first()).toBeVisible();
});

test('customer cannot reach /admin', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(CUSTOMER_EMAIL);
  await page.getByLabel('Password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/portal/);
});

test('admin signs in and reaches /admin', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(ADMIN_EMAIL);
  await page.getByLabel('Password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: /overview/i })).toBeVisible();
});
