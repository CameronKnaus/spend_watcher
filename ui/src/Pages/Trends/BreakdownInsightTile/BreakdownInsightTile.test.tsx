import { describe, it, expect } from 'vitest';
import { http, HttpResponse, makeTimeFrame, renderWithProviders, screen, server } from 'test/testUtils';
import { spendingDetailsResponse } from '@msw/mocks/spending/spendingDetailsResponse';
import BreakdownInsightTile from './BreakdownInsightTile';

describe('BreakdownInsightTile', () => {
  it('headlines the top two categories with their combined share of the month', async () => {
    renderWithProviders(<BreakdownInsightTile />, { timeFrame: makeTimeFrame() });

    // Baseline details mock: GROCERIES 46% + UTILITIES 32% = 78% of June.
    expect(await screen.findByText('Groceries and Utilities are 78% of June so far')).toBeInTheDocument();

    // Four named segments (46/32/13/8) plus a 1% everything-else remainder.
    const segments = screen.getAllByTestId('breakdown-segment');
    expect(segments).toHaveLength(5);
    expect(segments[0]?.getAttribute('style')).toContain('width: 46%');
    expect(segments[0]?.getAttribute('style')).toContain('GROCERIES');
  });

  it('uses the single-category phrasing when only one category has spend', async () => {
    const singleCategory = {
      ...spendingDetailsResponse,
      spendCategoryOverview: {
        ...spendingDetailsResponse.spendCategoryOverview,
        categoryDetailsList: [
          {
            ...spendingDetailsResponse.spendCategoryOverview.categoryDetailsList[1],
            combinedTotals: { amount: 86, count: 1, percentageOfTotalAmount: 100, percentageOfTotalCount: 100 },
          },
        ],
      },
    };
    server.use(http.get('*/api/spending/details', () => HttpResponse.json(singleCategory)));
    renderWithProviders(<BreakdownInsightTile />, { timeFrame: makeTimeFrame() });

    expect(await screen.findByText('Groceries is 100% of June so far')).toBeInTheDocument();
    expect(screen.getAllByTestId('breakdown-segment')).toHaveLength(1);
  });

  it('shows the empty state when the month has no spend', async () => {
    server.use(
      http.get('*/api/spending/details', () =>
        HttpResponse.json({
          ...spendingDetailsResponse,
          spendCategoryOverview: { ...spendingDetailsResponse.spendCategoryOverview, categoryDetailsList: [] },
        }),
      ),
    );
    renderWithProviders(<BreakdownInsightTile />, { timeFrame: makeTimeFrame() });

    expect(await screen.findByText('No spending recorded for this month yet.')).toBeInTheDocument();
  });
});
