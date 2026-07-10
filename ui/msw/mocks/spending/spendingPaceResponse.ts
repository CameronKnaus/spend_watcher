import type { SpendingPaceResponse } from '@spend-watcher/contract';
import { addDays, format, parse, subDays } from 'date-fns';

/**
 * Pace mirroring the details seed ($186 month-to-date) against a previous month that was pacing
 * at $200 by the same day: (186 − 200) / 200 = −7% — "7% under" in the hero badge.
 */
export const spendingPaceResponse = {
  monthToDate: { total: 186, discretionary: 126, recurring: 60 },
  previousMonthSameDay: { total: 200, discretionary: 130, recurring: 70 },
  previousMonthFull: { total: 410, discretionary: 280, recurring: 130 },
  dailyTotals: [],
  largestRecentExpense: null,
} satisfies SpendingPaceResponse;

// Highest on the 8th day of the window so the spike annotation has an unambiguous target.
const DAILY_AMOUNTS = [30, 12, 8, 44, 20, 16, 10, 60, 14, 22, 8, 18, 26, 38];

/**
 * The pace response with a daily-bars window ending at the requested targetDate, so the mock stays
 * aligned with whatever system time a test pins.
 */
export function buildSpendingPaceResponse(targetDate: string): SpendingPaceResponse {
  const windowStart = subDays(parse(targetDate, 'yyyy-MM-dd', new Date()), 13);
  const dailyTotals = DAILY_AMOUNTS.map((amount, index) => ({
    date: format(addDays(windowStart, index), 'yyyy-MM-dd'),
    amount,
  }));

  return {
    ...spendingPaceResponse,
    dailyTotals,
    largestRecentExpense: { date: dailyTotals[7].date, amount: 44, note: 'flights' },
  };
}
