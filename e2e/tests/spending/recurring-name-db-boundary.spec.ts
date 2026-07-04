// spec: specs/spending.plan.md
// seed: e2e/tests/seed.spec.ts
//
// KNOWN APP BUG (same shape as the tripName one): the contract allows recurringSpendName up to 60
// chars (contract/src/spending.contract.ts max(60)) but the DB column is varchar(30)
// (recurring_spending.spend_name). A 31-60 char name passes client AND contract validation, then
// the INSERT fails and the failure is swallowed (the mutation's onError is a TODO no-op) — the
// panel closes and the expense silently doesn't exist. This spec pins the real boundary (30) and
// should be extended to 60 once the schema or contract is fixed. The reject-at-over-max half lives
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
