import { queryAsync } from '@lib/queryAsync';
import { DbDate } from '@type/dateTypes';
import { formatDbDate } from '@utils/DateUtils/dateUtils';
import { SpendTransactionRow, Transaction } from './transactions.types';

// Maps a raw MySQL row to the camelCase domain shape. Keeping this here means the snake_case
// column names (`transaction_id`, `linked_trip_id`, ...) never escape the repository layer.
function toTransaction(row: SpendTransactionRow): Transaction {
  return {
    transactionId: row.transaction_id,
    category: row.category,
    amount: row.amount,
    date: formatDbDate(new Date(row.date)),
    note: row.note,
    linkedTripId: row.linked_trip_id,
  };
}

// Returns domain `Transaction[]`, not SQL rows.
export async function findTransactions(username: string, startDate: DbDate, endDate: DbDate): Promise<Transaction[]> {
  const rows = await queryAsync<SpendTransactionRow[]>(
    'SELECT * FROM spend_transactions WHERE username = ? AND date BETWEEN ? AND ? ORDER BY date DESC',
    [username, startDate, endDate],
  );

  return rows.map(toTransaction);
}
