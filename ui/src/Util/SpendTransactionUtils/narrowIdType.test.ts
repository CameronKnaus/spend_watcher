import { DiscretionaryTransactionId, RecurringTransactionId } from '@spend-watcher/contract';
import { describe, expect, it } from 'vitest';
import { isDiscretionaryTransactionId, isRecurringTransactionId, narrowIdType } from './narrowIdType';

const recurringId = 'Recurring-1' as RecurringTransactionId;
const discretionaryId = 'Discretionary-2' as DiscretionaryTransactionId;

describe('isRecurringTransactionId', () => {
  it('returns true for a Recurring- prefixed id', () => {
    expect(isRecurringTransactionId(recurringId)).toBe(true);
  });

  it('returns false for a Discretionary- prefixed id', () => {
    expect(isRecurringTransactionId(discretionaryId)).toBe(false);
  });
});

describe('isDiscretionaryTransactionId', () => {
  it('returns true for a Discretionary- prefixed id', () => {
    expect(isDiscretionaryTransactionId(discretionaryId)).toBe(true);
  });

  it('returns false for a Recurring- prefixed id', () => {
    expect(isDiscretionaryTransactionId(recurringId)).toBe(false);
  });
});

describe('narrowIdType', () => {
  it('returns a Recurring id unchanged', () => {
    expect(narrowIdType(recurringId)).toBe(recurringId);
  });

  it('returns a Discretionary id unchanged', () => {
    expect(narrowIdType(discretionaryId)).toBe(discretionaryId);
  });
});
