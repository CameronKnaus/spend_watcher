import { z } from 'zod';
import { zDiscretionaryTransactionId, zRecurringTransactionId, zSpendingCategory } from './shared';

export const transactionTotalSchema = z.object({ amount: z.number(), count: z.number() });
export type TransactionTotal = z.infer<typeof transactionTotalSchema>;

export const transactionTotalWithPercentageSchema = transactionTotalSchema.extend({
  percentageOfTotalAmount: z.number(),
  percentageOfTotalCount: z.number(),
});
export type TransactionTotalWithPercentage = z.infer<typeof transactionTotalWithPercentageSchema>;

export const summaryTotalsSchema = z.object({
  total: transactionTotalSchema,
  recurringTotals: transactionTotalSchema,
  discretionaryTotals: transactionTotalSchema,
});
export type SummaryTotals = z.infer<typeof summaryTotalsSchema>;

export const categoryDetailsSchema = z.object({
  category: zSpendingCategory,
  combinedTotals: transactionTotalWithPercentageSchema,
  discretionaryTotals: transactionTotalWithPercentageSchema,
  recurringTotals: transactionTotalWithPercentageSchema,
});
export type CategoryDetails = z.infer<typeof categoryDetailsSchema>;

export const spendCategoryOverviewSchema = z.object({
  categoriesWithTransactionsCount: z.number(),
  categoriesWithDiscretionaryTransactionsCount: z.number(),
  categoriesWithRecurringTransactionsCount: z.number(),
  categoryDetailsList: z.array(categoryDetailsSchema),
  topFourCombinedTotals: transactionTotalWithPercentageSchema,
  remainingCombinedTotals: transactionTotalWithPercentageSchema,
  topFourDiscretionaryTotals: transactionTotalWithPercentageSchema,
  remainingDiscretionaryTotals: transactionTotalWithPercentageSchema,
  topFourRecurringTotals: transactionTotalWithPercentageSchema,
  remainingRecurringTotals: transactionTotalWithPercentageSchema,
});
export type SpendCategoryOverview = z.infer<typeof spendCategoryOverviewSchema>;

export const discretionarySpendTransactionSchema = z.object({
  transactionId: zDiscretionaryTransactionId,
  isRecurring: z.literal(false),
  category: zSpendingCategory,
  amountSpent: z.number(),
  spentDate: z.iso.date(),
  note: z.string(),
  linkedTripId: z.string().optional(),
});
export type DiscretionarySpendTransaction = z.infer<typeof discretionarySpendTransactionSchema>;

export const recurringSpendTransactionSchema = z.object({
  transactionId: zRecurringTransactionId,
  isRecurring: z.literal(true),
  category: zSpendingCategory,
  amountSpent: z.number(),
  spentDate: z.iso.date(),
  expectedMonthlyAmount: z.number(),
  recurringSpendName: z.string(),
  recurringSpendId: z.string(),
  isVariableRecurring: z.boolean(),
  isActive: z.boolean(),
  requiresMonthlyUpdate: z.boolean(),
});
export type RecurringSpendTransaction = z.infer<typeof recurringSpendTransactionSchema>;

export const spendTransactionSchema = z.discriminatedUnion('isRecurring', [
  recurringSpendTransactionSchema,
  discretionarySpendTransactionSchema,
]);
export type SpendTransaction = z.infer<typeof spendTransactionSchema>;

export const spendGroupSummarySchema = summaryTotalsSchema.extend({
  // Prefixed transaction ids (`Recurring-<id>` / `Discretionary-<id>`) — kept precise so callers
  // can narrow by prefix.
  includedTransactions: z.array(z.union([zRecurringTransactionId, zDiscretionaryTransactionId])),
});
export type SpendGroupSummary = z.infer<typeof spendGroupSummarySchema>;

export const spendingDetailsOutputSchema = z.object({
  spendCategoryOverview: spendCategoryOverviewSchema,
  // Keyed by `Recurring-<id>` / `Discretionary-<id>` transaction ids.
  transactionDictionary: z.record(z.string(), spendTransactionSchema),
  spendTypeRatio: z.object({ discretionary: z.number(), recurring: z.number() }),
  summary: summaryTotalsSchema,
  discretionaryTransactionIdList: z.array(zDiscretionaryTransactionId),
  recurringTransactionIdList: z.array(zRecurringTransactionId),
  // Keyed by `yyyy-MM-dd` date.
  transactionsByDate: z.record(z.string(), spendGroupSummarySchema),
});
export type SpendingDetailsResponse = z.infer<typeof spendingDetailsOutputSchema>;
export type TransactionsByDate = SpendingDetailsResponse['transactionsByDate'];
