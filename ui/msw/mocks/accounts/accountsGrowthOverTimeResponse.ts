import type { AccountGrowthOverTimeResponse } from '@spend-watcher/contract';

// Fixed historical months (not relative to "today") so the latest-point label is stable.
export const accountsGrowthOverTimeResponse = [
  { accountId: 'a1', accountName: 'Test Checking', date: '2024-01-15', amount: 4000 },
  { accountId: 'a1', accountName: 'Test Checking', date: '2024-03-15', amount: 5000 },
  { accountId: 'a2', accountName: 'Test Savings', date: '2024-03-15', amount: 3000 },
] satisfies AccountGrowthOverTimeResponse;
