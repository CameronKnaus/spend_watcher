import { format, parse } from 'date-fns';
import { DbDate, dbDateFormat, MonthYearDbDate, monthYearDbDateFormat } from 'Types/dateTypes';

export function parseDbDate(date: DbDate): Date {
  return parse(date, dbDateFormat, new Date());
}

// For a human readable format (month in plain text)
export function formatToMonthDayYear(date: DbDate): string {
  return format(parse(date, dbDateFormat, new Date()), 'MMM do, yyyy');
}

// For a human readable format (month in plain text)
export function formatToMonthDay(date: DbDate): string {
  return format(parse(date, dbDateFormat, new Date()), 'MMM do');
}

export function formatMonthYearDBDateAsReadable(date: MonthYearDbDate) {
  return format(parse(date, monthYearDbDateFormat, new Date()), 'MMM yyyy');
}

export function getCurrentMonthLabel(): string {
  return format(new Date(), 'LLLL');
}
