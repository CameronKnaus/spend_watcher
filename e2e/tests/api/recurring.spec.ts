// Exercises: contract/src/spending.contract.ts recurring endpoints
// (POST /spending/recurring/{add,edit,delete,set-active}, /spending/recurring/transactions/{add,edit};
// GET /spending/recurring/{summary,transactions}).

import { apiTest as test, expect } from '../../src/apiFixtures';
import { post } from '../../src/seed';
import { getJson } from '../../src/apiHelpers';
import { format, subMonths } from 'date-fns';
import {
  SpendingCategory,
  type AppInputs,
  type RecurringSummaryResponse,
  type RecurringTransactionsListResponse,
} from '@spend-watcher/contract';

type RecurringAdd = AppInputs['spending']['recurringSpendAdd'];

const currentMonth = format(new Date(), 'yyyy-MM');
// Creating a recurring spend already inserts a current-month transaction, and
// recurring_transactions has UNIQUE(recurring_spend_id, date) — so a per-month add targets a month
// that doesn't already have one (the real use: filling in a missing prior month for a variable spend).
const previousMonth = format(subMonths(new Date(), 1), 'yyyy-MM');

function readSummary(api: Parameters<typeof getJson>[0]): Promise<RecurringSummaryResponse> {
  return getJson<RecurringSummaryResponse>(api, '/api/spending/recurring/summary');
}

async function addAndFindId(api: Parameters<typeof getJson>[0], input: RecurringAdd): Promise<string> {
  await post(api, '/api/spending/recurring/add', input);
  const summary = await readSummary(api);
  const spend = [...summary.activeRecurringTransactions, ...summary.inactiveRecurringTransactions].find(
    (s) => s.recurringSpendName === input.recurringSpendName,
  );
  if (!spend) throw new Error(`recurring spend '${input.recurringSpendName}' not found after add`);
  return spend.recurringSpendId;
}

test.describe('Recurring spending — CRUD round-trip', () => {
  test('a fixed recurring spend auto-backfills the current month on creation', async ({ api }) => {
    await post(api, '/api/spending/recurring/add', {
      category: SpendingCategory.UTILITIES,
      recurringSpendName: 'Internet',
      expectedMonthlyAmount: 60,
      isVariableRecurring: false,
    });

    const summary = await readSummary(api);
    expect(summary.activeRecurringTransactions).toHaveLength(1);
    expect(summary.activeRecurringTransactions[0]).toMatchObject({
      recurringSpendName: 'Internet',
      expectedMonthlyAmount: 60,
      // The api backfills a fixed spend's current-month transaction at creation, so the actual
      // amount already equals the expected amount and no update is pending.
      amountSpent: 60,
      isActive: true,
      requiresMonthlyUpdate: false,
    });
    expect(summary.actualMonthlyTotal).toBe(60);
    expect(summary.averageEstimatedMonthlyTotal).toBe(60);
  });

  test('edit → set inactive → delete each reflect in the summary', async ({ api }) => {
    const spendId = await addAndFindId(api, {
      category: SpendingCategory.UTILITIES,
      recurringSpendName: 'Internet',
      expectedMonthlyAmount: 60,
      isVariableRecurring: false,
    });

    const edit: AppInputs['spending']['recurringSpendEdit'] = {
      recurringSpendId: spendId,
      category: SpendingCategory.ENTERTAINMENT,
      recurringSpendName: 'Streaming',
      expectedMonthlyAmount: 20,
      isVariableRecurring: false,
    };
    await post(api, '/api/spending/recurring/edit', edit);

    let summary = await readSummary(api);
    expect(summary.activeRecurringTransactions[0]).toMatchObject({
      recurringSpendName: 'Streaming',
      category: SpendingCategory.ENTERTAINMENT,
      expectedMonthlyAmount: 20,
    });

    await post(api, '/api/spending/recurring/set-active', { recurringSpendId: spendId, isActive: false });
    summary = await readSummary(api);
    expect(summary.activeRecurringTransactions).toHaveLength(0);
    expect(summary.inactiveRecurringTransactions).toHaveLength(1);

    await post(api, '/api/spending/recurring/delete', { recurringSpendId: spendId });
    summary = await readSummary(api);
    expect(summary.activeRecurringTransactions).toHaveLength(0);
    expect(summary.inactiveRecurringTransactions).toHaveLength(0);
  });

  test('a per-month transaction can be added and edited on a variable spend', async ({ api }) => {
    const spendId = await addAndFindId(api, {
      category: SpendingCategory.UTILITIES,
      recurringSpendName: 'Electric',
      expectedMonthlyAmount: 100,
      isVariableRecurring: true,
    });

    await post(api, '/api/spending/recurring/transactions/add', {
      recurringSpendId: spendId,
      amountSpent: 120,
      date: previousMonth,
    });

    let list = await getJson<RecurringTransactionsListResponse>(api, '/api/spending/recurring/transactions', {
      recurringSpendId: spendId,
    });
    const prior = list.transactions.find((t) => t.date === previousMonth);
    expect(prior?.amountSpent).toBe(120);

    await post(api, '/api/spending/recurring/transactions/edit', {
      transactionId: prior!.transactionId,
      amountSpent: 95,
    });
    list = await getJson<RecurringTransactionsListResponse>(api, '/api/spending/recurring/transactions', {
      recurringSpendId: spendId,
    });
    expect(list.transactions.find((t) => t.transactionId === prior!.transactionId)?.amountSpent).toBe(95);
  });
});

