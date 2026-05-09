import { DiscretionaryTransactionId } from '@routes/spending/spending.model';
import { z as zod } from 'zod';

const zodValidateDiscretionaryId = zod.custom<DiscretionaryTransactionId>(
  (givenValue): givenValue is DiscretionaryTransactionId =>
    typeof givenValue === 'string' && /^Discretionary-\d+$/.test(givenValue),
  {
    message: 'Invalid transactionId format. Expected format: "Discretionary-<number>".',
  },
);

export default zodValidateDiscretionaryId;
