import type { HistoryStartResponse } from '@spend-watcher/contract';

export const spendingHistoryStartResponse = {
  earliestTransactionDate: '2026-06-01',
  earliestRecurringTransactionDate: '2026-06-01',
  earliestDiscretionaryTransactionDate: '2026-06-01',
} satisfies HistoryStartResponse;
