import type { TransactionsV1Response } from '../../../src/Types/Services/spending.model';

// Legacy endpoint still consumed by the Trends bar chart module.
export const spendingTransactionsResponse = { transactions: [] } satisfies TransactionsV1Response;
