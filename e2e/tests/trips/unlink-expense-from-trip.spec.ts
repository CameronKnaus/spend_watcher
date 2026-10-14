// spec: specs/trips.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../src/fixtures';

test.describe('Linking an Expense to a Trip', () => {
  test('Editing a linked expense to remove the trip link updates trip card totals', async ({ page }) => {
    // 1. Navigate to /dashboard and log an expense linked to Test Trip.
    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'Log expense' }).click();
    await expect(page.getByRole('heading', { name: 'New expense', level: 2 })).toBeVisible();

    await page.getByRole('textbox', { name: '$' }).click();
    await page.getByRole('textbox', { name: '$' }).fill('50');
    await expect(page.getByRole('textbox', { name: '$' })).toHaveValue('$50.00');

    await page.getByRole('textbox', { name: 'About your expense' }).fill('Souvenir');

    await page.getByRole('combobox', { name: '--' }).click();
    await page.getByRole('dialog').getByText('Test Trip').click();
    await expect(page.getByRole('combobox', { name: '--' })).toHaveValue('Test Trip');

    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByRole('heading', { name: 'New expense', level: 2 })).not.toBeVisible();

    // 2. Navigate to /trips and verify the trip card shows -$50.00.
    await page.goto('/trips');
    const discretionaryTile = page.locator('text=Discretionary').locator('..').locator('..');
    await expect(discretionaryTile).toContainText('-$50.00');

    // 3. Click 'Details' to open the Test Trip details panel.
    await page.getByRole('button', { name: 'Details' }).click();
    await expect(page.getByRole('heading', { name: 'Test Trip' }).first()).toBeVisible();

    // The Souvenir transaction row is visible in linked transactions.
    const transactionRow = page.getByRole('button', { name: /Other -\$50\.00.*Souvenir/ });
    await expect(transactionRow).toBeVisible();

    // 4. Click the transaction row to open the edit expense panel.
    await transactionRow.click();
    await expect(page.locator('input[name="linkedTripId"]')).toHaveValue('Test Trip');

    // 5. Click the Linked Trip textbox to open the dropdown.
    await page.locator('input[name="linkedTripId"]').click();

    // 6. Click 'Clear selection' to remove the trip link. 'Clear selection' only exists in the open
    // dropdown, so an exact text match targets it unambiguously.
    await page.getByText('Clear selection', { exact: true }).click();
    await expect(page.locator('input[name="linkedTripId"]')).toHaveValue('');

    // 7. Submit the edit.
    await page.getByRole('button', { name: 'Submit' }).click();

    // 8. Verify the trip card totals all reset to $0.00.
    const airfareTile = page.locator('text=Airfare').locator('..').locator('..');
    await expect(airfareTile).toContainText('$0.00');
    await expect(discretionaryTile).toContainText('$0.00');
    const totalTile = page.locator('text=Total').locator('..').locator('..');
    await expect(totalTile).toContainText('$0.00');

    // 9. Click 'Details' again to verify the linked transactions section is empty.
    await page.getByRole('button', { name: 'Details' }).click();
    await expect(page.getByText('This trip has no linked transactions yet')).toBeVisible();
    await expect(transactionRow).not.toBeVisible();
  });
});
