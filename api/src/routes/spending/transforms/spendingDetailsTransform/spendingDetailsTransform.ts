import { SpendingDetailsV1Response, TotalsByCategory, TransactionsByDate } from '@routes/spending/spending.model';
import { DiscretionaryTransactionHistorySQLRow, RecurringTransactionHistorySQLRow } from '../../spending.service';
import addToCategoryTotals from './addToCategoryTotals';
import formatTransactions from './formatTransactions';
import generateCategoryOverview from './generateCategoryOverview';
import mutateTransactionsByDate from './generateDateBreakdown';
import { addToSummary } from './generateSummary';
import initSummaryTotals from './initSummaryTotals';

export default function spendingDetailsTransform(
  discretionaryTransactions: DiscretionaryTransactionHistorySQLRow[],
  recurringTransactions: RecurringTransactionHistorySQLRow[],
): SpendingDetailsV1Response {
  const { discretionaryTransactionIdList, recurringTransactionIdList, transactionDataList, transactionDictionary } =
    formatTransactions(discretionaryTransactions, recurringTransactions);

  const summary = initSummaryTotals();
  const totalsByCategory: TotalsByCategory = {};
  const transactionsByDate: TransactionsByDate = {};

  // Iterate through all transactions and perform calculations
  transactionDataList.forEach((transaction) => {
    addToSummary(summary, transaction);
    addToCategoryTotals(totalsByCategory, transaction);

    mutateTransactionsByDate(transactionsByDate, transaction);
  });

  const discretionaryTotal = summary.discretionaryTotals.amount;
  const recurringTotal = summary.recurringTotals.amount;
  return {
    // Default sorted descending by discretionary amount
    spendCategoryOverview: generateCategoryOverview(totalsByCategory, summary),
    // Provides a way to get transaction information by ID, rather than duplicate transaction entries many times
    transactionDictionary,
    spendTypeRatio: {
      discretionary: discretionaryTotal / summary.total.amount,
      recurring: recurringTotal / summary.total.amount,
    },
    summary,
    discretionaryTransactionIdList,
    recurringTransactionIdList,
    transactionsByDate,
  };
}
