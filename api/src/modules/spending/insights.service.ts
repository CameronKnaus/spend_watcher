import { formatDbDate } from '@utils/DateUtils/dateUtils';
import { isBefore } from 'date-fns';
import {
  findEarliestDiscretionaryDate,
  findEarliestRecurringDate,
  findYearlyMonthlyTotals,
} from './insights.repository';
import { HistoryStartResponse, YearlyAverageResponse } from '@spend-watcher/contract';

// Earliest dates the user has spending history for. The combined earliest is computed here in the
// service — the repository only owns the two raw queries.
export async function getHistoryStart(username: string): Promise<HistoryStartResponse> {
  const [earliestDiscretionaryRaw, earliestRecurringRaw] = await Promise.all([
    findEarliestDiscretionaryDate(username),
    findEarliestRecurringDate(username),
  ]);

  const earliestDiscretionary = new Date(earliestDiscretionaryRaw);
  const earliestRecurring = new Date(earliestRecurringRaw);

  const earliestDate = isBefore(earliestDiscretionary, earliestRecurring) ? earliestDiscretionary : earliestRecurring;

  return {
    earliestTransactionDate: formatDbDate(earliestDate),
    earliestRecurringTransactionDate: formatDbDate(earliestRecurring),
    earliestDiscretionaryTransactionDate: formatDbDate(earliestDiscretionary),
  };
}

// Current-year monthly average (completed months only) plus a YoY comparison against the prior
// calendar year.
export async function getYearlyAverage(username: string): Promise<YearlyAverageResponse> {
  const now = new Date();
  const currentYear = now.getFullYear();
  const previousYear = currentYear - 1;

  const rows = await findYearlyMonthlyTotals(username, currentYear, previousYear);

  const currentRow = rows.find((row) => row.year === currentYear);
  const previousRow = rows.find((row) => row.year === previousYear);

  const currentYtdAvg =
    currentRow && currentRow.monthsWithData > 0 ? currentRow.totalAmount / currentRow.monthsWithData : null;

  const previousYearAvg = previousRow ? previousRow.totalAmount / 12 : null;
  const previousHasEnoughData = (previousRow?.monthsWithData ?? 0) >= 6;

  const monthlyAverage = currentYtdAvg ?? previousYearAvg ?? 0;

  const comparison =
    currentYtdAvg != null && previousYearAvg != null && previousHasEnoughData && previousYearAvg > 0
      ? {
          year: previousYear,
          monthlyAverage: previousYearAvg,
          percentChange: (currentYtdAvg - previousYearAvg) / previousYearAvg,
        }
      : null;

  return { monthlyAverage, comparison };
}
