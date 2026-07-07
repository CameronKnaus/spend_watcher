// Exercises: contract/src/accounts.contract.ts
// (POST /accounts/{add,edit,set-active,delete,update/add,update/edit}; GET /accounts/summary, /accounts/history).

import { apiTest as test, expect } from '../../src/apiFixtures';
import { post } from '../../src/seed';
import { getJson } from '../../src/apiHelpers';
import { format, subMonths } from 'date-fns';
import {
  AccountCategory,
  type AccountGrowthOverTimeResponse,
  type AccountsSummaryResponse,
  type AccountHistoryResponse,
  type AppInputs,
} from '@spend-watcher/contract';

type AccountAdd = AppInputs['accounts']['add'];

const currentMonth = format(new Date(), 'yyyy-MM');

function readSummary(api: Parameters<typeof getJson>[0]): Promise<AccountsSummaryResponse> {
  return getJson<AccountsSummaryResponse>(api, '/api/accounts/summary');
}

async function addAndFindId(api: Parameters<typeof getJson>[0], input: AccountAdd): Promise<string> {
  await post(api, '/api/accounts/add', input);
  const summary = await readSummary(api);
  const account = summary.accountsList.find((a) => a.name === input.accountName);
  if (!account) throw new Error(`account '${input.accountName}' not found after add`);
  return account.id;
}

test.describe('Accounts — CRUD round-trip', () => {
  test('add → summary → edit → history update → delete', async ({ api }) => {
    const accountId = await addAndFindId(api, {
      accountName: 'Test Checking',
      startingAccountValue: 5000,
      accountCategory: AccountCategory.CHECKING,
      isFixedRate: true,
      annualPercentageRate: 0,
    });

    let summary = await readSummary(api);
    expect(summary.totalEquity).toBe(5000);
    expect(summary.totalAccountsCount).toBe(1);
    expect(summary.accountsCountByCategory).toMatchObject({ CHECKING: 1, SAVINGS: 0 });
    expect(summary.accountTotalsByType).toMatchObject({ CHECKING: 5000 });
    expect(summary.accountsList[0]).toMatchObject({
      name: 'Test Checking',
      currentAccountValue: 5000,
      category: 'CHECKING',
      // Adding an account auto-creates the current month's history entry, so no update is pending.
      lastUpdated: currentMonth,
      requiresNewUpdate: false,
    });

    // Rename + recategorize.
    await post(api, '/api/accounts/edit', {
      accountId,
      accountName: 'Primary Savings',
      accountCategory: AccountCategory.SAVINGS,
      isFixedRate: true,
      annualPercentageRate: 0,
    });
    summary = await readSummary(api);
    expect(summary.accountsList[0]).toMatchObject({ name: 'Primary Savings', category: 'SAVINGS' });
    expect(summary.accountTotalsByType).toMatchObject({ CHECKING: 0, SAVINGS: 5000 });

    // Edit this month's existing update (auto-created at 5000 on account creation) — equity follows.
    // Editing the single current-month row keeps the assertion deterministic; update/add would append
    // a second same-month row (there's no unique constraint on account_id+date).
    let history = await getJson<AccountHistoryResponse>(api, '/api/accounts/history', { accountId });
    const currentUpdate = history.updateHistory.find((u) => u.date === currentMonth);
    expect(currentUpdate?.amount).toBe(5000);
    await post(api, '/api/accounts/update/edit', {
      accountId,
      updateId: currentUpdate!.updateId,
      amount: 5250,
    });

    summary = await readSummary(api);
    expect(summary.totalEquity).toBe(5250);
    expect(summary.accountsList[0].currentAccountValue).toBe(5250);

    history = await getJson<AccountHistoryResponse>(api, '/api/accounts/history', { accountId });
    expect(history.updateHistory.find((u) => u.date === currentMonth)?.amount).toBe(5250);

    await post(api, '/api/accounts/delete', { accountId });
    summary = await readSummary(api);
    expect(summary.totalAccountsCount).toBe(0);
    expect(summary.totalEquity).toBe(0);
  });

  test('equity sums across multiple accounts and types', async ({ api }) => {
    await post(api, '/api/accounts/add', {
      accountName: 'Checking',
      startingAccountValue: 1000,
      accountCategory: AccountCategory.CHECKING,
      isFixedRate: true,
      annualPercentageRate: 0,
    });
    await post(api, '/api/accounts/add', {
      accountName: 'Brokerage',
      startingAccountValue: 4000,
      accountCategory: AccountCategory.INVESTING,
      isFixedRate: false,
      annualPercentageRate: 5,
    });

    const summary = await readSummary(api);
    expect(summary.totalEquity).toBe(5000);
    expect(summary.totalAccountsCount).toBe(2);
    expect(summary.accountTotalsByType).toMatchObject({ CHECKING: 1000, INVESTING: 4000 });
  });
});

