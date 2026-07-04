import {
  CategoryDetails,
  SpendCategoryOverview,
  SpendingCategory,
  SummaryTotals,
  TransactionTotalWithPercentage,
} from '@spend-watcher/contract';
import { TotalsByCategory } from '../details.types';
import { initTransactionTotalWithPercentage, roundNumber } from './calcHelpers';

// Returns a list of category details sorted by amount spent, plus top-four / remaining rollups.
export default function generateCategoryOverview(
  totalsByCategory: TotalsByCategory,
  summary: SummaryTotals,
): SpendCategoryOverview {
  const totalAmount = summary.total.amount;
  const totalCount = summary.total.count;
  const discretionaryTotal = summary.discretionaryTotals.amount;
  const discretionaryTotalCount = summary.discretionaryTotals.count;
  const recurringTotal = summary.recurringTotals.amount;
  const recurringTotalCount = summary.recurringTotals.count;
  let categoriesWithTransactionsCount = 0;
  let categoriesWithDiscretionaryTransactionsCount = 0;
  let categoriesWithRecurringTransactionsCount = 0;

  const categoryDetailsList: CategoryDetails[] = Object.entries(totalsByCategory).map(([category, categoryTotals]) => {
    if (categoryTotals.total.count > 0) {
      categoriesWithTransactionsCount++;
    }

    if (categoryTotals.discretionaryTotals.count > 0) {
      categoriesWithDiscretionaryTransactionsCount++;
    }

    if (categoryTotals.recurringTotals.count > 0) {
      categoriesWithRecurringTransactionsCount++;
    }

    return {
      category: category as SpendingCategory,
      combinedTotals: {
        amount: categoryTotals.total.amount,
        count: categoryTotals.total.count,
        percentageOfTotalAmount: roundNumber((categoryTotals.total.amount / totalAmount) * 100),
        percentageOfTotalCount: roundNumber((categoryTotals.total.count / totalCount) * 100),
      },
      discretionaryTotals: {
        amount: categoryTotals.discretionaryTotals.amount,
        count: categoryTotals.discretionaryTotals.count,
        percentageOfTotalAmount: roundNumber((categoryTotals.discretionaryTotals.amount / discretionaryTotal) * 100),
        percentageOfTotalCount: roundNumber((categoryTotals.discretionaryTotals.count / discretionaryTotalCount) * 100),
      },
      recurringTotals: {
        amount: categoryTotals.recurringTotals.amount,
        count: categoryTotals.recurringTotals.count,
        percentageOfTotalAmount: roundNumber((categoryTotals.recurringTotals.amount / recurringTotal) * 100),
        percentageOfTotalCount: roundNumber((categoryTotals.recurringTotals.count / recurringTotalCount) * 100),
      },
    };
  });

  // Top four categories by recurring amount.
  const topFourRecurringTotals: TransactionTotalWithPercentage = categoryDetailsList
    .sort((a, b) => b.recurringTotals.amount - a.recurringTotals.amount)
    .slice(0, 4)
    .reduce(
      (acc, category) => ({
        amount: roundNumber(acc.amount + category.recurringTotals.amount),
        count: roundNumber(acc.count + category.recurringTotals.count),
        percentageOfTotalAmount: roundNumber(
          acc.percentageOfTotalAmount + category.recurringTotals.percentageOfTotalAmount,
        ),
        percentageOfTotalCount: roundNumber(
          acc.percentageOfTotalCount + category.recurringTotals.percentageOfTotalCount,
        ),
      }),
      initTransactionTotalWithPercentage(),
    );

  // Top four categories by discretionary amount.
  const topFourDiscretionaryTotals: TransactionTotalWithPercentage = categoryDetailsList
    .sort((a, b) => b.discretionaryTotals.amount - a.discretionaryTotals.amount)
    .slice(0, 4)
    .reduce(
      (acc, category) => ({
        amount: roundNumber(acc.amount + category.discretionaryTotals.amount),
        count: roundNumber(acc.count + category.discretionaryTotals.count),
        percentageOfTotalAmount: roundNumber(
          acc.percentageOfTotalAmount + category.discretionaryTotals.percentageOfTotalAmount,
        ),
        percentageOfTotalCount: roundNumber(
          acc.percentageOfTotalCount + category.discretionaryTotals.percentageOfTotalCount,
        ),
      }),
      initTransactionTotalWithPercentage(),
    );

  // Top four categories by combined amount.
  const topFourTotals: TransactionTotalWithPercentage = categoryDetailsList
    .sort((a, b) => b.combinedTotals.amount - a.combinedTotals.amount)
    .slice(0, 4)
    .reduce(
      (acc, category) => ({
        amount: roundNumber(acc.amount + category.combinedTotals.amount),
        count: roundNumber(acc.count + category.combinedTotals.count),
        percentageOfTotalAmount: roundNumber(
          acc.percentageOfTotalAmount + category.combinedTotals.percentageOfTotalAmount,
        ),
        percentageOfTotalCount: roundNumber(
          acc.percentageOfTotalCount + category.combinedTotals.percentageOfTotalCount,
        ),
      }),
      initTransactionTotalWithPercentage(),
    );

  return {
    categoryDetailsList,
    categoriesWithTransactionsCount,
    categoriesWithDiscretionaryTransactionsCount,
    categoriesWithRecurringTransactionsCount,
    topFourCombinedTotals: topFourTotals,
    remainingCombinedTotals: {
      amount: roundNumber(totalAmount - topFourTotals.amount),
      count: roundNumber(totalCount - topFourTotals.count),
      percentageOfTotalAmount: roundNumber(100 - topFourTotals.percentageOfTotalAmount),
      percentageOfTotalCount: roundNumber(100 - topFourTotals.percentageOfTotalCount),
    },
    topFourDiscretionaryTotals,
    remainingDiscretionaryTotals: {
      amount: roundNumber(discretionaryTotal - topFourDiscretionaryTotals.amount),
      count: roundNumber(discretionaryTotalCount - topFourDiscretionaryTotals.count),
      percentageOfTotalAmount: roundNumber(100 - topFourDiscretionaryTotals.percentageOfTotalAmount),
      percentageOfTotalCount: roundNumber(100 - topFourDiscretionaryTotals.percentageOfTotalCount),
    },
    topFourRecurringTotals,
    remainingRecurringTotals: {
      amount: roundNumber(recurringTotal - topFourRecurringTotals.amount),
      count: roundNumber(recurringTotalCount - topFourRecurringTotals.count),
      percentageOfTotalAmount: roundNumber(100 - topFourRecurringTotals.percentageOfTotalAmount),
      percentageOfTotalCount: roundNumber(100 - topFourRecurringTotals.percentageOfTotalCount),
    },
  };
}
