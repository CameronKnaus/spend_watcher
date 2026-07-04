import { orpc } from 'api/orpc';
import { DbDate } from 'Types/dateTypes';

export const spendingDetailsQueryOptions = ({ startDate, endDate }: { startDate: DbDate; endDate: DbDate }) =>
  orpc.spending.details.queryOptions({ input: { startDate, endDate } });
