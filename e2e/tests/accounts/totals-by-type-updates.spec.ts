// spec: specs/accounts.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../src/fixtures';

test.describe('Net Worth Tile and Totals by Account Type', () => {
  test('Totals by Account Type updates after adding a new account type', async ({ page }) => {
    // 1. Navigate to /savings and observe the 'Totals by account type' module.
    await page.goto('/savings');

    await expect(page.getByText('Checking').first()).toBeVisible();
    // The Totals by Account Type module always shows all four types (even at $0.00).
    // Initially Investment shows $0.00.
    await expect(page.getByText('Investment').first()).toBeVisible();
    await expect(page.getByText('$0.00').first()).toBeVisible();

    // 2. Click 'Add account', enter name 'My IRA', select 'Investment', enter value '15000', and click 'Submit'.
    await page.getByRole('button', { name: 'Add account' }).click();
    await page.locator('input[name="accountName"]').fill('My IRA');
    await page.locator('input[name="accountCategory"]').click();
    // Scope to dialog to avoid strict-mode violation.
    await page.getByRole('dialog').getByText('Investment').click();
    await page.locator('input[name="startingAccountValue"]').click();
    await page.locator('input[name="startingAccountValue"]').fill('15000');
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByRole('dialog')).not.toBeVisible();

    // 3. Observe the 'Totals by account type' module.
    await expect(page.getByText('Investment').first()).toBeVisible();
    await expect(page.getByText('$15,000.00').first()).toBeVisible();
    await expect(page.getByText('$5,000.00').first()).toBeVisible();
  });
});
