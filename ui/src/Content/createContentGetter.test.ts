import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import createContentGetter from './createContentGetter';

vi.mock('Content/english', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./english')>();
  return {
    default: {
      ...actual.default,
      transactions: {
        ...actual.default.transactions,
        repeatedTokenLabel: '{{0}} spent of {{0}} budget',
      },
    },
  };
});

describe('createContentGetter', () => {
  it('returns the content string for a known key', () => {
    const { result } = renderHook(() => createContentGetter('transactions'));

    expect(result.current('logExpense')).toBe('Log expense');
  });

  it('replaces {{n}} tokens with the provided injections', () => {
    const { result } = renderHook(() => createContentGetter('transactions'));

    // todayLabel is '{{0}} - Today'
    expect(result.current('todayLabel', ['Jul 3rd'])).toBe('Jul 3rd - Today');
  });

  it('replaces every occurrence of a repeated token, not just the first', () => {
    const { result } = renderHook(() => createContentGetter('transactions'));

    const getContent = result.current as (key: string, injections?: string[]) => string;
    expect(getContent('repeatedTokenLabel', ['$50'])).toBe('$50 spent of $50 budget');
  });

  it('returns MISSING_CONTENT for an unknown key instead of the string "undefined"', () => {
    const { result } = renderHook(() => createContentGetter('transactions'));

    const getContent = result.current as (key: string) => string;
    expect(getContent('definitely-not-a-key')).toBe('MISSING_CONTENT');
  });
});
