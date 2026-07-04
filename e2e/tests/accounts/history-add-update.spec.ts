// spec: specs/accounts.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../src/fixtures';
import { format } from 'date-fns';

test.describe('Account Update History', () => {
  test('Update the current month value in history', async ({ page }) => {
    const currentMonthLabel = format(new Date(), 'MMMM yyyy');

    // 1. Navigate to /savings, click 'Test Checking', then click 'History'.
    await page.goto('/savings');
    await page.getByText('Test Checking').click();
    await page.getByRole('button', { name: 'History' }).click();

    // The seeded account already has a value for the current month ($5,000.00 from initial seed).
    // Current month row is in edit mode — no "Add for [month]" button.
    await expect(page.getByRole('dialog').getByText(currentMonthLabel)).toBeVisible();
    await expect(page.locator('input[name="amount"]')).toHaveValue('$5,000.00');
    await expect(page.getByRole('button', { name: 'Confirm change' })).not.toBeVisible();

    // 2. Update the amount to '5250'.
    await page.locator('input[name="amount"]').fill('5250');
    await expect(page.locator('input[name="amount"]')).toHaveValue('$5,250.00');
    await expect(page.getByRole('button', { name: 'Confirm change' })).toBeVisible();

    // 3. Click 'Confirm change'.
    await page.getByRole('button', { name: 'Confirm change' }).click();

    // The row stays in edit state, showing '$5,250.00' as the confirmed value.
    await expect(page.locator('input[name="amount"]')).toHaveValue('$5,250.00');
    await expect(page.getByRole('button', { name: 'Confirm change' })).not.toBeVisible();

    // The 'Your accounts' list now shows the updated value for 'Test Checking'.
    await page.getByRole('button', { name: 'Back' }).click();
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('button', { name: /Test Checking.*\$5,250\.00/ })).toBeVisible();

    // The current-month update banner is not shown on the Dashboard (account is up to date).
    await page.goto('/dashboard');
    await expect(page.getByText('1 account(s) require updates for this month')).not.toBeVisible();
  });
});
