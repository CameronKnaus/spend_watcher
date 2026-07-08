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

type RangeTotalsRow = {
  discretionary_total: string | null;
  recurring_total: string | null;
};

export type SpendRangeTotals = {
  discretionary: number;
  recurring: number;
};

// Combined discretionary + recurring spend totals inside a closed date range.
export async function findSpendTotalsInRange(
  username: string,
  startDate: string,
  endDate: string,
): Promise<SpendRangeTotals> {
  const rows = await queryAsync<RangeTotalsRow[]>(
    `SELECT
        SUM(CASE WHEN source = 'discretionary' THEN amount ELSE 0 END) AS discretionary_total,
        SUM(CASE WHEN source = 'recurring' THEN amount ELSE 0 END) AS recurring_total
      FROM (
        SELECT 'discretionary' AS source, amount, date
        FROM spend_transactions
        WHERE username = ? AND date BETWEEN ? AND ?
        UNION ALL
        SELECT 'recurring' AS source, t.transaction_amount AS amount, t.date
        FROM user_information.recurring_transactions t
        JOIN user_information.recurring_spending s
          ON t.recurring_spend_id = s.recurring_spend_id
        WHERE s.username = ? AND t.date BETWEEN ? AND ?
      ) combined`,
    [username, startDate, endDate, username, startDate, endDate],
  );

  return {
    discretionary: Number(rows[0]?.discretionary_total ?? 0),
    recurring: Number(rows[0]?.recurring_total ?? 0),
  };
}

type DailyTotalRow = {
  day: string;
  daily_total: string;
};

export type DailySpendTotal = {
  date: string;
  amount: number;
};

// Per-day discretionary totals inside a closed date range. Days with no transactions are absent —
// the service zero-fills.
export async function findDiscretionaryDailyTotals(
  username: string,
  startDate: string,
  endDate: string,
): Promise<DailySpendTotal[]> {
  const rows = await queryAsync<DailyTotalRow[]>(
    `SELECT DATE_FORMAT(date, '%Y-%m-%d') AS day, SUM(amount) AS daily_total
      FROM spend_transactions
      WHERE username = ? AND date BETWEEN ? AND ?
      GROUP BY day`,
    [username, startDate, endDate],
  );

  return rows.map((row) => ({ date: row.day, amount: Number(row.daily_total) }));
}

type LargestExpenseRow = {
  day: string;
  amount: string;
  note: string | null;
};

export type LargestExpense = {
  date: string;
  amount: number;
  note: string;
};

// The single largest discretionary transaction inside a closed date range, ties broken by insert
// order so the result is deterministic.
export async function findLargestExpenseInRange(
  username: string,
  startDate: string,
  endDate: string,
): Promise<LargestExpense | null> {
  const rows = await queryAsync<LargestExpenseRow[]>(
    `SELECT DATE_FORMAT(date, '%Y-%m-%d') AS day, amount, note
      FROM spend_transactions
      WHERE username = ? AND date BETWEEN ? AND ?
      ORDER BY amount DESC, transaction_id ASC
      LIMIT 1`,
    [username, startDate, endDate],
  );

  if (rows.length === 0) {
    return null;
  }

  return { date: rows[0].day, amount: Number(rows[0].amount), note: rows[0].note ?? '' };
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
