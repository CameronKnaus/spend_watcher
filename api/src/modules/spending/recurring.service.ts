import {
  AppInputs,
  RecurringSpendTransaction,
  RecurringSummaryResponse,
  RecurringTransactionsListResponse,
} from '@spend-watcher/contract';
import { parseTransactionIdNumber } from '@utils/transactionId';
import {
  backfillRecurringTransactions,
  deleteRecurringSpend,
  findRecurringSummary,
  findRecurringTransactionsList,
  insertRecurringSpend,
  insertRecurringTransaction,
  updateRecurringActiveStatus,
  updateRecurringSpend,
  updateRecurringTransaction,
} from './recurring.repository';

// Wrapped here so the auth controller composes a spending service
// rather than reaching into the repository layer.
export function ensureRecurringTransactionsBackfilled(username: string): Promise<void> {
  return backfillRecurringTransactions(username);
}

// Builds the recurring summary. The aggregation mirrors the legacy `recurringSummaryTransform`
// (kept here since it operated on legacy row types).
export async function getRecurringSummary(username: string): Promise<RecurringSummaryResponse> {
  const recurringSpends = await findRecurringSummary(username);

  let averageEstimatedMonthlyTotal = 0;
  let actualMonthlyTotal = 0;
  let spendsRequiringUpdatesCount = 0;
  const activeRecurringTransactions: RecurringSpendTransaction[] = [];
  const inactiveRecurringTransactions: RecurringSpendTransaction[] = [];

  recurringSpends.forEach((spend) => {
    if (spend.isActive && spend.requiresMonthlyUpdate) {
      spendsRequiringUpdatesCount++;
    }

    averageEstimatedMonthlyTotal += spend.expectedMonthlyAmount;
    actualMonthlyTotal += spend.amountSpent;

    if (spend.isActive) {
      activeRecurringTransactions.push(spend);
    } else {
      inactiveRecurringTransactions.push(spend);
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

export async function getRecurringTransactionsList(
  recurringSpendId: string,
): Promise<RecurringTransactionsListResponse> {
  const transactions = await findRecurringTransactionsList(recurringSpendId);
  return { transactions };
}

export function addRecurringSpend(username: string, input: AppInputs['spending']['recurringSpendAdd']): Promise<void> {
  return insertRecurringSpend(username, input);
}

export function editRecurringSpend(
  username: string,
  input: AppInputs['spending']['recurringSpendEdit'],
): Promise<void> {
  return updateRecurringSpend(username, input);
}

export function removeRecurringSpend(username: string, recurringSpendId: string): Promise<void> {
  return deleteRecurringSpend(username, recurringSpendId);
}

export function setRecurringSpendActive(
  username: string,
  input: AppInputs['spending']['recurringSpendSetActive'],
): Promise<void> {
  return updateRecurringActiveStatus(username, input.recurringSpendId, input.isActive);
}

export function addRecurringTransaction(input: AppInputs['spending']['recurringTransactionAdd']): Promise<void> {
  return insertRecurringTransaction(input.recurringSpendId, input.amountSpent, input.date);
}

export function editRecurringTransaction(input: AppInputs['spending']['recurringTransactionEdit']): Promise<void> {
  return updateRecurringTransaction(parseTransactionIdNumber(input.transactionId), input.amountSpent);
}
