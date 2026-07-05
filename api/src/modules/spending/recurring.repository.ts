import { queryAsync, queryTransactionAsync } from '@lib/queryAsync';
import { AppInputs, RecurringSpendTransaction, RecurringTransactionsListResponse } from '@spend-watcher/contract';
import { DbDate, MonthYearDbDate } from '@type/dateTypes';
import { formatRecurringTransactionId } from '@utils/transactionId';
import { format, formatISO } from 'date-fns';
import { v4 as uuid4 } from 'uuid';
import { RecurringSpendTransactionRow, RecurringSpendWithTransactionRow } from './recurring.types';

type RecurringSpendAddInput = AppInputs['spending']['recurringSpendAdd'];
type RecurringSpendEditInput = AppInputs['spending']['recurringSpendEdit'];

// Maps a raw recurring spend+transaction row to the camelCase domain shape, so snake_case never
// leaks past the repository. Also used by the details transform, whose repo returns the same row
// shape. A spend "requires a monthly update" when its most recent transaction isn't in the current month.
export function toRecurringSpendTransaction(row: RecurringSpendWithTransactionRow): RecurringSpendTransaction {
  const currentMonth = format(new Date(), 'MM-yyyy');
  const lastUpdatedMonth = format(row.date, 'MM-yyyy');
  const requiresMonthlyUpdate = currentMonth !== lastUpdatedMonth;

  return {
    isRecurring: true,
    transactionId: formatRecurringTransactionId(row.transaction_id),
    category: row.category,
    amountSpent: row.transaction_amount,
    spentDate: formatISO(row.date, { representation: 'date' }) as DbDate,
    expectedMonthlyAmount: row.amount,
    recurringSpendName: row.spend_name,
    recurringSpendId: row.recurring_spend_id,
    isVariableRecurring: Boolean(row.is_variable_recurring),
    isActive: Boolean(row.is_active),
    requiresMonthlyUpdate,
  };
}

// Stored-proc write: fills in any missing fixed-recurring transactions from each spend's first
// transaction month through the current month.
export async function backfillRecurringTransactions(username: string): Promise<void> {
  await queryAsync('CALL BackfillRecurringTransactions(?)', [username]);
}

// Recurring spend summary: each recurring spend joined to its single most-recent transaction.
// Ported from the legacy `fetchRecurringTransactionsSummary`.
export async function findRecurringSummary(username: string): Promise<RecurringSpendTransaction[]> {
  const rows = await queryAsync<RecurringSpendWithTransactionRow[]>(
    `SELECT RecurringExpenses.recurring_spend_id, category, spend_name, amount, is_variable_recurring, is_active, transaction_amount, date, transaction_id
        FROM ( SELECT * FROM user_information.recurring_spending WHERE username=?) AS RecurringExpenses
        JOIN (
            SELECT * FROM user_information.recurring_transactions AS A
            INNER JOIN (
                SELECT recurring_spend_id AS recurringSpendMaxId, MAX(date) AS maxDate
                FROM user_information.recurring_transactions
                GROUP BY recurring_spend_id
            ) AS B
            ON A.recurring_spend_id = B.recurringSpendMaxId AND A.date = B.maxDate
        ) AS RecentTransactions
        ON RecurringExpenses.recurring_spend_id = RecentTransactions.recurring_spend_id ORDER BY amount DESC`,
    [username],
  );

  return rows.map(toRecurringSpendTransaction);
}

type RecurringTransactionListItem = RecurringTransactionsListResponse['transactions'][number];

// Maps a raw single recurring transaction to the list domain shape. `date` is reduced to YYYY-MM
// (legacy behavior) and the id is prefixed.
function toRecurringTransactionListItem(row: RecurringSpendTransactionRow): RecurringTransactionListItem {
  return {
    transactionId: formatRecurringTransactionId(row.transaction_id),
    date: format(row.date, 'yyyy-MM') as MonthYearDbDate,
    amountSpent: row.transaction_amount,
  };
}

