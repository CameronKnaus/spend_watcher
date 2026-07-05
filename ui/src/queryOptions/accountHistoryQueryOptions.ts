import { orpc } from 'apiClient/orpc';

export const accountHistoryQueryOptions = (accountId: string) =>
  orpc.accounts.history.queryOptions({
    input: { accountId },
    enabled: Boolean(accountId),
  });
