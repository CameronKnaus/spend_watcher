import { SpendingDetailsResponse } from '@spend-watcher/contract';
import { DiscretionaryHistoryRow, TotalsByCategory } from '../details.types';
import { RecurringSpendWithTransactionRow } from '../recurring.types';
import addToCategoryTotals from './addToCategoryTotals';
import { ratioOf } from './calcHelpers';
import formatTransactions from './formatTransactions';
import generateCategoryOverview from './generateCategoryOverview';
import mutateTransactionsByDate from './generateDateBreakdown';
import { addToSummary } from './generateSummary';
import initSummaryTotals from './initSummaryTotals';

// Builds the rich spending-details payload from raw discretionary + recurring history rows.
export default function spendingDetailsTransform(
  discretionaryTransactions: DiscretionaryHistoryRow[],
  recurringTransactions: RecurringSpendWithTransactionRow[],
): SpendingDetailsResponse {
  const { discretionaryTransactionIdList, recurringTransactionIdList, transactionDataList, transactionDictionary } =
    formatTransactions(discretionaryTransactions, recurringTransactions);

  const summary = initSummaryTotals();
  const totalsByCategory: TotalsByCategory = {};
  const transactionsByDate: SpendingDetailsResponse['transactionsByDate'] = {};

  transactionDataList.forEach((transaction) => {
    addToSummary(summary, transaction);
    addToCategoryTotals(totalsByCategory, transaction);
    mutateTransactionsByDate(transactionsByDate, transaction);
  });

  return {
    // Default sorted descending by amount.
    spendCategoryOverview: generateCategoryOverview(totalsByCategory, summary),
    // Lookup map so the rest of the response can reference transactions by id.
    transactionDictionary,
    spendTypeRatio: {
      discretionary: ratioOf(summary.discretionaryTotals.amount, summary.total.amount),
      recurring: ratioOf(summary.recurringTotals.amount, summary.total.amount),
    },
    summary,
    discretionaryTransactionIdList,
    recurringTransactionIdList,
    transactionsByDate,
  };
}
