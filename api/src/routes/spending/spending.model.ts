import { SpendingCategory } from '@type/categoryTypes';
import { DbDate } from '@type/dateTypes';
import zodValidateDbDateFormat from '@utils/zodCustomValidators/zodValidateDbDateFormat';
import zodValidateDiscretionaryId from '@utils/zodCustomValidators/zodValidateDiscretionaryId';
import zodValidateMonthYear from '@utils/zodCustomValidators/zodValidateMonthYear';
import zodValidateRecurringTransactionId from '@utils/zodCustomValidators/zodValidateRecurringTransactionId';
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

export type TransactionTotalWithPercentage = TransactionTotal & {
  // Percentage of the total dollar amount
  percentageOfTotalAmount: number;
  // Percentage of the total number of transactions
  percentageOfTotalCount: number;
};

export type TotalsByCategory = {
  [category in SpendingCategory]?: SummaryTotals;
};

// Summary data for a given list of transactions (includedTransactions)
export type SpendGroupSummary = {
  total: TransactionTotal;
  recurringTotals: TransactionTotal;
  discretionaryTotals: TransactionTotal;
  includedTransactions: TransactionId[];
};

export type SummaryTotals = Omit<SpendGroupSummary, 'includedTransactions'>;

// Mapped by date in a way that allows sorting by string
export type TransactionsByDate = Record<DbDate, SpendGroupSummary>;

// If given a discretionary transactionID, type of value will be casted to DiscretionarySpendTransaction and vice versa
export type TransactionDictionary = {
  [T in TransactionId]: T extends RecurringTransactionId
    ? RecurringSpendTransaction
    : T extends DiscretionaryTransactionId
      ? DiscretionarySpendTransaction
      : never;
};

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

export type SpendTransaction = RecurringSpendTransaction | DiscretionarySpendTransaction;

// SPEND RELATED TYPES END --------------------------------------------

// SPENDING DETAILS API --- /api/spending/v1/details
export const v1DetailsSchema = zod.object({
  startDate: zodValidateDbDateFormat,
  endDate: zodValidateDbDateFormat,
});

export type SpendingDetailsRequestParams = zod.infer<typeof v1DetailsSchema>;

export type CategoryDetails = {
  category: SpendingCategory;
  combinedTotals: TransactionTotalWithPercentage;
  discretionaryTotals: TransactionTotalWithPercentage;
  recurringTotals: TransactionTotalWithPercentage;
};

export type SpendCategoryOverview = {
  categoriesWithTransactionsCount: number;
  categoriesWithDiscretionaryTransactionsCount: number;
  categoriesWithRecurringTransactionsCount: number;
  categoryDetailsList: CategoryDetails[];
  topFourCombinedTotals: TransactionTotalWithPercentage;
  remainingCombinedTotals: TransactionTotalWithPercentage;
  topFourDiscretionaryTotals: TransactionTotalWithPercentage;
  remainingDiscretionaryTotals: TransactionTotalWithPercentage;
  topFourRecurringTotals: TransactionTotalWithPercentage;
  remainingRecurringTotals: TransactionTotalWithPercentage;
};

export type SpendingDetailsV1Response = {
  spendCategoryOverview: SpendCategoryOverview;
  transactionDictionary: TransactionDictionary;
  spendTypeRatio: {
    discretionary: number;
    recurring: number;
  };
  summary: SummaryTotals;
  discretionaryTransactionIdList: DiscretionaryTransactionId[];
  recurringTransactionIdList: RecurringTransactionId[];
  transactionsByDate: TransactionsByDate;
};
// END SPENDING DETAILS API --------------------------------------------

// LOG DISCRETIONARY API --- /api/spending/v1/discretionary/add
export const v1DiscretionaryAddSchema = zod.object({
  category: zod.nativeEnum(SpendingCategory),
  amountSpent: zod.number().safe().positive(),
  spentDate: zodValidateDbDateFormat,
  note: zod.string().trim().max(100),
  linkedTripId: zod.string().uuid().optional(),
});

export type DiscretionaryAddRequestParams = zod.infer<typeof v1DiscretionaryAddSchema>;
// END LOG DISCRETIONARY API

// EDIT DISCRETIONARY API --- /api/spending/v1/discretionary/edit
export const v1DiscretionaryEditSchema = v1DiscretionaryAddSchema.extend({
  // Add the transactionId field
  transactionId: zodValidateDiscretionaryId,
});

export type DiscretionaryEditRequestParams = zod.infer<typeof v1DiscretionaryEditSchema>;
// END EDIT DISCRETIONARY API --------------------------------------------

// DELETE DISCRETIONARY API --- /api/spending/v1/discretionary/delete
export const v1DiscretionaryDeleteSchema = zod.object({
  transactionId: zodValidateDiscretionaryId,
});

export type DiscretionaryDeleteRequestParams = zod.infer<typeof v1DiscretionaryDeleteSchema>;
// EMD DELETE DISCRETIONARY API --------------------------------------------

