import { orpc } from 'apiClient/orpc';
import { DbDate } from 'Types/dateTypes';

export const spendingPaceQueryOptions = ({ targetDate }: { targetDate: DbDate }) =>
  orpc.spending.pace.queryOptions({ input: { targetDate } });
