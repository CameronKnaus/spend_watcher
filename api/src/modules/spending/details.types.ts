import { SpendingCategory, SummaryTotals } from '@spend-watcher/contract';

export type DiscretionaryHistoryRow = {
  transaction_id: number;
  category: SpendingCategory;
  amount: number;
  date: string; // ISO timestamp, e.g. '2024-08-01T04:00:00.000Z'
  note: string | null;
  linked_trip_id: string | null;
};

// Working accumulator used while building the category breakdown. Not part of the response.
export type TotalsByCategory = Partial<Record<SpendingCategory, SummaryTotals>>;
