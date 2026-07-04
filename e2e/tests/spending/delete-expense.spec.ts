// spec: specs/spending.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../src/fixtures';

test.describe('Edit and Delete Discretionary Transactions', () => {
  test('Delete a discretionary transaction via the edit panel', async ({ page }) => {
    // 1. Navigate to /dashboard and click the 'Weekly groceries' transaction row
    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'Groceries -$86.00 Weekly groceries' }).click();
    await expect(page.getByRole('heading', { name: 'Edit expense', level: 2 })).toBeVisible();
    // Pre-populated: Amount $86.00, Category 'Groceries', Note 'Weekly groceries'
    await expect(page.getByRole('textbox', { name: '$' })).toHaveValue('$86.00');
    await expect(page.locator('input[name="category"]')).toHaveValue('Groceries');
    await expect(page.getByRole('textbox', { name: 'About your expense' })).toHaveValue('Weekly groceries');

    // 2. Click 'Permanently delete this expense'
    await page.getByRole('button', { name: 'Permanently delete this expense' }).click();
    // The panel closes immediately
    await expect(page.getByRole('heading', { name: 'Edit expense', level: 2 })).not.toBeVisible();

    // 3. Inspect 'Recent transactions'
    // 'Weekly groceries' row is no longer present
    await expect(page.getByRole('button', { name: 'Groceries -$86.00 Weekly groceries' })).not.toBeVisible();
    // 'Lunch' and 'Streaming' remain
    await expect(page.getByRole('button', { name: 'Dining out -$25.00 Lunch' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Entertainment -$15.00 Streaming' })).toBeVisible();

    // 4. Inspect 'Discretionary total' tile
    // $25 + $15 = $40; 'Discretionary total' should show -$40.00
    await expect(page.getByText('-$40.00').first()).toBeVisible();
  });
});
