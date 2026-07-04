// spec: specs/accounts.plan.md
// seed: e2e/tests/seed.spec.ts

import { test, expect } from '../../src/fixtures';

test.describe('Add Account — Happy Path', () => {
  test('Add a Checking account with all fields filled in', async ({ page }) => {
    // 1. Navigate to /savings and click the 'Add account' button.
    await page.goto('/savings');
    await page.getByRole('button', { name: 'Add account' }).click();

    await expect(page.getByRole('heading', { name: 'Add account' })).toBeVisible();
    await expect(page.locator('input[name="accountName"]')).toBeVisible();
    await expect(page.locator('input[name="accountCategory"]')).toBeVisible();
    await expect(page.locator('input[name="startingAccountValue"]')).toBeVisible();
    await expect(page.locator('input[name="annualPercentageRate"]')).toBeVisible();
    // The checkbox has no accessible name — locate by role within the dialog.
    await expect(page.getByRole('dialog').locator('input[type="checkbox"]')).toBeChecked();
    await expect(page.getByRole('button', { name: 'Submit' })).toBeDisabled();

    // 2. Type 'My Checking' into the 'Account name' field.
    await page.locator('input[name="accountName"]').fill('My Checking');
    await expect(page.locator('input[name="accountName"]')).toHaveValue('My Checking');

    // 3. Leave 'Account type' at its default of 'Checking'.
    await expect(page.locator('input[name="accountCategory"]')).toHaveValue('Checking');

    // 4. Click the 'Current account value' money input and type '2500'.
    await page.locator('input[name="startingAccountValue"]').click();
    await page.locator('input[name="startingAccountValue"]').fill('2500');
    await expect(page.locator('input[name="startingAccountValue"]')).toHaveValue('$2,500.00');

    // 5. Click the 'Annual growth rate' percentage input and type '3.5'.
    await page.locator('input[name="annualPercentageRate"]').click();
    await page.locator('input[name="annualPercentageRate"]').fill('3.5');
    await expect(page.locator('input[name="annualPercentageRate"]')).toHaveValue('3.50%');

    // 6. Verify the fixed-rate checkbox is checked, then click 'Submit'.
    await expect(page.getByRole('dialog').locator('input[type="checkbox"]')).toBeChecked();
    await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText('My Checking')).toBeVisible();
    await expect(page.getByText('$2,500.00')).toBeVisible();

    // 7. Reload — the row must come back from the database, not just the client cache.
    await page.reload();
    await expect(page.getByText('My Checking')).toBeVisible();
    await expect(page.getByText('$2,500.00')).toBeVisible();
  });

  // Consolidates the former add-account-savings/investing/bonds permutations: one non-default type
  // plus the only unique payload the trio had (isFixedRate=false with a growth rate) — and unlike the
  // originals, verifies those values actually persisted by reopening the edit form.
  test('Add an Investment account with a variable growth rate', async ({ page }) => {
    await page.goto('/savings');
    await page.getByRole('button', { name: 'Add account' }).click();

    await page.locator('input[name="accountName"]').fill('Brokerage');

    // Select a non-default type. Scope to the dialog to avoid strict-mode violation (type names
    // also appear in the Totals-by-type module behind the panel).
    await page.locator('input[name="accountCategory"]').click();
    await page.getByRole('dialog').getByText('Investment').click();
    await expect(page.locator('input[name="accountCategory"]')).toHaveValue('Investment');

    await page.locator('input[name="startingAccountValue"]').click();
    await page.locator('input[name="startingAccountValue"]').fill('50000');
    await expect(page.locator('input[name="startingAccountValue"]')).toHaveValue('$50,000.00');

    await page.locator('input[name="annualPercentageRate"]').click();
    await page.locator('input[name="annualPercentageRate"]').fill('7');
    await page.getByRole('dialog').locator('input[type="checkbox"]').uncheck();
    await expect(page.getByRole('dialog').locator('input[type="checkbox"]')).not.toBeChecked();

    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText('Brokerage')).toBeVisible();

    // Reopen the account's edit form: the APR and unchecked fixed-rate flag must round-trip
    // through the API — this is the assertion the deleted permutation specs never made.
    await page.getByText('Brokerage').click();
    await expect(page.getByRole('heading', { name: 'Manage Brokerage' })).toBeVisible();
    await page.getByRole('button', { name: 'Edit account' }).click();
    await expect(page.locator('input[name="accountCategory"]')).toHaveValue('Investment');
    await expect(page.locator('input[name="annualPercentageRate"]')).toHaveValue('7.00%');
    await expect(page.getByRole('dialog').locator('input[type="checkbox"]')).not.toBeChecked();
  });
});
