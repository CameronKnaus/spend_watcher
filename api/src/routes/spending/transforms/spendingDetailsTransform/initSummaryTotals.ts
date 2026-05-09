import { SummaryTotals } from '@routes/spending/spending.model';
import initTransactionTotal from '@utils/CalculationHelpers/initTransactionTotal';

export default function initSummaryTotals(): SummaryTotals {
    return {
        total: initTransactionTotal(),
        recurringTotals: initTransactionTotal(),
        discretionaryTotals: initTransactionTotal(),
    };
}
