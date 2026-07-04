import { SpendTransaction } from '@spend-watcher/contract';
import { TotalsByCategory } from '../details.types';
import { addTransactionTotals } from './calcHelpers';
import initSummaryTotals from './initSummaryTotals';

export default function addToCategoryTotals(totalsByCategory: TotalsByCategory, transaction: SpendTransaction) {
  const currentTotals = totalsByCategory[transaction.category] ?? initSummaryTotals();

  currentTotals.total = addTransactionTotals(currentTotals.total, transaction.amountSpent);

  if (transaction.isRecurring) {
    currentTotals.recurringTotals = addTransactionTotals(currentTotals.recurringTotals, transaction.amountSpent);
  } else {
    currentTotals.discretionaryTotals = addTransactionTotals(
      currentTotals.discretionaryTotals,
      transaction.amountSpent,
    );
  }

  totalsByCategory[transaction.category] = currentTotals;
}
