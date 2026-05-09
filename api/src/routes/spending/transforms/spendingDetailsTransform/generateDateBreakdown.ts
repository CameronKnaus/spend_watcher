import { SpendGroupSummary, SpendTransaction, TransactionsByDate } from '@routes/spending/spending.model';
import roundNumber from '@utils/CalculationHelpers/roundNumber';

function initDaySpendRecord(): SpendGroupSummary {
  return {
    total: {
      amount: 0,
      count: 0,
    },
    recurringTotals: {
      amount: 0,
      count: 0,
    },
    discretionaryTotals: {
      amount: 0,
      count: 0,
    },
    includedTransactions: [],
  };
}

export default function mutateTransactionsByDate(
  transactionsByDate: TransactionsByDate,
  transaction: SpendTransaction,
) {
  const currentDateEntry = transactionsByDate[transaction.spentDate] || initDaySpendRecord();

  // Grand total
  currentDateEntry.total.amount = roundNumber(currentDateEntry.total.amount + transaction.amountSpent);
  currentDateEntry.total.count++;

  // Recurring vs discretionary
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

  // Add identifier as a way to look up transaction information included in this summary
  currentDateEntry.includedTransactions.push(transaction.transactionId);
  transactionsByDate[transaction.spentDate] = currentDateEntry;
}
