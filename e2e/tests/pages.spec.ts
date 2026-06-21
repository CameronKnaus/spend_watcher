import { expect, test } from '../src/fixtures';

// Smoke check: for a signed-in user, each protected route renders its own page (an <h1> page title +
// the navigation) instead of bouncing to /auth or crashing. `test` here is the pre-authenticated,
// seeded fixture, and it runs for both the desktop and mobile projects.
const protectedRoutes = ['/dashboard', '/savings', '/trends', '/recurring_spending', '/trips'];

for (const route of protectedRoutes) {
  test(`renders ${route} for an authenticated user`, async ({ page }) => {
    await page.goto(route);

    await expect(page).toHaveURL(new RegExp(`${route}$`));
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('navigation').first()).toBeVisible();
  });
}
