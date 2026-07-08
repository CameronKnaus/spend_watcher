import { describe, it, expect } from 'vitest';
import { http, HttpResponse, makeTimeFrame, renderWithProviders, screen, server } from 'test/testUtils';
import { buildCategoryTrendsResponse } from '@msw/mocks/spending/categoryTrendsResponse';
import { SpendingCategory } from '@spend-watcher/contract';
import CategoriesInsightTile from './CategoriesInsightTile';

describe('CategoriesInsightTile', () => {
  it('headlines the biggest mover vs its 3-month average', async () => {
    const { container } = renderWithProviders(<CategoriesInsightTile />, { timeFrame: makeTimeFrame() });

    // Baseline trends mock: RESTAURANTS 25 vs avg(35,30,28)=31 → −19%, the largest swing.
    expect(await screen.findByText('Dining out is down 19%')).toBeInTheDocument();
    expect(screen.getByText('vs your 3-month average')).toBeInTheDocument();
    expect(container.querySelectorAll('polyline')).toHaveLength(1);
  });

  it('flags a rising category in loss red phrasing', async () => {
    const response = buildCategoryTrendsResponse('2026-06');
    response.categories = [
      { category: SpendingCategory.ENTERTAINMENT, monthlyTotals: [100, 100, 40, 40, 40, 80], percentChange: 1 },
    ];
    server.use(http.get('*/api/spending/category-trends', () => HttpResponse.json(response)));
    renderWithProviders(<CategoriesInsightTile />, { timeFrame: makeTimeFrame() });

    // 80 vs avg(40,40,40)=40 → +100%.
    expect(await screen.findByText('Entertainment is up 100%')).toBeInTheDocument();
  });

  it('shows the empty state when no category has a 3-month baseline', async () => {
    const response = buildCategoryTrendsResponse('2026-06');
    response.categories = [
      { category: SpendingCategory.GROCERIES, monthlyTotals: [50, 20, 0, 0, 0, 90], percentChange: null },
    ];
    server.use(http.get('*/api/spending/category-trends', () => HttpResponse.json(response)));
    renderWithProviders(<CategoriesInsightTile />, { timeFrame: makeTimeFrame() });

    expect(await screen.findByText('Not enough history to compare categories yet.')).toBeInTheDocument();
  });
});
