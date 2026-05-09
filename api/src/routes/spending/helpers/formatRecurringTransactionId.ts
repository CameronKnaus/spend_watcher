import { RecurringTransactionId } from '../spending.model';

export default function formatRecurringTransactionId(recurringSpendId: number): RecurringTransactionId {
    return `Recurring-${recurringSpendId}`;
}
