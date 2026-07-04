// spec: specs/trends.plan.md
// seed: e2e/tests/seed.spec.ts
//
// Consolidated category-panel journeys. The panel is the same category-scoped fetch regardless of
// entry point or category, so one file covers: open from the totals table (anchor), open from the
// Top-categories widget, and the RESTAURANTS -> 'Dining out' display mapping (formerly the
// category-panel-entertainment / -restaurants / -from-top-categories permutations).

import { test, expect } from '../../src/fixtures';
import { format } from 'date-fns';

test.describe('Category transaction list panel', () => {
  test('Clicking a category in the totals table opens the transaction list panel', async ({ page }) => {
    // 1. Navigate to /trends and wait for the totals table to load
    await page.goto('/trends');
    await expect(page.getByRole('button', { name: 'Groceries', exact: true })).toBeVisible();

    // 2. Click the 'Groceries' category button in the totals table
    await page.locator('table').getByRole('button', { name: 'Groceries' }).click();

    // expect: A slide-up panel dialog appears with the category as its title
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Groceries', level: 2 })).toBeVisible();

    // 3. The panel lists the category-scoped transaction served by the API: amount and note.
    await expect(page.getByRole('dialog').getByRole('button', { name: /Groceries.*-\$86\.00/ })).toBeVisible();
    await expect(page.getByRole('dialog').getByText('Weekly groceries')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();
  });

  test("Panel opened from Top categories maps RESTAURANTS to 'Dining out' and closes", async ({ page }) => {
    // 1. The Top-categories widget shows the seeded chips with server-computed percentages.
    await page.goto('/trends');
    await expect(page.getByRole('heading', { name: 'Top discretionary categories' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Dining out -$25.00 (19.84%)' })).toBeVisible();

    // 2. Open the panel from the widget chip — the other entry point into the same fetch.
    await page.getByRole('button', { name: 'Dining out -$25.00 (19.84%)' }).click();
    await expect(page.getByRole('heading', { name: 'Dining out', level: 2 })).toBeVisible();

    // 3. The RESTAURANTS enum renders under its display label with the row's date (seeded today).
    await expect(page.getByRole('dialog').getByRole('button', { name: /Dining out.*-\$25\.00/ })).toBeVisible();
    await expect(page.getByRole('dialog').getByText('Lunch')).toBeVisible();
    await expect(page.getByRole('dialog').getByText(format(new Date(), 'MMM do, yyyy'))).toBeVisible();

    // 4. Close dismisses the panel.
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('heading', { name: 'Dining out', level: 2 })).not.toBeVisible();
  });
});
