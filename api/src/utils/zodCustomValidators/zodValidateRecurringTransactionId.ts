import { RecurringTransactionId } from '@routes/spending/spending.model';
import { z as zod } from 'zod';

const zodValidateRecurringTransactionId = zod.custom<RecurringTransactionId>(
    (givenValue): givenValue is RecurringTransactionId =>
        typeof givenValue === 'string' && /^Recurring-\d+$/.test(givenValue),
    {
        message: 'Invalid transactionId format. Expected format: "Recurring-<number>".',
    },
);

export default zodValidateRecurringTransactionId;
