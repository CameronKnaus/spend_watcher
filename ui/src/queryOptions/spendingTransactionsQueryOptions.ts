import { orpc } from 'api/orpc';

/** `startDate` and `endDate` received as YYYY-MM-DD strings */
export const spendingTransactionsQueryOptions = ({ startDate, endDate }: { startDate: string; endDate: string }) =>
  orpc.spending.transactions.queryOptions({ input: { startDate, endDate } });
