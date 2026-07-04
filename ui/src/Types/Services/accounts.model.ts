import { AccountCategory } from '@spend-watcher/contract';
import { DbDate } from 'Types/dateTypes';
import zodValidateMonthYear from 'Util/zodCustomValidators/zodValidateMonthYear';
import { z as zod } from 'zod';

// SHARED ZOD VALIDATORS
const zodAccountName = zod.string().min(3, { message: 'Account names must be at least 3 characters' });

export interface Account {
  id: string;
  name: string;
  currentAccountValue: number;
  category: AccountCategory;
  isFixedRate: boolean;
  annualPercentageRate: number;
}

export type AccountWithStatus = Account & {
  // `string` (yyyy-MM)
  lastUpdated: string;
  requiresNewUpdate: boolean;
};

export const addAccountRequestParamSchema = zod.object({
  accountName: zodAccountName,
  startingAccountValue: zod.number(),
  accountCategory: zod.nativeEnum(AccountCategory),
  isFixedRate: zod.boolean(),
  annualPercentageRate: zod.number().optional(),
});

export type AddAccountRequestParams = zod.infer<typeof addAccountRequestParamSchema>;

export const editAccountDetailsRequestParamsSchema = addAccountRequestParamSchema
  .extend({
    accountId: zod.string().uuid(),
  })
  .omit({
    startingAccountValue: true,
  });

export type EditAccountDetailsRequestParams = zod.infer<typeof editAccountDetailsRequestParamsSchema>;

export const addAccountUpdateRequestParamSchema = zod.object({
  accountId: zod.string().uuid(),
  amount: zod.number(),
  date: zodValidateMonthYear,
});

export type AddAccountUpdateV1RequestParams = zod.infer<typeof addAccountUpdateRequestParamSchema>;

export const editAccountUpdateRequestParamSchema = zod.object({
  accountId: zod.string().uuid(),
  updateId: zod.number(),
  amount: zod.number(),
});

export type EditAccountUpdateV1RequestParams = zod.infer<typeof editAccountUpdateRequestParamSchema>;

export type AccountValueDataPoint = {
  accountId: string; // uuid string
  accountName: string;
  date: DbDate;
  amount: number;
};

export type AccountGrowthOverTimeV1Response = AccountValueDataPoint[];
