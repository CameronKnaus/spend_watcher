import { describe, expect, it } from 'vitest';
import msMapper from './TimeMapping';

describe('msMapper', () => {
  it('maps a day to exactly 24 hours of milliseconds', () => {
    expect(msMapper.day).toBe(msMapper.hour * 24);
  });

  it('maps an hour to exactly 60 minutes of milliseconds', () => {
    expect(msMapper.hour).toBe(msMapper.minute * 60);
  });

  it('maps a minute to exactly 60 seconds of milliseconds', () => {
    expect(msMapper.minute).toBe(msMapper.second * 60);
  });

  it('maps a second to 1000ms', () => {
    expect(msMapper.second).toBe(1000);
  });

  // year/month are calendar averages (365.25-ish days / ~30.4 days), not exact
  // multiples of a day, so they are asserted against a tolerance instead of equality.
  it('approximates a year as ~365.05 days', () => {
    expect(msMapper.year / msMapper.day).toBeCloseTo(365.05, 1);
  });

  it('approximates a month as ~30.4 days', () => {
    expect(msMapper.month / msMapper.day).toBeCloseTo(30.4, 1);
  });
});
