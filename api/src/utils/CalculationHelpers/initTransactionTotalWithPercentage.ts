import { TransactionTotalWithPercentage } from '@routes/spending/spending.model';

export default function initTransactionTotal(): TransactionTotalWithPercentage {
    return {
        amount: 0,
        count: 0,
        percentageOfTotalAmount: 0,
        percentageOfTotalCount: 0,
    };
}
