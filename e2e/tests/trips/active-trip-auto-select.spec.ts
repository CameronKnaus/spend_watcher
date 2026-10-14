// spec: specs/trips.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../src/fixtures';
import { datePickerInputs, selectDate } from '../../src/datePicker';
import { addDays } from 'date-fns';

test.describe('Active Trip Auto-Selection', () => {
  test('Creating a trip spanning today causes the Log Expense form to auto-select it', async ({ page }) => {
    // 1. Navigate to /trips and click 'Add trip'.
    await page.goto('/trips');
    await page.getByRole('button', { name: 'Add trip' }).click();
    await expect(page.getByRole('heading', { name: 'New trip', level: 2 })).toBeVisible();

    // 2. Type the trip name.
    await page.getByRole('textbox', { name: 'Europe summer trip' }).fill('Active Trip');
    await expect(page.getByRole('textbox', { name: 'Europe summer trip' })).toHaveValue('Active Trip');

    // 3. Leave 'Start date' as today (the form defaults to today).
    // 4. Set the 'End date' picker to tomorrow so the trip spans today and is active.
    // NOTE: The active-trip notice only fires when endDate is strictly in the future (> today).
    // A same-day trip (startDate = endDate = today) does NOT trigger the notice.
    const tomorrow = addDays(new Date(), 1);
    const allDateInputs = datePickerInputs(page);
    // On mobile: tap the end-date input to open the dialog, navigate if needed (tomorrow
    // is still the same month as today so no navigation is required), select the day, OK.
    // On desktop: fill directly.
    await selectDate(page, allDateInputs.last(), tomorrow);
    await expect(allDateInputs.last()).not.toHaveValue('');

    // 5. Click 'Submit'.
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByRole('heading', { name: 'Active Trip', level: 2 })).toBeVisible();

    // 6. Navigate to /dashboard and click 'Log expense'.
    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'Log expense' }).click();
    await expect(page.getByRole('heading', { name: 'New expense', level: 2 })).toBeVisible();

    // 7. Verify the active-trip info notice is visible naming the active trip.
    await expect(
      page.getByRole('heading', { name: /Your current trip, "Active Trip", has already been applied/ }),
    ).toBeVisible();

    // 8. Verify the 'Linked Trip' field is pre-populated with the active trip name.
    await expect(page.getByRole('combobox', { name: '--' })).toHaveValue('Active Trip');

    // 9. Click 'Cancel' to dismiss without submitting.
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('heading', { name: 'New expense', level: 2 })).not.toBeVisible();
  });
});
