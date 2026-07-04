import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import useContent from './useContent';

describe('useContent', () => {
  it('returns the content string for a known key', () => {
    const { result } = renderHook(() => useContent('transactions'));

    expect(result.current('logExpense')).toBe('Log expense');
  });

  it('replaces {{n}} tokens with the provided injections', () => {
    const { result } = renderHook(() => useContent('transactions'));

    // todayLabel is '{{0}} - Today'
    expect(result.current('todayLabel', ['Jul 3rd'])).toBe('Jul 3rd - Today');
  });

  it('returns MISSING_CONTENT for an unknown key instead of the string "undefined"', () => {
    const { result } = renderHook(() => useContent('transactions'));

    const getContent = result.current as (key: string) => string;
    expect(getContent('definitely-not-a-key')).toBe('MISSING_CONTENT');
  });
});
