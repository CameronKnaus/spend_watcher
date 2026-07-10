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

// Window totals for the pace comparisons, split the same way the details summary is.
const paceAmountsSchema = z.object({
  total: z.number(),
  discretionary: z.number(),
  recurring: z.number(),
});

// GET /spending/pace — month-to-date totals plus previous-month comparison windows. `targetDate`
// comes from the client so "today" reflects the user's timezone and tests stay deterministic.
export const paceContract = oc
  .route({ method: 'GET', path: '/spending/pace' })
  .input(z.object({ targetDate: z.iso.date() }))
  .output(
    z.object({
      monthToDate: paceAmountsSchema,
      // The previous month cut off at the same day-of-month (clamped to that month's length), so
      // partial months compare like-for-like.
      previousMonthSameDay: paceAmountsSchema,
      previousMonthFull: paceAmountsSchema,
      // One entry per day for the 14 days ending at targetDate, zero-filled. Discretionary only —
      // recurring transactions carry a synthetic first-of-month date that would render as a fake
      // day-one spike.
      dailyTotals: z.array(z.object({ date: z.iso.date(), amount: z.number() })),
      largestRecentExpense: z.object({ date: z.iso.date(), amount: z.number(), note: z.string() }).nullable(),
    }),
  );

// GET /spending/category-trends — per-category totals for the six calendar months ending at
// targetMonth, powering the delta + sparkline columns on Trends. Totals combine discretionary and
// recurring spend. Categories with no spend anywhere in the window are omitted.
export const categoryTrendsContract = oc
  .route({ method: 'GET', path: '/spending/category-trends' })
  .input(z.object({ targetMonth: zMonthYearDate }))
  .output(
    z.object({
      // Oldest first; the last entry is targetMonth. monthlyTotals aligns with this, zero-filled.
      months: z.array(zMonthYearDate),
      categories: z.array(
        z.object({
          category: zSpendingCategory,
          monthlyTotals: z.array(z.number()),
          // targetMonth vs the month before it; null when that month has no spend to compare
          // against. When targetMonth is the current month this compares a partial month against
          // a full one — accepted for v1.
          percentChange: z.number().nullable(),
        }),
      ),
    }),
  );

// GET /spending/typical-pace — this month's cumulative discretionary spend against a "typical"
// month averaged from the six prior full months. Discretionary only: recurring lands on synthetic
// first-of-month dates that would distort a day-by-day pace.
export const typicalPaceContract = oc
  .route({ method: 'GET', path: '/spending/typical-pace' })
  .input(z.object({ targetDate: z.iso.date() }))
  .output(
    z.object({
      // One entry per day from the 1st through targetDate, cumulative.
      cumulativeByDay: z.array(z.object({ date: z.iso.date(), amount: z.number() })),
      // Averages over the baseline months that had any spend; null when none did, so the ui can
      // tell "no history" apart from "a typical month is $0".
      typicalMonthTotal: z.number().nullable(),
      typicalThroughSameDay: z.number().nullable(),
      baselineMonthCount: z.number(),
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
  // The ui's trip select submits '' when no trip is chosen (its clear action can't emit
  // `undefined` — see FilterableSelect); treat '' the same as an absent field so the forms
  // can validate against this schema directly instead of maintaining a diverged copy.
  linkedTripId: z
    .uuid()
    .optional()
    .or(z.literal('').transform(() => undefined)),
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
  // The `spend_name` DB column is varchar(30).
  recurringSpendName: z.string().trim().min(1).max(30),
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
  pace: paceContract,
  categoryTrends: categoryTrendsContract,
  typicalPace: typicalPaceContract,
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
