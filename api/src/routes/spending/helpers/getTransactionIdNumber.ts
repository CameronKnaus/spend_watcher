import { DiscretionaryTransactionId, RecurringTransactionId } from '../spending.model';

export default function getTransactionIdNumber(
  transactionId: DiscretionaryTransactionId | RecurringTransactionId,
): number {
  return parseInt(transactionId.split('-')[1]);
}
