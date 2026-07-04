import { RecurringSpendTransaction, SpendingCategory } from '@spend-watcher/contract';

export type RecurringTransactionId = RecurringSpendTransaction['transactionId'];

// A recurring transaction joined to its parent spend's metadata. The summary query returns one per
// spend (its most recent transaction); the details history query returns every transaction in range.
export type RecurringSpendWithTransactionRow = {
  amount: number; // expected / average monthly amount of the recurring spend
  category: SpendingCategory;
  date: string; // e.g. '2024-08-01T04:00:00.000Z' — date of this transaction
  is_active: 0 | 1;
  is_variable_recurring: 0 | 1;
  recurring_spend_id: string;
  spend_name: string;
  transaction_amount: number;
  transaction_id: number;
};

export type RecurringSpendTransactionRow = {
  transaction_id: number;
  transaction_amount: number;
  // YYYY-MM-DD
  date: string;
};
