import { RecurringSpendTransaction } from '@spend-watcher/contract';
import { DbDate } from '@type/dateTypes';
import { format, formatISO } from 'date-fns';
import { RecurringHistoryRow } from '../details.types';

export function formatDiscretionaryTransactionId(transactionId: number): `Discretionary-${number}` {
  return `Discretionary-${transactionId}`;
}

export function formatRecurringTransactionId(transactionId: number): `Recurring-${number}` {
  return `Recurring-${transactionId}`;
}

// Formats a recurring spend group (not a single transaction). A spend "requires a monthly update"
// when its most recent transaction isn't in the current month.
export function formatRecurringSpend(transaction: RecurringHistoryRow): RecurringSpendTransaction {
  const currentMonth = format(new Date(), 'MM-yyyy');
  const lastUpdatedMonth = format(new Date(transaction.date), 'MM-yyyy');

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
    requiresMonthlyUpdate: currentMonth !== lastUpdatedMonth,
  };
}
