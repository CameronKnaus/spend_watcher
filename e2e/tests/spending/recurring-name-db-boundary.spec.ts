// spec: specs/spending.plan.md
// seed: e2e/tests/seed.spec.ts
//
// The contract, ui, and DB (recurring_spending.spend_name varchar(30)) all agree on 30 as the max
// name length. This spec pins that shared boundary end-to-end; the reject-at-over-max half lives
// in the RecurringExpenseForm component tests.

import { test, expect } from '../../src/fixtures';

test.describe('Recurring Spending — DB Boundaries', () => {
  test('An expense name of exactly 30 characters (the real DB max) persists end-to-end', async ({ page }) => {
    await page.goto('/recurring_spending');
    await page.getByRole('button', { name: 'Create recurring expense' }).click();
    await expect(page.getByRole('heading', { name: 'New recurring expense', level: 2 })).toBeVisible();

    const maxLengthName = 'N'.repeat(30);
    await page.getByRole('textbox', { name: 'Rent payment' }).fill(maxLengthName);

    await page.getByRole('textbox', { name: '$0.00' }).click();
    await page.getByRole('textbox', { name: '$0.00' }).fill('50');
    await expect(page.getByRole('textbox', { name: '$0.00' })).toHaveValue('$50.00');

    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByRole('heading', { name: 'New recurring expense', level: 2 })).not.toBeVisible();

    // The card must render the name served back by the API — "the dialog closed" alone is exactly
    // the vacuous assertion that let the 60-vs-30 bug hide.
    await expect(page.getByText(maxLengthName)).toBeVisible();
  });
});
