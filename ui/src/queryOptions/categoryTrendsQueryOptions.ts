import { orpc } from 'apiClient/orpc';

export const categoryTrendsQueryOptions = ({ targetMonth }: { targetMonth: string }) =>
  orpc.spending.categoryTrends.queryOptions({ input: { targetMonth } });
