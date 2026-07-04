// spec: specs/spending.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../src/fixtures';

test.describe('Recurring Spending — Edit and Delete', () => {
  test('Edit a recurring expense name and category', async ({ page }) => {
    // 1. Navigate to /recurring_spending
    await page.goto('/recurring_spending');
    await expect(page.getByRole('heading', { name: 'Recurring spending', level: 1 })).toBeVisible();
    await expect(page.getByText('Internet')).toBeVisible();

    // 2. Click the 'Internet' card
    await page.getByText('Internet').click();
    // The manage panel opens showing 'What would you like to do?'
    await expect(page.getByText('What would you like to do?')).toBeVisible();

    // 3. Click 'Edit'
    await page.getByRole('button', { name: 'Edit' }).click();
    // The panel transitions to the Edit view
    await expect(page.getByRole('textbox', { name: 'Rent payment' })).toHaveValue('Internet');
    await expect(page.locator('input[name="category"]')).toHaveValue('Utilities');
    await expect(page.getByRole('textbox', { name: '$0.00' })).toHaveValue('$60.00');

    // 4. Clear the Expense name and type 'Home Internet'
    await page.getByRole('textbox', { name: 'Rent payment' }).fill('Home Internet');
    await expect(page.getByRole('textbox', { name: 'Rent payment' })).toHaveValue('Home Internet');

    // 5. Open the Category select and choose 'Housing'
    await page.locator('input[name="category"]').click();
    await page.locator('input[name="category"]').fill('Housing');
    await page.getByText('Housing').first().click();
    await expect(page.locator('input[name="category"]')).toHaveValue('Housing');

    // 6. Click 'Submit'
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByText('What would you like to do?')).not.toBeVisible();

    // 7. Inspect the 'Monthly transactions' list
    // The card now shows 'Home Internet' with Housing category instead of 'Internet' / Utilities
    await expect(page.getByText('Home Internet')).toBeVisible();
    // exact match: the new name "Home Internet" contains "Internet", so a substring match would
    // still resolve — the standalone "Internet" card label is what should be gone.
    await expect(page.getByText('Internet', { exact: true })).not.toBeVisible();
  });
});
