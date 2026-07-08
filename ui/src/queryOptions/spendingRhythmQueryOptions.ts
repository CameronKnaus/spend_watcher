import { orpc } from 'apiClient/orpc';
import { DbDate } from 'Types/dateTypes';

export const spendingRhythmQueryOptions = ({ targetDate }: { targetDate: DbDate }) =>
  orpc.spending.rhythm.queryOptions({ input: { targetDate } });
