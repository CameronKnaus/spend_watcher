import formatDiscretionaryTransactionId from '@routes/spending/helpers/formatDiscretionaryTransactionId';
import formatRecurringTransaction from '@routes/spending/helpers/formatRecurringSpend';
import {
    DiscretionarySpendTransaction,
    DiscretionaryTransactionId,
    RecurringTransactionId,
    SpendTransaction,
    TransactionDictionary,
} from '@routes/spending/spending.model';
import {
    DiscretionaryTransactionHistorySQLRow,
    RecurringTransactionHistorySQLRow,
} from '@routes/spending/spending.service';
import { DbDate } from '@type/dateTypes';
import { formatISO } from 'date-fns';

/* Transaction data sent in the response will contain an ID lookup map, where the transactionID is the key
    and the transaction data is the value.  The rest of the response will contain transactionIDs that can be 
    used with this lookup map to get the transaction data. 
    
    Also returned here is the lists of all transactions, discretionary transactions, and recurring transactions
    sorted by date.

    Lastly, a list of all transaction data is returned for further parsing, but this is not used in the final response.
*/
export default function formatTransactions(
    discretionaryTransactions: DiscretionaryTransactionHistorySQLRow[],
    recurringTransactions: RecurringTransactionHistorySQLRow[],
) {
    const transactionDictionary: TransactionDictionary = {};
    const discretionaryTransactionIdList: DiscretionaryTransactionId[] = [];
    const recurringTransactionIdList: RecurringTransactionId[] = [];
    const transactionDataList: SpendTransaction[] = [];

    // Format discretionary transactions
    discretionaryTransactions.forEach((transaction) => {
        const identifier = formatDiscretionaryTransactionId(transaction.transaction_id);
        const formattedTransaction: DiscretionarySpendTransaction = {
            isRecurring: false,
            transactionId: identifier,
            category: transaction.category,
            amountSpent: transaction.amount,
            spentDate: formatISO(new Date(transaction.date), { representation: 'date' }) as DbDate,
            note: transaction.note ?? '',
        };

        if (transaction.linked_trip_id) {
            formattedTransaction.linkedTripId = transaction.linked_trip_id;
        }

        transactionDictionary[formattedTransaction.transactionId] = formattedTransaction;
        discretionaryTransactionIdList.push(identifier);
        transactionDataList.push(formattedTransaction);
    });

    // Format recurring transactions
    recurringTransactions.forEach((transaction) => {
        const formattedTransaction = formatRecurringTransaction(transaction);
        transactionDictionary[formattedTransaction.transactionId] = formattedTransaction;
        recurringTransactionIdList.push(formattedTransaction.transactionId);
        transactionDataList.push(formattedTransaction);
    });

    return {
        transactionDictionary,
        discretionaryTransactionIdList,
        recurringTransactionIdList,
        transactionDataList,
    };
}
