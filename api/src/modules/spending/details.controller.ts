import { authed } from '../../orpc/base';
import { getSpendingDetails } from './details.service';

// GET /api/spending/details — the rich category/date spending breakdown for a date range.
export const details = authed.spending.details.handler(({ context, input }) =>
  getSpendingDetails(context.username, input.startDate, input.endDate),
);
