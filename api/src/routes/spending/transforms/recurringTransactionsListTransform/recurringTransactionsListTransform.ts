import formatRecurringTransactionId from '@routes/spending/helpers/formatRecurringTransactionId';
import { RecurringTransactionsListV1Response } from '@routes/spending/spending.model';
import { RecurringTransactionSQLRow } from '@routes/spending/spending.service';
import { MonthYearDbDate } from '@type/dateTypes';
import { format } from 'date-fns';

export default function recurringTransactionsListTransform(
    transactions: RecurringTransactionSQLRow[],
): RecurringTransactionsListV1Response {
    return {
        transactions: transactions.map((transaction) => ({
            transactionId: formatRecurringTransactionId(transaction.transaction_id),
            date: format(new Date(transaction.date), 'yyyy-MM') as MonthYearDbDate,
            amountSpent: transaction.transaction_amount,
        })),
    };
}
