// spec: specs/accounts.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../src/fixtures';

test.describe('Delete Account', () => {
  test('Delete account — full confirmation flow', async ({ page }) => {
    // 1. Navigate to /savings and click the 'Test Checking' row.
    await page.goto('/savings');
    await page.getByText('Test Checking').click();

    await expect(page.getByRole('heading', { name: 'Manage Test Checking' })).toBeVisible();

    // 2. Click 'Delete account'.
    await page.getByRole('button', { name: 'Delete account' }).click();

    await expect(page.getByRole('heading', { name: 'Delete account' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Permanently delete "Test Checking"', level: 3 })).toBeVisible();
    await expect(page.getByText('This will permanently delete this account and all of its data')).toBeVisible();
    await expect(page.getByText('This action cannot be undone.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete account' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();

    // 3. Click 'Delete account' (the proceed button).
    await page.getByRole('button', { name: 'Delete account' }).click();

    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText('Test Checking')).not.toBeVisible();

    // The accounts-need-update banner is no longer shown on the Dashboard.
    await page.goto('/dashboard');
    await expect(page.getByText('1 account(s) require updates for this month')).not.toBeVisible();
  });
});
