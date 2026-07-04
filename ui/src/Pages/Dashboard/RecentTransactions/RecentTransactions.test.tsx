import { beforeEach, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse, renderWithProviders, screen, server } from 'test/testUtils';
import { spendingDetailsResponse } from '@msw/mocks/spending/spendingDetailsResponse';
import { SpendingCategory, type SpendingDetailsResponse } from '@spend-watcher/contract';
import RecentTransactions from './RecentTransactions';

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date(2026, 5, 15)); // June 15, 2026
});

type DiscretionaryId = SpendingDetailsResponse['discretionaryTransactionIdList'][number];
type DaySpec = { date: string; ids: DiscretionaryId[] };

function makeDetails(days: DaySpec[]): SpendingDetailsResponse {
  const transactionDictionary: SpendingDetailsResponse['transactionDictionary'] = {};
  const transactionsByDate: SpendingDetailsResponse['transactionsByDate'] = {};
  for (const day of days) {
    for (const id of day.ids) {
      transactionDictionary[id] = {
        transactionId: id,
        isRecurring: false,
        category: SpendingCategory.GROCERIES,
        amountSpent: 10,
        spentDate: day.date,
        note: `note-${id}`,
      };
    }
    transactionsByDate[day.date] = {
      total: { amount: day.ids.length * 10, count: day.ids.length },
      discretionaryTotals: { amount: day.ids.length * 10, count: day.ids.length },
      recurringTotals: { amount: 0, count: 0 },
      includedTransactions: day.ids,
    };
  }
  return { ...spendingDetailsResponse, transactionDictionary, transactionsByDate } satisfies SpendingDetailsResponse;
}

function renderRecent(details: SpendingDetailsResponse) {
  server.use(http.get('*/api/spending/details', () => HttpResponse.json(details)));
  return renderWithProviders(<RecentTransactions />);
}

describe('RecentTransactions windowing', () => {
  it('includes whole-day groups until the 5-transaction target is passed', async () => {
    renderRecent(
      makeDetails([
        { date: '2026-06-15', ids: ['Discretionary-1', 'Discretionary-2', 'Discretionary-3'] },
        { date: '2026-06-14', ids: ['Discretionary-4', 'Discretionary-5', 'Discretionary-6'] },
        // Already at 6 transactions (> 5): this whole day must be dropped.
        { date: '2026-06-12', ids: ['Discretionary-7'] },
      ]),
    );

    expect(await screen.findByText(/note-Discretionary-1/)).toBeInTheDocument();
    expect(screen.getByText(/note-Discretionary-6/)).toBeInTheDocument();
    expect(screen.queryByText(/note-Discretionary-7/)).not.toBeInTheDocument();
  });

  it('stops at the first day with no discretionary spend', async () => {
    const details = makeDetails([
      { date: '2026-06-15', ids: ['Discretionary-1'] },
      { date: '2026-06-14', ids: [] }, // recurring-only day: zero discretionary count
      { date: '2026-06-13', ids: ['Discretionary-2'] },
    ]);
    renderRecent(details);

    expect(await screen.findByText(/note-Discretionary-1/)).toBeInTheDocument();
    // The scan stops at the empty day, so later days never render.
    expect(screen.queryByText(/note-Discretionary-2/)).not.toBeInTheDocument();
  });

  it('labels today and yesterday, and leaves older dates as plain labels', async () => {
    renderRecent(
      makeDetails([
        { date: '2026-06-15', ids: ['Discretionary-1'] },
        { date: '2026-06-14', ids: ['Discretionary-2'] },
        { date: '2026-06-12', ids: ['Discretionary-3'] },
      ]),
    );

    expect(await screen.findByRole('heading', { name: /Jun 15th - Today/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Jun 14th - Yesterday/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Jun 12th/ })).toBeInTheDocument();
  });

  it('shows the empty-state copy when there are no transactions', async () => {
    renderRecent(makeDetails([]));

    expect(await screen.findByText('You do not have any transactions this month.')).toBeInTheDocument();
  });
});
