// spec: specs/trips.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../src/fixtures';

test.describe('Linking an Expense to a Trip', () => {
  test('Log a new expense linked to Test Trip and verify it appears in trip details', async ({ page }) => {
    // 1. Navigate to /dashboard.
    await page.goto('/dashboard');
    await expect(page.getByRole('button', { name: 'Log expense' })).toBeVisible();

    // 2. Click the 'Log expense' button.
    await page.getByRole('button', { name: 'Log expense' }).click();
    await expect(page.getByRole('heading', { name: 'New expense', level: 2 })).toBeVisible();

    // The 'Linked Trip' field shows the default placeholder (no active trip, so not auto-selected)
    await expect(page.getByRole('combobox', { name: '--' })).toHaveValue('');

    // 3. Enter '50' in the Amount field.
    await page.getByRole('textbox', { name: '$' }).click();
    await page.getByRole('textbox', { name: '$' }).fill('50');
    await expect(page.getByRole('textbox', { name: '$' })).toHaveValue('$50.00');

    // 4. Leave Category as 'Other' (default).
    // 5. Type 'Souvenir' in the Notes field.
    await page.getByRole('textbox', { name: 'About your expense' }).fill('Souvenir');

    // 6. Leave the Date of Expense as today's date.
    // 7. Click the 'Linked Trip' filterable-select dropdown and select 'Test Trip'.
    await page.getByRole('combobox', { name: '--' }).click();
    await page.getByText('Test Trip').click();
    await expect(page.getByRole('combobox', { name: '--' })).toHaveValue('Test Trip');

    // 8. Click 'Submit'.
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByRole('heading', { name: 'New expense', level: 2 })).not.toBeVisible();

    // 9. Navigate to /trips.
    await page.goto('/trips');

    // 11. Verify the cost totals on the 'Test Trip' card have updated.
    await expect(page.getByText('-$50.00').first()).toBeVisible();

    // 10. Click 'Details' on the 'Test Trip' card.
    await page.getByRole('button', { name: 'Details' }).click();
    await expect(page.getByRole('heading', { name: 'Test Trip' }).first()).toBeVisible();

    // The 'Linked transactions' section shows one transaction row for the Souvenir expense
    await expect(page.getByRole('button', { name: /Other -\$50\.00.*Souvenir/ })).toBeVisible();

    // The empty-state alert is no longer shown
    await expect(page.getByRole('heading', { name: 'This trip has no linked' })).not.toBeVisible();

    // Close panel and verify the card totals
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByText('-$50.00').first()).toBeVisible();
  });
});
