import { DiscretionaryTransactionId } from '../spending.model';

export default function formatDiscretionaryTransactionId(transactionId: number): DiscretionaryTransactionId {
  return `Discretionary-${transactionId}`;
}
