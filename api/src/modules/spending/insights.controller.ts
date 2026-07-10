import { authed } from '../../orpc/base';
import { getHistoryStart, getSpendingPace, getYearlyAverage } from './insights.service';

// GET /api/spending/history-start — the earliest dates the user has spending history for.
export const historyStart = authed.spending.historyStart.handler(({ context }) => getHistoryStart(context.username));

// GET /api/spending/yearly-average — current-year monthly average plus a YoY comparison.
export const yearlyAverage = authed.spending.yearlyAverage.handler(({ context }) => getYearlyAverage(context.username));

// GET /api/spending/pace — month-to-date totals with previous-month comparison windows.
export const pace = authed.spending.pace.handler(({ context, input }) =>
  getSpendingPace(context.username, input.targetDate),
);
