import { DbDate } from 'Types/dateTypes';
import { SpendingCategory } from '@spend-watcher/contract';
import zodValidateDbDateFormat from 'Util/zodCustomValidators/zodValidateDbDateFormat';
import zodValidateMonthYear from 'Util/zodCustomValidators/zodValidateMonthYear';
import zodValidateRecurringTransactionId from 'Util/zodCustomValidators/zodValidateRecurringTransactionId';
import { z as zod } from 'zod';

// SPEND RELATED TYPES BEGIN --------------------------------------------
export type RecurringTransactionId = `${'Recurring-'}${number}`;
export type DiscretionaryTransactionId = `${'Discretionary-'}${number}`;
export type TransactionId = RecurringTransactionId | DiscretionaryTransactionId;

export type TransactionTotal = {
  // Total dollar amount
  amount: number;
  // Total number of transactions
  count: number;
};

// Summary data for a given list of transactions (includedTransactions)
export type SpendGroupSummary = {
  total: TransactionTotal;
  recurringTotals: TransactionTotal;
  discretionaryTotals: TransactionTotal;
  includedTransactions: TransactionId[];
};

// Mapped by date in a way that allows sorting by string
export type TransactionsByDate = Record<DbDate, SpendGroupSummary>;

// Shared attributes between all spend transactions
export type BaseSpendTransaction = {
  category: SpendingCategory;
  amountSpent: number; // transaction_amount from recurring
  spentDate: DbDate;
};

// Discretionary spend transaction specific attributes
export type DiscretionarySpendTransaction = {
  transactionId: DiscretionaryTransactionId;
  isRecurring: false;
  note: string;
  linkedTripId?: string;
} & BaseSpendTransaction;

// Recurring spend transaction specific attributes
export type RecurringSpendTransaction = {
  transactionId: RecurringTransactionId;
  isRecurring: true;
  expectedMonthlyAmount: number;
  recurringSpendName: string; // spend_name from recurring
  recurringSpendId: string; // uuid string
  isVariableRecurring: boolean;
  isActive: boolean;
  requiresMonthlyUpdate: boolean;
} & BaseSpendTransaction;

// SPEND RELATED TYPES END --------------------------------------------

// Discretionary add — used for client-side form validation (zodResolver).
export const v1DiscretionaryAddSchema = zod.object({
  category: zod.nativeEnum(SpendingCategory),
  amountSpent: zod.number().safe().positive(),
  spentDate: zodValidateDbDateFormat,
  note: zod.string().trim().max(100),
  linkedTripId: zod.string().uuid().optional(),
});

// Recurring spend add — used for client-side form validation (zodResolver).
export const v1AddRecurringSpendSchema = zod.object({
  category: zod.nativeEnum(SpendingCategory),
  recurringSpendName: zod.string().trim().max(60),
  expectedMonthlyAmount: zod.number().safe().positive(),
  isVariableRecurring: zod.boolean(),
});

export type AddRecurringSpendRequestParams = zod.infer<typeof v1AddRecurringSpendSchema>;

// Recurring transaction edit — used for client-side form validation (zodResolver).
export const v1EditRecurringTransactionSchema = zod.object({
  transactionId: zodValidateRecurringTransactionId,
  amountSpent: zod.number().safe().positive(),
});

// Recurring transaction add — used for client-side form validation (zodResolver).
export const v1AddRecurringTransactionSchema = zod.object({
  recurringSpendId: zod.string().uuid(),
  amountSpent: zod.number().safe().nonnegative(),
  date: zodValidateMonthYear,
});

// Legacy transaction shape still consumed by the Trends bar chart.
export type Transaction = {
  transactionId: number;
  category: SpendingCategory;
  amount: number;
  date: DbDate;
  isRecurring: boolean;
};

export type TransactionsV1Response = {
  transactions: Transaction[];
};
