import { SpendGroupSummary, SpendingDetailsResponse, SpendTransaction } from '@spend-watcher/contract';
import { roundNumber } from './calcHelpers';

type TransactionsByDate = SpendingDetailsResponse['transactionsByDate'];

function initDaySpendRecord(): SpendGroupSummary {
  return {
    total: { amount: 0, count: 0 },
    recurringTotals: { amount: 0, count: 0 },
    discretionaryTotals: { amount: 0, count: 0 },
    includedTransactions: [],
  };
}

export default function mutateTransactionsByDate(
  transactionsByDate: TransactionsByDate,
  transaction: SpendTransaction,
) {
  const currentDateEntry = transactionsByDate[transaction.spentDate] || initDaySpendRecord();

  currentDateEntry.total.amount = roundNumber(currentDateEntry.total.amount + transaction.amountSpent);
  currentDateEntry.total.count++;

  if (transaction.isRecurring) {
    currentDateEntry.recurringTotals.amount = roundNumber(
      currentDateEntry.recurringTotals.amount + transaction.amountSpent,
    );
    currentDateEntry.recurringTotals.count++;
  } else {
    currentDateEntry.discretionaryTotals.amount = roundNumber(
      currentDateEntry.discretionaryTotals.amount + transaction.amountSpent,
    );
    currentDateEntry.discretionaryTotals.count++;
  }

  currentDateEntry.includedTransactions.push(transaction.transactionId);
  transactionsByDate[transaction.spentDate] = currentDateEntry;
}
