import db from '@lib/db';
import { SpendingCategory } from '@type/categoryTypes';
import { DbDate } from '@type/dateTypes';
import { v4 as uuid4 } from 'uuid';
import getTransactionIdNumber from './helpers/getTransactionIdNumber';
import {
  AddRecurringSpendRequestParams,
  AddRecurringTransactionRequestParams,
  DiscretionaryAddRequestParams,
  DiscretionaryEditRequestParams,
  DiscretionaryTransactionId,
  EditRecurringSpendRequestParams,
  EditRecurringTransactionRequestParams,
  SetActiveRecurringSpendRequestParams,
} from './spending.model';

export type DiscretionaryTransactionHistorySQLRow = {
  transaction_id: number;
  username: string;
  category: SpendingCategory;
  amount: number;
  uncommon: never; // currently unused
  is_custom_category: never; // currently unused
  date: string; // '2024-08-01T04:00:00.000Z'
  note: string | null;
  linked_trip_id: string | null;
};

export function fetchDiscretionarySpending(
  username: string,
  startDate: DbDate,
  endDate: DbDate,
): Promise<DiscretionaryTransactionHistorySQLRow[]> {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT * FROM spend_transactions WHERE username=? AND date between ? AND ? ORDER BY date DESC',
      [username, startDate, endDate],
      (error, rows) => {
        if (error) {
          reject(error);
        } else {
          resolve(rows);
        }
      },
    );
  });
}

// TODO: Does this service need all history included
export type RecurringTransactionHistorySQLRow = {
  amount: number; // The set average amount of a recurring transaction TODO: Name this average and make recurring spending be an average of your total spend over time
  category: SpendingCategory;
  date: string; // '2024-08-01T04:00:00.000Z' - The date of the this particular transaction
  is_active: 0 | 1;
  is_variable_recurring: 0 | 1; // 0 if the recurring spend is a fixed amount every month, 1 if it is a variable amount
  recurring_spend_id: string; // Id of the recurring spend that this transaction is associated with
  spend_name: string; // Name of the recurring spend that this transaction is associated with
  transaction_amount: number; // This is the actual amount of this particular transaction, not the average / expected amount of the recurring spend
  transaction_id: number; // The id of this particular transaction
  username: string;
};

export function fetchRecurringTransactionHistory(
  username: string,
  startDate: DbDate,
  endDate: DbDate,
): Promise<RecurringTransactionHistorySQLRow[]> {
  return new Promise((resolve, reject) => {
    const queryString = `SELECT RecurringExpenses.recurring_spend_id, username, category, spend_name, amount, is_variable_recurring, is_active, transaction_amount, date, transaction_id
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
        ON RecurringExpenses.recurring_spend_id = RecentTransactions.recurring_spend_id WHERE date BETWEEN ? AND ? ORDER BY amount DESC`;

    db.query(queryString, [username, startDate, endDate], (error, rows) => {
      if (error) {
        reject(error);
      } else {
        resolve(rows);
      }
    });
  });
}

export function logDiscretionaryTransaction(
  username: string,
  transactionDetails: DiscretionaryAddRequestParams,
): Promise<void> {
  return new Promise((resolve, reject) => {
    db.query(
      'INSERT INTO spend_transactions (username, category, amount, date, note, linked_trip_id) VALUES (?, ?, ?, ?, ?, ?)',
      [
        username,
        transactionDetails.category,
        transactionDetails.amountSpent,
        transactionDetails.spentDate,
        transactionDetails.note,
        transactionDetails.linkedTripId,
      ],
      (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      },
    );
  });
}

export function editDiscretionaryTransaction(
  username: string,
  transactionDetails: DiscretionaryEditRequestParams,
): Promise<void> {
  return new Promise((resolve, reject) => {
    db.query(
      `UPDATE spend_transactions SET category=?, amount=?, date=?, note=?, linked_trip_id=? WHERE username=? AND transaction_id=?`,
      [
        transactionDetails.category,
        transactionDetails.amountSpent,
        transactionDetails.spentDate,
        transactionDetails.note,
        transactionDetails.linkedTripId,
        username,
        getTransactionIdNumber(transactionDetails.transactionId),
      ],
      (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      },
    );
  });
}

export function deleteDiscretionaryTransaction(
  username: string,
  transactionId: DiscretionaryTransactionId,
): Promise<void> {
  return new Promise((resolve, reject) => {
    db.query(
      `DELETE FROM spend_transactions WHERE username=? AND transaction_id=?`,
      [username, getTransactionIdNumber(transactionId)],
      (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      },
    );
  });
}

