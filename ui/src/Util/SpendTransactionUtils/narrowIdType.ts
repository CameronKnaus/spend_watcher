import { DiscretionaryTransactionId, RecurringTransactionId, TransactionId } from 'Types/Services/spending.model';

// Define a type predicate to check if the ID is a RecurringTransactionId
export function isRecurringTransactionId(transactionId: TransactionId): transactionId is RecurringTransactionId {
  return transactionId.startsWith('Recurring-');
}

export function isDiscretionaryTransactionId(
  transactionId: TransactionId,
): transactionId is DiscretionaryTransactionId {
  return transactionId.startsWith('Discretionary-');
}

// Use this utility to narrow down and determine the type of a given transaction ID
export function narrowIdType(transactionId: TransactionId): DiscretionaryTransactionId | RecurringTransactionId {
  if (isRecurringTransactionId(transactionId)) {
    return transactionId;
  }

  return transactionId as DiscretionaryTransactionId;
}
