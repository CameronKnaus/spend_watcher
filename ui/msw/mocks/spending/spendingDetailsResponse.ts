import { SpendingCategory, type SpendingDetailsResponse } from '@spend-watcher/contract';

const zeroPct = { amount: 0, count: 0, percentageOfTotalAmount: 0, percentageOfTotalCount: 0 };

const summary = {
  total: { amount: 186, count: 4 },
  discretionaryTotals: { amount: 126, count: 3 },
  recurringTotals: { amount: 60, count: 1 },
};

/**
 * Spending details mirroring the seed: GROCERIES $86, UTILITIES $60 (recurring), RESTAURANTS $25,
 * ENTERTAINMENT $15. Combined = $186 / 4 txns; discretionary = $126 / 3; recurring = $60 / 1.
 * Categories are intentionally NOT pre-sorted so tests can verify the component's descending sort.
 */
export const spendingDetailsResponse = {
  spendCategoryOverview: {
    categoriesWithTransactionsCount: 4,
    categoriesWithDiscretionaryTransactionsCount: 3,
    categoriesWithRecurringTransactionsCount: 1,
    categoryDetailsList: [
      {
        category: SpendingCategory.RESTAURANTS,
        combinedTotals: { amount: 25, count: 1, percentageOfTotalAmount: 13, percentageOfTotalCount: 25 },
        discretionaryTotals: { amount: 25, count: 1, percentageOfTotalAmount: 20, percentageOfTotalCount: 33 },
        recurringTotals: zeroPct,
      },
      {
        category: SpendingCategory.GROCERIES,
        combinedTotals: { amount: 86, count: 1, percentageOfTotalAmount: 46, percentageOfTotalCount: 25 },
        discretionaryTotals: { amount: 86, count: 1, percentageOfTotalAmount: 68, percentageOfTotalCount: 33 },
        recurringTotals: zeroPct,
      },
      {
        category: SpendingCategory.UTILITIES,
        combinedTotals: { amount: 60, count: 1, percentageOfTotalAmount: 32, percentageOfTotalCount: 25 },
        discretionaryTotals: zeroPct,
        recurringTotals: { amount: 60, count: 1, percentageOfTotalAmount: 100, percentageOfTotalCount: 100 },
      },
      {
        category: SpendingCategory.ENTERTAINMENT,
        combinedTotals: { amount: 15, count: 1, percentageOfTotalAmount: 8, percentageOfTotalCount: 25 },
        discretionaryTotals: { amount: 15, count: 1, percentageOfTotalAmount: 12, percentageOfTotalCount: 33 },
        recurringTotals: zeroPct,
      },
    ],
    topFourCombinedTotals: { ...summary.total, percentageOfTotalAmount: 100, percentageOfTotalCount: 100 },
    remainingCombinedTotals: zeroPct,
    topFourDiscretionaryTotals: {
      ...summary.discretionaryTotals,
      percentageOfTotalAmount: 100,
      percentageOfTotalCount: 100,
    },
    remainingDiscretionaryTotals: zeroPct,
    topFourRecurringTotals: { ...summary.recurringTotals, percentageOfTotalAmount: 100, percentageOfTotalCount: 100 },
    remainingRecurringTotals: zeroPct,
  },
  transactionDictionary: {},
  spendTypeRatio: { discretionary: 126, recurring: 60 },
  summary,
  discretionaryTransactionIdList: [],
  recurringTransactionIdList: [],
  transactionsByDate: {},
} satisfies SpendingDetailsResponse;