export function updateFixedRecurringMonthlySpendData(username: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const queryString = 'CALL BackfillRecurringTransactions(?)';

    db.query(queryString, [username], (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

// Gives you details about all the recurring transactions that fall under the current month.
export function fetchRecurringTransactionsSummary(username: string): Promise<RecurringTransactionHistorySQLRow[]> {
  return new Promise((resolve, reject) => {
    const queryString = `SELECT RecurringExpenses.recurring_spend_id, username, category, spend_name, amount, is_variable_recurring, is_active, transaction_amount, date, transaction_id
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
        ON RecurringExpenses.recurring_spend_id = RecentTransactions.recurring_spend_id ORDER BY amount DESC`;

    db.query(queryString, [username, username], (error, rows) => {
      if (error) {
        reject(error);
      } else {
        resolve(rows);
      }
    });
  });
}

export async function addRecurringSpend(
  username: string,
  requestParams: AddRecurringSpendRequestParams,
): Promise<void> {
  await db.beginTransaction();
  try {
    const newSpendId = uuid4();
    const queryString = `
            INSERT INTO recurring_spending (recurring_spend_id, username, category, spend_name, amount, is_variable_recurring, is_active) VALUES (?, ?, ?, ?, ?, ?, TRUE);
            INSERT INTO recurring_transactions (recurring_spend_id, transaction_amount, date) VALUES (?, ?, DATE_SUB(NOW(), INTERVAL DAYOFMONTH(NOW())-1 DAY));
        `;
    await db.query(queryString, [
      newSpendId,
      username,
      requestParams.category,
      requestParams.recurringSpendName,
      requestParams.expectedMonthlyAmount,
      requestParams.isVariableRecurring,
      newSpendId,
      requestParams.expectedMonthlyAmount,
    ]);

    await db.commit();
  } catch (error) {
    await db.rollback();
    throw error;
  }
}

export async function editRecurringSpend(
  username: string,
  requestParams: EditRecurringSpendRequestParams,
): Promise<void> {
  // TODO: Update this month's transaction amount if the user is editing a fixed recurring spend's monthly amount
  const queryString =
    'UPDATE recurring_spending SET category=?, amount=?, spend_name=?, is_variable_recurring=? WHERE username=? AND recurring_spend_id=?;';
  await db.query(queryString, [
    requestParams.category,
    requestParams.expectedMonthlyAmount,
    requestParams.recurringSpendName,
    requestParams.isVariableRecurring,
    username,
    requestParams.recurringSpendId,
  ]);
}

export async function deleteRecurringTransaction(username: string, recurringSpendId: string): Promise<void> {
  await db.beginTransaction();
  try {
    const queryString = 'DELETE FROM recurring_spending WHERE username=? AND recurring_spend_id=?';
    await db.query(queryString, [username, recurringSpendId]);

    await db.commit();
  } catch (error) {
    await db.rollback();
    throw error;
  }
}

export async function updateRecurringSpendActiveStatus(
  username: string,
  requestParams: SetActiveRecurringSpendRequestParams,
) {
  const queryString = `UPDATE recurring_spending SET is_active=? WHERE username=? AND recurring_spend_id=?`;
  await db.query(queryString, [requestParams.isActive, username, requestParams.recurringSpendId]);
}

// A transaction tied to a recurring spend.
export type RecurringTransactionSQLRow = {
  transaction_id: number;
  transaction_amount: number;
  date: DbDate;
};

// TODO: Add username check to avoid possible collision with other users of the same uuid recurring_spend_id (unlikely but possible)
export async function fetchRecurringSpendTransactionsList(
  recurringSpendId: string,
): Promise<RecurringTransactionSQLRow[]> {
  return new Promise((resolve, reject) => {
    const queryString = `SELECT transaction_amount, date, transaction_id FROM recurring_transactions WHERE recurring_spend_id=? ORDER BY date DESC`;
    db.query(queryString, [recurringSpendId], (error, rows) => {
      if (error) {
        reject(error);
      } else {
        resolve(rows);
      }
    });
  });
}

// Edits a single transaction tied to a recurring spend.
export async function editRecurringTransaction(requestParams: EditRecurringTransactionRequestParams): Promise<void> {
  const queryString = `UPDATE recurring_transactions SET transaction_amount=? WHERE transaction_id=?`;

  await db.query(queryString, [requestParams.amountSpent, getTransactionIdNumber(requestParams.transactionId)]);
}

// Adds a single transaction tied to a recurring spend.
export async function addRecurringTransaction(requestParams: AddRecurringTransactionRequestParams): Promise<void> {
  const formattedDate = `${requestParams.date}-01`;

  const queryString =
    'INSERT INTO recurring_transactions (recurring_spend_id, transaction_amount, date) VALUES (?, ?, ?)';
  await db.query(queryString, [requestParams.recurringSpendId, requestParams.amountSpent, formattedDate]);
}

type TransactionMinMaxSQLRow = {
  min: string;
  max: string;
};

// Gets the min and max dates of a user's transactions. Allows for min / max dates for a datepicker for example
export function getTransactionsAvailableRange(username: string): Promise<TransactionMinMaxSQLRow> {
  return new Promise((resolve, reject) => {
    const queryString = 'SELECT MIN(date) as min, MAX(date) as max FROM spend_transactions WHERE username=?';
    db.query(queryString, [username], (error, rows) => {
      if (error) {
        reject(error);
      } else {
        resolve(rows[0]);
      }
    });
  });
}

type DiscretionaryMinDateSQLRow = {
  earliest_discretionary_transaction_date: string; // '2024-08-01T04:00:00.000Z'
};

export function getEarliestDiscretionaryTransactionDate(username: string): Promise<DiscretionaryMinDateSQLRow> {
  return new Promise((resolve, reject) => {
    const queryString =
      'SELECT MIN(date) as earliest_discretionary_transaction_date FROM spend_transactions WHERE username=?';
    db.query(queryString, [username], (error, rows) => {
      if (error) {
        reject(error);
      } else {
        resolve(rows[0]);
      }
    });
  });
}

type RecurringMinDateSQLRow = {
  earliest_recurring_transaction_date: string; // '2024-08-01T04:00:00.000Z'
};

export function getEarliestRecurringTransactionDate(username: string): Promise<RecurringMinDateSQLRow> {
  return new Promise((resolve, reject) => {
    const queryString = `
            SELECT MIN(transactions.date) as earliest_recurring_transaction_date
            FROM user_information.recurring_transactions AS transactions
            JOIN user_information.recurring_spending spending ON transactions.recurring_spend_id = spending.recurring_spend_id
            WHERE spending.username=?
        `;
    db.query(queryString, [username], (error, rows) => {
      if (error) {
        reject(error);
      } else {
        resolve(rows[0]);
      }
    });
  });
}
