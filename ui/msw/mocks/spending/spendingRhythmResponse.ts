import type { SpendingRhythmResponse } from '@spend-watcher/contract';
import { addDays, format, getDate, parse, startOfMonth } from 'date-fns';

/**
 * A $40-median month of steady $20 days with one 3.8× spike ($152) three days before targetDate,
 * so the spike sits inside the tile's 7-day strip.
 */
export function buildSpendingRhythmResponse(targetDate: string): SpendingRhythmResponse {
  const target = parse(targetDate, 'yyyy-MM-dd', new Date());
  const monthStart = startOfMonth(target);
  const dayOfMonth = getDate(target);
  const spikeDay = Math.max(dayOfMonth - 3, 1);

  return {
    dailyMedian: 40,
    days: Array.from({ length: dayOfMonth }, (_, index) => ({
      date: format(addDays(monthStart, index), 'yyyy-MM-dd'),
      amount: index + 1 === spikeDay ? 152 : 20,
    })),
  };
}
