import { describe, expect, it } from 'vitest';
import { MonthYearDbDate } from 'Types/dateTypes';
import buildMonthLedger from './buildMonthLedger';

describe('buildMonthLedger', () => {
  it('walks back from now through the oldest month, descending', () => {
    const now = new Date(2026, 6, 9); // July 9 2026

    const { months, monthBeforeOldest } = buildMonthLedger('2026-03', now);

    expect(months).toEqual(['2026-07', '2026-06', '2026-05', '2026-04', '2026-03']);
    expect(monthBeforeOldest).toBe('2026-02');
  });

  it('returns just the current month when the oldest month is the current month', () => {
    const now = new Date(2026, 6, 9);

    const { months, monthBeforeOldest } = buildMonthLedger('2026-07', now);

    expect(months).toEqual(['2026-07']);
    expect(monthBeforeOldest).toBe('2026-06');
  });

  it('crosses a year boundary when the oldest month is in a previous year', () => {
    const now = new Date(2026, 1, 9); // February 9 2026

    const { months, monthBeforeOldest } = buildMonthLedger('2025-11', now);

    expect(months).toEqual(['2026-02', '2026-01', '2025-12', '2025-11']);
    expect(monthBeforeOldest).toBe('2025-10');
  });

  it('degrades to just the current month when the oldest month is in the future, instead of hanging', () => {
    const now = new Date(2026, 6, 9);

    const { months, monthBeforeOldest } = buildMonthLedger('2026-12', now);

    expect(months).toEqual(['2026-07']);
    expect(monthBeforeOldest).toBe('2026-06');
  });

  it('degrades to just the current month when the oldest month is malformed, instead of throwing', () => {
    const now = new Date(2026, 6, 9);

    const { months, monthBeforeOldest } = buildMonthLedger('not-a-month' as MonthYearDbDate, now);

    expect(months).toEqual(['2026-07']);
    expect(monthBeforeOldest).toBe('2026-06');
  });

  it('returns just the current month when there is no history yet', () => {
    const now = new Date(2026, 6, 9);

    const { months, monthBeforeOldest } = buildMonthLedger(undefined, now);

    expect(months).toEqual(['2026-07']);
    expect(monthBeforeOldest).toBe('2026-06');
  });
});
