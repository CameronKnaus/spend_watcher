import { differenceInCalendarMonths, format, parse, subMonths } from 'date-fns';
import { MonthYearDbDate, monthYearDbDateFormat } from 'Types/dateTypes';

type MonthLedger = {
  months: MonthYearDbDate[];
  monthBeforeOldest: MonthYearDbDate;
};

const toMonthYearDbDate = (date: Date): MonthYearDbDate => format(date, monthYearDbDateFormat) as MonthYearDbDate;

// Clamped rather than walked: an undefined oldest month (no history yet), one in the future, or a malformed
// one (NaN diff) all collapse to "0 months back" so callers always get the current month instead of a crash
// or a non-terminating loop.
export default function buildMonthLedger(oldestMonth: MonthYearDbDate | undefined, now: Date): MonthLedger {
  const rawDiff = oldestMonth ? differenceInCalendarMonths(now, parse(oldestMonth, monthYearDbDateFormat, now)) : 0;
  const monthsBack = Number.isFinite(rawDiff) ? Math.max(0, rawDiff) : 0;

  const months = Array.from({ length: monthsBack + 1 }, (_, index) => toMonthYearDbDate(subMonths(now, index)));
  const monthBeforeOldest = toMonthYearDbDate(subMonths(now, monthsBack + 1));

  return { months, monthBeforeOldest };
}
