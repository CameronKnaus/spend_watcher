import { SpendingCategory } from '@spend-watcher/contract';
// YYYY-MM-DD

export type RecurringTransactionId = `${'Recurring-'}${number}`;

export type RecurringSummaryRow = {
  amount: number; // expected / average monthly amount of the recurring spend
  category: SpendingCategory;
  date: string; // e.g. '2024-08-01T04:00:00.000Z' — date of the most recent transaction
  is_active: 0 | 1;
  is_variable_recurring: 0 | 1;
  recurring_spend_id: string;
  spend_name: string;
  transaction_amount: number; // actual amount of the most recent transaction
  transaction_id: number;
  username: string;
};

export type RecurringSpendTransactionRow = {
  transaction_id: number;
  transaction_amount: number;
  // YYYY-MM-DD
  date: string;
};

export type RecurringSpendTransaction = {
  transactionId: RecurringTransactionId;
  isRecurring: true;
  category: SpendingCategory;
  amountSpent: number; // actual most-recent transaction amount (transaction_amount)
  // YYYY-MM-DD
  spentDate: string;
  expectedMonthlyAmount: number; // expected/average monthly amount (amount)
  recurringSpendName: string;
  recurringSpendId: string;
  isVariableRecurring: boolean;
  isActive: boolean;
  requiresMonthlyUpdate: boolean;
};
