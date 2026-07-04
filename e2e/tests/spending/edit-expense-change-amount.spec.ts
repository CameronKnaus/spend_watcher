// spec: specs/spending.plan.md
// seed: e2e/tests/seed.spec.ts

import { test, expect } from '../../src/fixtures';

test.describe('Edit and Delete Discretionary Transactions', () => {
  test('Open edit panel from Recent Transactions and change amount and category', async ({ page }) => {
    // 1. Navigate to /dashboard
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'Recent transactions', level: 3 })).toBeVisible();

    // 2. Click the 'Lunch' transaction row in the Recent Transactions list
    await page.getByRole('button', { name: 'Dining out -$25.00 Lunch' }).click();
    await expect(page.getByRole('heading', { name: 'Edit expense', level: 2 })).toBeVisible();
    // Pre-populated with: Amount = $25.00, Category = 'Dining out', Note = 'Lunch' — this proves
    // the read-by-id path, not just the list render.
    await expect(page.getByRole('textbox', { name: '$' })).toHaveValue('$25.00');
    await expect(page.locator('input[name="category"]')).toHaveValue('Dining out');
    await expect(page.getByRole('textbox', { name: 'About your expense' })).toHaveValue('Lunch');

    // 3. Clear the Amount field and type 35
    await page.getByRole('textbox', { name: '$' }).click();
    await page.getByRole('textbox', { name: '$' }).fill('35');
    await expect(page.getByRole('textbox', { name: '$' })).toHaveValue('$35.00');

    // 4. Change the category to 'Fitness' via the filterable select
    await page.locator('input[name="category"]').click();
    await page.locator('input[name="category"]').fill('Fitness');
    await page.getByText('Fitness').first().click();
    await expect(page.locator('input[name="category"]')).toHaveValue('Fitness');

    // 5. Click 'Submit'
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByRole('heading', { name: 'Edit expense', level: 2 })).not.toBeVisible();

    // 6. Server-side recalculation: discretionary $86 + $35 + $15 = -$136.00
    await expect(page.getByText('-$136.00').first()).toBeVisible();
    // The row re-renders with the new category and amount
    await expect(page.getByRole('button', { name: /Fitness.*-\$35\.00.*Lunch/ }).first()).toBeVisible();
    // The category aggregation moved: 'Dining out' no longer appears in Top discretionary categories
    await expect(page.getByRole('button', { name: /Dining out.*-\$25\.00/ })).not.toBeVisible();
    await expect(page.getByRole('button', { name: /Fitness.*-\$35\.00.*\(/ }).first()).toBeVisible();
  });
});
