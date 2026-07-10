import { orpc } from 'apiClient/orpc';
import { DbDate } from 'Types/dateTypes';

export const typicalPaceQueryOptions = ({ targetDate }: { targetDate: DbDate }) =>
  orpc.spending.typicalPace.queryOptions({ input: { targetDate } });
