// spec: specs/spending.plan.md
// seed: e2e/tests/seed.spec.ts
//
// Consolidated create journeys: fixed and variable are the same POST with the isVariableRecurring
// flag flipped, so they live in one file (formerly recurring-create-fixed + recurring-create-variable).

import { test, expect } from '../../src/fixtures';

test.describe('Recurring Spending Page — Create Recurring Expense', () => {
  test('Create a new fixed recurring expense with all required fields', async ({ page }) => {
    // 1. Navigate to /recurring_spending
    await page.goto('/recurring_spending');
    await expect(page.getByRole('heading', { name: 'Recurring spending', level: 1 })).toBeVisible();
    // The 'Internet' expense card is shown under 'Monthly transactions'
    await expect(page.getByText('Internet')).toBeVisible();

    // 2. Click 'Create recurring expense'
    await page.getByRole('button', { name: 'Create recurring expense' }).click();
    await expect(page.getByRole('heading', { name: 'New recurring expense', level: 2 })).toBeVisible();
    // Category defaults to 'Other', 'This amount varies' unchecked, Monthly amount empty
    await expect(page.locator('input[name="category"]')).toHaveValue('Other');
    await expect(page.getByRole('checkbox')).not.toBeChecked();

    // 3. Type 'Netflix' in the Expense name field
    await page.getByLabel('Expense name').fill('Netflix');
    await expect(page.getByLabel('Expense name')).toHaveValue('Netflix');

    // 4. Open the Category select and choose 'Entertainment'
    await page.locator('input[name="category"]').click();
    await page.locator('input[name="category"]').fill('Entertainment');
    await page.getByText('Entertainment').first().click();
    await expect(page.locator('input[name="category"]')).toHaveValue('Entertainment');

    // 5. Leave the 'This amount varies' checkbox unchecked
    await expect(page.getByRole('checkbox')).not.toBeChecked();
    // Label reads 'Monthly amount'
    await expect(page.getByText('Monthly amount')).toBeVisible();

    // 6. Enter 18 in the Monthly amount field
    await page.getByLabel('Monthly amount').click();
    await page.getByLabel('Monthly amount').fill('18');
    await expect(page.getByLabel('Monthly amount')).toHaveValue('$18.00');

    // 7. Click 'Submit'
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByRole('heading', { name: 'New recurring expense', level: 2 })).not.toBeVisible();

    // 8. Inspect the 'Monthly transactions' list on the page
    // A new 'Netflix' card appears with 'Entertainment' category icon and 'Fixed' label
    await expect(page.getByText('Netflix')).toBeVisible();
    // (No "Update required" assertion: a FIXED recurring expense is auto-backfilled for the current
    // month on the next read, so it does not show an update-required state.)
    await expect(page.getByText('Fixed').first()).toBeVisible();
  });

  test('Create a new variable recurring expense', async ({ page }) => {
    // 1. Navigate to /recurring_spending and click 'Create recurring expense'
    await page.goto('/recurring_spending');
    await expect(page.getByRole('heading', { name: 'Recurring spending', level: 1 })).toBeVisible();
    await page.getByRole('button', { name: 'Create recurring expense' }).click();
    await expect(page.getByRole('heading', { name: 'New recurring expense', level: 2 })).toBeVisible();

    // 2. Enter 'Electric bill' in the Expense name field
    await page.getByLabel('Expense name').fill('Electric bill');
    await expect(page.getByLabel('Expense name')).toHaveValue('Electric bill');

    // 3. Select 'Utilities' from the Category select
    await page.locator('input[name="category"]').click();
    await page.locator('input[name="category"]').fill('Utilities');
    await page.getByRole('dialog').getByText('Utilities').click();
    await expect(page.locator('input[name="category"]')).toHaveValue('Utilities');

    // 4. Check the 'This amount varies' checkbox
    await page.getByRole('checkbox').click();
    await expect(page.getByRole('checkbox')).toBeChecked();
    // The monthly amount label changes to 'Estimated monthly amount'
    await expect(page.getByText('Estimated monthly amount')).toBeVisible();

    // 5. Enter 80 in the Estimated monthly amount field
    await page.getByLabel('Estimated monthly amount').click();
    await page.getByLabel('Estimated monthly amount').fill('80');
    await expect(page.getByLabel('Estimated monthly amount')).toHaveValue('$80.00');

    // 6. Click 'Submit'
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByRole('heading', { name: 'New recurring expense', level: 2 })).not.toBeVisible();

    // 7. Inspect the new 'Electric bill' card
    // The card shows 'Utilities' category and 'Estimated: -$80.00' label (not 'Fixed').
    // Note: creating a new recurring expense auto-creates the current month's transaction,
    // so 'Update required' does NOT appear immediately after creation.
    await expect(page.getByText('Electric bill')).toBeVisible();
    await expect(page.getByText(/Estimated:.*\$80\.00/)).toBeVisible();
  });
});