test.describe('Accounts — growth over time', () => {
  // The rows behind this endpoint are Date-typed and shaped to yyyy-MM-dd in the controller; this
  // is the suite's only authenticated read of it, pinning the formatting and per-update fan-out.
  test('returns one yyyy-MM-dd dated point per balance update', async ({ api }) => {
    const previousMonth = format(subMonths(new Date(), 1), 'yyyy-MM');
    const accountId = await addAndFindId(api, {
      accountName: 'Growth Account',
      startingAccountValue: 1000,
      accountCategory: AccountCategory.SAVINGS,
      isFixedRate: true,
      annualPercentageRate: 0,
    });
    // Creation already inserted the current month's update (1000); fill in last month at 1500.
    await post(api, '/api/accounts/update/add', { accountId, amount: 1500, date: previousMonth });

    const points = await getJson<AccountGrowthOverTimeResponse>(api, '/api/accounts/growth-over-time');
    const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date));
    expect(sorted).toEqual([
      { accountId, accountName: 'Growth Account', date: `${previousMonth}-01`, amount: 1500 },
      { accountId, accountName: 'Growth Account', date: `${currentMonth}-01`, amount: 1000 },
    ]);
  });
});

test.describe('Accounts — input validation (400)', () => {
  const base: AccountAdd = {
    accountName: 'Valid Name',
    startingAccountValue: 100,
    accountCategory: AccountCategory.CHECKING,
    isFixedRate: true,
    annualPercentageRate: 0,
  };

  const cases: { name: string; body: Record<string, unknown>; badPath: string }[] = [
    { name: 'name under 3 chars', body: { ...base, accountName: 'ab' }, badPath: 'accountName' },
    // The DB column is varchar(50).
    { name: 'name over 50 chars', body: { ...base, accountName: 'A'.repeat(51) }, badPath: 'accountName' },
    { name: 'unknown category', body: { ...base, accountCategory: 'CRYPTO' }, badPath: 'accountCategory' },
  ];

  for (const { name, body, badPath } of cases) {
    test(`rejects ${name}`, async ({ api }) => {
      const res = await api.post('/api/accounts/add', { data: body });
      expect(res.status()).toBe(400);
      const json = await res.json();
      expect(json.code).toBe('BAD_REQUEST');
      expect(json.data.issues.some((i: { path: string[] }) => i.path.includes(badPath))).toBe(true);
    });
  }

  test('accepts a name of exactly 50 characters (the DB max)', async ({ api }) => {
    const res = await api.post('/api/accounts/add', { data: { ...base, accountName: 'A'.repeat(50) } });
    expect(res.status()).toBe(200);
  });
});

test.describe('Accounts — tenant isolation', () => {
  test("a user cannot edit or delete another user's account", async ({ api, otherApi }) => {
    const accountId = await addAndFindId(api, {
      accountName: 'Test Checking',
      startingAccountValue: 5000,
      accountCategory: AccountCategory.CHECKING,
      isFixedRate: true,
      annualPercentageRate: 0,
    });

    await post(otherApi, '/api/accounts/edit', {
      accountId,
      accountName: 'Hacked',
      accountCategory: AccountCategory.BONDS,
      isFixedRate: true,
      annualPercentageRate: 0,
    });
    await post(otherApi, '/api/accounts/delete', { accountId });

    const summary = await readSummary(api);
    expect(summary.accountsList).toHaveLength(1);
    expect(summary.accountsList[0]).toMatchObject({ name: 'Test Checking', category: 'CHECKING' });

    // The attacker's own account list stayed empty.
    const otherSummary = await getJson<AccountsSummaryResponse>(otherApi, '/api/accounts/summary');
    expect(otherSummary.accountsList).toHaveLength(0);
  });

  // Regression guard for a fixed IDOR: `money_account_updates` has no username column, and history /
  // update-add / update-edit once queried it by account_id / update_id alone (update_id is a
  // sequential int). All three are now scoped through the parent `money_accounts.username`.
  test("another user's history read does not expose an account (IDOR regression)", async ({ api, otherApi }) => {
    const accountId = await addAndFindId(api, {
      accountName: 'Private Account',
      startingAccountValue: 1234,
      accountCategory: AccountCategory.SAVINGS,
      isFixedRate: true,
      annualPercentageRate: 0,
    });

    const leaked = await getJson<AccountHistoryResponse>(otherApi, '/api/accounts/history', { accountId });
    expect(leaked.updateHistory).toHaveLength(0);
  });

  test("another user cannot add or edit an account's balance updates (IDOR regression)", async ({ api, otherApi }) => {
    const accountId = await addAndFindId(api, {
      accountName: 'Private Account',
      startingAccountValue: 1234,
      accountCategory: AccountCategory.SAVINGS,
      isFixedRate: true,
      annualPercentageRate: 0,
    });
    const history = await getJson<AccountHistoryResponse>(api, '/api/accounts/history', { accountId });
    const ownerUpdateId = history.updateHistory[0].updateId;

    // Both are silent no-ops for a non-owner (scoped UPDATE / INSERT..SELECT affect 0 rows).
    await post(otherApi, '/api/accounts/update/edit', { accountId, updateId: ownerUpdateId, amount: 99999 });
    await post(otherApi, '/api/accounts/update/add', { accountId, amount: 42, date: currentMonth });

    const after = await getJson<AccountHistoryResponse>(api, '/api/accounts/history', { accountId });
    expect(after.updateHistory).toEqual([{ date: currentMonth, amount: 1234, updateId: ownerUpdateId }]);
  });
});
