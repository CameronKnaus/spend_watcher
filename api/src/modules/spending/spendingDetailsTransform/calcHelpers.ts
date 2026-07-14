import { TransactionTotal, TransactionTotalWithPercentage } from '@spend-watcher/contract';

// Rounds to (by default) 2 decimal places.
export function roundNumber(givenNumber: number, decimalPlaces = 2): number {
  const pow = 10 ** decimalPlaces;
  return Math.round(givenNumber * pow) / pow;
}

// A range can have zero transactions of a given kind (e.g. no discretionary spends yet this
// month), so 0/0 must become 0 — the contract's output validation rejects NaN.
export function percentageOf(part: number, total: number): number {
  return total === 0 ? 0 : roundNumber((part / total) * 100);
}

export function ratioOf(part: number, total: number): number {
  return total === 0 ? 0 : part / total;
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
