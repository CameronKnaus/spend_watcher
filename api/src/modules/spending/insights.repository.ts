import { queryAsync } from '@lib/queryAsync';

type EarliestDiscretionaryDateRow = {
  /**  e.g. '2024-08-01T04:00:00.000Z' */
  earliest_discretionary_transaction_date: string;
};

// Earliest discretionary transaction date for a user, as the raw DB date string.
// Ported from `getEarliestDiscretionaryTransactionDate`.
export async function findEarliestDiscretionaryDate(username: string): Promise<string> {
  const rows = await queryAsync<EarliestDiscretionaryDateRow[]>(
    'SELECT MIN(date) as earliest_discretionary_transaction_date FROM spend_transactions WHERE username=?',
    [username],
  );

  return rows[0].earliest_discretionary_transaction_date;
}

type EarliestRecurringDateRow = {
  /**  e.g. '2024-08-01T04:00:00.000Z' */
  earliest_recurring_transaction_date: string;
};

// Earliest recurring transaction date for a user, as the raw DB date string.
// Ported from `getEarliestRecurringTransactionDate`.
export async function findEarliestRecurringDate(username: string): Promise<string> {
  const rows = await queryAsync<EarliestRecurringDateRow[]>(
    `SELECT MIN(transactions.date) as earliest_recurring_transaction_date
            FROM user_information.recurring_transactions AS transactions
            JOIN user_information.recurring_spending spending ON transactions.recurring_spend_id = spending.recurring_spend_id
            WHERE spending.username=?`,
    [username],
  );

  return rows[0].earliest_recurring_transaction_date;
}

type YearlyTotalsRow = {
  year: number;
  total_amount: number;
  months_with_data: number;
};

type YearlyTotal = {
  year: number;
  totalAmount: number;
  monthsWithData: number;
};

// Per-year spend totals (discretionary + recurring) for the current and previous calendar years,
// excluding the current in-progress month. Ported from `fetchYearlyMonthlyTotals`.
export async function findYearlyMonthlyTotals(
  username: string,
  currentYear: number,
  previousYear: number,
): Promise<YearlyTotal[]> {
  const rows = await queryAsync<YearlyTotalsRow[]>(
    `SELECT
        YEAR(date) AS year,
        SUM(amount) AS total_amount,
        COUNT(DISTINCT MONTH(date)) AS months_with_data
      FROM (
        SELECT date, amount
        FROM spend_transactions
        WHERE username = ?
          AND (
            (YEAR(date) = ? AND date < DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01'))
            OR YEAR(date) = ?
          )
        UNION ALL
        SELECT t.date, t.transaction_amount AS amount
        FROM user_information.recurring_transactions t
        JOIN user_information.recurring_spending s
          ON t.recurring_spend_id = s.recurring_spend_id
        WHERE s.username = ?
          AND (
            (YEAR(t.date) = ? AND t.date < DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01'))
            OR YEAR(t.date) = ?
          )
      ) combined
      GROUP BY YEAR(date)`,
    [username, currentYear, previousYear, username, currentYear, previousYear],
  );

  return rows.map((row) => ({
    year: Number(row.year),
    totalAmount: Number(row.total_amount),
    monthsWithData: Number(row.months_with_data),
  }));
}
