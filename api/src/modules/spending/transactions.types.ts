import { SpendingCategory } from '@type/categoryTypes';
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
