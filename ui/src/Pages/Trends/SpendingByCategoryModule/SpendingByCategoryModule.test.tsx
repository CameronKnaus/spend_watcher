import { describe, it, expect } from 'vitest';
import { http, HttpResponse, makeTimeFrame, renderWithProviders, screen, server, within } from 'test/testUtils';
import { spendingDetailsResponse } from '@msw/mocks/spending/spendingDetailsResponse';
import { DateRangeType } from 'Contexts/SelectedTimeFrame.context';
import SpendingByCategoryModule from './SpendingByCategoryModule';

describe('SpendingByCategoryModule', () => {
  it('renders categories sorted by total with their share of the period', async () => {
    renderWithProviders(<SpendingByCategoryModule />, { timeFrame: makeTimeFrame() });

    expect(screen.getByRole('heading', { name: 'Spending by category' })).toBeInTheDocument();
    expect(await screen.findByText('Groceries')).toBeInTheDocument();

    // The mock list is intentionally unsorted; rows must sort by combined total descending.
    const rows = screen.getAllByRole('row').slice(1);
    const [groceriesRow, utilitiesRow, restaurantsRow, entertainmentRow] = rows;
    if (!groceriesRow || !utilitiesRow || !restaurantsRow || !entertainmentRow) {
      throw new Error('expected four category rows');
    }
    expect(within(groceriesRow).getByText('Groceries')).toBeInTheDocument();
    expect(within(groceriesRow).getByText('-$86.00')).toBeInTheDocument();
    expect(within(groceriesRow).getByText('46%')).toBeInTheDocument();
    expect(within(utilitiesRow).getByText('Utilities')).toBeInTheDocument();
    expect(within(restaurantsRow).getByText('Dining out')).toBeInTheDocument();
    expect(within(entertainmentRow).getByText('Entertainment')).toBeInTheDocument();
    expect(within(entertainmentRow).getByText('8%')).toBeInTheDocument();
  });

  it('labels the total column with the selected month', async () => {
    renderWithProviders(<SpendingByCategoryModule />, { timeFrame: makeTimeFrame() });

    expect(await screen.findByRole('columnheader', { name: 'June' })).toBeInTheDocument();
  });

  it('shows month-over-month deltas and sparklines in monthly mode', async () => {
    const { container } = renderWithProviders(<SpendingByCategoryModule />, { timeFrame: makeTimeFrame() });

    expect(await screen.findByRole('columnheader', { name: 'vs May' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Last 6 months' })).toBeInTheDocument();

    // Trends mock: GROCERIES +7.5% (rising), UTILITIES flat, RESTAURANTS −10.7% (falling),
    // ENTERTAINMENT null. Rows sort GROCERIES, UTILITIES, RESTAURANTS, ENTERTAINMENT.
    await screen.findByText('Groceries');
    const rows = screen.getAllByRole('row').slice(1);
    const [groceriesRow, utilitiesRow, restaurantsRow, entertainmentRow] = rows;
    if (!groceriesRow || !utilitiesRow || !restaurantsRow || !entertainmentRow) {
      throw new Error('expected four category rows');
    }
    expect(within(groceriesRow).getByText('8%')).toBeInTheDocument();
    expect(within(utilitiesRow).getByText('0%')).toBeInTheDocument();
    expect(within(restaurantsRow).getByText('11%')).toBeInTheDocument();
    expect(within(entertainmentRow).getByText('—')).toBeInTheDocument();
    expect(container.querySelectorAll('polyline')).toHaveLength(4);
  });

  it('labels the total column with the year and drops the trend columns in yearly mode', async () => {
    const { container } = renderWithProviders(<SpendingByCategoryModule />, {
      timeFrame: makeTimeFrame({ dateRangeType: DateRangeType.YEAR, currentYearLabel: '2026' }),
    });

    expect(await screen.findByRole('columnheader', { name: '2026' })).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: /vs / })).toBeNull();
    expect(screen.queryByRole('columnheader', { name: 'Last 6 months' })).toBeNull();
    expect(container.querySelectorAll('polyline')).toHaveLength(0);
  });

  it('shows the empty state when the period has no transactions', async () => {
    server.use(
      http.get('*/api/spending/details', () =>
        HttpResponse.json({
          ...spendingDetailsResponse,
          spendCategoryOverview: { ...spendingDetailsResponse.spendCategoryOverview, categoryDetailsList: [] },
        }),
      ),
    );
    renderWithProviders(<SpendingByCategoryModule />, { timeFrame: makeTimeFrame() });

    expect(await screen.findByText('No spending recorded for this period yet.')).toBeInTheDocument();
  });
});
