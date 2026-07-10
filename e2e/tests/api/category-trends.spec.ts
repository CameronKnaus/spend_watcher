// Exercises: GET /spending/category-trends (contract/src/spending.contract.ts,
// insights.service.ts window/zero-fill math). targetMonth is caller-supplied, so these specs pin
// fixed months in the past and stay deterministic regardless of when they run.

import { apiTest as test, expect } from '../../src/apiFixtures';
import { post } from '../../src/seed';
import { getJson } from '../../src/apiHelpers';
import type { CategoryTrendsResponse } from '@spend-watcher/contract';

async function addExpense(
  api: Parameters<typeof getJson>[0],
  category: string,
  spentDate: string,
  amountSpent: number,
): Promise<void> {
  await post(api, '/api/spending/discretionary/add', { category, amountSpent, spentDate, note: 'trend seed' });
}

test.describe('Category trends — six-month window', () => {
  test('aligns zero-filled monthly totals across a year boundary and computes the delta', async ({ api }) => {
    await addExpense(api, 'GROCERIES', '2023-09-15', 10);
    await addExpense(api, 'GROCERIES', '2024-01-05', 40);
    await addExpense(api, 'GROCERIES', '2024-02-10', 50);

    const res = await getJson<CategoryTrendsResponse>(api, '/api/spending/category-trends', {
      targetMonth: '2024-02',
    });

    expect(res.months).toEqual(['2023-09', '2023-10', '2023-11', '2023-12', '2024-01', '2024-02']);
    const groceries = res.categories.find((entry) => entry.category === 'GROCERIES');
    expect(groceries?.monthlyTotals).toEqual([10, 0, 0, 0, 40, 50]);
    expect(groceries?.percentChange).toBeCloseTo(0.25, 5);
  });

  test('delta is null when the month before targetMonth has no spend', async ({ api }) => {
    await addExpense(api, 'ENTERTAINMENT', '2024-02-10', 15);

    const res = await getJson<CategoryTrendsResponse>(api, '/api/spending/category-trends', {
      targetMonth: '2024-02',
    });

    const entertainment = res.categories.find((entry) => entry.category === 'ENTERTAINMENT');
    expect(entertainment?.monthlyTotals).toEqual([0, 0, 0, 0, 0, 15]);
    expect(entertainment?.percentChange).toBeNull();
  });

  test('categories with no spend inside the window are omitted', async ({ api }) => {
    await addExpense(api, 'CLOTHING', '2023-01-01', 100);

    const res = await getJson<CategoryTrendsResponse>(api, '/api/spending/category-trends', {
      targetMonth: '2024-02',
    });

    expect(res.categories).toEqual([]);
  });

  test('recurring spend counts toward its category totals', async ({ api }) => {
    // Creation backfills a current-month transaction, which is safely outside the pinned window.
    await post(api, '/api/spending/recurring/add', {
      category: 'UTILITIES',
      recurringSpendName: 'Electric',
      expectedMonthlyAmount: 60,
      isVariableRecurring: true,
    });
    const summary = await getJson<{ activeRecurringTransactions: { recurringSpendId: string }[] }>(
      api,
      '/api/spending/recurring/summary',
    );
    const recurringSpendId = summary.activeRecurringTransactions[0].recurringSpendId;
    await post(api, '/api/spending/recurring/transactions/add', {
      recurringSpendId,
      amountSpent: 55,
      date: '2024-01',
    });
    await post(api, '/api/spending/recurring/transactions/add', {
      recurringSpendId,
      amountSpent: 66,
      date: '2024-02',
    });

    const res = await getJson<CategoryTrendsResponse>(api, '/api/spending/category-trends', {
      targetMonth: '2024-02',
    });

    const utilities = res.categories.find((entry) => entry.category === 'UTILITIES');
    expect(utilities?.monthlyTotals).toEqual([0, 0, 0, 0, 55, 66]);
    expect(utilities?.percentChange).toBeCloseTo(0.2, 5);
  });
});
