import { SpendTransaction, TotalsByCategory } from '@routes/spending/spending.model';
import addTransactionTotals from '@utils/CalculationHelpers/addTransactionTotals';
import initSummaryTotals from './initSummaryTotals';

export default function addToCategoryTotals(totalsByCategory: TotalsByCategory, transaction: SpendTransaction) {
  const currentTotals = totalsByCategory[transaction.category] ?? initSummaryTotals();

  currentTotals.total = addTransactionTotals(currentTotals.total, transaction.amountSpent);

  // Add to discretionary or recurring total
  if (transaction.isRecurring) {
    currentTotals.recurringTotals = addTransactionTotals(currentTotals.recurringTotals, transaction.amountSpent);
  } else {
    currentTotals.discretionaryTotals = addTransactionTotals(
      currentTotals.discretionaryTotals,
      transaction.amountSpent,
    );
  }

  // Ensure data is set back to original object
  totalsByCategory[transaction.category] = currentTotals;
}
