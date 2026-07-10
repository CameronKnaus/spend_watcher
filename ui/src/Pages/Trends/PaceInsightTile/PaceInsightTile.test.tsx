import { describe, it, expect } from 'vitest';
import { http, HttpResponse, makeTimeFrame, renderWithProviders, screen, server } from 'test/testUtils';
import { buildTypicalPaceResponse } from '@msw/mocks/spending/typicalPaceResponse';
import PaceInsightTile from './PaceInsightTile';

describe('PaceInsightTile', () => {
  it('shows how far under the usual pace the month is running, with the projection', async () => {
    const { container } = renderWithProviders(<PaceInsightTile />, { timeFrame: makeTimeFrame() });

    // Builder at endDate 2026-06-27: $270 month-to-date vs $320 typical-through-day-27,
    // projecting $300 against a typical $400 month.
    expect(await screen.findByText('$50.00 under')).toBeInTheDocument();
    expect(screen.getByText('Projected $300.00 vs a typical $400.00')).toBeInTheDocument();
    expect(screen.getByTestId('pace-typical-line')).toBeInTheDocument();
    expect(container.querySelector('polyline')).not.toBeNull();
  });

  it('flags an over-pace month in loss phrasing', async () => {
    server.use(
      http.get('*/api/spending/typical-pace', () =>
        HttpResponse.json({ ...buildTypicalPaceResponse('2026-06-27'), typicalThroughSameDay: 100 }),
      ),
    );
    renderWithProviders(<PaceInsightTile />, { timeFrame: makeTimeFrame() });

    expect(await screen.findByText('$170.00 over')).toBeInTheDocument();
  });

  it('falls back to the no-history line when there is no baseline', async () => {
    server.use(
      http.get('*/api/spending/typical-pace', () =>
        HttpResponse.json({
          ...buildTypicalPaceResponse('2026-06-27'),
          typicalThroughSameDay: null,
          typicalMonthTotal: null,
          baselineMonthCount: 0,
        }),
      ),
    );
    renderWithProviders(<PaceInsightTile />, { timeFrame: makeTimeFrame() });

    expect(await screen.findByText('Not enough history to know your usual pace yet.')).toBeInTheDocument();
    expect(screen.queryByTestId('pace-typical-line')).toBeNull();
    expect(screen.queryByText(/Projected/)).toBeNull();
  });
});
