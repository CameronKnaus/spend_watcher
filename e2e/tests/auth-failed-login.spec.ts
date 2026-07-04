import { expect, test } from '@playwright/test';
import { API_URL } from '../src/config';
import { registerUser } from '../src/seed';

// Exercises the real auth gate with a clean (signed-out) context, like auth.spec.ts.
//
// KNOWN UX GAP: LoginForm's mutation onError is a TODO no-op, so a rejected login shows the user
// NO feedback — the form just sits there. Until that's built, "stays on /auth, never redirects"
// is the strongest user-visible assertion available; extend this spec to assert the error message
// once one exists.

test('rejects a wrong password and keeps the visitor on /auth', async ({ page, playwright }) => {
  // Register a real user out-of-band so the username exists and only the password is wrong.
  const api = await playwright.request.newContext({ baseURL: API_URL });
  const user = await registerUser(api);
  await api.dispose();

  await page.goto('/auth');
  await page.getByPlaceholder('Username', { exact: true }).fill(user.username);
  await page.getByPlaceholder('Password', { exact: true }).fill(`${user.password}-wrong`);
  await page.getByRole('button', { name: 'Submit' }).click();

  // The server rejects the credentials: no redirect, still on the auth screen, and protected
  // routes still bounce back (no cookie was set).
  await expect(page).toHaveURL(/\/auth$/);
  await expect(page.getByText('Welcome to SpendWatcher')).toBeVisible();

  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/auth$/);
});
