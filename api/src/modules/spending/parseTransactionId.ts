// Turns a public, prefixed transaction id (`Discretionary-123` / `Recurring-123`) back into the
// raw numeric `transaction_id` the DB stores. The reverse of the `formatRecurringTransactionId` /
// `Discretionary-${id}` helpers.
export function parseTransactionIdNumber(transactionId: string): number {
  return Number(transactionId.split('-')[1]);
}
