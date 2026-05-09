import { TransactionTotal } from '@routes/spending/spending.model';

export default function initTransactionTotal(): TransactionTotal {
  return {
    amount: 0,
    count: 0,
  };
}
