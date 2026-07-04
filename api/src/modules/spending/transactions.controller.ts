import { authed } from '../../orpc/base';
import { getTransactions } from './transactions.service';

// GET /api/spending/transactions — discretionary + recurring transactions over a date range.
// Input validation (the date range) and response typing both come from the shared contract;
// this handler only wires the validated input + identity into the service.
export const transactions = authed.spending.transactions.handler(({ context, input }) =>
  getTransactions(context.username, input.startDate, input.endDate),
);
