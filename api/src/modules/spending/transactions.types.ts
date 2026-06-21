import { SpendingCategory } from '@spend-watcher/contract';
import { DbDate } from '@type/dateTypes';

// Raw snake_case row exactly as MySQL returns it from the `spend_transactions` table.
// This shape is internal to the repository layer — only `transactions.repository.ts` consumes it,
// and it must never leak past the repo to the service or controller.
export type SpendTransactionRow = {
  transaction_id: number;
  username: string;
  category: SpendingCategory;
  amount: number;
  date: string; // e.g. '2024-08-01T04:00:00.000Z'
  note?: string;
  linked_trip_id?: string;
};

// camelCase domain shape. This is what every layer above the repository (service, controller,
// and ultimately the HTTP response) sees. The repo is responsible for mapping a row to this.
export type Transaction = {
  transactionId: number;
  category: SpendingCategory;
  amount: number;
  date: DbDate;
  note?: string;
  linkedTripId?: string;
};

// Raw snake_case row from the recurring history query. Internal to the repository — it joins
// `recurring_spending` to its most recent `recurring_transactions` row.
export type RecurringTransactionHistoryRow = {
  amount: number; // The set / expected average amount of the recurring spend
  category: SpendingCategory;
  date: string; // e.g. '2024-08-01T04:00:00.000Z' — date of this particular transaction
  is_active: 0 | 1;
  is_variable_recurring: 0 | 1;
  recurring_spend_id: string;
  spend_name: string;
  transaction_amount: number; // actual amount of this particular transaction
  transaction_id: number;
  username: string;
};

// camelCase domain shape for a recurring history transaction, returned by the repository.
export type RecurringTransaction = {
  transactionId: number;
  category: SpendingCategory;
  amount: number; // expected/average monthly amount (from `amount`)
  date: DbDate;
};

// A single entry in the combined discretionary + recurring flat list.
export type CombinedTransaction = {
  transactionId: number;
  category: SpendingCategory;
  amount: number;
  date: DbDate;
  isRecurring: boolean;
};
