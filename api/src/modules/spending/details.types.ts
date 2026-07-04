import { SpendingCategory, SummaryTotals } from '@spend-watcher/contract';

export type DiscretionaryHistoryRow = {
  transaction_id: number;
  category: SpendingCategory;
  amount: number;
  date: string; // ISO timestamp, e.g. '2024-08-01T04:00:00.000Z'
  note: string | null;
  linked_trip_id: string | null;
};

// Raw recurring history row: a recurring transaction joined to its parent spend's metadata.
export type RecurringHistoryRow = {
  amount: number; // expected/average monthly amount of the recurring spend
  category: SpendingCategory;
  date: string;
  is_active: 0 | 1;
  is_variable_recurring: 0 | 1;
  recurring_spend_id: string;
  spend_name: string;
  transaction_amount: number; // actual amount of this transaction
  transaction_id: number;
};

// Working accumulator used while building the category breakdown. Not part of the response.
export type TotalsByCategory = Partial<Record<SpendingCategory, SummaryTotals>>;
