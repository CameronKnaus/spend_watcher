import db from '@lib/db';
import { DbDate, dbDateFormat } from '@type/dateTypes';
import { format } from 'date-fns';

// Returns a query string set to be the first day of the month of the given date.
// If a date is not given then the MySQL current date function will be used
export function getFirstOfMonthForDb(givenDate?: DbDate) {
  return `DATE_SUB(${db.escape(givenDate ?? 'CURRENT_DATE()')}, INTERVAL DAYOFMONTH(NOW())-1 DAY)`;
}

export function formatDbDate(date: Date) {
  return format(date, dbDateFormat);
}
