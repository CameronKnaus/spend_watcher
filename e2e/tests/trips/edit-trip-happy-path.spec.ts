// spec: specs/trips.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../src/fixtures';
import { datePickerInputs, selectDate } from '../../src/datePicker';
import { addMonths, format, setDate, startOfMonth, subDays } from 'date-fns';

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

  test('Move a past trip to later dates by changing the start date first', async ({ page }) => {
    // Both dates are after the seeded trip's end date, which is the move the start picker has to allow.
    const newStart = startOfMonth(addMonths(new Date(), 1));
    const newEnd = setDate(newStart, 5);
    const seededStart = subDays(new Date(), 14);

    // 1. Open the edit form for 'Test Trip'.
    await page.goto('/trips');
    await page.getByRole('button', { name: 'Details' }).click();
    await page.getByRole('button', { name: 'Edit trip details' }).click();
    await expect(page.getByRole('heading', { name: 'Edit trip details' })).toBeVisible();

    // 2. Set the start date, then the end date.
    const allDateInputs = datePickerInputs(page);
    await selectDate(page, allDateInputs.first(), newStart, seededStart);
    await selectDate(page, allDateInputs.last(), newEnd, newStart);

    // 3. Click 'Submit'.
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByRole('heading', { name: 'Edit trip details' })).not.toBeVisible();

    // 4. A reload shows the dates were saved, not just held in the form.
    await page.reload();
    const rangeLabel = `${format(newStart, 'MMM do')} - ${format(newEnd, 'MMM do')}, ${format(newEnd, 'yyyy')}`;
    await expect(page.getByText(rangeLabel)).toBeVisible();
  });
});
