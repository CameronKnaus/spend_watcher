import { expect, test } from '@playwright/test';
import { API_URL } from '../src/config';
import { registerUser } from '../src/seed';

// These exercise the real auth gate, so they use a clean (signed-out) context — the plain `test` from
// '@playwright/test', not the pre-authenticated one in ../src/fixtures.

test('redirects an unauthenticated visitor to /auth', async ({ page }) => {
  await page.goto('/dashboard');

  await expect(page).toHaveURL(/\/auth$/);
  await expect(page.getByText('Welcome to SpendWatcher')).toBeVisible();
});

test('lets a registered user sign in through the login form', async ({ page, playwright }) => {
  // Create the account out-of-band so we have known credentials, but deliberately do NOT load its
  // cookie into the browser — the point of this test is to drive the actual form.
  const api = await playwright.request.newContext({ baseURL: API_URL });
  const user = await registerUser(api);
  await api.dispose();

  await page.goto('/auth');
  await page.getByPlaceholder('Username', { exact: true }).fill(user.username);
  await page.getByPlaceholder('Password', { exact: true }).fill(user.password);
  // Click "Submit" specifically — both form buttons default to type=submit, so pressing Enter would
  // activate the first one (the "Register" toggle) instead. The native form submit drives validation.
  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
