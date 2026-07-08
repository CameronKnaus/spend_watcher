import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { http, HttpResponse, renderWithProviders, screen, server } from 'test/testUtils';
import { spendingDetailsResponse } from '@msw/mocks/spending/spendingDetailsResponse';
import { spendingPaceResponse } from '@msw/mocks/spending/spendingPaceResponse';
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

  it('shows an under-pace badge against the previous month through the same day', async () => {
    vi.setSystemTime(new Date(2026, 5, 15));
    renderWithProviders(<TotalSpentHero />);

    // Baseline pace mock: (186 − 200) / 200 = −7%.
    expect(await screen.findByText("7% under May's pace")).toBeInTheDocument();
  });

  it('shows an over-pace badge when spending outruns the previous month', async () => {
    vi.setSystemTime(new Date(2026, 5, 15));
    server.use(
      http.get('*/api/spending/pace', () =>
        HttpResponse.json({
          ...spendingPaceResponse,
          previousMonthSameDay: { total: 100, discretionary: 60, recurring: 40 },
        }),
      ),
    );
    renderWithProviders(<TotalSpentHero />);

    expect(await screen.findByText("86% over May's pace")).toBeInTheDocument();
  });

  it('renders the daily-spend bars with today highlighted and the spike annotated', async () => {
    vi.setSystemTime(new Date(2026, 5, 15));
    const { container } = renderWithProviders(<TotalSpentHero />);

    expect(await screen.findByText('Daily spend — last 14 days')).toBeInTheDocument();

    const bars = container.querySelectorAll('rect');
    expect(bars).toHaveLength(14);
    expect(bars[13]).toHaveAttribute('fill', 'var(--theme-color-primary-500)');
    expect(bars[0]).toHaveAttribute('fill', 'var(--theme-color-neutral-600)');

    // Window is June 2–15; the mock's largest expense sits on index 7 = June 9.
    expect(screen.getByText('Jun 2')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Big spike · Jun 9 — flights $44')).toBeInTheDocument();
  });

  it('omits the daily-spend bars on mobile', async () => {
    vi.setSystemTime(new Date(2026, 5, 15));
    renderWithProviders(<TotalSpentHero />, { isMobile: true });

    expect(await screen.findByText('-$186.00')).toBeInTheDocument();
    expect(screen.queryByText('Daily spend — last 14 days')).toBeNull();
  });

  it('hides the pace badge when the previous month has no spend to compare against', async () => {
    vi.setSystemTime(new Date(2026, 5, 15));
    server.use(
      http.get('*/api/spending/pace', () =>
        HttpResponse.json({
          ...spendingPaceResponse,
          previousMonthSameDay: { total: 0, discretionary: 0, recurring: 0 },
        }),
      ),
    );
    renderWithProviders(<TotalSpentHero />);

    expect(await screen.findByText('-$186.00')).toBeInTheDocument();
    expect(screen.queryByText(/pace$/)).toBeNull();
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
