import { MonthYearDbDate } from '@type/dateTypes';
import { format } from 'date-fns';
import { authed } from '../../orpc/base';
import {
  addAccount,
  addAccountUpdate,
  editAccount,
  editAccountUpdate,
  getAccountGrowthOverTime,
  getAccountsSummary,
  getAccountUpdates,
  removeAccount,
  setAccountActive,
} from './accounts.service';

// GET /api/accounts/summary — all of the user's accounts plus aggregated equity/category totals.
export const summary = authed.accounts.summary.handler(({ context }) => getAccountsSummary(context.username));

// GET /api/accounts/growth-over-time — account totals per date as data points for d3 charts.
// The service returns raw points; date shaping to yyyy-MM-dd is HTTP-response concern, so it lives here.
export const growthOverTime = authed.accounts.growthOverTime.handler(async ({ context }) => {
  const dataPoints = await getAccountGrowthOverTime(context.username);

  return dataPoints.map((dataPoint) => ({
    ...dataPoint,
    date: format(dataPoint.date, 'yyyy-MM-dd'),
  }));
});

// GET /api/accounts/history — the full monthly update history for a single account.
export const history = authed.accounts.history.handler(async ({ context, input }) => {
  const updates = await getAccountUpdates(context.username, input.accountId);

  // Empty when the account has no updates or isn't the caller's — echo the requested id rather than
  // reading `updates[0]`, which would throw.
  return {
    accountId: input.accountId,
    updateHistory: updates.map((update) => ({
      date: format(update.date, 'yyyy-MM') as MonthYearDbDate,
      amount: update.amount,
      updateId: update.updateId,
    })),
  };
});

// POST /api/accounts/add — create a new account plus its starting-balance update.
export const add = authed.accounts.add.handler(({ context, input }) => addAccount(context.username, input));

// POST /api/accounts/edit — edit an account's details.
export const edit = authed.accounts.edit.handler(({ context, input }) => editAccount(context.username, input));

// POST /api/accounts/set-active — toggle an account active/inactive.
export const setActive = authed.accounts.setActive.handler(({ context, input }) =>
  setAccountActive(context.username, input),
);

// POST /api/accounts/delete — permanently delete an account.
export const remove = authed.accounts.delete.handler(({ context, input }) =>
  removeAccount(context.username, input.accountId),
);

// POST /api/accounts/update/add — add a monthly balance update for an account.
export const updateAdd = authed.accounts.updateAdd.handler(({ context, input }) =>
  addAccountUpdate(context.username, input),
);

// POST /api/accounts/update/edit — edit an existing balance update.
export const updateEdit = authed.accounts.updateEdit.handler(({ context, input }) =>
  editAccountUpdate(context.username, input),
);
