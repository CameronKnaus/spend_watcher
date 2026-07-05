import { DiscretionarySpendTransaction, SpendingDetailsResponse, SpendTransaction } from '@spend-watcher/contract';
import { DbDate } from '@type/dateTypes';
import { formatDiscretionaryTransactionId } from '@utils/transactionId';
import { formatISO } from 'date-fns';
import { DiscretionaryHistoryRow } from '../details.types';
import { toRecurringSpendTransaction } from '../recurring.repository';
import { RecurringSpendWithTransactionRow } from '../recurring.types';

type TransactionDictionary = SpendingDetailsResponse['transactionDictionary'];

/* Builds the transactionId -> transaction lookup map (so the rest of the response can reference
   transactions by id instead of duplicating them), plus the discretionary/recurring id lists and a
   flat list of all transaction data for further aggregation. */
export default function formatTransactions(
  discretionaryTransactions: DiscretionaryHistoryRow[],
  recurringTransactions: RecurringSpendWithTransactionRow[],
) {
  const transactionDictionary: TransactionDictionary = {};
  const discretionaryTransactionIdList: SpendingDetailsResponse['discretionaryTransactionIdList'] = [];
  const recurringTransactionIdList: SpendingDetailsResponse['recurringTransactionIdList'] = [];
  const transactionDataList: SpendTransaction[] = [];

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

  recurringTransactions.forEach((transaction) => {
    const formattedTransaction = toRecurringSpendTransaction(transaction);
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
