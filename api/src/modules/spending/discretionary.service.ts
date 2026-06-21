import { AppInputs } from '@spend-watcher/contract';
import { deleteDiscretionary, insertDiscretionary, updateDiscretionary } from './discretionary.repository';
import { parseTransactionIdNumber } from './parseTransactionId';

type DiscretionaryAddInput = AppInputs['spending']['discretionaryAdd'];
type DiscretionaryEditInput = AppInputs['spending']['discretionaryEdit'];

export function addDiscretionary(username: string, input: DiscretionaryAddInput): Promise<void> {
  return insertDiscretionary(username, input);
}

export function editDiscretionary(username: string, input: DiscretionaryEditInput): Promise<void> {
  const { transactionId, ...details } = input;
  return updateDiscretionary(username, parseTransactionIdNumber(transactionId), details);
}

export function removeDiscretionary(username: string, transactionId: string): Promise<void> {
  return deleteDiscretionary(username, parseTransactionIdNumber(transactionId));
}
