import { authed } from '../../orpc/base';
import {
  addRecurringSpend,
  addRecurringTransaction,
  editRecurringSpend,
  editRecurringTransaction,
  getRecurringSummary,
  getRecurringTransactionsList,
  removeRecurringSpend,
  setRecurringSpendActive,
} from './recurring.service';

// GET /api/spending/recurring/summary — summary of the user's recurring spends for the current month.
export const recurringSummary = authed.spending.recurringSummary.handler(({ context }) =>
  getRecurringSummary(context.username),
);

// GET /api/spending/recurring/transactions — all transactions tied to a given recurring spend.
export const recurringTransactions = authed.spending.recurringTransactions.handler(({ context, input }) =>
  getRecurringTransactionsList(context.username, input.recurringSpendId),
);

// POST /api/spending/recurring/add — create a new recurring spend.
export const recurringSpendAdd = authed.spending.recurringSpendAdd.handler(({ context, input }) =>
  addRecurringSpend(context.username, input),
);

// POST /api/spending/recurring/edit — edit an existing recurring spend.
export const recurringSpendEdit = authed.spending.recurringSpendEdit.handler(({ context, input }) =>
  editRecurringSpend(context.username, input),
);

// POST /api/spending/recurring/delete — permanently delete a recurring spend.
export const recurringSpendDelete = authed.spending.recurringSpendDelete.handler(({ context, input }) =>
  removeRecurringSpend(context.username, input.recurringSpendId),
);

// POST /api/spending/recurring/set-active — toggle a recurring spend active/inactive.
export const recurringSpendSetActive = authed.spending.recurringSpendSetActive.handler(({ context, input }) =>
  setRecurringSpendActive(context.username, input),
);

// POST /api/spending/recurring/transactions/add — add a transaction to a recurring spend.
export const recurringTransactionAdd = authed.spending.recurringTransactionAdd.handler(({ context, input }) =>
  addRecurringTransaction(context.username, input),
);

// POST /api/spending/recurring/transactions/edit — edit a recurring spend's transaction.
export const recurringTransactionEdit = authed.spending.recurringTransactionEdit.handler(({ context, input }) =>
  editRecurringTransaction(context.username, input),
);
