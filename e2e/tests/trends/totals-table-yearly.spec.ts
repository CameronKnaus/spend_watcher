// spec: specs/trends.plan.md
// seed: e2e/tests/seed.spec.ts

import { test, expect } from '../../src/fixtures';
import { post, ymd } from '../../src/seed';
import { isSameYear, setDate, subMonths } from 'date-fns';

test.describe('Totals table', () => {
  test('Switching to Yearly mode queries the wider range from the API', async ({ page, api }) => {
    // Seed one PRIOR-MONTH transaction so Yearly totals actually differ from Monthly — without it
    // the two modes return identical data and this test cannot tell them apart. (In January the
    // prior month falls into last year, so the yearly view legitimately matches monthly then.)
    const priorMonth = setDate(subMonths(new Date(), 1), 15);
    await post(api, '/api/spending/discretionary/add', {
      category: 'GROCERIES',
      amountSpent: 40,
      spentDate: ymd(priorMonth),
      note: 'Last month groceries',
    });
    const priorMonthCountsInYear = isSameYear(priorMonth, new Date());

    // 1. Monthly mode: only current-month data — the prior-month $40 must NOT be included.
    await page.goto('/trends');
    await expect(page.getByRole('button', { name: 'Groceries', exact: true })).toBeVisible();
    const groceriesRow = page.getByRole('row', { name: /Groceries/ });
    await expect(groceriesRow.getByRole('cell', { name: '-$86.00' }).first()).toBeVisible();

    // 2. Switch to Yearly mode.
    await page.getByRole('button', { name: 'Yearly' }).click();

    // expect: All category rows are present, including the backfilled Utilities row.
    await expect(page.getByRole('button', { name: 'Dining out', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Entertainment', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Utilities', exact: true })).toBeVisible();

    // expect: The Groceries row now includes the prior-month transaction — proof the yearly
    // range parameter reached the API and widened the query (86 + 40 = 126).
    const groceriesYearlyTotal = priorMonthCountsInYear ? '-$126.00' : '-$86.00';
    await expect(groceriesRow.getByRole('cell', { name: groceriesYearlyTotal }).first()).toBeVisible();

    // expect: The footer totals widen accordingly (monthly baseline: -$186 total / -$126
    // discretionary, +$40 in the yearly range).
    const totalRow = page.getByRole('row', { name: /^Total/ });
    const yearlyTotal = priorMonthCountsInYear ? '-$226.00' : '-$186.00';
    const yearlyDiscretionary = priorMonthCountsInYear ? '-$166.00' : '-$126.00';
    await expect(totalRow.getByRole('cell', { name: yearlyTotal, exact: true })).toBeVisible();
    await expect(totalRow.getByRole('cell', { name: yearlyDiscretionary, exact: true })).toBeVisible();
  });
});
