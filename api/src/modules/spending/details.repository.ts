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

// Each recurring spend joined to its most-recent transaction, filtered to the range.
export function findRecurringHistory(
  username: string,
  startDate: DbDate,
  endDate: DbDate,
): Promise<RecurringHistoryRow[]> {
  return queryAsync<RecurringHistoryRow[]>(
    `SELECT RecurringExpenses.recurring_spend_id, username, category, spend_name, amount, is_variable_recurring, is_active, transaction_amount, date, transaction_id
        FROM ( SELECT * FROM user_information.recurring_spending WHERE username=?) AS RecurringExpenses
        JOIN (
            SELECT * FROM user_information.recurring_transactions AS A
            INNER JOIN (
                SELECT recurring_spend_id AS recurringSpendMaxId
                FROM user_information.recurring_transactions
                GROUP BY recurring_spend_id
            ) AS B
            ON A.recurring_spend_id = B.recurringSpendMaxId
        ) AS RecentTransactions
        ON RecurringExpenses.recurring_spend_id = RecentTransactions.recurring_spend_id WHERE date BETWEEN ? AND ? ORDER BY amount DESC`,
    [username, startDate, endDate],
  );
}
