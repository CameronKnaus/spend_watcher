import { AccountCategory, type AccountsSummaryResponse } from '@spend-watcher/contract';

export const accountsSummaryResponse = {
  totalEquity: 5000,
  yearStartNetWorth: 4000,
  totalAccountsCount: 1,
  accountsCountByCategory: {
    [AccountCategory.CHECKING]: 1,
    [AccountCategory.SAVINGS]: 0,
    [AccountCategory.INVESTING]: 0,
    [AccountCategory.BONDS]: 0,
  },
  accountTotalsByType: {
    [AccountCategory.CHECKING]: 5000,
    [AccountCategory.SAVINGS]: 0,
    [AccountCategory.INVESTING]: 0,
    [AccountCategory.BONDS]: 0,
  },
  accountsList: [
    {
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Test Checking',
      currentAccountValue: 5000,
      category: AccountCategory.CHECKING,
      isFixedRate: true,
      annualPercentageRate: 0,
      lastUpdated: '2026-06',
      requiresNewUpdate: false,
    },
  ],
} satisfies AccountsSummaryResponse;
