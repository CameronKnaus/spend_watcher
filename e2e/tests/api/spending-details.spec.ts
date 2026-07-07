// Exercises: the read-side aggregation in api/src/modules/spending/spendingDetailsTransform/* via
// GET /spending/details, plus GET /spending/{yearly-average,history-start}
// (contract/src/spending.contract.ts, contract/src/spendingDetails.ts).
//
// This is the most algorithmic code in the api — totals, per-category percentages, and the
// discretionary/recurring split — so the spec seeds a known slice and pins the exact numbers.

import { apiTest as test, expect } from '../../src/apiFixtures';
import { post, ymd } from '../../src/seed';
import { currentMonthRange, getJson } from '../../src/apiHelpers';
import { format, startOfMonth, subMonths } from 'date-fns';
import type {
  HistoryStartResponse,
  RecurringSummaryResponse,
  SpendingDetailsResponse,
  YearlyAverageResponse,
} from '@spend-watcher/contract';

const range = currentMonthRange();

// GROCERIES 86 + RESTAURANTS 25 + ENTERTAINMENT 15 = 126 discretionary; a fixed recurring adds 60
// (auto-backfilled to the current month). Total 186 across 4 categories.
async function seedKnownMonth(api: Parameters<typeof getJson>[0]): Promise<void> {
  await post(api, '/api/spending/discretionary/add', {
    category: 'GROCERIES',
    amountSpent: 86,
    spentDate: range.startDate,
    note: 'g',
  });
  await post(api, '/api/spending/discretionary/add', {
    category: 'RESTAURANTS',
    amountSpent: 25,
    spentDate: range.startDate,
    note: 'r',
  });
  await post(api, '/api/spending/discretionary/add', {
    category: 'ENTERTAINMENT',
    amountSpent: 15,
    spentDate: range.startDate,
    note: 'e',
  });
  await post(api, '/api/spending/recurring/add', {
    category: 'UTILITIES',
    recurringSpendName: 'Internet',
    expectedMonthlyAmount: 60,
    isVariableRecurring: false,
  });
}

test.describe('Spending details — aggregation math', () => {
  test('summary totals split discretionary vs recurring', async ({ api }) => {
    await seedKnownMonth(api);
    const details = await getJson<SpendingDetailsResponse>(api, '/api/spending/details', range);

    expect(details.summary.total).toEqual({ amount: 186, count: 4 });
    expect(details.summary.discretionaryTotals).toEqual({ amount: 126, count: 3 });
    expect(details.summary.recurringTotals).toEqual({ amount: 60, count: 1 });

    // Ratio of each spend type to the combined total.
    expect(details.spendTypeRatio.discretionary).toBeCloseTo(126 / 186, 5);
    expect(details.spendTypeRatio.recurring).toBeCloseTo(60 / 186, 5);
  });

  test('per-category overview computes counts and percentages', async ({ api }) => {
    await seedKnownMonth(api);
    const details = await getJson<SpendingDetailsResponse>(api, '/api/spending/details', range);
    const overview = details.spendCategoryOverview;

    expect(overview.categoriesWithTransactionsCount).toBe(4);
    expect(overview.categoriesWithDiscretionaryTransactionsCount).toBe(3);
    expect(overview.categoriesWithRecurringTransactionsCount).toBe(1);

    // Only four categories exist, so the "top four" holds the entire month.
    expect(overview.topFourCombinedTotals).toMatchObject({ amount: 186, count: 4, percentageOfTotalAmount: 100 });

    const byCategory = Object.fromEntries(overview.categoryDetailsList.map((c) => [c.category, c.combinedTotals]));
    expect(byCategory.GROCERIES).toMatchObject({ amount: 86 });
    expect(byCategory.GROCERIES.percentageOfTotalAmount).toBeCloseTo(46.24, 1);
    expect(byCategory.UTILITIES).toMatchObject({ amount: 60 });
    expect(byCategory.UTILITIES.percentageOfTotalAmount).toBeCloseTo(32.26, 1);
    expect(byCategory.RESTAURANTS.percentageOfTotalAmount).toBeCloseTo(13.44, 1);
    expect(byCategory.ENTERTAINMENT.percentageOfTotalAmount).toBeCloseTo(8.06, 1);
  });

  test('a date-range read reports each day’s transactions', async ({ api }) => {
    await seedKnownMonth(api);
    const details = await getJson<SpendingDetailsResponse>(api, '/api/spending/details', range);

    // All three discretionary transactions and the backfilled recurring one land on the 1st.
    const firstOfMonth = ymd(startOfMonth(new Date()));
    const day = details.transactionsByDate[firstOfMonth];
    expect(day.total).toEqual({ amount: 186, count: 4 });
    expect(day.includedTransactions).toHaveLength(4);
  });
});

test.describe('Spending details — recurring history across months', () => {
  // The recurring-history query returns EVERY transaction in range; the near-identical summary
  // query returns only each spend's most recent. A copy-paste of the summary join into the history
  // repo would pass every single-month spec, so this pins the difference with a two-month range.
  test("a range spanning two months includes both of a spend's transactions", async ({ api }) => {
    await post(api, '/api/spending/recurring/add', {
      category: 'UTILITIES',
      recurringSpendName: 'Electric',
      expectedMonthlyAmount: 100,
      isVariableRecurring: true,
    });
    const summary = await getJson<RecurringSummaryResponse>(api, '/api/spending/recurring/summary');
    const spendId = summary.activeRecurringTransactions[0].recurringSpendId;

    // Creation already inserted the current-month transaction (100); fill in last month at 120.
    await post(api, '/api/spending/recurring/transactions/add', {
      recurringSpendId: spendId,
      amountSpent: 120,
      date: format(subMonths(new Date(), 1), 'yyyy-MM'),
    });

    const twoMonthRange = {
      startDate: format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'),
      endDate: range.endDate,
    };
    const details = await getJson<SpendingDetailsResponse>(api, '/api/spending/details', twoMonthRange);

    expect(details.recurringTransactionIdList).toHaveLength(2);
    expect(details.summary.recurringTotals).toEqual({ amount: 220, count: 2 });
    expect(details.summary.total).toEqual({ amount: 220, count: 2 });
  });
});

test.describe('Spending insights', () => {
  test('yearly-average is zero with no history', async ({ api }) => {
    const res = await getJson<YearlyAverageResponse>(api, '/api/spending/yearly-average');
    expect(res).toEqual({ monthlyAverage: 0, comparison: null });
  });

  test('history-start reports the earliest discretionary transaction date', async ({ api }) => {
    const earliest = ymd(startOfMonth(new Date()));
    await post(api, '/api/spending/discretionary/add', {
      category: 'GROCERIES',
      amountSpent: 10,
      spentDate: earliest,
      note: 'first',
    });

    const res = await getJson<HistoryStartResponse>(api, '/api/spending/history-start');
    expect(res.earliestDiscretionaryTransactionDate).toBe(earliest);
  });
});
