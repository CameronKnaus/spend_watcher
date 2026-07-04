import { CombinedTransactionsResponse, SpendingCategory } from '@spend-watcher/contract';
import { DbDate } from '@type/dateTypes';
import { findRecurringTransactions, findTransactions } from './transactions.repository';
import { CombinedTransaction } from './transactions.types';

// The service never imports `@lib/db` — all DB access goes through the repository.
// Orchestrates the discretionary + recurring fetches, then merges them into a single flat list
// sorted newest-first and collects the set of categories present.
export async function getTransactions(
  username: string,
  startDate: DbDate,
  endDate: DbDate,
): Promise<CombinedTransactionsResponse> {
  const [discretionary, recurring] = await Promise.all([
    findTransactions(username, startDate, endDate),
    findRecurringTransactions(username, startDate, endDate),
  ]);

  const presentCategories = new Set<SpendingCategory>();

  const discretionaryList: CombinedTransaction[] = discretionary.map((transaction) => {
    presentCategories.add(transaction.category);
    return {
      transactionId: transaction.transactionId,
      category: transaction.category,
      amount: transaction.amount,
      date: transaction.date,
      isRecurring: false,
    };
  });

  const recurringList: CombinedTransaction[] = recurring.map((transaction) => {
    presentCategories.add(transaction.category);
    return {
      transactionId: transaction.transactionId,
      category: transaction.category,
      amount: transaction.amount,
      date: transaction.date,
      isRecurring: true,
    };
  });

  const transactions = [...discretionaryList, ...recurringList].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return {
    presentCategories: Array.from(presentCategories),
    transactions,
  };
}
