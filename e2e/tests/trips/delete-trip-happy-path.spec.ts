// spec: specs/trips.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../src/fixtures';

test.describe('Delete Trip', () => {
  test('Delete a trip via the speed-bump confirmation and verify it is removed from the list', async ({ page }) => {
    // 1. Navigate to /trips and click 'Details' on 'Test Trip'.
    await page.goto('/trips');
    await page.getByRole('button', { name: 'Details' }).click();

    // 2. Click 'Edit trip details'.
    await page.getByRole('button', { name: 'Edit trip details' }).click();
    await expect(page.getByRole('button', { name: 'Permanently delete this trip' })).toBeVisible();

    // 3. Click the 'Permanently delete this trip' button.
    await page.getByRole('button', { name: 'Permanently delete this trip' }).click();

    // The speed-bump confirmation state is shown
    await expect(page.getByRole('heading', { name: 'Delete Test Trip' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Are you sure?' })).toBeVisible();
    await expect(page.getByText("This will permanently delete this trip")).toBeVisible();
    await expect(page.getByRole('button', { name: 'Confirm' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();

    // 4. Click the 'Confirm' button.
    await page.getByRole('button', { name: 'Confirm' }).click();

    // The panel closes and the Test Trip card is no longer present
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByRole('heading', { name: 'Test Trip' })).not.toBeVisible();
    await expect(page.getByRole('heading', { name: 'My trips' })).toBeVisible();

    // 5. Navigate away and back to /trips to confirm persistence.
    await page.goto('/dashboard');
    await page.goto('/trips');
    await expect(page.getByRole('heading', { name: 'Test Trip' })).not.toBeVisible();
  });
});
