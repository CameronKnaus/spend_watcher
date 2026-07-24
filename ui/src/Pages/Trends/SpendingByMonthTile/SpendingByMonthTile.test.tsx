import { describe, it, expect } from 'vitest';
import { http, HttpResponse, makeTimeFrame, renderWithProviders, screen, server } from 'test/testUtils';
import { spendingDetailsResponse } from '@msw/mocks/spending/spendingDetailsResponse';
import { DateRangeType } from 'Contexts/SelectedTimeFrame.context';
import { SpendingCategory } from '@spend-watcher/contract';
import SpendingByMonthTile from './SpendingByMonthTile';

describe('SpendingByMonthTile', () => {
  it('defaults to the priciest month with its delta badge and comparison rows', async () => {
    renderWithProviders(<SpendingByMonthTile />, { timeFrame: makeTimeFrame() });

    expect(await screen.findByRole('heading', { name: 'Spending by month' })).toBeInTheDocument();

    // Baseline month sums 170/170/170/158/168/186 — June (last, priciest) is preselected,
    // $15.67 above the 170.33 average.
    expect(await screen.findByText('June 2026')).toBeInTheDocument();
    expect(screen.getAllByTestId('month-bar')).toHaveLength(6);
    expect(screen.getByTestId('month-delta-badge')).toHaveTextContent('$15.67 above your average');

    // GROCERIES June 86 vs 73 avg of the other five months; ENTERTAINMENT only exists in June.
    expect(screen.getByText('+18%')).toBeInTheDocument();
    expect(screen.getByText('new')).toBeInTheDocument();

    // The baseline details mock has no transactions in its dictionary.
    expect(screen.getByText('No discretionary transactions this month.')).toBeInTheDocument();
  });

  it('re-selects a month when its bar is clicked', async () => {
    const { user } = renderWithProviders(<SpendingByMonthTile />, { timeFrame: makeTimeFrame() });

    await screen.findByText('June 2026');
    const [firstMonthBar] = screen.getAllByTestId('month-bar');
    if (!firstMonthBar) {
      throw new Error('expected at least one month bar');
    }
    await user.click(firstMonthBar);

    expect(await screen.findByText('January 2026')).toBeInTheDocument();
    expect(screen.getByTestId('month-delta-badge')).toHaveTextContent('$0.33 below your average');
  });

  it('lists the top three discretionary transactions as what drove the month', async () => {
    const base = spendingDetailsResponse.transactionDictionary;
    const withTransactions = {
      ...spendingDetailsResponse,
      transactionDictionary: {
        ...base,
        'Discretionary-1': {
          transactionId: 'Discretionary-1' as const,
          isRecurring: false as const,
          category: SpendingCategory.ENTERTAINMENT,
          amountSpent: 180,
          spentDate: '2026-06-10',
          note: 'Concert tickets ×2',
        },
        'Discretionary-2': {
          transactionId: 'Discretionary-2' as const,
          isRecurring: false as const,
          category: SpendingCategory.RESTAURANTS,
          amountSpent: 142.35,
          spentDate: '2026-06-12',
          note: 'Anniversary dinner',
        },
        'Discretionary-3': {
          transactionId: 'Discretionary-3' as const,
          isRecurring: false as const,
          category: SpendingCategory.GROCERIES,
          amountSpent: 128.4,
          spentDate: '2026-06-14',
          note: '',
        },
        'Discretionary-4': {
          transactionId: 'Discretionary-4' as const,
          isRecurring: false as const,
          category: SpendingCategory.TREATS,
          amountSpent: 5,
          spentDate: '2026-06-15',
          note: 'small treat',
        },
        'Recurring-9': {
          transactionId: 'Recurring-9' as const,
          isRecurring: true as const,
          category: SpendingCategory.UTILITIES,
          amountSpent: 999,
          spentDate: '2026-06-01',
          expectedMonthlyAmount: 999,
          recurringSpendName: 'Mega bill',
          recurringSpendId: 'r-9',
          isVariableRecurring: false,
          isActive: true,
          requiresMonthlyUpdate: false,
        },
      },
    };
    server.use(http.get('*/api/spending/details', () => HttpResponse.json(withTransactions)));
    renderWithProviders(<SpendingByMonthTile />, { timeFrame: makeTimeFrame() });

    expect(await screen.findByText('Concert tickets ×2')).toBeInTheDocument();
    expect(screen.getByText('$180.00')).toBeInTheDocument();
    expect(screen.getByText('Anniversary dinner')).toBeInTheDocument();
    // A blank note falls back to the category label; the 4th-largest and recurring never show.
    expect(screen.getByText('$128.40')).toBeInTheDocument();
    expect(screen.queryByText('small treat')).toBeNull();
    expect(screen.queryByText('$999.00')).toBeNull();
  });

  it('renders nothing in yearly mode', () => {
    const { container } = renderWithProviders(<SpendingByMonthTile />, {
      timeFrame: makeTimeFrame({ dateRangeType: DateRangeType.YEAR }),
    });

    expect(container).toBeEmptyDOMElement();
  });
});
