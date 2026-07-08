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
    expect(within(rows[0]).getByText('Groceries')).toBeInTheDocument();
    expect(within(rows[0]).getByText('-$86.00')).toBeInTheDocument();
    expect(within(rows[0]).getByText('46%')).toBeInTheDocument();
    expect(within(rows[1]).getByText('Utilities')).toBeInTheDocument();
    expect(within(rows[2]).getByText('Dining out')).toBeInTheDocument();
    expect(within(rows[3]).getByText('Entertainment')).toBeInTheDocument();
    expect(within(rows[3]).getByText('8%')).toBeInTheDocument();
  });

  it('labels the total column with the selected month', async () => {
    renderWithProviders(<SpendingByCategoryModule />, { timeFrame: makeTimeFrame() });

    expect(await screen.findByRole('columnheader', { name: 'June' })).toBeInTheDocument();
  });

  it('labels the total column with the year in yearly mode', async () => {
    renderWithProviders(<SpendingByCategoryModule />, {
      timeFrame: makeTimeFrame({ dateRangeType: DateRangeType.YEAR, currentYearLabel: '2026' }),
    });

    expect(await screen.findByRole('columnheader', { name: '2026' })).toBeInTheDocument();
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
