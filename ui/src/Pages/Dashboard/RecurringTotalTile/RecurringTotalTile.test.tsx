import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { http, HttpResponse, renderWithProviders, screen, server } from 'test/testUtils';
import { recurringSummaryResponse } from '@msw/mocks/spending/recurringSummaryResponse';
import { spendingPaceResponse } from '@msw/mocks/spending/spendingPaceResponse';
import RecurringTotalTile from './RecurringTotalTile';

describe('RecurringTotalTile', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date(2026, 5, 15));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the recurring total with a signed delta vs the previous month', async () => {
    renderWithProviders(<RecurringTotalTile />);

    expect(screen.getByRole('heading', { name: 'Recurring total' })).toBeInTheDocument();
    expect(await screen.findByText('-$60.00')).toBeInTheDocument();
    // Baseline pace mock: (60 − 70) / 70 ≈ −14%.
    expect(await screen.findByText('-14% vs May')).toBeInTheDocument();
  });

  it('reads as flat when the movement is under the noise threshold', async () => {
    server.use(
      http.get('*/api/spending/pace', () =>
        HttpResponse.json({
          ...spendingPaceResponse,
          previousMonthSameDay: { total: 190, discretionary: 130, recurring: 60 },
        }),
      ),
    );
    renderWithProviders(<RecurringTotalTile />);

    expect(await screen.findByText('flat vs May')).toBeInTheDocument();
  });

  it('appends the awaiting-update count when recurring spends need updates', async () => {
    server.use(
      http.get('*/api/spending/recurring/summary', () =>
        HttpResponse.json({
          ...recurringSummaryResponse,
          recurringSpendsRequireUpdates: true,
          spendsRequiringUpdatesCount: 3,
        }),
      ),
    );
    renderWithProviders(<RecurringTotalTile />);

    expect(await screen.findByText('-14% vs May · 3 awaiting update')).toBeInTheDocument();
  });

  it('shows no context line when there is nothing to compare or update', async () => {
    server.use(
      http.get('*/api/spending/pace', () =>
        HttpResponse.json({
          ...spendingPaceResponse,
          previousMonthSameDay: { total: 130, discretionary: 130, recurring: 0 },
        }),
      ),
    );
    renderWithProviders(<RecurringTotalTile />);

    expect(await screen.findByText('-$60.00')).toBeInTheDocument();
    expect(screen.queryByText(/vs May/)).toBeNull();
  });
});
