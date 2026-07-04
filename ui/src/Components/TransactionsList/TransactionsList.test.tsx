import { describe, expect, it } from 'vitest';
import { HttpResponse, http, makeTimeFrame, renderWithProviders, screen, server, waitFor } from 'test/testUtils';
import { spendingDetailsResponse } from '@msw/mocks/spending/spendingDetailsResponse';
import { SpendingCategory, type SpendingDetailsResponse } from '@spend-watcher/contract';
import TransactionsList from './TransactionsList';

function makeDetailsWithTransactions(): SpendingDetailsResponse {
  return {
    ...spendingDetailsResponse,
    transactionDictionary: {
      'Discretionary-1': {
        transactionId: 'Discretionary-1',
        isRecurring: false,
        category: SpendingCategory.GROCERIES,
        amountSpent: 86,
        spentDate: '2026-06-14',
        note: 'Weekly groceries',
      },
      'Discretionary-2': {
        transactionId: 'Discretionary-2',
        isRecurring: false,
        category: SpendingCategory.RESTAURANTS,
        amountSpent: 25,
        spentDate: '2026-06-12',
        note: 'Lunch',
      },
    },
    transactionsByDate: {
      '2026-06-14': {
        total: { amount: 86, count: 1 },
        discretionaryTotals: { amount: 86, count: 1 },
        recurringTotals: { amount: 0, count: 0 },
        includedTransactions: ['Discretionary-1'],
      },
      '2026-06-12': {
        total: { amount: 25, count: 1 },
        discretionaryTotals: { amount: 25, count: 1 },
        recurringTotals: { amount: 0, count: 0 },
        includedTransactions: ['Discretionary-2'],
      },
      // A recurring-only day: no discretionary spend
      '2026-06-01': {
        total: { amount: 60, count: 1 },
        discretionaryTotals: { amount: 0, count: 0 },
        recurringTotals: { amount: 60, count: 1 },
        includedTransactions: ['Recurring-1'],
      },
    },
  } satisfies SpendingDetailsResponse;
}

function renderList(details: SpendingDetailsResponse) {
  server.use(http.get('*/api/spending/details', () => HttpResponse.json(details)));
  return renderWithProviders(<TransactionsList />, { timeFrame: makeTimeFrame() });
}

describe('TransactionsList', () => {
  it('groups discretionary transactions under date headers with negated day totals', async () => {
    renderList(makeDetailsWithTransactions());

    // Regex names: jsdom's accessible-name computation omits the visual space between the
    // adjacent label/amount spans (a real browser reports "Groceries -$86.00 …").
    expect(await screen.findByRole('heading', { name: /Jun 14th.*\$86\.00/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Groceries.*\$86\.00.*Weekly groceries/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Jun 12th.*\$25\.00/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Dining out.*\$25\.00.*Lunch/ })).toBeInTheDocument();
  });

  it('skips dates that only contain recurring spend', async () => {
    renderList(makeDetailsWithTransactions());

    await screen.findByRole('heading', { name: /Jun 14th/ });
    expect(screen.queryByRole('heading', { name: /Jun 1st/ })).not.toBeInTheDocument();
  });

  it('renders no transaction groups for an empty month', async () => {
    const { queryClient } = renderList(spendingDetailsResponse); // transactionsByDate is empty in the base mock

    expect(screen.getByRole('heading', { name: 'Discretionary transactions' })).toBeInTheDocument();
    // Wait for the fetch to settle so the empty state is asserted against loaded data.
    await waitFor(() => expect(queryClient.isFetching()).toBe(0));
    expect(screen.queryAllByRole('button', { name: /-\$/ })).toHaveLength(0);
  });
});
