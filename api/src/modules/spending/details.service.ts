import { SpendingDetailsResponse } from '@spend-watcher/contract';
import { DbDate } from '@type/dateTypes';
import { findDiscretionaryHistory, findRecurringHistory } from './details.repository';
import spendingDetailsTransform from './spendingDetailsTransform/spendingDetailsTransform';

export async function getSpendingDetails(
  username: string,
  startDate: DbDate,
  endDate: DbDate,
): Promise<SpendingDetailsResponse> {
  const [discretionary, recurring] = await Promise.all([
    findDiscretionaryHistory(username, startDate, endDate),
    findRecurringHistory(username, startDate, endDate),
  ]);

  return spendingDetailsTransform(discretionary, recurring);
}
