import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { http, HttpResponse, renderWithProviders, screen, server } from 'test/testUtils';
import { spendingDetailsResponse } from '@msw/mocks/spending/spendingDetailsResponse';
import TotalSpentHero from './TotalSpentHero';

const zeroSummary = {
  total: { amount: 0, count: 0 },
  discretionaryTotals: { amount: 0, count: 0 },
  recurringTotals: { amount: 0, count: 0 },
};

describe('TotalSpentHero', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the total with month progress and the projected month-end total', async () => {
    vi.setSystemTime(new Date(2026, 5, 15));
    renderWithProviders(<TotalSpentHero />);

    expect(screen.getByRole('heading', { name: 'Total spent' })).toBeInTheDocument();
    expect(await screen.findByText('-$186.00')).toBeInTheDocument();
    expect(screen.getByText('Day 15 of 30')).toBeInTheDocument();
    expect(screen.getByText('50% of June')).toBeInTheDocument();
    // Halfway through June at $186 projects to $372 by month end.
    expect(screen.getByText('On pace for $372.00 this month')).toBeInTheDocument();
  });

  it('rounds the month progress at the start of a short month', async () => {
    vi.setSystemTime(new Date(2026, 1, 1));
    renderWithProviders(<TotalSpentHero />);

    expect(await screen.findByText('Day 1 of 28')).toBeInTheDocument();
    expect(screen.getByText('4% of February')).toBeInTheDocument();
  });

  it('hides the projection when the month has no spend', async () => {
    vi.setSystemTime(new Date(2026, 5, 15));
    server.use(
      http.get('*/api/spending/details', () => HttpResponse.json({ ...spendingDetailsResponse, summary: zeroSummary })),
    );
    renderWithProviders(<TotalSpentHero />);

    expect(await screen.findByText('$0.00')).toBeInTheDocument();
    expect(screen.queryByText(/On pace for/)).toBeNull();
  });
});
