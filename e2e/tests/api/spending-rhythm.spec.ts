// Exercises: GET /spending/rhythm (contract/src/spending.contract.ts, insights.service.ts median
// math). Fixed calendar dates keep every run deterministic.

import { apiTest as test, expect } from '../../src/apiFixtures';
import { post } from '../../src/seed';
import { getJson } from '../../src/apiHelpers';
import type { SpendingRhythmResponse } from '@spend-watcher/contract';

async function addExpense(api: Parameters<typeof getJson>[0], spentDate: string, amountSpent: number): Promise<void> {
  await post(api, '/api/spending/discretionary/add', {
    category: 'GROCERIES',
    amountSpent,
    spentDate,
    note: 'rhythm seed',
  });
}

test.describe('Spending rhythm — daily median', () => {
  test('takes the middle non-zero spend day and zero-fills the month', async ({ api }) => {
    await addExpense(api, '2024-07-01', 10);
    await addExpense(api, '2024-07-02', 20);
    await addExpense(api, '2024-07-03', 100);

    const res = await getJson<SpendingRhythmResponse>(api, '/api/spending/rhythm', { targetDate: '2024-07-10' });

    expect(res.dailyMedian).toBe(20);
    expect(res.days).toHaveLength(10);
    expect(res.days[0]).toEqual({ date: '2024-07-01', amount: 10 });
    expect(res.days.slice(3).every((day) => day.amount === 0)).toBe(true);
  });

  test('averages the middle pair when the spend-day count is even', async ({ api }) => {
    await addExpense(api, '2024-07-01', 10);
    await addExpense(api, '2024-07-02', 20);
    await addExpense(api, '2024-07-03', 30);
    await addExpense(api, '2024-07-04', 100);

    const res = await getJson<SpendingRhythmResponse>(api, '/api/spending/rhythm', { targetDate: '2024-07-10' });

    expect(res.dailyMedian).toBe(25);
  });

  test('the median window is exactly the 90 days ending at targetDate', async ({ api }) => {
    // Apr 11 is day 91 — outside; only the July day should feed the median.
    await addExpense(api, '2024-04-11', 999);
    await addExpense(api, '2024-07-01', 10);

    const res = await getJson<SpendingRhythmResponse>(api, '/api/spending/rhythm', { targetDate: '2024-07-10' });

    expect(res.dailyMedian).toBe(10);
  });

  test('median is null for a user with no history', async ({ api }) => {
    const res = await getJson<SpendingRhythmResponse>(api, '/api/spending/rhythm', { targetDate: '2024-07-10' });

    expect(res.dailyMedian).toBeNull();
    expect(res.days).toHaveLength(10);
    expect(res.days.every((day) => day.amount === 0)).toBe(true);
  });
});
