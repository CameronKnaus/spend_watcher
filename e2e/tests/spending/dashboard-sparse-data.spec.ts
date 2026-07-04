import type { Page } from '@playwright/test';
import { unseededTest as test, expect } from '../../src/fixtures';
import { post, SEEDED_RECURRING, ymd } from '../../src/seed';

// Method-filtered so a CORS preflight to the same URL can't satisfy the wait.
function waitForDetailsResponse(page: Page) {
  return page.waitForResponse(
    (response) => response.url().includes('/api/spending/details') && response.request().method() === 'GET',
  );
}

test.describe('Dashboard with sparse spending data', () => {
  test('A brand-new user with no transactions sees a zeroed dashboard', async ({ page }) => {
    const detailsResponse = waitForDetailsResponse(page);
    await page.goto('/dashboard');
    expect((await detailsResponse).status()).toBe(200);

    // Tiles render real amounts (not skeletons), all $0.00.
    await expect(page.getByText('Total spent', { exact: true })).toBeVisible();
    await expect(page.getByText('Discretionary total', { exact: true })).toBeVisible();
    await expect(page.getByText('Recurring total', { exact: true })).toBeVisible();
    await expect(page.getByText('$0.00').first()).toBeVisible();
    await expect(page.getByText('You have no discretionary spending so far this month.')).toBeVisible();
  });

  test('A month with only recurring spending renders totals and the empty top-categories state', async ({
    page,
    api,
  }) => {
    // A fixed recurring spend auto-creates its current-month transaction, so the user has recurring
    // data but zero discretionary — the exact state every user is in at the start of a month.
    await post(api, '/api/spending/recurring/add', { ...SEEDED_RECURRING, isVariableRecurring: false });

    const detailsResponse = waitForDetailsResponse(page);
    await page.goto('/dashboard');
    expect((await detailsResponse).status()).toBe(200);

    await expect(page.getByText('Recurring total', { exact: true })).toBeVisible();
    await expect(page.getByText('-$60.00').first()).toBeVisible();
    await expect(page.getByText('Discretionary total', { exact: true })).toBeVisible();
    await expect(page.getByText('$0.00').first()).toBeVisible();
    await expect(page.getByText('You have no discretionary spending so far this month.')).toBeVisible();
  });

  test('A month with only discretionary spending renders totals and top-category percentages', async ({
    page,
    api,
  }) => {
    await post(api, '/api/spending/discretionary/add', {
      category: 'RESTAURANTS',
      amountSpent: 25,
      spentDate: ymd(new Date()),
      note: 'Lunch',
    });

    const detailsResponse = waitForDetailsResponse(page);
    await page.goto('/dashboard');
    expect((await detailsResponse).status()).toBe(200);

    await expect(page.getByText('Discretionary total', { exact: true })).toBeVisible();
    await expect(page.getByText('-$25.00').first()).toBeVisible();
    await expect(page.getByText('Recurring total', { exact: true })).toBeVisible();
    await expect(page.getByText('$0.00').first()).toBeVisible();
    // The single category owns 100% — a server-computed percentage, so this pins the percentage
    // fields themselves, not just the response status.
    await expect(page.getByRole('button', { name: 'Dining out -$25.00 (100%)' })).toBeVisible();
  });
});
