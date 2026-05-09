import { Transaction, TransactionsV1Response } from '@routes/spending/spending.model';
import {
    DiscretionaryTransactionHistorySQLRow,
    RecurringTransactionHistorySQLRow,
} from '@routes/spending/spending.service';
import { SpendingCategory } from '@type/categoryTypes';
import { formatDbDate } from '@utils/DateUtils/dateUtils';

export default function transactionsTransform(
    discretionaryTransactions: DiscretionaryTransactionHistorySQLRow[],
    recurringTransactions: RecurringTransactionHistorySQLRow[],
): TransactionsV1Response {
    const presentCategories = new Set<SpendingCategory>();

    const discretionaryList: Transaction[] = discretionaryTransactions.map((transaction) => {
        presentCategories.add(transaction.category as SpendingCategory);
        return {
            transactionId: transaction.transaction_id,
            category: transaction.category,
            amount: transaction.amount,
            date: formatDbDate(new Date(transaction.date)),
            isRecurring: false,
        };
    });

    const recurringList: Transaction[] = recurringTransactions.map((transaction) => {
        presentCategories.add(transaction.category as SpendingCategory);
        return {
            transactionId: transaction.transaction_id,
            category: transaction.category,
            amount: transaction.amount,
            date: formatDbDate(new Date(transaction.date)),
            isRecurring: true,
        };
    });

    const sortedList = [...discretionaryList, ...recurringList].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return {
        presentCategories: Array.from(presentCategories),
        transactions: sortedList,
    };
}