// All transactions tied to a given recurring spend. `recurring_transactions` has no username
// column, so ownership is enforced by joining to the parent `recurring_spending` and filtering on
// its username — without this a caller could read another user's history by supplying their
// (guessable, integer-derived) recurringSpendId.
export async function findRecurringTransactionsList(
  username: string,
  recurringSpendId: string,
): Promise<RecurringTransactionListItem[]> {
  const rows = await queryAsync<RecurringSpendTransactionRow[]>(
    `SELECT rt.transaction_amount, rt.date, rt.transaction_id
        FROM recurring_transactions AS rt
        JOIN recurring_spending AS rs ON rt.recurring_spend_id = rs.recurring_spend_id
        WHERE rt.recurring_spend_id=? AND rs.username=?
        ORDER BY rt.date DESC`,
    [recurringSpendId, username],
  );

  return rows.map(toRecurringTransactionListItem);
}

// Creates a recurring spend plus its first transaction for the current month, in one transaction
// so a failed second insert can't leave a spend with no transactions.
export async function insertRecurringSpend(username: string, input: RecurringSpendAddInput): Promise<void> {
  const newSpendId = uuid4();
  await queryTransactionAsync([
    {
      sql: 'INSERT INTO recurring_spending (recurring_spend_id, username, category, spend_name, amount, is_variable_recurring, is_active) VALUES (?, ?, ?, ?, ?, ?, TRUE)',
      params: [
        newSpendId,
        username,
        input.category,
        input.recurringSpendName,
        input.expectedMonthlyAmount,
        input.isVariableRecurring,
      ],
    },
    {
      sql: 'INSERT INTO recurring_transactions (recurring_spend_id, transaction_amount, date) VALUES (?, ?, DATE_SUB(NOW(), INTERVAL DAYOFMONTH(NOW())-1 DAY))',
      params: [newSpendId, input.expectedMonthlyAmount],
    },
  ]);
}

export async function updateRecurringSpend(username: string, input: RecurringSpendEditInput): Promise<void> {
  await queryAsync(
    'UPDATE recurring_spending SET category=?, amount=?, spend_name=?, is_variable_recurring=? WHERE username=? AND recurring_spend_id=?',
    [
      input.category,
      input.expectedMonthlyAmount,
      input.recurringSpendName,
      input.isVariableRecurring,
      username,
      input.recurringSpendId,
    ],
  );
}

export async function deleteRecurringSpend(username: string, recurringSpendId: string): Promise<void> {
  await queryAsync('DELETE FROM recurring_spending WHERE username=? AND recurring_spend_id=?', [
    username,
    recurringSpendId,
  ]);
}

export async function updateRecurringActiveStatus(
  username: string,
  recurringSpendId: string,
  isActive: boolean,
): Promise<void> {
  await queryAsync('UPDATE recurring_spending SET is_active=? WHERE username=? AND recurring_spend_id=?', [
    isActive,
    username,
    recurringSpendId,
  ]);
}

// `monthYearDate` is a `yyyy-MM` string; the DB stores the first of the month. The INSERT..SELECT
// only produces a row when the target spend belongs to `username`, so a caller can't graft a
// transaction onto another user's recurring spend.
export async function insertRecurringTransaction(
  username: string,
  recurringSpendId: string,
  amountSpent: number,
  monthYearDate: string,
): Promise<void> {
  await queryAsync(
    `INSERT INTO recurring_transactions (recurring_spend_id, transaction_amount, date)
        SELECT ?, ?, ? FROM recurring_spending WHERE recurring_spend_id=? AND username=?`,
    [recurringSpendId, amountSpent, `${monthYearDate}-01`, recurringSpendId, username],
  );
}

// Scoped through the parent `recurring_spending` so a caller can only edit transactions on spends
// they own — `transaction_id` is a guessable auto-increment int, so filtering on it alone would let
// anyone rewrite another user's amounts.
export async function updateRecurringTransaction(
  username: string,
  transactionId: number,
  amountSpent: number,
): Promise<void> {
  await queryAsync(
    `UPDATE recurring_transactions AS rt
        JOIN recurring_spending AS rs ON rt.recurring_spend_id = rs.recurring_spend_id
        SET rt.transaction_amount=?
        WHERE rt.transaction_id=? AND rs.username=?`,
    [amountSpent, transactionId, username],
  );
}
