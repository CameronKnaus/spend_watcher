import { SpendingCategory, type RecurringSummaryResponse } from '@spend-watcher/contract';

/** Baseline recurring summary: the one seeded Internet spend, no updates required. */
export const recurringSummaryResponse = {
  recurringSpendsRequireUpdates: false,
  spendsRequiringUpdatesCount: 0,
  activeRecurringTransactions: [
    {
      transactionId: 'Recurring-3',
      isRecurring: true,
      category: SpendingCategory.UTILITIES,
      amountSpent: 60,
      spentDate: '2026-06-01',
      expectedMonthlyAmount: 60,
      recurringSpendName: 'Internet',
      recurringSpendId: '33333333-3333-4333-8333-333333333333',
      isVariableRecurring: false,
      isActive: true,
      requiresMonthlyUpdate: false,
    },
  ],
  inactiveRecurringTransactions: [],
  averageEstimatedMonthlyTotal: 60,
  actualMonthlyTotal: 60,
} satisfies RecurringSummaryResponse;
