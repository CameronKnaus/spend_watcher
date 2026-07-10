import { dbDateFormat, monthYearDbDateFormat } from '@type/dateTypes';
import { formatDbDate } from '@utils/DateUtils/dateUtils';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDate,
  getDaysInMonth,
  isBefore,
  parse,
  setDate,
  startOfMonth,
  subDays,
  subMonths,
} from 'date-fns';
import {
  findCategoryMonthlyTotals,
  findDiscretionaryDailyTotals,
  findEarliestDiscretionaryDate,
  findEarliestRecurringDate,
  findLargestExpenseInRange,
  findSpendTotalsInRange,
  findYearlyMonthlyTotals,
  SpendRangeTotals,
} from './insights.repository';
import {
  CategoryTrendsResponse,
  HistoryStartResponse,
  SpendingCategory,
  SpendingPaceResponse,
  TypicalPaceResponse,
  YearlyAverageResponse,
} from '@spend-watcher/contract';

const TYPICAL_BASELINE_MONTHS = 6;

// This month's cumulative discretionary series plus a "typical month" baseline averaged over the
// six prior full months (only months with any spend count toward the average).
export async function getTypicalPace(username: string, targetDate: string): Promise<TypicalPaceResponse> {
  const target = parse(targetDate, dbDateFormat, new Date());
  const targetMonthStart = startOfMonth(target);
  const dayOfMonth = getDate(target);

  const dailyTotals = await findDiscretionaryDailyTotals(
    username,
    formatDbDate(subMonths(targetMonthStart, TYPICAL_BASELINE_MONTHS)),
    targetDate,
  );

  const byMonth = new Map<string, { day: number; amount: number }[]>();
  for (const entry of dailyTotals) {
    const month = entry.date.slice(0, 7);
    const days = byMonth.get(month) ?? [];
    days.push({ day: Number(entry.date.slice(8, 10)), amount: entry.amount });
    byMonth.set(month, days);
  }

  let baselineMonthCount = 0;
  let baselineTotalSum = 0;
  let baselineThroughSum = 0;
  for (let monthsBack = 1; monthsBack <= TYPICAL_BASELINE_MONTHS; monthsBack++) {
    const monthStart = subMonths(targetMonthStart, monthsBack);
    const days = byMonth.get(format(monthStart, monthYearDbDateFormat));
    if (!days || days.length === 0) {
      continue;
    }

    const clampedDay = Math.min(dayOfMonth, getDaysInMonth(monthStart));
    baselineMonthCount += 1;
    baselineTotalSum += days.reduce((sum, day) => sum + day.amount, 0);
    baselineThroughSum += days.reduce((sum, day) => (day.day <= clampedDay ? sum + day.amount : sum), 0);
  }

  const currentMonthDays = new Map(
    (byMonth.get(format(targetMonthStart, monthYearDbDateFormat)) ?? []).map((day) => [day.day, day.amount]),
  );
  let runningTotal = 0;
  const cumulativeByDay = Array.from({ length: dayOfMonth }, (_, index) => {
    runningTotal += currentMonthDays.get(index + 1) ?? 0;
    return { date: formatDbDate(setDate(targetMonthStart, index + 1)), amount: runningTotal };
  });

  return {
    cumulativeByDay,
    typicalMonthTotal: baselineMonthCount > 0 ? baselineTotalSum / baselineMonthCount : null,
    typicalThroughSameDay: baselineMonthCount > 0 ? baselineThroughSum / baselineMonthCount : null,
    baselineMonthCount,
  };
}

const TREND_WINDOW_MONTHS = 6;

// Per-category monthly totals for the six months ending at targetMonth, zero-filled so every
// category's series aligns with the months axis.
export async function getCategoryTrends(username: string, targetMonth: string): Promise<CategoryTrendsResponse> {
  const targetMonthStart = parse(targetMonth, monthYearDbDateFormat, new Date());
  const windowStart = subMonths(targetMonthStart, TREND_WINDOW_MONTHS - 1);

  const monthlyTotals = await findCategoryMonthlyTotals(
    username,
    formatDbDate(windowStart),
    formatDbDate(endOfMonth(targetMonthStart)),
  );

  const months = Array.from({ length: TREND_WINDOW_MONTHS }, (_, index) =>
    format(addMonths(windowStart, index), monthYearDbDateFormat),
  );
  const monthIndex = new Map(months.map((month, index) => [month, index]));

  const totalsByCategory = new Map<SpendingCategory, number[]>();
  for (const entry of monthlyTotals) {
    const series = totalsByCategory.get(entry.category) ?? Array.from({ length: TREND_WINDOW_MONTHS }, () => 0);
    series[monthIndex.get(entry.month) ?? 0] = entry.amount;
    totalsByCategory.set(entry.category, series);
  }

  const categories = [...totalsByCategory.entries()].map(([category, series]) => {
    const latest = series[TREND_WINDOW_MONTHS - 1];
    const previous = series[TREND_WINDOW_MONTHS - 2];

    return {
      category,
      monthlyTotals: series,
      percentChange: previous > 0 ? (latest - previous) / previous : null,
    };
  });

  return { months, categories };
}

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

function withCombinedTotal({ discretionary, recurring }: SpendRangeTotals) {
  return { total: discretionary + recurring, discretionary, recurring };
}

// Month-to-date totals for the month containing `targetDate`, alongside two previous-month
// windows: cut off at the same day-of-month (clamped — Mar 31 compares against Feb 28) and the
// full month.
export async function getSpendingPace(username: string, targetDate: string): Promise<SpendingPaceResponse> {
  const target = parse(targetDate, dbDateFormat, new Date());
  const previousMonthStart = startOfMonth(subMonths(target, 1));
  const clampedDay = Math.min(getDate(target), getDaysInMonth(previousMonthStart));
  const dailyWindowStart = subDays(target, 13);

  const [monthToDate, previousMonthSameDay, previousMonthFull, dailySpendTotals, largestRecentExpense] =
    await Promise.all([
      findSpendTotalsInRange(username, formatDbDate(startOfMonth(target)), targetDate),
      findSpendTotalsInRange(
        username,
        formatDbDate(previousMonthStart),
        formatDbDate(setDate(previousMonthStart, clampedDay)),
      ),
      findSpendTotalsInRange(username, formatDbDate(previousMonthStart), formatDbDate(endOfMonth(previousMonthStart))),
      findDiscretionaryDailyTotals(username, formatDbDate(dailyWindowStart), targetDate),
      findLargestExpenseInRange(username, formatDbDate(dailyWindowStart), targetDate),
    ]);

  const totalsByDay = new Map(dailySpendTotals.map((day) => [day.date, day.amount]));
  const dailyTotals = eachDayOfInterval({ start: dailyWindowStart, end: target }).map((day) => {
    const date = formatDbDate(day);
    return { date, amount: totalsByDay.get(date) ?? 0 };
  });

  return {
    monthToDate: withCombinedTotal(monthToDate),
    previousMonthSameDay: withCombinedTotal(previousMonthSameDay),
    previousMonthFull: withCombinedTotal(previousMonthFull),
    dailyTotals,
    largestRecentExpense,
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
