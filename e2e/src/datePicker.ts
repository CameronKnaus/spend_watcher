/**
 * Cross-platform date-picker helpers for Playwright tests.
 *
 * MUI X DatePicker renders differently based on the pointer type:
 *   Desktop (pointer: fine) — editable <input>. You can call .fill() with a date string.
 *   Mobile  (pointer: coarse) — readonly <input> that opens a modal dialog on click.
 *                              .fill() does not work; you must tap to open the dialog,
 *                              navigate months, tap the day, then tap OK.
 */

import type { Locator, Page } from '@playwright/test';
import { differenceInCalendarMonths, format, startOfMonth } from 'date-fns';

/**
 * Returns true when the page is using the MUI mobile date-picker variant
 * (coarse pointer, i.e. touch device). MUI uses the same media query internally.
 */
export async function isMobilePicker(page: Page): Promise<boolean> {
  return page.evaluate(() => window.matchMedia('(pointer: coarse)').matches);
}

/**
 * Returns a locator matching ALL date-picker text inputs on the page,
 * regardless of platform. Order matches DOM order.
 *
 * Matched on the placeholder ATTRIBUTE (the format mask), not the accessible name: both the
 * desktop and mobile variants carry it, and it is stable whether or not the picker has an
 * associated <label> — a labeled picker's accessible name is the label text, an unlabeled
 * desktop picker's is the placeholder, and the mobile variant's is its "Choose date…" aria-label.
 */
export function datePickerInputs(page: Page): Locator {
  return page.getByPlaceholder('MMMM DD, YYYY');
}

/**
 * Selects `targetDate` in a single date-picker identified by `input`.
 *
 * Desktop path  → fills the editable text field with "MMMM do, yyyy" format.
 * Mobile path   → taps the readonly input to open the modal dialog, navigates
 *                 month-by-month to reach `targetDate`'s month, taps the day
 *                 grid-cell, then confirms with the "OK" button.
 *
 * @param page         The Playwright Page object.
 * @param input        Locator resolving to exactly one date-picker input.
 * @param targetDate   The date to select.
 * @param openOnMonth  The month the picker will show when it first opens
 *                     (defaults to today). Used only for mobile month navigation.
 */
export async function selectDate(
  page: Page,
  input: Locator,
  targetDate: Date,
  openOnMonth: Date = new Date(),
): Promise<void> {
  if (await isMobilePicker(page)) {
    // Tap the readonly input to open the picker dialog. Scope to the dialog that contains the
    // calendar grid: when the picker lives inside a SlideUpPanel (also role="dialog"), a bare
    // getByRole('dialog') matches both, and waitFor({ state: 'hidden' }) below would never resolve
    // because the panel stays open after the calendar closes.
    await input.click();
    const dialog = page.getByRole('dialog').filter({ has: page.getByRole('gridcell') });
    await dialog.waitFor();

    // Navigate forward/backward by months until the target month is visible.
    const monthDiff = differenceInCalendarMonths(startOfMonth(targetDate), startOfMonth(openOnMonth));
    if (monthDiff > 0) {
      for (let i = 0; i < monthDiff; i++) {
        await dialog.getByRole('button', { name: 'Next month' }).click();
      }
    } else if (monthDiff < 0) {
      for (let i = 0; i < -monthDiff; i++) {
        await dialog.getByRole('button', { name: 'Previous month' }).click();
      }
    }

    // Click the day button. Locating by accessible name (the day number) is racy: month navigation
    // is animated, and while the new month slides in BOTH month grids are in the DOM, so e.g. "5"
    // matches July 5 and August 5 at once (strict-mode violation) — and no wait on grid count or
    // header label closes the race, because the label updates before the new grid mounts. MUI
    // stamps every day button with data-timestamp = local midnight of its date, which uniquely
    // identifies the TARGET day across both grids, so this is the one stable hook.
    const dayTimestamp = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).getTime();
    await dialog.locator(`button[role="gridcell"][data-timestamp="${dayTimestamp}"]`).click();

    // Confirm — mobile picker does NOT auto-close (closeOnSelect defaults to false).
    await dialog.getByRole('button', { name: 'OK' }).click();
    await dialog.waitFor({ state: 'hidden' });
  } else {
    // Desktop: fill the editable text field directly.
    const formatted = format(targetDate, 'MMMM do, yyyy');
    await input.fill(formatted);
  }
}

/**
 * Opens the calendar view for a date-picker and returns the dialog locator
 * so the caller can inspect its contents (e.g. check disabled days).
 *
 * Desktop: clicks the "Choose date" calendar-icon button that opens a popover.
 * Mobile:  taps the readonly input which opens the modal dialog.
 *
 * @param page   The Playwright Page object.
 * @param input  Locator resolving to exactly one date-picker input.
 */
export async function openDatePickerCalendar(page: Page, input: Locator): Promise<Locator> {
  if (await isMobilePicker(page)) {
    await input.click();
  } else {
    // Desktop renders a calendar-icon button alongside the field.
    // Its aria-label starts with "Choose date".
    await page.getByRole('button', { name: /Choose date/ }).click();
  }
  // Scope to the dialog containing the calendar grid so we don't also match an enclosing
  // SlideUpPanel (also role="dialog") when the picker is opened from inside a form panel.
  const dialog = page.getByRole('dialog').filter({ has: page.getByRole('gridcell') });
  await dialog.waitFor();
  return dialog;
}
