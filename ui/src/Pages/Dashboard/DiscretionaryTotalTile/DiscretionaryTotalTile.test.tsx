import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { http, HttpResponse, renderWithProviders, screen, server } from 'test/testUtils';
import { spendingPaceResponse } from '@msw/mocks/spending/spendingPaceResponse';
import DiscretionaryTotalTile from './DiscretionaryTotalTile';

describe('DiscretionaryTotalTile', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date(2026, 5, 15));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the discretionary total with a decrease badge vs the previous month', async () => {
    renderWithProviders(<DiscretionaryTotalTile />);

    expect(screen.getByRole('heading', { name: 'Discretionary total' })).toBeInTheDocument();
    expect(await screen.findByText('-$126.00')).toBeInTheDocument();
    // Baseline pace mock: (126 − 130) / 130 ≈ −3%.
    expect(await screen.findByText('3% vs May')).toBeInTheDocument();
  });

  it('shows an increase badge when discretionary spend outruns the previous month', async () => {
    server.use(
      http.get('*/api/spending/pace', () =>
        HttpResponse.json({
          ...spendingPaceResponse,
          previousMonthSameDay: { total: 200, discretionary: 100, recurring: 100 },
        }),
      ),
    );
    renderWithProviders(<DiscretionaryTotalTile />);

    expect(await screen.findByText('26% vs May')).toBeInTheDocument();
  });

  it('hides the badge when the previous month has no discretionary spend', async () => {
    server.use(
      http.get('*/api/spending/pace', () =>
        HttpResponse.json({
          ...spendingPaceResponse,
          previousMonthSameDay: { total: 70, discretionary: 0, recurring: 70 },
        }),
      ),
    );
    renderWithProviders(<DiscretionaryTotalTile />);

    expect(await screen.findByText('-$126.00')).toBeInTheDocument();
    expect(screen.queryByText(/vs May/)).toBeNull();
  });
});
