import { TransactionTotal } from '@routes/spending/spending.model';
import initTransactionTotal from './initTransactionTotal';
import roundNumber from './roundNumber';

// Increases the running total count by one and adds the given amount to the running total amount
export default function addTransactionTotals(runningTotals: TransactionTotal, addedAmount: number): TransactionTotal {
  if (!runningTotals) {
    return initTransactionTotal();
  }

  return {
    // Increase the running count of transactions
    count: runningTotals.count + 1,
    amount: roundNumber(runningTotals.amount + addedAmount),
  };
}
