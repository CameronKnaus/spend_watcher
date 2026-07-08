import type { TypicalPaceResponse } from '@spend-watcher/contract';
import { addDays, format, getDate, getDaysInMonth, parse, startOfMonth } from 'date-fns';

/**
 * A steady $10/day month tracking $50 under a typical month: through day N the cumulative is
 * N×10, the typical-through-same-day is N×10+50, and the typical month total is
 * daysInMonth×10+100 (so the projection lands exactly $100 under typical).
 */
export function buildTypicalPaceResponse(targetDate: string): TypicalPaceResponse {
  const target = parse(targetDate, 'yyyy-MM-dd', new Date());
  const monthStart = startOfMonth(target);
  const dayOfMonth = getDate(target);

  return {
    cumulativeByDay: Array.from({ length: dayOfMonth }, (_, index) => ({
      date: format(addDays(monthStart, index), 'yyyy-MM-dd'),
      amount: (index + 1) * 10,
    })),
    typicalThroughSameDay: dayOfMonth * 10 + 50,
    typicalMonthTotal: getDaysInMonth(target) * 10 + 100,
    baselineMonthCount: 6,
  };
}
