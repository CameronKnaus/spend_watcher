import { z } from 'zod';
import { AccountCategory, SpendingCategory } from './enums';

/** Category enums as zod schemas. */
export const zSpendingCategory = z.enum(SpendingCategory);
export const zAccountCategory = z.enum(AccountCategory);

/** A `yyyy-MM` month-year string (e.g. account `lastUpdated`, recurring-transaction `date`). */
export const zMonthYearDate = z.string().regex(/^\d{4}-\d{2}$/, 'Expected a yyyy-MM date');

/** The public, prefixed transaction ids the api hands out. */
export const zRecurringTransactionId = z.templateLiteral(['Recurring-', z.number().int()]);
export const zDiscretionaryTransactionId = z.templateLiteral(['Discretionary-', z.number().int()]);

export type RecurringTransactionId = z.infer<typeof zRecurringTransactionId>;
export type DiscretionaryTransactionId = z.infer<typeof zDiscretionaryTransactionId>;
export type TransactionId = RecurringTransactionId | DiscretionaryTransactionId;
