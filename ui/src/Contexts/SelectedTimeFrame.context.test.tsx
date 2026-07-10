import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { use, type ReactNode } from 'react';
import SelectedTimeFrameProvider, { DateRangeType, SelectedTimeFrameContext } from './SelectedTimeFrame.context';

function useTimeFrame() {
  const context = use(SelectedTimeFrameContext);
  if (!context) {
    throw new Error('missing provider');
  }
  return context;
}

const wrapper = ({ children }: { children: ReactNode }) => (
  <SelectedTimeFrameProvider>{children}</SelectedTimeFrameProvider>
);

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 5, 15));
});

describe('SelectedTimeFrame defaults', () => {
  it('starts in monthly mode spanning the 1st of this month through today', () => {
    const { result } = renderHook(useTimeFrame, { wrapper });

    expect(result.current.dateRangeType).toBe(DateRangeType.MONTH);
    expect(result.current.startDate).toBe('2026-06-01');
    expect(result.current.endDate).toBe('2026-06-15');
    expect(result.current.isPresentMonth).toBe(true);
    expect(result.current.isPresentYear).toBe(true);
    expect(result.current.currentMonthLabel).toBe('June');
    expect(result.current.currentYearLabel).toBe('2026');
  });
});

describe('SelectedTimeFrame monthly navigation', () => {
  it('refuses to step forward past the present month', () => {
    const { result } = renderHook(useTimeFrame, { wrapper });

    act(() => result.current.forwardOneMonth());

    expect(result.current.startDate).toBe('2026-06-01');
    expect(result.current.endDate).toBe('2026-06-15');
  });

  it('steps back to a full previous month, then forward returns to the present month ending today', () => {
    const { result } = renderHook(useTimeFrame, { wrapper });

    act(() => result.current.backOneMonth());
    expect(result.current.startDate).toBe('2026-05-01');
    expect(result.current.endDate).toBe('2026-05-31');
    expect(result.current.isPresentMonth).toBe(false);
    expect(result.current.currentMonthLabel).toBe('May');

    act(() => result.current.forwardOneMonth());
    expect(result.current.startDate).toBe('2026-06-01');
    // Back at the present month the range ends today, not the end of the month.
    expect(result.current.endDate).toBe('2026-06-15');
    expect(result.current.isPresentMonth).toBe(true);
  });

  it('ignores year steppers while in monthly mode', () => {
    const { result } = renderHook(useTimeFrame, { wrapper });

    act(() => result.current.backOneYear());

    expect(result.current.startDate).toBe('2026-06-01');
    expect(result.current.endDate).toBe('2026-06-15');
  });
});

describe('SelectedTimeFrame yearly mode', () => {
  it('switching to yearly spans the 1st of the year through today', () => {
    const { result } = renderHook(useTimeFrame, { wrapper });

    act(() => result.current.updateDateRangeType(DateRangeType.YEAR));

    expect(result.current.dateRangeType).toBe(DateRangeType.YEAR);
    expect(result.current.startDate).toBe('2026-01-01');
    expect(result.current.endDate).toBe('2026-06-15');
  });

  it('refuses to step forward past the present year', () => {
    const { result } = renderHook(useTimeFrame, { wrapper });

    act(() => result.current.updateDateRangeType(DateRangeType.YEAR));
    act(() => result.current.forwardOneYear());

    expect(result.current.startDate).toBe('2026-01-01');
    expect(result.current.endDate).toBe('2026-06-15');
  });

  it('steps back to a full previous year, then forward returns to the present year ending today', () => {
    const { result } = renderHook(useTimeFrame, { wrapper });

    act(() => result.current.updateDateRangeType(DateRangeType.YEAR));
    act(() => result.current.backOneYear());
    expect(result.current.startDate).toBe('2025-01-01');
    expect(result.current.endDate).toBe('2025-12-31');
    expect(result.current.isPresentYear).toBe(false);

    act(() => result.current.forwardOneYear());
    expect(result.current.startDate).toBe('2026-01-01');
    expect(result.current.endDate).toBe('2026-06-15');
    expect(result.current.isPresentYear).toBe(true);
  });

  it('switching back to monthly resets to the current month', () => {
    const { result } = renderHook(useTimeFrame, { wrapper });

    act(() => result.current.updateDateRangeType(DateRangeType.YEAR));
    act(() => result.current.backOneYear());
    act(() => result.current.updateDateRangeType(DateRangeType.MONTH));

    expect(result.current.dateRangeType).toBe(DateRangeType.MONTH);
    expect(result.current.startDate).toBe('2026-06-01');
    expect(result.current.endDate).toBe('2026-06-15');
  });
});

describe('SelectedTimeFrame handler identity', () => {
  it('keeps the entire context value referentially stable across a re-render with no state change', () => {
    const { result, rerender } = renderHook(useTimeFrame, { wrapper });
    const apiBefore = result.current;
    const backOneMonthBefore = result.current.backOneMonth;

    rerender();

    expect(result.current).toBe(apiBefore);
    expect(result.current.backOneMonth).toBe(backOneMonthBefore);
  });

  it('keeps setToCurrentMonth stable across a re-render triggered by another handler', () => {
    const { result } = renderHook(useTimeFrame, { wrapper });
    const setToCurrentMonthBefore = result.current.setToCurrentMonth;
    const updateDateRangeTypeBefore = result.current.updateDateRangeType;

    act(() => result.current.backOneMonth());

    expect(result.current.setToCurrentMonth).toBe(setToCurrentMonthBefore);
    expect(result.current.updateDateRangeType).toBe(updateDateRangeTypeBefore);
  });

  it('gives steppers a fresh identity only when their own inputs change, unlike the always-stable handlers', () => {
    const { result } = renderHook(useTimeFrame, { wrapper });
    const backOneMonthBefore = result.current.backOneMonth;
    const setToCurrentMonthBefore = result.current.setToCurrentMonth;

    act(() => result.current.backOneMonth());

    // parsedStartDate is a real dependency, so the closure legitimately changes.
    expect(result.current.backOneMonth).not.toBe(backOneMonthBefore);
    // Handlers with no date/type dependencies stay referentially stable regardless.
    expect(result.current.setToCurrentMonth).toBe(setToCurrentMonthBefore);
  });
});
