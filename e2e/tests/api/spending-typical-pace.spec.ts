// Exercises: GET /spending/typical-pace (contract/src/spending.contract.ts, insights.service.ts
// baseline averaging). Fixed calendar dates keep every run deterministic.

import { apiTest as test, expect } from '../../src/apiFixtures';
import { post } from '../../src/seed';
import { getJson } from '../../src/apiHelpers';
import { format, subMonths } from 'date-fns';
import type { TypicalPaceResponse } from '@spend-watcher/contract';

async function addExpense(api: Parameters<typeof getJson>[0], spentDate: string, amountSpent: number): Promise<void> {
  await post(api, '/api/spending/discretionary/add', {
    category: 'GROCERIES',
    amountSpent,
    spentDate,
    note: 'typical seed',
  });
}

test.describe('Typical pace — baseline averaging', () => {
  test('averages only baseline months with spend and cuts them at the same day', async ({ api }) => {
    // April: $100 by day 15 + $50 after; May: $30. The other four baseline months stay empty.
    await addExpense(api, '2024-04-10', 100);
    await addExpense(api, '2024-04-20', 50);
    await addExpense(api, '2024-05-01', 30);
    await addExpense(api, '2024-07-05', 20);
    await addExpense(api, '2024-07-15', 40);

    const res = await getJson<TypicalPaceResponse>(api, '/api/spending/typical-pace', { targetDate: '2024-07-15' });

    expect(res.baselineMonthCount).toBe(2);
    expect(res.typicalMonthTotal).toBeCloseTo((150 + 30) / 2, 5);
    expect(res.typicalThroughSameDay).toBeCloseTo((100 + 30) / 2, 5);

    expect(res.cumulativeByDay).toHaveLength(15);
    expect(res.cumulativeByDay[0]).toEqual({ date: '2024-07-01', amount: 0 });
    expect(res.cumulativeByDay[4]).toEqual({ date: '2024-07-05', amount: 20 });
    expect(res.cumulativeByDay[14]).toEqual({ date: '2024-07-15', amount: 60 });
  });

  test('clamps the same-day cutoff to each baseline month’s length', async ({ api }) => {
    await addExpense(api, '2024-02-29', 75);

    const res = await getJson<TypicalPaceResponse>(api, '/api/spending/typical-pace', { targetDate: '2024-03-31' });

    expect(res.baselineMonthCount).toBe(1);
    // Day 31 clamps to Feb 29, so the leap-day transaction counts as "through the same day".
    expect(res.typicalThroughSameDay).toBe(75);
    expect(res.typicalMonthTotal).toBe(75);
  });

  test('returns nulls and a zero-filled series for a user with no history', async ({ api }) => {
    const res = await getJson<TypicalPaceResponse>(api, '/api/spending/typical-pace', { targetDate: '2024-07-10' });

    expect(res.baselineMonthCount).toBe(0);
    expect(res.typicalMonthTotal).toBeNull();
    expect(res.typicalThroughSameDay).toBeNull();
    expect(res.cumulativeByDay).toHaveLength(10);
    expect(res.cumulativeByDay.every((day) => day.amount === 0)).toBe(true);
  });

  test('recurring spend never counts toward the pace baseline', async ({ api }) => {
    await post(api, '/api/spending/recurring/add', {
      category: 'UTILITIES',
      recurringSpendName: 'Internet',
      expectedMonthlyAmount: 60,
      isVariableRecurring: false,
    });
    const summary = await getJson<{ activeRecurringTransactions: { recurringSpendId: string }[] }>(
      api,
      '/api/spending/recurring/summary',
    );
    await post(api, '/api/spending/recurring/transactions/add', {
      recurringSpendId: summary.activeRecurringTransactions[0].recurringSpendId,
      amountSpent: 120,
      date: format(subMonths(new Date(), 1), 'yyyy-MM'),
    });

    const res = await getJson<TypicalPaceResponse>(api, '/api/spending/typical-pace', {
      targetDate: format(new Date(), 'yyyy-MM-dd'),
    });

    expect(res.baselineMonthCount).toBe(0);
    expect(res.typicalMonthTotal).toBeNull();
    expect(res.cumulativeByDay.every((day) => day.amount === 0)).toBe(true);
  });
});
