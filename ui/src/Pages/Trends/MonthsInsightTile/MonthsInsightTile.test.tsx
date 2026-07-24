import { describe, it, expect } from 'vitest';
import { http, HttpResponse, makeTimeFrame, renderWithProviders, screen, server } from 'test/testUtils';
import { buildCategoryTrendsResponse } from '@msw/mocks/spending/categoryTrendsResponse';
import MonthsInsightTile from './MonthsInsightTile';

describe('MonthsInsightTile', () => {
  it('names the priciest month with its delta above the window average', async () => {
    renderWithProviders(<MonthsInsightTile />, { timeFrame: makeTimeFrame() });

    // Baseline trends mock month sums: 170, 170, 170, 158, 168, 186 — priciest is the selected
    // month (June per the timeFrame), sitting $15.67 above the 170.33 average.
    expect(await screen.findByText(/June was your priciest month/)).toBeInTheDocument();
    expect(screen.getByText('$15.67 above')).toBeInTheDocument();

    const bars = screen.getAllByTestId('months-insight-bar');
    expect(bars).toHaveLength(6);
    // The priciest month wins the loss color even when it is also the selected month.
    expect(bars[5]?.getAttribute('style')).toContain('semantic-loss');
    expect(bars[0]?.getAttribute('style')).toContain('neutral-600');
  });

  it('shows the empty state when fewer than two months have data', async () => {
    const singleMonth = buildCategoryTrendsResponse('2026-06');
    const [firstCategory] = singleMonth.categories;
    if (!firstCategory) {
      throw new Error('expected buildCategoryTrendsResponse to seed at least one category');
    }
    singleMonth.categories = [
      { category: firstCategory.category, monthlyTotals: [0, 0, 0, 0, 0, 50], percentChange: null },
    ];
    server.use(http.get('*/api/spending/category-trends', () => HttpResponse.json(singleMonth)));
    renderWithProviders(<MonthsInsightTile />, { timeFrame: makeTimeFrame() });

    expect(await screen.findByText('Not enough history to compare months yet.')).toBeInTheDocument();
  });
});
