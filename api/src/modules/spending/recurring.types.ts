import { SpendingCategory } from '@spend-watcher/contract';

// A recurring transaction joined to its parent spend's metadata. The summary query returns one per
// spend (its most recent transaction); the details history query returns every transaction in range.
export type RecurringSpendWithTransactionRow = {
  amount: number; // expected / average monthly amount of the recurring spend
  category: SpendingCategory;
  date: Date; // the mysql driver maps DATE columns to Date objects
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
  date: Date;
};
