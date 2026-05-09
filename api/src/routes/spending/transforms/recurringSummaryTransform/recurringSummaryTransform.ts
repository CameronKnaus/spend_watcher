import formatRecurringSpend from '@routes/spending/helpers/formatRecurringSpend';
import { RecurringSpendTransaction, RecurringSummaryV1Response } from '@routes/spending/spending.model';
import { RecurringTransactionHistorySQLRow } from '@routes/spending/spending.service';

export default function recurringSummaryTransform(
    recurringTransactions: RecurringTransactionHistorySQLRow[],
): RecurringSummaryV1Response {
    let averageEstimatedMonthlyTotal = 0;
    let actualMonthlyTotal = 0;
    const activeRecurringTransactions: RecurringSpendTransaction[] = [];
    const inactiveRecurringTransactions: RecurringSpendTransaction[] = [];
    let spendsRequiringUpdatesCount = 0;

    recurringTransactions.forEach((unformattedSpend) => {
        const transaction = formatRecurringSpend(unformattedSpend);

        if (transaction.isActive && transaction.requiresMonthlyUpdate) {
            spendsRequiringUpdatesCount++;
        }

        averageEstimatedMonthlyTotal += transaction.expectedMonthlyAmount;
        actualMonthlyTotal += transaction.amountSpent;

        if (transaction.isActive) {
            activeRecurringTransactions.push(transaction);
        } else {
            inactiveRecurringTransactions.push(transaction);
        }
    });

    return {
        recurringSpendsRequireUpdates: spendsRequiringUpdatesCount > 0,
        spendsRequiringUpdatesCount,
        averageEstimatedMonthlyTotal,
        actualMonthlyTotal,
        activeRecurringTransactions,
        inactiveRecurringTransactions,
    };
}
