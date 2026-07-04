import { describe, expect, it } from 'vitest';
import { renderWithProviders } from 'test/testUtils';
import { SpendingCategory } from '@spend-watcher/contract';
import type { TransactionsV1Response } from 'Types/Services/spending.model';
import BarChart from './BarChart';

const MEASUREMENT = { x: 0, y: 0, top: 0, left: 0, right: 800, bottom: 400, width: 800, height: 400 };

const RESPONSE: TransactionsV1Response = {
  transactions: [
    { transactionId: 1, category: SpendingCategory.GROCERIES, amount: 86, date: '2026-06-14', isRecurring: false },
    { transactionId: 2, category: SpendingCategory.RESTAURANTS, amount: 25, date: '2026-06-15', isRecurring: false },
    { transactionId: 3, category: SpendingCategory.GROCERIES, amount: 14, date: '2026-06-10', isRecurring: false },
  ],
};

describe('BarChart', () => {
  it('renders one bar group per category, summing repeat categories', () => {
    const { container } = renderWithProviders(
      <BarChart transactionResponse={RESPONSE} containerMeasurement={MEASUREMENT} />,
    );

    // The ids are the chart's stable public hooks (the old e2e spec asserted the same ones).
    expect(container.querySelector('#bar-GROCERIES')).not.toBeNull();
    expect(container.querySelector('#bar-RESTAURANTS')).not.toBeNull();
    expect(container.querySelector('#bar-ENTERTAINMENT')).toBeNull();
    expect(container.querySelectorAll('#bar-chart-bounds > g[id^="bar-"]')).toHaveLength(2);
  });

  it('sizes bars proportionally to the summed category totals', () => {
    const { container } = renderWithProviders(
      <BarChart transactionResponse={RESPONSE} containerMeasurement={MEASUREMENT} />,
    );

    const groceriesBar = container.querySelector('#bar-GROCERIES rect');
    const diningBar = container.querySelector('#bar-RESTAURANTS rect');
    // Groceries total (86 + 14 = 100) is the max, so its bar is the tallest.
    const groceriesHeight = Number(groceriesBar?.getAttribute('height'));
    const diningHeight = Number(diningBar?.getAttribute('height'));
    expect(groceriesHeight).toBeGreaterThan(diningHeight);
    expect(diningHeight).toBeGreaterThan(0);
  });
});
