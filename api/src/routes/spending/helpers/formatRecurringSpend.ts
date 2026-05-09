import { DbDate } from '@type/dateTypes';
import { format, formatISO } from 'date-fns';
import { RecurringSpendTransaction } from '../spending.model';
import { RecurringTransactionHistorySQLRow } from '../spending.service';
import formatRecurringTransactionId from './formatRecurringTransactionId';

// This formats a recurring spend group (not transactions tied to this spend group)
export default function formatRecurringSpend(
    transaction: RecurringTransactionHistorySQLRow,
): RecurringSpendTransaction {
    const currentMonth = format(new Date(), 'MM-yyyy');
    const lastUpdatedMonth = format(new Date(transaction.date), 'MM-yyyy');
    const requiresMonthlyUpdate = currentMonth !== lastUpdatedMonth;

    return {
        isRecurring: true,
        expectedMonthlyAmount: transaction.amount,
        recurringSpendName: transaction.spend_name,
        recurringSpendId: transaction.recurring_spend_id,
        isVariableRecurring: Boolean(transaction.is_variable_recurring),
        isActive: Boolean(transaction.is_active),
        transactionId: formatRecurringTransactionId(transaction.transaction_id),
        category: transaction.category,
        amountSpent: transaction.transaction_amount,
        spentDate: formatISO(new Date(transaction.date), { representation: 'date' }) as DbDate,
        requiresMonthlyUpdate,
    };
}
