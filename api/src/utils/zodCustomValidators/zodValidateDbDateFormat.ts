import { DbDate } from '@type/dateTypes';
import { z as zod } from 'zod';

// Validates a string is 'YYYY-MM-DD' format
const zodValidateDbDateFormat = zod.custom<DbDate>(
    (givenValue): givenValue is DbDate =>
        typeof givenValue === 'string' && /^\d{4}-(0\d|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(givenValue),
    {
        message: 'Invalid YearMonthDay format. Expected format: "YYYY-MM-DD".',
    },
);

export default zodValidateDbDateFormat;
