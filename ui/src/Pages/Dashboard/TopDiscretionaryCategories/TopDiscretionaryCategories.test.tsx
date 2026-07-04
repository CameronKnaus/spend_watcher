import { describe, expect, it } from 'vitest';
import { http, HttpResponse, renderWithProviders, screen, server } from 'test/testUtils';
import { spendingDetailsResponse } from '@msw/mocks/spending/spendingDetailsResponse';
import type { SpendingDetailsResponse } from '@spend-watcher/contract';
import TopDiscretionaryCategories from './TopDiscretionaryCategories';

function renderWidget(details?: SpendingDetailsResponse) {
  // Without an override, the baseline /api/spending/details handler serves spendingDetailsResponse.
  if (details) {
    server.use(http.get('*/api/spending/details', () => HttpResponse.json(details)));
  }
  return renderWithProviders(<TopDiscretionaryCategories />);
}

describe('TopDiscretionaryCategories', () => {
  it('lists categories sorted by discretionary spend, largest first', async () => {
    renderWidget();

    // The mock is deliberately unsorted (Restaurants first); the widget must sort by amount.
    const buttons = await screen.findAllByRole('button', { name: /-\$\d/ });
    expect(buttons[0]).toHaveAccessibleName(expect.stringContaining('Groceries'));
    expect(buttons[0]).toHaveAccessibleName(expect.stringContaining('$86.00'));
    expect(buttons[1]).toHaveAccessibleName(expect.stringContaining('Dining out'));
    expect(buttons[2]).toHaveAccessibleName(expect.stringContaining('Entertainment'));
  });

  it('shows the combined total when more than one category has spend', async () => {
    renderWidget();

    expect(await screen.findByText('Combined total')).toBeInTheDocument();
  });

  it('renders the empty-state copy when there is no discretionary spending', async () => {
    const empty = {
      ...spendingDetailsResponse,
      spendCategoryOverview: {
        ...spendingDetailsResponse.spendCategoryOverview,
        categoriesWithDiscretionaryTransactionsCount: 0,
      },
    } satisfies SpendingDetailsResponse;
    renderWidget(empty);

    expect(await screen.findByText('You have no discretionary spending so far this month.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Groceries/ })).not.toBeInTheDocument();
  });
});
