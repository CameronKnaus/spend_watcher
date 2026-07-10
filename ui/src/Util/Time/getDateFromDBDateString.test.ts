import { describe, expect, it } from 'vitest';
import getDateFromDBDateString from './getDateFromDBDateString';

describe('getDateFromDBDateString', () => {
  it('preserves the year/month/day of a yyyy-MM-dd string regardless of local timezone', () => {
    const result = getDateFromDBDateString('2024-03-15');

    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(2);
    expect(result.getDate()).toBe(15);
  });

  it('returns midnight local time, not shifted by the timezone offset', () => {
    const result = getDateFromDBDateString('2024-03-15');

    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
  });

  it('handles a year boundary date (Dec 31) without rolling into the next year', () => {
    const result = getDateFromDBDateString('2024-12-31');

    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(11);
    expect(result.getDate()).toBe(31);
  });

  it('handles a year boundary date (Jan 1) without rolling into the previous year', () => {
    const result = getDateFromDBDateString('2024-01-01');

    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(1);
  });

  it('handles a leap day', () => {
    const result = getDateFromDBDateString('2024-02-29');

    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(29);
  });
});
