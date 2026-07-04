import { queryAsync } from '@lib/queryAsync';
import { DbDate } from '@type/dateTypes';
import { formatDbDate } from '@utils/DateUtils/dateUtils';
import {
  RecurringTransaction,
  RecurringTransactionHistoryRow,
  SpendTransactionRow,
  Transaction,
} from './transactions.types';

// Returns domain `Transaction[]`, not SQL rows.
export async function findTransactions(username: string, startDate: DbDate, endDate: DbDate): Promise<Transaction[]> {
  const rows = await queryAsync<SpendTransactionRow[]>(
    'SELECT * FROM spend_transactions WHERE username = ? AND date BETWEEN ? AND ? ORDER BY date DESC',
    [username, startDate, endDate],
  );

  return rows.map((row) => ({
    transactionId: row.transaction_id,
    category: row.category,
    amount: row.amount,
    date: formatDbDate(new Date(row.date)),
    note: row.note,
    linkedTripId: row.linked_trip_id,
  }));
}

// Recurring transaction history over a date range: each active/inactive recurring spend joined to its
// transactions, filtered to the range. Ported from the legacy `fetchRecurringTransactionHistory`.
export async function findRecurringTransactions(
  username: string,
  startDate: DbDate,
  endDate: DbDate,
): Promise<RecurringTransaction[]> {
  const rows = await queryAsync<RecurringTransactionHistoryRow[]>(
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

  return rows.map((row) => ({
    transactionId: row.transaction_id,
    category: row.category,
    amount: row.amount,
    date: formatDbDate(new Date(row.date)),
  }));
}
