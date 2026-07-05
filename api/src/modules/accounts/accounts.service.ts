import { AccountCategory, AccountsSummaryResponse, AppInputs } from '@spend-watcher/contract';
import { MonthYearDbDate, monthYearDbDateFormat } from '@type/dateTypes';
import { format, isBefore } from 'date-fns';
import {
  deleteAccount,
  findAccountGrowthOverTime,
  findAccountsWithLatestUpdate,
  findAccountUpdates,
  insertAccount,
  insertAccountUpdate,
  updateAccount,
  updateAccountActiveStatus,
  updateAccountUpdate,
} from './accounts.repository';
import { AccountUpdate, AccountValueDataPoint, AccountWithStatus } from './accounts.types';

function emptyCategoryRecord(): Record<AccountCategory, number> {
  return {
    [AccountCategory.CHECKING]: 0,
    [AccountCategory.SAVINGS]: 0,
    [AccountCategory.INVESTING]: 0,
    [AccountCategory.BONDS]: 0,
  };
}

// Aggregate the user's accounts into the summary payload.
export async function getAccountsSummary(username: string): Promise<AccountsSummaryResponse> {
  const fetchedAccounts = await findAccountsWithLatestUpdate(username);

  let totalEquity = 0;
  let totalAccountsCount = 0;
  const accountsCountByCategory = emptyCategoryRecord();
  const accountTotalsByType = emptyCategoryRecord();

  const currentMonthYearDate = format(new Date(), monthYearDbDateFormat);

  const accountsList = fetchedAccounts.map((account): AccountWithStatus => {
    const lastUpdated = format(account.date, monthYearDbDateFormat) as MonthYearDbDate;

    totalEquity += account.amount;
    accountTotalsByType[account.category] += account.amount;

    totalAccountsCount += 1;
    accountsCountByCategory[account.category] += 1;

    return {
      id: account.accountId,
      name: account.accountName,
      currentAccountValue: account.amount,
      category: account.category,
      isFixedRate: account.isFixedRate,
      annualPercentageRate: account.annualPercentageRate,
      lastUpdated,
      requiresNewUpdate: isBefore(lastUpdated, currentMonthYearDate),
    };
  });

  return {
    totalEquity,
    totalAccountsCount,
    accountTotalsByType,
    accountsCountByCategory,
    accountsList: accountsList.sort((a, b) => (a.currentAccountValue < b.currentAccountValue ? 1 : -1)),
  };
}

// Raw domain points — the controller owns shaping `date` into the response's yyyy-MM-dd string.
export function getAccountGrowthOverTime(username: string): Promise<AccountValueDataPoint[]> {
  return findAccountGrowthOverTime(username);
}

export function getAccountUpdates(accountId: string): Promise<AccountUpdate[]> {
  return findAccountUpdates(accountId);
}

export function addAccount(username: string, input: AppInputs['accounts']['add']): Promise<void> {
  return insertAccount(username, input);
}

export function editAccount(username: string, input: AppInputs['accounts']['edit']): Promise<void> {
  return updateAccount(username, input);
}

export function setAccountActive(username: string, input: AppInputs['accounts']['setActive']): Promise<void> {
  return updateAccountActiveStatus(username, input.accountId, input.isActive);
}

export function removeAccount(username: string, accountId: string): Promise<void> {
  return deleteAccount(username, accountId);
}

export function addAccountUpdate(input: AppInputs['accounts']['updateAdd']): Promise<void> {
  return insertAccountUpdate(input);
}

export function editAccountUpdate(input: AppInputs['accounts']['updateEdit']): Promise<void> {
  return updateAccountUpdate(input);
}
