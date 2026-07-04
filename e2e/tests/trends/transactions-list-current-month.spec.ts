// spec: specs/trends.plan.md
// seed: e2e/tests/seed.spec.ts
//
// NOTE: 'Restaurants' category is displayed as 'Dining out' in the UI.

import { test, expect } from '../../src/fixtures';
import { format } from 'date-fns';
import { seededDiscretionary } from '../../src/seed';

test.describe('Discretionary transactions list', () => {
  test('Transactions list shows the seeded entries grouped by date for the current month', async ({ page }) => {
    // 1. Navigate to /trends and wait for the 'Discretionary transactions' module to load
    await page.goto('/trends');
    await expect(page.getByRole('heading', { name: 'Discretionary transactions' })).toBeVisible();

    // 2. Every seeded transaction renders as a row: category label, amount, note.
    await expect(page.getByRole('button', { name: 'Dining out -$25.00 Lunch' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Groceries -$86.00 Weekly groceries' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Entertainment -$15.00 Streaming' })).toBeVisible();

    // 3. Date group headers. Derive the expected dates from the seed itself — early in a month the
    // seed clamps older transactions to the 1st, so several rows can share one header. Deduping
    // here keeps the assertion correct on every day of the month.
    const expectedHeaders = new Set(seededDiscretionary().map((t) => format(t.spentDate, 'MMM do')));
    for (const header of expectedHeaders) {
      await expect(page.getByRole('heading', { name: new RegExp(header) }).first()).toBeVisible();
    }
  });
});
