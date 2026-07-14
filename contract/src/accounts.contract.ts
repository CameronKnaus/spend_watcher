import { oc } from '@orpc/contract';
import { z } from 'zod';
import { zAccountCategory, zMonthYearDate } from './shared';

// A single account joined to its latest update, with derived status.
export const accountWithStatusSchema = z.object({
  id: z.string(),
  name: z.string(),
  currentAccountValue: z.number(),
  category: zAccountCategory,
  isFixedRate: z.boolean(),
  annualPercentageRate: z.number(),
  lastUpdated: zMonthYearDate,
  requiresNewUpdate: z.boolean(),
});
export type AccountWithStatus = z.infer<typeof accountWithStatusSchema>;

// GET /accounts/summary
export const accountsSummaryContract = oc.route({ method: 'GET', path: '/accounts/summary' }).output(
  z.object({
    totalEquity: z.number(),
    totalAccountsCount: z.number(),
    accountsCountByCategory: z.record(zAccountCategory, z.number()),
    accountTotalsByType: z.record(zAccountCategory, z.number()),
    accountsList: z.array(accountWithStatusSchema),
  }),
);

// GET /accounts/growth-over-time — one data point per account update (dates as yyyy-MM-dd).
const accountValueDataPointSchema = z.object({
  accountId: z.string(),
  accountName: z.string(),
  date: z.iso.date(),
  amount: z.number(),
});

export const accountsGrowthOverTimeContract = oc
  .route({ method: 'GET', path: '/accounts/growth-over-time' })
  .output(z.array(accountValueDataPointSchema));

// GET /accounts/history — full monthly update history for a single account.
export const accountsHistoryContract = oc
  .route({ method: 'GET', path: '/accounts/history' })
  .input(z.object({ accountId: z.uuid() }))
  .output(
    z.object({
      accountId: z.string(),
      updateHistory: z.array(
        z.object({
          date: zMonthYearDate,
          amount: z.number(),
          updateId: z.number(),
        }),
      ),
    }),
  );

// The `account_name` DB column is varchar(50).
const accountName = z.string().min(3, 'Account names must be at least 3 characters').max(50);

// POST /accounts/add
export const accountAddInputSchema = z.object({
  accountName,
  startingAccountValue: z.number(),
  accountCategory: zAccountCategory,
  isFixedRate: z.boolean(),
  annualPercentageRate: z.number().optional(),
});

export const accountAddContract = oc.route({ method: 'POST', path: '/accounts/add' }).input(accountAddInputSchema);

// POST /accounts/edit
export const accountEditInputSchema = z.object({
  accountId: z.uuid(),
  accountName,
  accountCategory: zAccountCategory,
  isFixedRate: z.boolean(),
  annualPercentageRate: z.number().optional(),
});

export const accountEditContract = oc.route({ method: 'POST', path: '/accounts/edit' }).input(accountEditInputSchema);

// POST /accounts/set-active
export const accountSetActiveContract = oc
  .route({ method: 'POST', path: '/accounts/set-active' })
  .input(z.object({ accountId: z.uuid(), isActive: z.boolean() }));

// POST /accounts/delete
export const accountDeleteContract = oc
  .route({ method: 'POST', path: '/accounts/delete' })
  .input(z.object({ accountId: z.uuid() }));

// POST /accounts/update/add
export const accountUpdateAddInputSchema = z.object({
  accountId: z.uuid(),
  amount: z.number(),
  date: zMonthYearDate,
});

export const accountUpdateAddContract = oc
  .route({ method: 'POST', path: '/accounts/update/add' })
  .input(accountUpdateAddInputSchema);

// POST /accounts/update/edit
export const accountUpdateEditInputSchema = z.object({
  accountId: z.uuid(),
  updateId: z.number(),
  amount: z.number(),
});

export const accountUpdateEditContract = oc
  .route({ method: 'POST', path: '/accounts/update/edit' })
  .input(accountUpdateEditInputSchema);

export const accountsContract = {
  summary: accountsSummaryContract,
  growthOverTime: accountsGrowthOverTimeContract,
  history: accountsHistoryContract,
  add: accountAddContract,
  edit: accountEditContract,
  setActive: accountSetActiveContract,
  delete: accountDeleteContract,
  updateAdd: accountUpdateAddContract,
  updateEdit: accountUpdateEditContract,
};
