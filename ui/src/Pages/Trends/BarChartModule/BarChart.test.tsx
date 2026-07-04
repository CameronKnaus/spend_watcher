import { describe, expect, it } from 'vitest';
import { renderWithProviders } from 'test/testUtils';
import { SpendingCategory, type CategoryDetails } from '@spend-watcher/contract';
import BarChart from './BarChart';

const MEASUREMENT = { x: 0, y: 0, top: 0, left: 0, right: 800, bottom: 400, width: 800, height: 400 };

function buildCategoryDetails(category: SpendingCategory, amount: number): CategoryDetails {
  const totals = { amount, count: 1, percentageOfTotalAmount: 0, percentageOfTotalCount: 0 };
  return { category, combinedTotals: totals, discretionaryTotals: totals, recurringTotals: totals };
}

const CATEGORY_DETAILS_LIST: CategoryDetails[] = [
  buildCategoryDetails(SpendingCategory.GROCERIES, 100),
  buildCategoryDetails(SpendingCategory.RESTAURANTS, 25),
];

describe('BarChart', () => {
  it('renders one bar group per category in the list', () => {
    const { container } = renderWithProviders(
      <BarChart categoryDetailsList={CATEGORY_DETAILS_LIST} containerMeasurement={MEASUREMENT} />,
    );

    // The ids are the chart's stable public hooks (the old e2e spec asserted the same ones).
    expect(container.querySelector('#bar-GROCERIES')).not.toBeNull();
    expect(container.querySelector('#bar-RESTAURANTS')).not.toBeNull();
    expect(container.querySelector('#bar-ENTERTAINMENT')).toBeNull();
    expect(container.querySelectorAll('#bar-chart-bounds > g[id^="bar-"]')).toHaveLength(2);
  });

  it('sizes bars proportionally to the category combined totals', () => {
    const { container } = renderWithProviders(
      <BarChart categoryDetailsList={CATEGORY_DETAILS_LIST} containerMeasurement={MEASUREMENT} />,
    );

    const groceriesBar = container.querySelector('#bar-GROCERIES rect');
    const diningBar = container.querySelector('#bar-RESTAURANTS rect');
    // Groceries ($100) is the max, so its bar is the tallest.
    const groceriesHeight = Number(groceriesBar?.getAttribute('height'));
    const diningHeight = Number(diningBar?.getAttribute('height'));
    expect(groceriesHeight).toBeGreaterThan(diningHeight);
    expect(diningHeight).toBeGreaterThan(0);
  });
});
