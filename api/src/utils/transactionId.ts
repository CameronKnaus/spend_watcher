import { DiscretionaryTransactionId, RecurringTransactionId } from '@spend-watcher/contract';

export function formatRecurringTransactionId(transactionId: number): RecurringTransactionId {
  return `Recurring-${transactionId}`;
}

export function formatDiscretionaryTransactionId(transactionId: number): DiscretionaryTransactionId {
  return `Discretionary-${transactionId}`;
}

// Turns a public, prefixed transaction id (`Discretionary-123` / `Recurring-123`) back into the
// raw numeric `transaction_id` the DB stores. The reverse of the format helpers above.
export function parseTransactionIdNumber(transactionId: string): number {
  return Number(transactionId.split('-')[1]);
}
