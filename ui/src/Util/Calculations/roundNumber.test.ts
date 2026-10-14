import { describe, expect, it } from 'vitest';
import roundNumber from './roundNumber';

describe('roundNumber', () => {
  it('rounds to 2 decimal places by default', () => {
    expect(roundNumber(123.456)).toBe(123.46);
  });

  it('returns 0 for 0', () => {
    expect(roundNumber(0)).toBe(0);
  });

  it('rounds negative numbers', () => {
    expect(roundNumber(-9.876)).toBe(-9.88);
  });

  it('rounds large values', () => {
    expect(roundNumber(1234567.891)).toBe(1234567.89);
  });

  it('leaves whole numbers unchanged', () => {
    expect(roundNumber(10)).toBe(10);
  });

  it('respects a custom decimalPlaces argument', () => {
    expect(roundNumber(10.1, 3)).toBe(10.1);
    expect(roundNumber(4.5, 0)).toBe(5);
  });

  it('rounds -4.5 to -4 at 0 decimal places (Math.round rounds half toward +Infinity, not away from zero)', () => {
    expect(roundNumber(-4.5, 0)).toBe(-4);
  });

  // Documents current behavior, not a bug in this function: 1.005 has no exact binary
  // floating-point representation and is actually stored as ~1.00499999999999989, so
  // multiplying by 100 and rounding lands on 100, not 101.
  it('rounds 1.005 down to 1 due to IEEE-754 floating-point representation', () => {
    expect(roundNumber(1.005)).toBe(1);
  });
});
