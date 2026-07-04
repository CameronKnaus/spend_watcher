import { describe, it, expect } from 'vitest';
import { DateRangeType } from 'Contexts/SelectedTimeFrame.context';
import { HttpResponse, http, makeTimeFrame, renderWithProviders, server, waitFor } from 'test/testUtils';
import type { HistoryStartResponse } from '@spend-watcher/contract';
import TimeFrameButton from './TimeFrameButton';

describe('TimeFrameButton period stepper', () => {
  async function setup(timeFrameOverrides: Parameters<typeof makeTimeFrame>[0], earliest = '2026-01-01') {
    // The earliest-transaction date drives the back arrow's disabled state — pin it per test.
    server.use(
      http.get('*/api/spending/history-start', () =>
        HttpResponse.json({
          earliestTransactionDate: earliest,
          earliestRecurringTransactionDate: '2026-06-01',
          earliestDiscretionaryTransactionDate: '2026-06-01',
        } satisfies HistoryStartResponse),
      ),
    );
    const timeFrame = makeTimeFrame(timeFrameOverrides);
    const utils = renderWithProviders(<TimeFrameButton />, { timeFrame });
    // Wait for the history-start fetch to settle so the arrow states reflect loaded data.
    await waitFor(() => expect(utils.queryClient.isFetching()).toBe(0));
    const arrows = utils.container.querySelectorAll('[class*="arrowButton"]');
    return { ...utils, timeFrame, back: arrows[0] as HTMLElement, forward: arrows[1] as HTMLElement };
  }

  it('disables the forward arrow on the current month and ignores clicks', async () => {
    const { forward, timeFrame, user } = await setup({ dateRangeType: DateRangeType.MONTH, isPresentMonth: true });

    expect(forward.className).toContain('disabledArrowButton');
    await user.click(forward);
    expect(timeFrame.forwardOneMonth).not.toHaveBeenCalled();
  });

  it('enables the forward arrow on a past month and steps forward on click', async () => {
    const { forward, timeFrame, user } = await setup({ dateRangeType: DateRangeType.MONTH, isPresentMonth: false });

    expect(forward.className).not.toContain('disabledArrowButton');
    await user.click(forward);
    expect(timeFrame.forwardOneMonth).toHaveBeenCalledTimes(1);
  });

  it('disables the forward arrow on the current year (yearly mode) and ignores clicks', async () => {
    const { forward, timeFrame, user } = await setup({ dateRangeType: DateRangeType.YEAR, isPresentYear: true });

    expect(forward.className).toContain('disabledArrowButton');
    await user.click(forward);
    expect(timeFrame.forwardOneYear).not.toHaveBeenCalled();
  });

  it('enables the forward arrow on a past year (yearly mode) and steps forward on click', async () => {
    const { forward, timeFrame, user } = await setup({ dateRangeType: DateRangeType.YEAR, isPresentYear: false });

    expect(forward.className).not.toContain('disabledArrowButton');
    await user.click(forward);
    expect(timeFrame.forwardOneYear).toHaveBeenCalledTimes(1);
  });

  it('disables the back arrow once the start month equals the earliest transaction month', async () => {
    const { back, timeFrame, user } = await setup(
      { dateRangeType: DateRangeType.MONTH, startDate: '2026-06-01' },
      '2026-06-01',
    );

    expect(back.className).toContain('disabledArrowButton');
    await user.click(back);
    expect(timeFrame.backOneMonth).not.toHaveBeenCalled();
  });

  it('enables the back arrow when earlier history exists and steps back on click', async () => {
    const { back, timeFrame, user } = await setup(
      { dateRangeType: DateRangeType.MONTH, startDate: '2026-06-01' },
      '2026-01-01',
    );

    expect(back.className).not.toContain('disabledArrowButton');
    await user.click(back);
    expect(timeFrame.backOneMonth).toHaveBeenCalledTimes(1);
  });
});
