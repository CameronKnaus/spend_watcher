// spec: specs/trips.plan.md
// seed: e2e/tests/seed.spec.ts
//
// Consolidated add-trip journeys (formerly add-trip-happy-path + add-trip-same-day +
// add-trip-max-name-length): one future-dated add, one same-day add, one DB-boundary name.

import { test, expect } from '../../src/fixtures';
import { datePickerInputs, selectDate } from '../../src/datePicker';
import { addMonths, format, setDate, startOfMonth } from 'date-fns';

test.describe('Add Trip — Happy Path', () => {
  test('Add a new trip with name, start date, and end date', async ({ page }) => {
    // Dates are computed relative to today — hardcoded months rot (the original spec assumed
    // "2 clicks to August 2026" and broke on July 1st). 1st–5th of next month keeps single-digit
    // day cells exercised (the exact-match regression) and always lies in the future.
    const startDate = setDate(startOfMonth(addMonths(new Date(), 1)), 1);
    const endDate = setDate(startDate, 5);

    // 1. Navigate to /trips.
    await page.goto('/trips');
    await expect(page.getByRole('button', { name: 'Add trip' })).toBeVisible();

    // 2. Click the 'Add trip' button.
    await page.getByRole('button', { name: 'Add trip' }).click();
    await expect(page.getByRole('heading', { name: 'New trip' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Europe summer trip' })).toBeVisible();
    // Date pickers are visible — use cross-platform locator (desktop: "MMMM DD, YYYY",
    // mobile: "Choose date…")
    const allDateInputs = datePickerInputs(page);
    await expect(allDateInputs.first()).toBeVisible();
    await expect(allDateInputs.last()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();

    // 3. Type the trip name.
    await page.getByRole('textbox', { name: 'Europe summer trip' }).fill('Summer Vacation');
    await expect(page.getByRole('textbox', { name: 'Europe summer trip' })).toHaveValue('Summer Vacation');

    // 4. Set the END date first, then the start date. Order matters on mobile: the start picker's
    // maxDate is the current end date (which defaults to today), so its "Next month" button is
    // disabled until the end date has been pushed into the future.
    await selectDate(page, allDateInputs.last(), endDate);
    await selectDate(page, allDateInputs.first(), startDate);
    await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();

    // 5. Click the 'Submit' button.
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByRole('heading', { name: 'New trip' })).not.toBeVisible();
    await expect(page.getByRole('heading', { name: 'Summer Vacation' })).toBeVisible();

    // The card renders the range label from the persisted dates.
    const rangeLabel = `${format(startDate, 'MMM do')} - ${format(endDate, 'MMM do')}, ${format(endDate, 'yyyy')}`;
    await expect(page.getByText(rangeLabel)).toBeVisible();
    await expect(page.getByText('$0.00').first()).toBeVisible();

    // 6. Verify the trips list now has both cards.
    await expect(page.getByRole('heading', { name: 'Test Trip' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Summer Vacation' })).toBeVisible();
  });

  test('Add a trip with a same-day start and end date', async ({ page }) => {
    await page.goto('/trips');
    await page.getByRole('button', { name: 'Add trip' }).click();
    await expect(page.getByRole('heading', { name: 'New trip' })).toBeVisible();

    await page.getByRole('textbox', { name: 'Europe summer trip' }).fill('Day Trip');

    // Leave both dates at their default (today) — a same-day trip is valid.
    const allDateInputs = datePickerInputs(page);
    await expect(allDateInputs.first()).not.toHaveValue('');
    await expect(allDateInputs.last()).not.toHaveValue('');

    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByRole('heading', { name: 'New trip' })).not.toBeVisible();
    await expect(page.getByRole('heading', { name: 'Day Trip' })).toBeVisible();

    // The date range label shows the same date for both start and end.
    const todayLabel = format(new Date(), 'MMM do');
    await expect(page.getByText(`${todayLabel} - ${todayLabel}, ${format(new Date(), 'yyyy')}`)).toBeVisible();
    await expect(page.getByText('$0.00').first()).toBeVisible();
  });

  test('Trip name at the DB maximum length (30 characters) is accepted', async ({ page }) => {
    const maxLengthName = 'x'.repeat(30);

    await page.goto('/trips');
    await page.getByRole('button', { name: 'Add trip' }).click();
    await expect(page.getByRole('heading', { name: 'New trip' })).toBeVisible();

    await page.getByRole('textbox', { name: 'Europe summer trip' }).fill(maxLengthName);
    await expect(page.getByRole('textbox', { name: 'Europe summer trip' })).toHaveValue(maxLengthName);

    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByRole('heading', { name: 'New trip' })).not.toBeVisible();

    // The card must render the name served back by the API — proof the insert succeeded at the
    // 30-char boundary.
    await expect(page.getByRole('heading', { name: maxLengthName })).toBeVisible();
  });
});
