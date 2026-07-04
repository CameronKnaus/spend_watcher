import { SpendTransaction, SummaryTotals } from '@spend-watcher/contract';
import { roundNumber } from './calcHelpers';

// `summaryTotals` is mutated in place.
export function addToSummary(summaryTotals: SummaryTotals, transaction: SpendTransaction) {
  summaryTotals.total.amount = roundNumber(summaryTotals.total.amount + transaction.amountSpent);
  summaryTotals.total.count++;

  if (transaction.isRecurring) {
    summaryTotals.recurringTotals.amount = roundNumber(summaryTotals.recurringTotals.amount + transaction.amountSpent);
    summaryTotals.recurringTotals.count++;
  } else {
    summaryTotals.discretionaryTotals.amount = roundNumber(
      summaryTotals.discretionaryTotals.amount + transaction.amountSpent,
    );
    summaryTotals.discretionaryTotals.count++;
  }
}
