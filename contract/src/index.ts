import type { InferContractRouterInputs, InferContractRouterOutputs } from '@orpc/contract';
import { accountsContract } from './accounts.contract';
import { authContract } from './auth.contract';
import { spendingContract } from './spending.contract';
import { tripsContract } from './trips.contract';

// The whole API surface. The api package implements this; the ui passes it to OpenAPILink.
export const appContract = {
  spending: spendingContract,
  accounts: accountsContract,
  trips: tripsContract,
  auth: authContract,
};

// Shared building blocks (enums + zod helpers) for anyone who needs them directly.
export { AccountCategory, SpendingCategory } from './enums';
export * from './shared';
// Auth input schemas (the ui reuses these for its login/register form validation).
export { loginInputSchema, registerInputSchema } from './auth.contract';
// Spending-details schemas + working types (the api transform infers its types from these).
export * from './spendingDetails';

// Inferred request/response maps — the single source of truth for every endpoint's types.
export type AppContract = typeof appContract;
export type AppInputs = InferContractRouterInputs<AppContract>;
export type AppOutputs = InferContractRouterOutputs<AppContract>;

// Named response types, re-derived from the contract, so the api can keep its existing type names
// (`*.types.ts` re-exports these instead of hand-maintaining the response shapes).
export type CombinedTransactionsResponse = AppOutputs['spending']['transactions'];
export type RecurringSummaryResponse = AppOutputs['spending']['recurringSummary'];
export type RecurringTransactionsListResponse = AppOutputs['spending']['recurringTransactions'];
export type HistoryStartResponse = AppOutputs['spending']['historyStart'];
export type YearlyAverageResponse = AppOutputs['spending']['yearlyAverage'];

export type AccountsSummaryResponse = AppOutputs['accounts']['summary'];
export type AccountGrowthOverTimeResponse = AppOutputs['accounts']['growthOverTime'];
export type AccountHistoryResponse = AppOutputs['accounts']['history'];

export type TripsListResponse = AppOutputs['trips']['list'];
export type TripLinkedExpensesResponse = AppOutputs['trips']['expenses'];

export type LoginInput = AppInputs['auth']['login'];
