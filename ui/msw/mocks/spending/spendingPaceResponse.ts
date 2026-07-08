import type { SpendingPaceResponse } from '@spend-watcher/contract';

/**
 * Pace mirroring the details seed ($186 month-to-date) against a previous month that was pacing
 * at $200 by the same day: (186 − 200) / 200 = −7% — "7% under" in the hero badge.
 */
export const spendingPaceResponse = {
  monthToDate: { total: 186, discretionary: 126, recurring: 60 },
  previousMonthSameDay: { total: 200, discretionary: 130, recurring: 70 },
  previousMonthFull: { total: 410, discretionary: 280, recurring: 130 },
} satisfies SpendingPaceResponse;
