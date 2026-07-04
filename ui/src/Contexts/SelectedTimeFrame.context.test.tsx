import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useContext, type ReactNode } from 'react';
import SelectedTimeFrameProvider, { DateRangeType, SelectedTimeFrameContext } from './SelectedTimeFrame.context';

function useTimeFrame() {
  const context = useContext(SelectedTimeFrameContext);
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
