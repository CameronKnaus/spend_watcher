// spec: specs/accounts.plan.md
// seed: e2e/tests/seed.spec.ts

import { test, expect } from '../../src/fixtures';

test.describe('Edit Account', () => {
  test('Edit account name, type, and growth rate — happy path', async ({ page }) => {
    // 1. Navigate to /savings and click the 'Test Checking' account row to open the manage panel.
    await page.goto('/savings');
    await page.getByText('Test Checking').click();

    await expect(page.getByRole('heading', { name: 'Manage Test Checking' })).toBeVisible();

    // 2. Click 'Edit account'.
    await page.getByRole('button', { name: 'Edit account' }).click();

    await expect(page.getByRole('heading', { name: 'Edit Test Checking' })).toBeVisible();
    await expect(page.locator('input[name="accountName"]')).toHaveValue('Test Checking');
    await expect(page.locator('input[name="accountCategory"]')).toHaveValue('Checking');
    await expect(page.getByRole('button', { name: 'Submit' })).toBeDisabled();

    // 3. Rename the account.
    await page.locator('input[name="accountName"]').fill('');
    await page.locator('input[name="accountName"]').fill('Primary Checking');
    await expect(page.locator('input[name="accountName"]')).toHaveValue('Primary Checking');
    // Now that the form is dirty and valid, Submit should be enabled.
    await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();

    // 4. Change the type to Savings (scoped to the dialog — 'Savings' also appears in
    //    Totals by type behind the panel).
    await page.locator('input[name="accountCategory"]').click();
    await page.getByRole('dialog').getByText('Savings', { exact: true }).click();
    await expect(page.locator('input[name="accountCategory"]')).toHaveValue('Savings');

    // 5. Change the growth rate to 5%.
    await page.locator('input[name="annualPercentageRate"]').click();
    await page.locator('input[name="annualPercentageRate"]').fill('5');
    await expect(page.locator('input[name="annualPercentageRate"]')).toHaveValue('5.00%');

    // 6. Submit.
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText('Primary Checking')).toBeVisible();
    await expect(page.getByText('Test Checking')).not.toBeVisible();

    // 7. Reopen the edit form: name, type, and rate must have round-tripped through the API.
    await page.getByText('Primary Checking').click();
    await expect(page.getByRole('heading', { name: 'Manage Primary Checking' })).toBeVisible();
    await page.getByRole('button', { name: 'Edit account' }).click();
    await expect(page.locator('input[name="accountName"]')).toHaveValue('Primary Checking');
    await expect(page.locator('input[name="accountCategory"]')).toHaveValue('Savings');
    await expect(page.locator('input[name="annualPercentageRate"]')).toHaveValue('5.00%');
  });
});
