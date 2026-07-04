import { describe, it, expect } from 'vitest';
import { http, HttpResponse, makeTimeFrame, renderWithProviders, screen, server, within } from 'test/testUtils';
import { spendingDetailsResponse } from '@msw/mocks/spending/spendingDetailsResponse';
import type { SpendingDetailsResponse } from '@spend-watcher/contract';
import TotalsTable from './TotalsTable';

describe('TotalsTable', () => {
  function renderTable() {
    // The default /api/spending/details handler serves the baseline spendingDetailsResponse data.
    return renderWithProviders(<TotalsTable />, { timeFrame: makeTimeFrame() });
  }

  it('renders all thirteen column headers', async () => {
    renderTable();
    expect(await screen.findAllByRole('columnheader')).toHaveLength(13);
    expect(screen.getByRole('columnheader', { name: 'Category' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Total spent' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Recurring % of transactions' })).toBeInTheDocument();
  });

  it('orders category rows by combined total descending', async () => {
    const { container } = renderTable();
    await screen.findByRole('columnheader', { name: 'Category' });
    const tbody = container.querySelector('tbody') as HTMLElement;
    const categories = within(tbody)
      .getAllByRole('button')
      .map((button) => button.textContent);

    // $86 Groceries > $60 Utilities > $25 Dining out > $15 Entertainment.
    expect(categories).toEqual(['Groceries', 'Utilities', 'Dining out', 'Entertainment']);
  });

  it('renders the computed cells for a category row', async () => {
    const { container } = renderTable();
    await screen.findByRole('columnheader', { name: 'Category' });
    const tbody = container.querySelector('tbody') as HTMLElement;
    const groceriesRow = within(tbody).getByRole('button', { name: 'Groceries' }).closest('tr') as HTMLElement;

    // combined + discretionary columns both show the $86 spend as a loss.
    expect(within(groceriesRow).getAllByText('-$86.00')).toHaveLength(2);
    // combined percentage-of-total cell.
    expect(within(groceriesRow).getByText('46%')).toBeInTheDocument();
  });

  it('renders the footer with the summed total and transaction count', async () => {
    const { container } = renderTable();
    await screen.findByRole('columnheader', { name: 'Category' });
    const footerRow = container.querySelector('tfoot tr') as HTMLElement;

    expect(within(footerRow).getByText('-$186.00')).toBeInTheDocument(); // combined total
    expect(within(footerRow).getByText('-$126.00')).toBeInTheDocument(); // discretionary total
    expect(within(footerRow).getByText('4')).toBeInTheDocument(); // combined transaction count
  });

  it('renders headers but no category rows for an empty month', async () => {
    const empty = {
      ...spendingDetailsResponse,
      spendCategoryOverview: { ...spendingDetailsResponse.spendCategoryOverview, categoryDetailsList: [] },
    } satisfies SpendingDetailsResponse;
    server.use(http.get('*/api/spending/details', () => HttpResponse.json(empty)));
    const { container } = renderWithProviders(<TotalsTable />, { timeFrame: makeTimeFrame() });

    expect(await screen.findByRole('columnheader', { name: 'Category' })).toBeInTheDocument();
    expect(within(container.querySelector('tbody') as HTMLElement).queryAllByRole('button')).toHaveLength(0);
  });
});
