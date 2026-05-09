import { DbDate } from 'Types/dateTypes';

// When parsing a 'yyyy-MM-dd' date string, the day may be off by one due to time zone differences.
// This utility will parse the date string and return a Date object with the correct date, regardless of time zone.
export default function getDateFromDBDateString(dateString: DbDate): Date {
  const dateTime = new Date(dateString);
  // ValueOf to get the UTC epoch time
  const epochTimeAsUTC = dateTime.valueOf();
  const timeZoneOffsetInMilliseconds = dateTime.getTimezoneOffset() * 60 * 1000;

  return new Date(epochTimeAsUTC + timeZoneOffsetInMilliseconds);
}
