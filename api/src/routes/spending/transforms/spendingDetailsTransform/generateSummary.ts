import { SpendTransaction, SummaryTotals } from '@routes/spending/spending.model';
import roundNumber from '@utils/CalculationHelpers/roundNumber';

// SummaryTotals is mutated
export function addToSummary(SummaryTotals: SummaryTotals, transaction: SpendTransaction) {
    // Grand total
    SummaryTotals.total.amount = roundNumber(SummaryTotals.total.amount + transaction.amountSpent);
    SummaryTotals.total.count++;

    // Recurring vs discretionary
    if (transaction.isRecurring) {
        SummaryTotals.recurringTotals.amount = roundNumber(
            SummaryTotals.recurringTotals.amount + transaction.amountSpent,
        );
        SummaryTotals.recurringTotals.count++;
    } else {
        SummaryTotals.discretionaryTotals.amount = roundNumber(
            SummaryTotals.discretionaryTotals.amount + transaction.amountSpent,
        );
        SummaryTotals.discretionaryTotals.count++;
    }
}
