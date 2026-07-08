// Exercises: GET /spending/pace (contract/src/spending.contract.ts, insights.service.ts window
// math). `targetDate` is caller-supplied, so these specs pin fixed calendar dates far in the past
// and stay deterministic regardless of when they run.

import { apiTest as test, expect } from '../../src/apiFixtures';
import { post } from '../../src/seed';
import { getJson } from '../../src/apiHelpers';
import { format, subMonths } from 'date-fns';
import type { SpendingPaceResponse } from '@spend-watcher/contract';

async function addExpense(api: Parameters<typeof getJson>[0], spentDate: string, amountSpent: number): Promise<void> {
  await post(api, '/api/spending/discretionary/add', {
    category: 'GROCERIES',
    amountSpent,
    spentDate,
    note: 'pace seed',
  });
}

test.describe('Spending pace — comparison windows', () => {
  test('splits totals into month-to-date, previous-month-same-day, and previous-month-full', async ({ api }) => {
    await addExpense(api, '2024-05-03', 50);
    await addExpense(api, '2024-04-05', 30);
    await addExpense(api, '2024-04-25', 70);

    const res = await getJson<SpendingPaceResponse>(api, '/api/spending/pace', { targetDate: '2024-05-10' });

    expect(res.monthToDate).toEqual({ total: 50, discretionary: 50, recurring: 0 });
    // April 25 falls outside the 1st–10th same-day window but inside the full month.
    expect(res.previousMonthSameDay).toEqual({ total: 30, discretionary: 30, recurring: 0 });
    expect(res.previousMonthFull).toEqual({ total: 100, discretionary: 100, recurring: 0 });
  });

  test('clamps the same-day cutoff to the previous month’s length', async ({ api }) => {
    await addExpense(api, '2024-02-29', 40);
    await addExpense(api, '2024-02-01', 10);
    // Would leak into the same-day window if day 31 overflowed into March.
    await addExpense(api, '2024-03-01', 99);

    const res = await getJson<SpendingPaceResponse>(api, '/api/spending/pace', { targetDate: '2024-03-31' });

    expect(res.previousMonthSameDay.total).toBe(50);
    expect(res.previousMonthFull.total).toBe(50);
    expect(res.monthToDate.total).toBe(99);
  });

  test('returns zeroed windows for a user with no history', async ({ api }) => {
    const res = await getJson<SpendingPaceResponse>(api, '/api/spending/pace', { targetDate: '2024-05-10' });

    const zeros = { total: 0, discretionary: 0, recurring: 0 };
    expect(res).toEqual({ monthToDate: zeros, previousMonthSameDay: zeros, previousMonthFull: zeros });
  });

  test('recurring spend counts toward the recurring split in every window', async ({ api }) => {
    // Creation backfills a $60 transaction into the current month (on the 1st).
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

    const res = await getJson<SpendingPaceResponse>(api, '/api/spending/pace', {
      targetDate: format(new Date(), 'yyyy-MM-dd'),
    });

    expect(res.monthToDate).toEqual({ total: 60, discretionary: 0, recurring: 60 });
    // Recurring transactions land on the 1st, inside any same-day window.
    expect(res.previousMonthSameDay).toEqual({ total: 120, discretionary: 0, recurring: 120 });
    expect(res.previousMonthFull).toEqual({ total: 120, discretionary: 0, recurring: 120 });
  });
});
