import { SummaryTotals } from '@spend-watcher/contract';
import { initTransactionTotal } from './calcHelpers';

export default function initSummaryTotals(): SummaryTotals {
  return {
    total: initTransactionTotal(),
    recurringTotals: initTransactionTotal(),
    discretionaryTotals: initTransactionTotal(),
  };
}
