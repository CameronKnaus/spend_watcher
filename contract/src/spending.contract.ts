import { oc } from '@orpc/contract';
import { z } from 'zod';
import { zDiscretionaryTransactionId, zMonthYearDate, zRecurringTransactionId, zSpendingCategory } from './shared';
import { spendingDetailsOutputSchema } from './spendingDetails';

// GET /spending/details — the rich category/date breakdown for a date range.
export const detailsContract = oc
  .route({ method: 'GET', path: '/spending/details' })
  .input(z.object({ startDate: z.iso.date(), endDate: z.iso.date() }))
  .output(spendingDetailsOutputSchema);

// A single recurring spend group as surfaced in the summary.
const recurringSpendTransactionSchema = z.object({
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

// GET /spending/recurring/summary
export const recurringSummaryContract = oc.route({ method: 'GET', path: '/spending/recurring/summary' }).output(
  z.object({
    recurringSpendsRequireUpdates: z.boolean(),
    spendsRequiringUpdatesCount: z.number(),
    activeRecurringTransactions: z.array(recurringSpendTransactionSchema),
    inactiveRecurringTransactions: z.array(recurringSpendTransactionSchema),
    averageEstimatedMonthlyTotal: z.number(),
    actualMonthlyTotal: z.number(),
  }),
);

// GET /spending/recurring/transactions
export const recurringTransactionsContract = oc
  .route({ method: 'GET', path: '/spending/recurring/transactions' })
  .input(z.object({ recurringSpendId: z.uuid() }))
  .output(
    z.object({
      transactions: z.array(
        z.object({
          transactionId: zRecurringTransactionId,
          date: zMonthYearDate,
          amountSpent: z.number(),
        }),
      ),
    }),
  );

// GET /spending/history-start
export const historyStartContract = oc.route({ method: 'GET', path: '/spending/history-start' }).output(
  z.object({
    earliestTransactionDate: z.iso.date(),
    earliestRecurringTransactionDate: z.iso.date(),
    earliestDiscretionaryTransactionDate: z.iso.date(),
  }),
);

// GET /spending/yearly-average
export const yearlyAverageContract = oc.route({ method: 'GET', path: '/spending/yearly-average' }).output(
  z.object({
    monthlyAverage: z.number(),
    comparison: z
      .object({
        year: z.number(),
        monthlyAverage: z.number(),
        percentChange: z.number(),
      })
      .nullable(),
  }),
);

// --- Mutations ---------------------------------------------------------------------------------
// All write endpoints respond with an empty body, so the procedures declare no output.

// POST /spending/discretionary/add
export const discretionaryInputSchema = z.object({
  category: zSpendingCategory,
  amountSpent: z.number().safe().positive(),
  spentDate: z.iso.date(),
  // The `note` DB column is varchar(60).
  note: z.string().trim().max(60),
  linkedTripId: z.uuid().optional(),
});

export const discretionaryAddContract = oc
  .route({ method: 'POST', path: '/spending/discretionary/add' })
  .input(discretionaryInputSchema);

// POST /spending/discretionary/edit
export const discretionaryEditContract = oc
  .route({ method: 'POST', path: '/spending/discretionary/edit' })
  .input(discretionaryInputSchema.extend({ transactionId: zDiscretionaryTransactionId }));

// POST /spending/discretionary/delete
export const discretionaryDeleteContract = oc
  .route({ method: 'POST', path: '/spending/discretionary/delete' })
  .input(z.object({ transactionId: zDiscretionaryTransactionId }));

// POST /spending/recurring/add
export const recurringSpendInputSchema = z.object({
  category: zSpendingCategory,
  recurringSpendName: z.string().trim().min(1).max(60),
  expectedMonthlyAmount: z.number().safe().positive(),
  isVariableRecurring: z.boolean(),
});

export const recurringSpendAddContract = oc
  .route({ method: 'POST', path: '/spending/recurring/add' })
  .input(recurringSpendInputSchema);

// POST /spending/recurring/edit
export const recurringSpendEditContract = oc
  .route({ method: 'POST', path: '/spending/recurring/edit' })
  .input(recurringSpendInputSchema.extend({ recurringSpendId: z.uuid() }));

// POST /spending/recurring/delete
export const recurringSpendDeleteContract = oc
  .route({ method: 'POST', path: '/spending/recurring/delete' })
  .input(z.object({ recurringSpendId: z.uuid() }));

// POST /spending/recurring/set-active
export const recurringSpendSetActiveContract = oc
  .route({ method: 'POST', path: '/spending/recurring/set-active' })
  .input(z.object({ recurringSpendId: z.uuid(), isActive: z.boolean() }));

// POST /spending/recurring/transactions/add
export const recurringTransactionAddInputSchema = z.object({
  recurringSpendId: z.uuid(),
  amountSpent: z.number().safe().nonnegative(),
  date: zMonthYearDate,
});

export const recurringTransactionAddContract = oc
  .route({ method: 'POST', path: '/spending/recurring/transactions/add' })
  .input(recurringTransactionAddInputSchema);

// POST /spending/recurring/transactions/edit
export const recurringTransactionEditInputSchema = z.object({
  transactionId: zRecurringTransactionId,
  amountSpent: z.number().safe().positive(),
});

export const recurringTransactionEditContract = oc
  .route({ method: 'POST', path: '/spending/recurring/transactions/edit' })
  .input(recurringTransactionEditInputSchema);

export const spendingContract = {
  details: detailsContract,
  recurringSummary: recurringSummaryContract,
  recurringTransactions: recurringTransactionsContract,
  historyStart: historyStartContract,
  yearlyAverage: yearlyAverageContract,
  discretionaryAdd: discretionaryAddContract,
  discretionaryEdit: discretionaryEditContract,
  discretionaryDelete: discretionaryDeleteContract,
  recurringSpendAdd: recurringSpendAddContract,
  recurringSpendEdit: recurringSpendEditContract,
  recurringSpendDelete: recurringSpendDeleteContract,
  recurringSpendSetActive: recurringSpendSetActiveContract,
  recurringTransactionAdd: recurringTransactionAddContract,
  recurringTransactionEdit: recurringTransactionEditContract,
};
