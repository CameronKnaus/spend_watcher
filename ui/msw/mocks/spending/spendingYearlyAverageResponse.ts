import type { YearlyAverageResponse } from '@spend-watcher/contract';

export const spendingYearlyAverageResponse = {
  monthlyAverage: 1234,
  comparison: { year: 2025, monthlyAverage: 1000, percentChange: 0.234 },
} satisfies YearlyAverageResponse;
