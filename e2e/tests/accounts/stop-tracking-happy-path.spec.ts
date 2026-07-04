// spec: specs/accounts.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../src/fixtures';

test.describe('Stop Tracking (Set Inactive)', () => {
  test('Stop tracking an account — happy path', async ({ page }) => {
    // 1. Navigate to /savings and click the 'Test Checking' row to open the manage panel.
    await page.goto('/savings');
    await page.getByText('Test Checking').click();

    await expect(page.getByRole('heading', { name: 'Manage Test Checking' })).toBeVisible();

    // 2. Click 'Stop tracking this account'.
    await page.getByRole('button', { name: 'Stop tracking this account' }).click();

    await expect(page.getByRole('heading', { name: 'Stop tracking this account' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Stop tracking "Test Checking"', level: 3 })).toBeVisible();
    await expect(page.getByText('This will not delete the account or its data')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Stop tracking' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();

    // 3. Click 'Stop tracking'.
    await page.getByRole('button', { name: 'Stop tracking' }).click();

    await expect(page.getByRole('dialog')).not.toBeVisible();
    // "Stop tracking" sets the account inactive — it is NOT deleted, so the row remains in the list.
    await expect(page.getByRole('button', { name: /Test Checking/ })).toBeVisible();

    // Reload: the not-deleted state must come back from the database, not the client cache.
    // (The UI renders no distinct "inactive" marker today, so the row surviving a reload is the
    // strongest persistence assertion available — the aggregate effects of inactive accounts are a
    // known coverage gap tracked in test-strategy.md.)
    await page.reload();
    await expect(page.getByRole('button', { name: /Test Checking/ })).toBeVisible();
  });
});
