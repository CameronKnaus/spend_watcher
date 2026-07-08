import { describe, it, expect } from 'vitest';
import { http, HttpResponse, makeTimeFrame, renderWithProviders, screen, server } from 'test/testUtils';
import { buildSpendingRhythmResponse } from '@msw/mocks/spending/spendingRhythmResponse';
import RhythmInsightTile from './RhythmInsightTile';

describe('RhythmInsightTile', () => {
  it('headlines the biggest unusual day with its ratio and flags it in the strip', async () => {
    renderWithProviders(<RhythmInsightTile />, { timeFrame: makeTimeFrame() });

    // Builder at endDate 2026-06-27: $152 spike on Jun 24 against a $40 median = 3.8×.
    expect(await screen.findByText('Jun 24 ran')).toBeInTheDocument();
    expect(screen.getByText('3.8× your daily median')).toBeInTheDocument();

    const cells = screen.getAllByTestId('rhythm-day');
    expect(cells).toHaveLength(7);
    // Jun 24 is the 4th cell of the Jun 21–27 strip and carries its day number.
    expect(cells[3].textContent).toBe('24');
    expect(cells[3].className).toContain('unusualDay');
    // The last cell is today (present month) and gets the today outline instead.
    expect(cells[6].className).toContain('todayDay');
  });

  it('reads as calm when no day breaks the threshold', async () => {
    const calm = buildSpendingRhythmResponse('2026-06-27');
    calm.days = calm.days.map((day) => ({ ...day, amount: 20 }));
    server.use(http.get('*/api/spending/rhythm', () => HttpResponse.json(calm)));
    renderWithProviders(<RhythmInsightTile />, { timeFrame: makeTimeFrame() });

    expect(await screen.findByText('No unusual spending days in June yet.')).toBeInTheDocument();
  });

  it('falls back to the no-history line when the median is null', async () => {
    const empty = buildSpendingRhythmResponse('2026-06-27');
    empty.dailyMedian = null;
    empty.days = empty.days.map((day) => ({ ...day, amount: 0 }));
    server.use(http.get('*/api/spending/rhythm', () => HttpResponse.json(empty)));
    renderWithProviders(<RhythmInsightTile />, { timeFrame: makeTimeFrame() });

    expect(await screen.findByText('Not enough history to know your rhythm yet.')).toBeInTheDocument();
  });
});
