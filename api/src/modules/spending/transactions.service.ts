import { DbDate } from '@type/dateTypes';
import { findTransactions } from './transactions.repository';
import { Transaction } from './transactions.types';

// The service never imports `@lib/db` — all DB access goes through the repository.
export function getTransactions(username: string, startDate: DbDate, endDate: DbDate): Promise<Transaction[]> {
  return findTransactions(username, startDate, endDate);
}
