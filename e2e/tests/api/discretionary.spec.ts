// Exercises: contract/src/spending.contract.ts (POST /spending/discretionary/{add,edit,delete})
// read back through GET /spending/details.

import { apiTest as test, expect } from '../../src/apiFixtures';
import { post } from '../../src/seed';
import { currentMonthRange, getJson } from '../../src/apiHelpers';
import { SpendingCategory, type AppInputs, type SpendingDetailsResponse } from '@spend-watcher/contract';

type DiscretionaryAdd = AppInputs['spending']['discretionaryAdd'];

const range = currentMonthRange();

function readDetails(api: Parameters<typeof getJson>[0]): Promise<SpendingDetailsResponse> {
  return getJson<SpendingDetailsResponse>(api, '/api/spending/details', range);
}

test.describe('Discretionary spending — CRUD round-trip', () => {
  test('add → read → edit → read → delete → gone', async ({ api }) => {
    const add: DiscretionaryAdd = {
      category: SpendingCategory.GROCERIES,
      amountSpent: 86,
      spentDate: range.startDate,
      note: 'Weekly groceries',
    };
    await post(api, '/api/spending/discretionary/add', add);

    // Read back through the real read path — the transaction the write reports must be the one
    // details returns, id and all.
    let details = await readDetails(api);
    expect(details.discretionaryTransactionIdList).toHaveLength(1);
    const transactionId = details.discretionaryTransactionIdList[0];
    expect(details.transactionDictionary[transactionId]).toMatchObject({
      category: 'GROCERIES',
      amountSpent: 86,
      note: 'Weekly groceries',
      isRecurring: false,
    });
    expect(details.summary.discretionaryTotals).toEqual({ amount: 86, count: 1 });

    // Edit the same transaction and confirm the read reflects every changed field.
    const edit: AppInputs['spending']['discretionaryEdit'] = {
      transactionId,
      category: SpendingCategory.RESTAURANTS,
      amountSpent: 40,
      spentDate: range.startDate,
      note: 'Dinner',
    };
    await post(api, '/api/spending/discretionary/edit', edit);

    details = await readDetails(api);
    expect(details.transactionDictionary[transactionId]).toMatchObject({
      category: 'RESTAURANTS',
      amountSpent: 40,
      note: 'Dinner',
    });
    expect(details.summary.discretionaryTotals).toEqual({ amount: 40, count: 1 });

    // Delete and confirm it's gone from the read.
    await post(api, '/api/spending/discretionary/delete', { transactionId });
    details = await readDetails(api);
    expect(details.discretionaryTransactionIdList).toHaveLength(0);
    expect(details.summary.discretionaryTotals).toEqual({ amount: 0, count: 0 });
  });
});

test.describe('Discretionary spending — input validation (400)', () => {
  const base: DiscretionaryAdd = {
    category: SpendingCategory.GROCERIES,
    amountSpent: 10,
    spentDate: range.startDate,
    note: 'ok',
  };

  const cases: { name: string; body: Record<string, unknown>; badPath: string }[] = [
    { name: 'unknown category', body: { ...base, category: 'NOT_A_CATEGORY' }, badPath: 'category' },
    { name: 'non-integer amount', body: { ...base, amountSpent: 24.5 }, badPath: 'amountSpent' },
    { name: 'negative amount', body: { ...base, amountSpent: -5 }, badPath: 'amountSpent' },
    { name: 'note over 60 chars', body: { ...base, note: 'N'.repeat(61) }, badPath: 'note' },
    { name: 'malformed date', body: { ...base, spentDate: '07/01/2026' }, badPath: 'spentDate' },
  ];

  for (const { name, body, badPath } of cases) {
    test(`rejects ${name}`, async ({ api }) => {
      const res = await api.post('/api/spending/discretionary/add', { data: body });
      expect(res.status()).toBe(400);
      const json = await res.json();
      expect(json.code).toBe('BAD_REQUEST');
      expect(json.data.issues.some((i: { path: string[] }) => i.path.includes(badPath))).toBe(true);
    });
  }

  test('rejects deleting with a mismatched id prefix (Recurring- on a discretionary route)', async ({ api }) => {
    const res = await api.post('/api/spending/discretionary/delete', { data: { transactionId: 'Recurring-1' } });
    expect(res.status()).toBe(400);
  });
});

test.describe('Discretionary spending — tenant isolation', () => {
  test("a user cannot edit or delete another user's transaction", async ({ api, otherApi }) => {
    await post(api, '/api/spending/discretionary/add', {
      category: 'GROCERIES',
      amountSpent: 50,
      spentDate: range.startDate,
      note: 'mine',
    });
    const { discretionaryTransactionIdList } = await readDetails(api);
    const transactionId = discretionaryTransactionIdList[0];

    // The api scopes writes by username, so a cross-tenant write is a silent no-op (200), not an
    // error — assert on the EFFECT: the owner's data is untouched.
    await post(otherApi, '/api/spending/discretionary/edit', {
      transactionId,
      category: 'RESTAURANTS',
      amountSpent: 9999,
      spentDate: range.startDate,
      note: 'hacked',
    });
    await post(otherApi, '/api/spending/discretionary/delete', { transactionId });

    const details = await readDetails(api);
    expect(details.discretionaryTransactionIdList).toEqual([transactionId]);
    expect(details.transactionDictionary[transactionId]).toMatchObject({
      category: 'GROCERIES',
      amountSpent: 50,
      note: 'mine',
    });

    // And the attacker's own ledger never saw the transaction.
    const otherDetails = await getJson<SpendingDetailsResponse>(otherApi, '/api/spending/details', range);
    expect(otherDetails.discretionaryTransactionIdList).toHaveLength(0);
  });
});
