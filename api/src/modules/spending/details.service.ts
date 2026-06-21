import { SpendingDetailsResponse } from '@spend-watcher/contract';
import { DbDate } from '@type/dateTypes';
import { findDiscretionaryHistory, findRecurringHistory } from './details.repository';
import { backfillRecurringTransactions } from './recurring.repository';
import spendingDetailsTransform from './spendingDetailsTransform/spendingDetailsTransform';

// The backfill write-on-read must run first so this month's fixed recurring transactions exist
// before the read aggregates them (mirrors the legacy /spending/v1/details behavior).
export async function getSpendingDetails(
  username: string,
  startDate: DbDate,
  endDate: DbDate,
): Promise<SpendingDetailsResponse> {
  await backfillRecurringTransactions(username);

  const [discretionary, recurring] = await Promise.all([
    findDiscretionaryHistory(username, startDate, endDate),
    findRecurringHistory(username, startDate, endDate),
  ]);

  return spendingDetailsTransform(discretionary, recurring);
}
