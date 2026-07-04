// spec: specs/spending.plan.md
// seed: e2e/tests/seed.spec.ts
//
// Consolidated dashboard READ journey: one page load, all three seeded widgets asserted against
// the API-served data (summary tiles, top categories with server-computed percentages, recent
// transaction rows), plus the category click-through into the slide-up panel. Replaces the former
// dashboard-summary-totals, dashboard-recent-transactions, and dashboard-top-categories specs.

import { test, expect } from '../../src/fixtures';
import { seededDiscretionary } from '../../src/seed';
import { format } from 'date-fns';

test.describe('Dashboard Spending Widgets', () => {
  test('Seeded data flows into summary tiles, top categories, and recent transactions', async ({ page }) => {
    // 1. Navigate to /dashboard and wait for the month-overview heading.
    await page.goto('/dashboard');
    const monthName = format(new Date(), 'MMMM');
    await expect(page.getByRole('heading', { name: `${monthName} overview` })).toBeVisible();

    // 2. Summary tiles. Labels are divs on mobile (not headings), so match by text.
    // Amounts are stable all month: seed guarantees $126 discretionary + $60 recurring backfill.
    await expect(page.getByText('Total spent', { exact: true })).toBeVisible();
    await expect(page.getByText('-$186.00').first()).toBeVisible();
    await expect(page.getByText('Discretionary total', { exact: true })).toBeVisible();
    await expect(page.getByText('-$126.00').first()).toBeVisible();
    await expect(page.getByText('Recurring total', { exact: true })).toBeVisible();
    await expect(page.getByText('-$60.00').first()).toBeVisible();

    // 3. Top discretionary categories — server-computed percentages of the $126 total.
    await expect(page.getByRole('heading', { name: 'Top discretionary categories' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Groceries -$86.00 (68.25%)' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Dining out -$25.00 (19.84%)' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Entertainment -$15.00 (11.9%)' })).toBeVisible();

    // 4. Recent transactions rows — every seeded transaction with its note.
    await expect(page.getByRole('heading', { name: 'Recent transactions' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Dining out -$25.00 Lunch' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Groceries -$86.00 Weekly groceries' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Entertainment -$15.00 Streaming' })).toBeVisible();

    // 5. Today's date-group header with the day total. The Lunch transaction is always seeded today.
    const todayLabel = format(new Date(), 'MMM do') + ' - Today';
    await expect(page.getByRole('heading', { name: new RegExp(todayLabel) })).toBeVisible();

    // 6. Category click-through: the panel shows the Groceries transaction served by the
    // category-scoped endpoint. Derive the expected date from the seed (clamped into this month).
    const groceries = seededDiscretionary().find((t) => t.category === 'GROCERIES')!;
    const groceriesDate = format(groceries.spentDate, 'MMM do,');
    await page.getByRole('button', { name: 'Groceries -$86.00 (68.25%)' }).click();
    await expect(page.getByRole('heading', { name: 'Groceries' })).toBeVisible();
    await expect(
      page.getByRole('button', { name: new RegExp(`Groceries.*-\\$86\\.00.*${groceriesDate}`) }),
    ).toBeVisible();

    // 7. Close the panel; the dashboard is still there.
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('heading', { name: 'Top discretionary categories' })).toBeVisible();
  });
});
