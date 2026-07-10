import { describe, expect, it } from 'vitest';
import formatCurrency from './formatCurrency';

describe('formatCurrency', () => {
  it('formats a typical positive amount', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats a negative amount with a leading minus sign', () => {
    expect(formatCurrency(-50)).toBe('-$50.00');
  });

  it('formats large values with thousands separators', () => {
    expect(formatCurrency(1234567.891)).toBe('$1,234,567.89');
  });

  it('accepts numeric strings, coercing them to a number first', () => {
    expect(formatCurrency('42.5')).toBe('$42.50');
  });

  describe('showSignWhenPositive', () => {
    it('prefixes a positive amount with "+" when true', () => {
      expect(formatCurrency(1234.5, true)).toBe('+$1,234.50');
    });

    it('does not add a sign to zero even when true (signDisplay: exceptZero)', () => {
      expect(formatCurrency(0, true)).toBe('$0.00');
    });

    it('still shows "-" for negative amounts when true', () => {
      expect(formatCurrency(-50, true)).toBe('-$50.00');
    });
  });

  describe('compact', () => {
    it('abbreviates thousands with at most one decimal place', () => {
      expect(formatCurrency(1234, false, true)).toBe('$1.2K');
    });

    it('abbreviates millions', () => {
      expect(formatCurrency(1000000, false, true)).toBe('$1M');
    });

    it('drops the decimal when it would be .0', () => {
      expect(formatCurrency(999, false, true)).toBe('$999');
    });

    it('combines with showSignWhenPositive', () => {
      expect(formatCurrency(-1234.5, true, true)).toBe('-$1.2K');
    });
  });

  // Documents current behavior, not a fix: the function does `Number(amount)` on string
  // input with no validation, so a non-numeric string silently produces the literal
  // string "$NaN" instead of throwing or falling back to a default.
  it('renders "$NaN" for a non-numeric string input', () => {
    expect(formatCurrency('abc')).toBe('$NaN');
  });

  it("treats an empty string as 0 (Number('') === 0)", () => {
    expect(formatCurrency('')).toBe('$0.00');
  });
});
