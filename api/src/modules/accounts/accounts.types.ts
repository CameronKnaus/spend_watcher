import { AccountCategory } from '@spend-watcher/contract';
import { MonthYearDbDate } from '@type/dateTypes';

// camelCase domain shape for a single account joined to its latest update.
// This is what the service consumes; the repo maps raw rows into this.
export type AccountWithLatestUpdate = {
  accountId: string;
  accountName: string;
  username: string;
  category: AccountCategory;
  isFixedRate: boolean;
  annualPercentageRate: number;
  // YYYY-MM-DD
  date: string;
  amount: number;
};

export type AccountWithStatus = {
  id: string;
  name: string;
  currentAccountValue: number;
  category: AccountCategory;
  isFixedRate: boolean;
  annualPercentageRate: number;
  lastUpdated: MonthYearDbDate;
  requiresNewUpdate: boolean;
};

export type AccountValueDataPoint = {
  accountId: string;
  accountName: string;
  // YYYY-MM-DD
  date: string;
  amount: number;
};

export type AccountUpdate = {
  accountId: string;
  // YYYY-MM-DD
  date: string;
  amount: number;
  updateId: number;
};
