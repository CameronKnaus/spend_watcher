import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  formatMonthYearDBDateAsReadable,
  formatToMonthDay,
  formatToMonthDayYear,
  getCurrentMonthLabel,
  parseDbDate,
} from './dateFormatters';

describe('parseDbDate', () => {
  it('parses a yyyy-MM-dd string into a Date with matching local y/m/d', () => {
    const result = parseDbDate('2024-03-05');

    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(2);
    expect(result.getDate()).toBe(5);
  });

  it('parses midnight local time', () => {
    const result = parseDbDate('2024-03-05');

    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
  });
});

describe('formatToMonthDayYear', () => {
  it('formats a typical date with an ordinal day', () => {
    expect(formatToMonthDayYear('2024-03-05')).toBe('Mar 5th, 2024');
  });

  it('uses the correct ordinal suffix for the 1st', () => {
    expect(formatToMonthDayYear('2024-01-01')).toBe('Jan 1st, 2024');
  });

  it('uses the correct ordinal suffix for the 22nd (not 22th)', () => {
    expect(formatToMonthDayYear('2024-01-22')).toBe('Jan 22nd, 2024');
  });

  it('formats a year-end date', () => {
    expect(formatToMonthDayYear('2024-12-31')).toBe('Dec 31st, 2024');
  });
});

describe('formatToMonthDay', () => {
  it('formats a date without the year', () => {
    expect(formatToMonthDay('2024-03-05')).toBe('Mar 5th');
  });
});

describe('formatMonthYearDBDateAsReadable', () => {
  it('formats a yyyy-MM string as "MMM yyyy"', () => {
    expect(formatMonthYearDBDateAsReadable('2024-03')).toBe('Mar 2024');
  });

  it('formats December correctly', () => {
    expect(formatMonthYearDBDateAsReadable('2024-12')).toBe('Dec 2024');
  });
});

describe('getCurrentMonthLabel', () => {
  beforeEach(() => {
    // Pin the clock so this assertion can't flake across a real month boundary.
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 6, 15));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the full name of the current month', () => {
    expect(getCurrentMonthLabel()).toBe('July');
  });
});
