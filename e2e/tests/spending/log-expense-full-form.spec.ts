// spec: specs/spending.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../src/fixtures';
import { subDays } from 'date-fns';
import { datePickerInputs, selectDate } from '../../src/datePicker';

test.describe('Log Discretionary Spend — Happy Path', () => {
  test('Log a new expense with all optional fields filled', async ({ page }) => {
    // 1. Navigate to /dashboard
    await page.goto('/dashboard');
    await expect(page.getByRole('button', { name: 'Log expense' })).toBeVisible();

    // 2. Click 'Log expense'
    await page.getByRole('button', { name: 'Log expense' }).click();
    await expect(page.getByRole('heading', { name: 'New expense', level: 2 })).toBeVisible();
    // Category field defaults to 'Other'
    await expect(page.locator('input[name="category"]')).toHaveValue('Other');

    // 3. Click into the Amount field and type 42
    await page.getByRole('textbox', { name: '$' }).click();
    await page.getByRole('textbox', { name: '$' }).fill('42');
    await expect(page.getByRole('textbox', { name: '$' })).toHaveValue('$42.00');

    // 4. Click the Category filterable select and type 'Gro' into the filter input
    await page.locator('input[name="category"]').click();
    await page.locator('input[name="category"]').fill('Gro');
    // The option list filters to show 'Groceries'. Scope to the dialog so we target the dropdown
    // option inside the panel (above the modal scrim) and not a 'Groceries' label in the dashboard
    // behind the modal, which the backdrop intercepts.
    await expect(page.getByRole('dialog').getByText('Groceries')).toBeVisible();

    // 5. Select 'Groceries' from the filtered list
    await page.getByRole('dialog').getByText('Groceries').click();
    await expect(page.locator('input[name="category"]')).toHaveValue('Groceries');

    // 6. Click the Notes field and type 'Trader Joes run'
    await page.getByRole('textbox', { name: 'About your expense' }).fill('Trader Joes run');
    await expect(page.getByRole('textbox', { name: 'About your expense' })).toHaveValue('Trader Joes run');

    // 7. Click the Date of Expense date picker and select a date from 2 days ago.
    // Uses the cross-platform helper so it works on both desktop (fill) and mobile (dialog).
    const twoDaysAgo = subDays(new Date(), 2);
    const dateInput = datePickerInputs(page).first();
    await selectDate(page, dateInput, twoDaysAgo);
    await expect(dateInput).not.toHaveValue('');

    // 8. Open the 'Linked Trip' select and choose 'Test Trip'
    await page.locator('input[name="linkedTripId"]').click();
    await page.getByRole('dialog').getByText('Test Trip').click();
    await expect(page.locator('input[name="linkedTripId"]')).toHaveValue('Test Trip');

    // 9. Click 'Submit'
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByRole('heading', { name: 'New expense', level: 2 })).not.toBeVisible();

    // 10. Check the 'Recent transactions' list on the dashboard
    await expect(page.getByRole('button', { name: /Groceries.*-\$42\.00/ }).first()).toBeVisible();
    await expect(page.getByText('Trader Joes run')).toBeVisible();
  });
});
