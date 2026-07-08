import { describe, it, expect } from 'vitest';
import { http, HttpResponse, makeTimeFrame, renderWithProviders, screen, server, within } from 'test/testUtils';
import { spendingDetailsResponse } from '@msw/mocks/spending/spendingDetailsResponse';
import { DateRangeType } from 'Contexts/SelectedTimeFrame.context';
import { SpendingCategory } from '@spend-watcher/contract';
import CategoryLedgerTile from './CategoryLedgerTile';

const groceriesRun = {
  transactionId: 'Discretionary-11' as const,
  isRecurring: false as const,
  category: SpendingCategory.GROCERIES,
  amountSpent: 128.4,
  spentDate: '2026-06-14',
  note: 'Costco run',
};

describe('CategoryLedgerTile', () => {
  it('sorts categories by signed change with no-baseline categories last', async () => {
    renderWithProviders(<CategoryLedgerTile />, { timeFrame: makeTimeFrame() });

    expect(await screen.findByRole('heading', { name: 'Categories' })).toBeInTheDocument();
    const rows = await screen.findAllByTestId('ledger-category-row');
    expect(rows).toHaveLength(4);

    // Trends mock: GROCERIES +16%, UTILITIES 0%, RESTAURANTS −19%, ENTERTAINMENT no baseline.
    expect(within(rows[0]).getByText('Groceries')).toBeInTheDocument();
    expect(within(rows[0]).getByText('+16%')).toBeInTheDocument();
    expect(within(rows[0]).getByText('avg $74.3/mo')).toBeInTheDocument();
    expect(within(rows[1]).getByText('Utilities')).toBeInTheDocument();
    expect(within(rows[2]).getByText('Dining out')).toBeInTheDocument();
    expect(within(rows[2]).getByText('−19%')).toBeInTheDocument();
    expect(within(rows[3]).getByText('Entertainment')).toBeInTheDocument();
  });

  it('opens the biggest mover by default with its six-month history', async () => {
    renderWithProviders(<CategoryLedgerTile />, { timeFrame: makeTimeFrame() });

    expect(await screen.findByText('June 2026 · 0 transaction(s)')).toBeInTheDocument();
    expect(screen.getByText('vs your 3-mo average')).toBeInTheDocument();
    expect(screen.getAllByTestId('ledger-history-bar')).toHaveLength(6);
    expect(screen.getByText('No discretionary transactions this month.')).toBeInTheDocument();
  });

  it('re-selects a category when its row is clicked', async () => {
    const { user } = renderWithProviders(<CategoryLedgerTile />, { timeFrame: makeTimeFrame() });

    const rows = await screen.findAllByTestId('ledger-category-row');
    await user.click(rows[2]);

    // The detail header now shows Dining out's numbers: $25 current (also in its list row),
    // −19% vs its average (list badge + header badge).
    expect(await screen.findAllByText('$25.00')).toHaveLength(2);
    expect(screen.getAllByText('−19%')).toHaveLength(2);
  });

  it('lists only the selected category’s discretionary transactions, newest first', async () => {
    const withTransactions = {
      ...spendingDetailsResponse,
      transactionDictionary: {
        'Discretionary-11': groceriesRun,
        'Discretionary-12': {
          ...groceriesRun,
          transactionId: 'Discretionary-12' as const,
          amountSpent: 12,
          spentDate: '2026-06-06',
          note: 'corner store',
        },
        'Discretionary-13': {
          ...groceriesRun,
          transactionId: 'Discretionary-13' as const,
          category: SpendingCategory.RESTAURANTS,
          amountSpent: 60,
          spentDate: '2026-06-10',
          note: 'takeout',
        },
        'Recurring-9': {
          transactionId: 'Recurring-9' as const,
          isRecurring: true as const,
          category: SpendingCategory.GROCERIES,
          amountSpent: 999,
          spentDate: '2026-06-01',
          expectedMonthlyAmount: 999,
          recurringSpendName: 'Meal kit',
          recurringSpendId: 'r-9',
          isVariableRecurring: false,
          isActive: true,
          requiresMonthlyUpdate: false,
        },
      },
    };
    server.use(http.get('*/api/spending/details', () => HttpResponse.json(withTransactions)));
    renderWithProviders(<CategoryLedgerTile />, { timeFrame: makeTimeFrame() });

    expect(await screen.findByText('June 2026 · 2 transaction(s)')).toBeInTheDocument();
    expect(screen.getByText('Costco run')).toBeInTheDocument();
    expect(screen.getByText('corner store')).toBeInTheDocument();
    expect(screen.queryByText('takeout')).toBeNull();
    expect(screen.queryByText('$999.00')).toBeNull();

    const dates = screen.getAllByText(/^Jun \d+$/).map((el) => el.textContent);
    expect(dates).toEqual(['Jun 14', 'Jun 6']);
  });

  it('renders nothing in yearly mode', () => {
    const { container } = renderWithProviders(<CategoryLedgerTile />, {
      timeFrame: makeTimeFrame({ dateRangeType: DateRangeType.YEAR }),
    });

    expect(container).toBeEmptyDOMElement();
  });
});
