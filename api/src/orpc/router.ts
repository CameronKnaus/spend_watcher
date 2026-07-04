import {
  add as accountAdd,
  edit as accountEdit,
  growthOverTime,
  history,
  remove as accountRemove,
  setActive as accountSetActive,
  summary,
  updateAdd as accountUpdateAdd,
  updateEdit as accountUpdateEdit,
} from '@modules/accounts/accounts.controller';
import { login, register, verify } from '@modules/auth/auth.controller';
import { details } from '@modules/spending/details.controller';
import { discretionaryAdd, discretionaryDelete, discretionaryEdit } from '@modules/spending/discretionary.controller';
import { historyStart, yearlyAverage } from '@modules/spending/insights.controller';
import {
  recurringSpendAdd,
  recurringSpendDelete,
  recurringSpendEdit,
  recurringSpendSetActive,
  recurringSummary,
  recurringTransactionAdd,
  recurringTransactionEdit,
  recurringTransactions,
} from '@modules/spending/recurring.controller';
import {
  add as tripAdd,
  edit as tripEdit,
  expenses,
  list,
  remove as tripRemove,
} from '@modules/trips/trips.controller';
import { pub } from './base';

export const router = pub.router({
  spending: {
    details,
    recurringSummary,
    recurringTransactions,
    historyStart,
    yearlyAverage,
    discretionaryAdd,
    discretionaryEdit,
    discretionaryDelete,
    recurringSpendAdd,
    recurringSpendEdit,
    recurringSpendDelete,
    recurringSpendSetActive,
    recurringTransactionAdd,
    recurringTransactionEdit,
  },
  accounts: {
    summary,
    growthOverTime,
    history,
    add: accountAdd,
    edit: accountEdit,
    setActive: accountSetActive,
    delete: accountRemove,
    updateAdd: accountUpdateAdd,
    updateEdit: accountUpdateEdit,
  },
  trips: {
    list,
    expenses,
    add: tripAdd,
    edit: tripEdit,
    delete: tripRemove,
  },
  auth: {
    login,
    register,
    verify,
  },
});