test.describe('Recurring spending — input validation (400)', () => {
  const base: RecurringAdd = {
    category: SpendingCategory.UTILITIES,
    recurringSpendName: 'Internet',
    expectedMonthlyAmount: 60,
    isVariableRecurring: false,
  };

  const cases: { name: string; body: Record<string, unknown>; badPath: string }[] = [
    { name: 'blank name', body: { ...base, recurringSpendName: '' }, badPath: 'recurringSpendName' },
    // The DB column is varchar(30); contract + ui now agree on that bound.
    {
      name: 'name over 30 chars',
      body: { ...base, recurringSpendName: 'N'.repeat(31) },
      badPath: 'recurringSpendName',
    },
    { name: 'unknown category', body: { ...base, category: 'NOPE' }, badPath: 'category' },
    { name: 'non-positive amount', body: { ...base, expectedMonthlyAmount: 0 }, badPath: 'expectedMonthlyAmount' },
  ];

  for (const { name, body, badPath } of cases) {
    test(`rejects ${name}`, async ({ api }) => {
      const res = await api.post('/api/spending/recurring/add', { data: body });
      expect(res.status()).toBe(400);
      const json = await res.json();
      expect(json.code).toBe('BAD_REQUEST');
      expect(json.data.issues.some((i: { path: string[] }) => i.path.includes(badPath))).toBe(true);
    });
  }

  test('accepts a name of exactly 30 characters (the DB max)', async ({ api }) => {
    const res = await api.post('/api/spending/recurring/add', {
      data: { ...base, recurringSpendName: 'N'.repeat(30) },
    });
    expect(res.status()).toBe(200);
  });
});

// Regression guard for a fixed IDOR: `recurring_transactions` has no username column, and these
// three endpoints once queried it by recurringSpendId / transaction_id alone. Because transaction
// ids are sequential integers surfaced as `Recurring-<n>`, any user could read, edit, or graft
// transactions onto another user's recurring spend. All three are now scoped through the parent
// `recurring_spending.username`. If any of these assertions fails, the isolation hole is back.
test.describe('Recurring spending — tenant isolation (IDOR regression)', () => {
  test("another user cannot read a spend's transaction history", async ({ api, otherApi }) => {
    const spendId = await addAndFindId(api, {
      category: SpendingCategory.UTILITIES,
      recurringSpendName: 'Internet',
      expectedMonthlyAmount: 60,
      isVariableRecurring: false,
    });

    const leaked = await getJson<RecurringTransactionsListResponse>(otherApi, '/api/spending/recurring/transactions', {
      recurringSpendId: spendId,
    });
    expect(leaked.transactions).toHaveLength(0);
  });

  test("another user cannot edit or add transactions on a spend they don't own", async ({ api, otherApi }) => {
    const spendId = await addAndFindId(api, {
      category: SpendingCategory.UTILITIES,
      recurringSpendName: 'Internet',
      expectedMonthlyAmount: 60,
      isVariableRecurring: false,
    });
    const ownerTxnId = (await readSummary(api)).activeRecurringTransactions[0].transactionId;

    // Both are silent no-ops for a non-owner (scoped UPDATE / INSERT..SELECT affect 0 rows), so
    // assert the owner's data is untouched rather than on a status code.
    await post(otherApi, '/api/spending/recurring/transactions/edit', {
      transactionId: ownerTxnId,
      amountSpent: 99999,
    });
    await post(otherApi, '/api/spending/recurring/transactions/add', {
      recurringSpendId: spendId,
      amountSpent: 42,
      date: currentMonth,
    });

    const list = await getJson<RecurringTransactionsListResponse>(api, '/api/spending/recurring/transactions', {
      recurringSpendId: spendId,
    });
    expect(list.transactions).toEqual([{ transactionId: ownerTxnId, date: currentMonth, amountSpent: 60 }]);
  });
});
