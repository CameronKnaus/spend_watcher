import { TransactionTotal, TransactionTotalWithPercentage } from '@spend-watcher/contract';

// Rounds to (by default) 2 decimal places.
export function roundNumber(givenNumber: number, decimalPlaces = 2): number {
  const pow = 10 ** decimalPlaces;
  return Math.round(givenNumber * pow) / pow;
}

export function initTransactionTotal(): TransactionTotal {
  return { amount: 0, count: 0 };
}

export function initTransactionTotalWithPercentage(): TransactionTotalWithPercentage {
  return { amount: 0, count: 0, percentageOfTotalAmount: 0, percentageOfTotalCount: 0 };
}

// Increases the running count by one and adds the amount to the running total.
export function addTransactionTotals(runningTotals: TransactionTotal, addedAmount: number): TransactionTotal {
  if (!runningTotals) {
    return initTransactionTotal();
  }

  return {
    count: runningTotals.count + 1,
    amount: roundNumber(runningTotals.amount + addedAmount),
  };
}
