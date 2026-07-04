// spec: specs/trends.plan.md
// seed: tests/seed.spec.ts
//
// NOTE: The 'Restaurants' category is displayed as 'Dining out' in the UI.
// The recurring backfill auto-creates a Utilities Internet $60 transaction,
// so the table has 4 rows and the footer total is -$186 (not -$126).

import { test, expect } from '../../src/fixtures';

test.describe('Totals table', () => {
  test('Totals table rows display correct amounts for seeded transactions', async ({ page }) => {
    // 1. Navigate to /trends and wait for the totals table to load
    await page.goto('/trends');
    await expect(page.getByRole('button', { name: 'Groceries', exact: true })).toBeVisible();

    // 2. Locate the 'Groceries' row in the table (first since it has the highest spend of $86)
    const groceriesRow = page.getByRole('row', { name: /Groceries/ });

    // expect: The 'Groceries' category row shows a total spent value of -$86
    await expect(groceriesRow.getByRole('cell', { name: '-$86.00' }).first()).toBeVisible();

    // expect: The transaction count column shows 1
    await expect(groceriesRow.getByRole('cell', { name: '1' }).first()).toBeVisible();

    // expect: The discretionary total column shows -$86
    await expect(groceriesRow.getByRole('cell', { name: '-$86.00' }).nth(1)).toBeVisible();

    // 3. Locate the 'Dining out' (Restaurants) row in the table
    const diningRow = page.getByRole('row', { name: /Dining out/ });

    // expect: The 'Dining out' row shows a total spent value of -$25
    await expect(diningRow.getByRole('cell', { name: '-$25.00' }).first()).toBeVisible();

    // expect: The transaction count column shows 1
    await expect(diningRow.getByRole('cell', { name: '1' }).first()).toBeVisible();

    // expect: The discretionary total column shows -$25
    await expect(diningRow.getByRole('cell', { name: '-$25.00' }).nth(1)).toBeVisible();

    // 4. Locate the 'Entertainment' row in the table
    const entertainmentRow = page.getByRole('row', { name: /Entertainment/ });

    // expect: The 'Entertainment' row shows a total spent value of -$15
    await expect(entertainmentRow.getByRole('cell', { name: '-$15.00' }).first()).toBeVisible();

    // expect: The transaction count column shows 1
    await expect(entertainmentRow.getByRole('cell', { name: '1' }).first()).toBeVisible();

    // expect: The discretionary total column shows -$15
    await expect(entertainmentRow.getByRole('cell', { name: '-$15.00' }).nth(1)).toBeVisible();

    // 5. Inspect the table footer (tfoot) row labelled 'Total'
    // Note: total includes Utilities $60 from recurring backfill → -$186 total, 4 transactions
    const totalRow = page.getByRole('row', { name: /^Total/ });

    // expect: The total amount is -$186.00 (includes $60 recurring backfill)
    await expect(totalRow.getByRole('cell', { name: '-$186.00' })).toBeVisible();

    // expect: The total transaction count is 4 (3 discretionary + 1 recurring)
    await expect(totalRow.getByRole('cell', { name: '4' })).toBeVisible();

    // expect: The discretionary total is -$126.00
    await expect(totalRow.getByRole('cell', { name: '-$126.00' })).toBeVisible();

    // expect: The discretionary transaction count is 3
    await expect(totalRow.getByRole('cell', { name: '3' })).toBeVisible();
  });
});
