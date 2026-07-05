import { orpc } from 'apiClient/orpc';

export const recurringTransactionsQueryOptions = (recurringSpendId?: string) =>
  orpc.spending.recurringTransactions.queryOptions({
    input: { recurringSpendId: recurringSpendId ?? '' },
    enabled: Boolean(recurringSpendId),
  });
