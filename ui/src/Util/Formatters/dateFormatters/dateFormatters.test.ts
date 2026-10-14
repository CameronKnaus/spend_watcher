import { describe, expect, it } from 'vitest';
import { formatDbDate, formatMonthYearDbDate } from './dateFormatters';

describe('formatDbDate', () => {
  it('formats a date as yyyy-MM-dd', () => {
    expect(formatDbDate(new Date(2026, 5, 15))).toBe('2026-06-15');
  });

  it('zero-pads single-digit months and days', () => {
    expect(formatDbDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('formatMonthYearDbDate', () => {
  it('formats a date as yyyy-MM', () => {
    expect(formatMonthYearDbDate(new Date(2026, 5, 15))).toBe('2026-06');
  });

  it('zero-pads single-digit months', () => {
    expect(formatMonthYearDbDate(new Date(2026, 0, 5))).toBe('2026-01');
  });
});
