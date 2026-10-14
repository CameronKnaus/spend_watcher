import { format, parse } from 'date-fns';
import { DbDate, dbDateFormat, MonthYearDbDate, monthYearDbDateFormat } from 'Types/dateTypes';

export function parseDbDate(date: DbDate): Date {
  return parse(date, dbDateFormat, new Date());
}

// Sole place the dbDateFormat string is paired with the DbDate cast, so the two can't drift apart.
export function formatDbDate(date: Date): DbDate {
  return format(date, dbDateFormat) as DbDate;
}

// Sole place the monthYearDbDateFormat string is paired with the MonthYearDbDate cast, so the two can't drift apart.
export function formatMonthYearDbDate(date: Date): MonthYearDbDate {
  return format(date, monthYearDbDateFormat) as MonthYearDbDate;
}

// For a human readable format (month in plain text)
export function formatToMonthDayYear(date: DbDate): string {
  return format(parse(date, dbDateFormat, new Date()), 'MMM do, yyyy');
}

// For a human readable format (month in plain text)
export function formatToMonthDay(date: DbDate): string {
  return format(parse(date, dbDateFormat, new Date()), 'MMM do');
}

export function formatMonthYearDBDateAsReadable(date: string) {
  return format(parse(date, monthYearDbDateFormat, new Date()), 'MMM yyyy');
}

export function getCurrentMonthLabel(): string {
  return format(new Date(), 'LLLL');
}