// RECURRING SUMMARY API --- /api/spending/v1/recurring/summary
export type RecurringSummaryV1Response = {
  recurringSpendsRequireUpdates: boolean;
  spendsRequiringUpdatesCount: number;
  activeRecurringTransactions: RecurringSpendTransaction[];
  inactiveRecurringTransactions: RecurringSpendTransaction[];
  averageEstimatedMonthlyTotal: number;
  actualMonthlyTotal: number;
};
// END RECURRING SUMMARY API --------------------------------------------

// RECURRING ADD API --- /api/spending/v1/recurring/add
export const v1AddRecurringSpendSchema = zod.object({
  category: zod.nativeEnum(SpendingCategory),
  recurringSpendName: zod.string().trim().max(60),
  expectedMonthlyAmount: zod.number().safe().positive(),
  isVariableRecurring: zod.boolean(),
});

export type AddRecurringSpendRequestParams = zod.infer<typeof v1AddRecurringSpendSchema>;
// END RECURRING ADD API --------------------------------------------

// RECURRING EDIT API --- /api/spending/v1/recurring/edit
export const v1EditRecurringSpendSchema = v1AddRecurringSpendSchema.extend({
  // Add the transactionId field
  recurringSpendId: zod.string().uuid(),
});

export type EditRecurringSpendRequestParams = zod.infer<typeof v1EditRecurringSpendSchema>;

// END RECURRING EDIT API --------------------------------------------

// RECURRING DELETE API --- /api/spending/v1/recurring/delete
export const v1DeleteRecurringSpendSchema = zod.object({
  recurringSpendId: zod.string().uuid(),
});

export type DeleteRecurringSpendRequestParams = zod.infer<typeof v1DeleteRecurringSpendSchema>;
// END RECURRING DELETE API --------------------------------------------

// RECURRING SET-ACTIVE API --- /api/spending/v1/recurring/set-active

export const v1SetActiveRecurringSpendSchema = zod.object({
  recurringSpendId: zod.string().uuid(),
  isActive: zod.boolean(),
});

export type SetActiveRecurringSpendRequestParams = zod.infer<typeof v1SetActiveRecurringSpendSchema>;

// END RECURRING SET-ACTIVE API --------------------------------------------

// RECURRING TRANSACTIONS LIST API

export const v1RecurringTransactionsListSchema = zod.object({
  recurringSpendId: zod.string().uuid(),
});

export type RecurringTransactionsListRequestParams = zod.infer<typeof v1RecurringTransactionsListSchema>;

export type RecurringTransactionsListV1Response = {
  transactions: {
    transactionId: RecurringTransactionId;
    date: DbDate;
    amountSpent: number;
  }[];
};

// END RECURRING TRANSACTIONS LIST API --------------------------------------------

// EDIT RECURRING TRANSACTION API --------------------------------------------

export const v1EditRecurringTransactionSchema = zod.object({
  transactionId: zodValidateRecurringTransactionId,
  amountSpent: zod.number().safe().positive(),
});

export type EditRecurringTransactionRequestParams = zod.infer<typeof v1EditRecurringTransactionSchema>;

// END EDIT RECURRING TRANSACTION API

// ADD RECURRING TRANSACTION API --------------------------------------------

export const v1AddRecurringTransactionSchema = zod.object({
  recurringSpendId: zod.string().uuid(),
  amountSpent: zod.number().safe().nonnegative(),
  date: zodValidateMonthYear,
});

export type AddRecurringTransactionRequestParams = zod.infer<typeof v1AddRecurringTransactionSchema>;

// END ADD RECURRING TRANSACTION API

// SPENDING HISTORY START API --------------------------------------------

export type SpendingHistoryStartV1Response = {
  earliestTransactionDate: DbDate;
  earliestRecurringTransactionDate: DbDate;
  earliestDiscretionaryTransactionDate: DbDate;
};

// END SPENDING HISTORY START API --------------------------------------------

// YEARLY AVERAGE API --- /api/spending/v1/yearly-average

export type YearlyAverageV1Response = {
  monthlyAverage: number;
  comparison: {
    year: number;
    percentChange: number;
  } | null;
};

// END YEARLY AVERAGE API --------------------------------------------

// TRANSACTIONS API --- /api/spending/v1/transactions

export const v1TransactionsSchema = zod.object({
  startDate: zodValidateDbDateFormat,
  endDate: zodValidateDbDateFormat,
});

export type TransactionsRequestParams = zod.infer<typeof v1TransactionsSchema>;

export type Transaction = {
  transactionId: number;
  category: SpendingCategory;
  amount: number;
  date: DbDate;
  isRecurring: boolean;
};

export type TransactionsV1Response = {
  presentCategories: SpendingCategory[];
  transactions: Transaction[];
};

// END TRANSACTIONS API --------------------------------------------
