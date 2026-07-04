// spec: specs/spending.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../src/fixtures';

test.describe('Recurring Spending — Edit and Delete', () => {
  test('Permanently delete a recurring expense with speed-bump confirmation', async ({ page }) => {
    // 1. Navigate to /recurring_spending and click the 'Internet' card
    await page.goto('/recurring_spending');
    await expect(page.getByRole('heading', { name: 'Recurring spending', level: 1 })).toBeVisible();
    await page.getByText('Internet').click();
    await expect(page.getByText('What would you like to do?')).toBeVisible();

    // 2. Click 'Permanently delete'
    await page.getByRole('button', { name: 'Permanently delete' }).click();
    // The panel transitions to a speed-bump showing 'Are you sure?'
    await expect(page.getByRole('heading', { name: 'Are you sure?', level: 3 })).toBeVisible();
    // Description mentions 'Internet'
    await expect(page.getByText(/Internet/).first()).toBeVisible();
    // Final warning
    await expect(page.getByText('This action cannot be undone.')).toBeVisible();
    // Delete and Cancel buttons
    await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();

    // 3. Click 'Delete' (the confirm/proceed button)
    await page.getByRole('button', { name: 'Delete' }).click();
    // The panel closes
    await expect(page.getByText('What would you like to do?')).not.toBeVisible();

    // 4. Inspect the 'Monthly transactions' list on the /recurring_spending page
    // The 'Internet' card is gone
    await expect(page.getByText('Internet')).not.toBeVisible();
  });
});
