// spec: specs/spending.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../src/fixtures';
import { datePickerInputs } from '../../src/datePicker';

test.describe('Dashboard Spending Widgets', () => {
  test('Summary totals update after logging a new discretionary expense', async ({ page }) => {
    // 1. Navigate to /dashboard and note the current 'Total spent' and 'Discretionary total' amounts
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // Recurring backfill means Total spent = -$186, Discretionary total = -$126
    // Use getByText instead of getByRole('heading') because the mobile layout renders these
    // as plain <div> elements (not headings) while the desktop layout uses <h3> via ModuleContainer.
    await expect(page.getByText('Total spent', { exact: true })).toBeVisible();
    await expect(page.getByText('Discretionary total', { exact: true })).toBeVisible();

    // 2. Click the 'Log expense' button on the dashboard
    await page.getByRole('button', { name: 'Log expense' }).click();
    await expect(page.getByRole('heading', { name: 'New expense', level: 2 })).toBeVisible();

    // 3. Enter 50 into the Amount field
    await page.getByRole('textbox', { name: '$' }).click();
    await page.getByRole('textbox', { name: '$' }).fill('50');
    await expect(page.getByRole('textbox', { name: '$' })).toHaveValue('$50.00');

    // 4. Select 'Fitness' from the Category filterable select
    await page.locator('input[name="category"]').click();
    await page.locator('input[name="category"]').fill('Fitness');
    await page.getByText('Fitness').first().click();
    await expect(page.locator('input[name="category"]')).toHaveValue('Fitness');

    // 5. The Date of Expense picker defaults to today. Use the cross-platform locator — the
    // desktop input's accessible name is the format mask, the mobile one is "Choose date…".
    await expect(datePickerInputs(page).first()).not.toHaveValue('');

    // 6. Click the 'Submit' button
    await page.getByRole('button', { name: 'Submit' }).click();
    // Panel closes
    await expect(page.getByRole('heading', { name: 'New expense', level: 2 })).not.toBeVisible();

    // 7. Wait for the dashboard to re-render and inspect the 'Total spent' and 'Discretionary total' tiles
    // New total: discretionary was -$126 + $50 = -$176; recurring -$60 stays; total = -$236
    await expect(page.getByText('-$176.00').first()).toBeVisible();

    // 8. Check that the new transaction appears in the 'Recent transactions' list
    await expect(page.getByRole('button', { name: /Fitness.*-\$50\.00/ }).first()).toBeVisible();
  });
});
