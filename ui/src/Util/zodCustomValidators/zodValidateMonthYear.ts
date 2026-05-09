import { MonthYearDbDate } from 'Types/dateTypes';
import { z as zod } from 'zod';

// Validates a string is 'YYYY-MM' format
const zodValidateMonthYear = zod.custom<MonthYearDbDate>(
  (givenValue): givenValue is MonthYearDbDate =>
    typeof givenValue === 'string' && /^\d{4}-(0\d|1[0-2])$/.test(givenValue),
  {
    message: 'Invalid MonthYear format. Expected format: "YYYY-MM".',
  },
);

export default zodValidateMonthYear;
