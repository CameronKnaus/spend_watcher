import { test } from '@playwright/test';
import { API_URL } from '../src/config';
import { registerUser, seedBaselineData } from '../src/seed';

// Seed used by the Playwright planner/generator agents (planner_setup_page / generator_setup_page).
// It registers a fresh user, seeds a representative slice of data through the real api, drops the auth
// cookie into the browser context, and lands on the dashboard — so the agents explore a populated,
// signed-in app instead of bouncing to /auth. Mirrors the `testUser` fixture in src/fixtures.ts.
test('seed', async ({ page, playwright }) => {
  const api = await playwright.request.newContext({ baseURL: API_URL });
  await registerUser(api);
  await seedBaselineData(api);

  const { cookies } = await api.storageState();
  await page.context().addCookies(cookies);
  await api.dispose();

  await page.goto('/dashboard');
  await page.getByRole('heading', { level: 1 }).waitFor();
});
