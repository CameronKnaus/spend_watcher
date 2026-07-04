// spec: specs/spending.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../src/fixtures';

test.describe('Recurring Spending — Toggle Active/Inactive', () => {
  test('Reactivate an inactive recurring expense', async ({ page }) => {
    // 1. Navigate to /recurring_spending and mark 'Internet' as inactive first
    await page.goto('/recurring_spending');
    await expect(page.getByRole('heading', { name: 'Recurring spending', level: 1 })).toBeVisible();
    await page.getByText('Internet').click();
    await expect(page.getByText('What would you like to do?')).toBeVisible();
    await page.getByRole('button', { name: 'Mark as inactive' }).click();
    await expect(page.getByRole('heading', { name: 'Deactivate this recurring spend', level: 3 })).toBeVisible();
    await page.getByRole('button', { name: 'Confirm' }).click();
    // 'Internet' is now in the 'Inactive transactions' section
    await expect(page.getByRole('heading', { name: 'Inactive transactions', level: 2 })).toBeVisible();
    await expect(page.getByText('Internet')).toBeVisible();

    // 2. Click the 'Internet' card in the 'Inactive transactions' section
    await page.getByText('Internet').click();
    // Manage panel opens with option 'Reactive this expense'
    await expect(page.getByText('What would you like to do?')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reactive this expense' })).toBeVisible();

    // 3. Click 'Reactive this expense'
    await page.getByRole('button', { name: 'Reactive this expense' }).click();
    // A speed-bump appears with title 'Reactivate this recurring spend'
    await expect(page.getByRole('heading', { name: 'Reactivate this recurring spend', level: 3 })).toBeVisible();

    // 4. Click 'Confirm'
    await page.getByRole('button', { name: 'Confirm' }).click();
    // The panel closes
    await expect(page.getByText('What would you like to do?')).not.toBeVisible();

    // 5. Inspect the page
    // 'Internet' moves back to 'Monthly transactions' section
    await expect(page.getByRole('heading', { name: 'Monthly transactions', level: 2 })).toBeVisible();
    await expect(page.getByText('Internet')).toBeVisible();
    // The 'Inactive transactions' section either disappears or is empty
    await expect(page.getByRole('heading', { name: 'Inactive transactions', level: 2 })).not.toBeVisible();
  });
});
