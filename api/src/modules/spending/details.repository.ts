import { queryAsync } from '@lib/queryAsync';
import { DbDate } from '@type/dateTypes';
import { DiscretionaryHistoryRow, RecurringHistoryRow } from './details.types';

// All discretionary transactions in the range, as raw rows for the details transform.
export function findDiscretionaryHistory(
  username: string,
  startDate: DbDate,
  endDate: DbDate,
): Promise<DiscretionaryHistoryRow[]> {
  return queryAsync<DiscretionaryHistoryRow[]>(
    'SELECT * FROM spend_transactions WHERE username = ? AND date BETWEEN ? AND ? ORDER BY date DESC',
    [username, startDate, endDate],
  );
}

// Every recurring transaction in the range, joined to its parent spend's metadata.
export function findRecurringHistory(
  username: string,
  startDate: DbDate,
  endDate: DbDate,
): Promise<RecurringHistoryRow[]> {
  return queryAsync<RecurringHistoryRow[]>(
    `SELECT spending.recurring_spend_id, category, spend_name, amount, is_variable_recurring, is_active, transaction_amount, date, transaction_id
        FROM user_information.recurring_spending AS spending
        JOIN user_information.recurring_transactions AS transactions
            ON spending.recurring_spend_id = transactions.recurring_spend_id
        WHERE spending.username = ? AND transactions.date BETWEEN ? AND ?
        ORDER BY amount DESC`,
    [username, startDate, endDate],
  );
}
