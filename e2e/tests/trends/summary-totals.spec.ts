// spec: specs/trends.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../src/fixtures';

test.describe('Page load and layout', () => {
  test('Summary total tiles are visible with seeded amounts', async ({ page }) => {
    // 1. Navigate to /trends and wait for data to load (skeleton loaders disappear)
    await page.goto('/trends');
    await page.getByText('-$126.00').first().waitFor({ state: 'visible' });

    // expect: A tile labelled 'Total spent' is visible
    // Use getByText instead of getByRole('heading') because the mobile layout renders these as
    // plain <div> elements (not headings). On the trends page the TotalsTable also has <th>
    // elements with the same text, so .first() targets the SummaryTotals tile (first in DOM).
    await expect(page.getByText('Total spent', { exact: true }).first()).toBeVisible();

    // expect: A tile labelled 'Discretionary total' is visible
    await expect(page.getByText('Discretionary total', { exact: true }).first()).toBeVisible();

    // expect: A tile labelled 'Recurring total' is visible
    await expect(page.getByText('Recurring total', { exact: true }).first()).toBeVisible();

    // 2. Read the displayed currency value in the 'Discretionary total' tile
    // expect: The discretionary total displays -$126 (sum of Restaurants $25 + Groceries $86 + Entertainment $15)
    await expect(page.getByText('-$126.00').first()).toBeVisible();

    // 3. Read the displayed currency value in the 'Total spent' tile
    // expect: The total spent value is visible and negative (red), reflecting at least $126 in discretionary spend
    // Note: with recurring backfill auto-creating Internet $60, Total spent = -$186.00
    await expect(page.getByText('-$186.00').first()).toBeVisible();
  });
});
