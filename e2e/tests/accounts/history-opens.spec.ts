// spec: specs/accounts.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../src/fixtures';
import { format, subMonths } from 'date-fns';

test.describe('Account Update History', () => {
  test('Open account history — shows current month in edit mode (seeded account already has value)', async ({
    page,
  }) => {
    const currentMonthLabel = format(new Date(), 'MMMM yyyy');
    const prevMonthLabel = format(subMonths(new Date(), 1), 'MMMM yyyy');

    // 1. Navigate to /savings and click the 'Test Checking' row.
    await page.goto('/savings');
    await page.getByText('Test Checking').click();

    await expect(page.getByRole('heading', { name: 'Manage Test Checking' })).toBeVisible();

    // 2. Click 'History'.
    await page.getByRole('button', { name: 'History' }).click();

    await expect(page.getByRole('heading', { name: '"Test Checking" history' })).toBeVisible();
    await expect(page.getByRole('dialog').getByText(currentMonthLabel)).toBeVisible();
    // The seeded account was created this month, so the current month already has a value —
    // it shows as an editable input ($5,000.00), not an "Add for …" button.
    await expect(page.locator('input[name="amount"]')).toHaveValue('$5,000.00');
    // The previous month shows an "Add for …" button.
    await expect(page.getByRole('button', { name: `Add for ${prevMonthLabel}` })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();

    // 3. Click 'Back'.
    await page.getByRole('button', { name: 'Back' }).click();

    await expect(page.getByRole('button', { name: 'Edit account' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'History' })).toBeVisible();
  });
});
