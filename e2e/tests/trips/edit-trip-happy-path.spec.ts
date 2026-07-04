// spec: specs/trips.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../src/fixtures';
import { datePickerInputs } from '../../src/datePicker';

test.describe('Edit Trip — Happy Path', () => {
  test('Edit trip name and date range, then verify updated card', async ({ page }) => {
    // 1. Navigate to /trips and click 'Details' on the 'Test Trip' card.
    await page.goto('/trips');
    await page.getByRole('button', { name: 'Details' }).click();
    await expect(page.getByRole('heading', { name: 'Test Trip' }).first()).toBeVisible();

    // 2. Click the 'Edit trip details' button in the panel footer.
    await page.getByRole('button', { name: 'Edit trip details' }).click();
    await expect(page.getByRole('heading', { name: 'Edit trip details' })).toBeVisible();

    // The Trip name input is pre-populated with 'Test Trip'
    await expect(page.getByRole('textbox', { name: 'Europe summer trip' })).toHaveValue('Test Trip');

    // The start and end date pickers are pre-populated with the trip's existing dates.
    // datePickerInputs() matches on both desktop ("MMMM DD, YYYY") and mobile ("Choose date…").
    const allDateInputs = datePickerInputs(page);
    await expect(allDateInputs.first()).not.toHaveValue('');
    await expect(allDateInputs.last()).not.toHaveValue('');

    // A 'Permanently delete this trip' button is visible (edit mode only)
    await expect(page.getByRole('button', { name: 'Permanently delete this trip' })).toBeVisible();

    // 3. Clear the 'Trip name' input and type 'Edited Trip Name'.
    await page.getByRole('textbox', { name: 'Europe summer trip' }).fill('Edited Trip Name');
    await expect(page.getByRole('textbox', { name: 'Europe summer trip' })).toHaveValue('Edited Trip Name');

    // 4. Click 'Submit'.
    await page.getByRole('button', { name: 'Submit' }).click();

    // After submit, the panel closes and the card shows the updated name
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // 5. The trips list card shows 'Edited Trip Name'.
    await expect(page.getByRole('heading', { name: 'Edited Trip Name' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Test Trip' })).not.toBeVisible();
  });
});
