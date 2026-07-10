import { SpendingCategory, type CategoryTrendsResponse } from '@spend-watcher/contract';
import { addMonths, format, parse, subMonths } from 'date-fns';

/**
 * Trends aligned with the details seed's four categories: GROCERIES rising 8%, RESTAURANTS falling
 * ~11%, UTILITIES flat, ENTERTAINMENT new this month (null delta).
 */
const CATEGORY_SERIES: { category: SpendingCategory; monthlyTotals: number[]; percentChange: number | null }[] = [
  { category: SpendingCategory.GROCERIES, monthlyTotals: [70, 72, 75, 68, 80, 86], percentChange: 0.075 },
  { category: SpendingCategory.UTILITIES, monthlyTotals: [60, 60, 60, 60, 60, 60], percentChange: 0 },
  { category: SpendingCategory.RESTAURANTS, monthlyTotals: [40, 38, 35, 30, 28, 25], percentChange: -0.107 },
  { category: SpendingCategory.ENTERTAINMENT, monthlyTotals: [0, 0, 0, 0, 0, 15], percentChange: null },
];

/** The trends response with a months axis ending at the requested targetMonth. */
export function buildCategoryTrendsResponse(targetMonth: string): CategoryTrendsResponse {
  const windowStart = subMonths(parse(targetMonth, 'yyyy-MM', new Date()), 5);

  return {
    months: Array.from({ length: 6 }, (_, index) => format(addMonths(windowStart, index), 'yyyy-MM')),
    categories: CATEGORY_SERIES,
  };
}
