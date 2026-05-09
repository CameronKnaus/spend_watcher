type Year = `${number}${number}${number}${number}`;
type Month = `0${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}` | '10' | '11' | '12';
type Day = `0${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}` | `${1 | 2}${number}` | '30' | '31';

// For use with Database interactions
export type DbDate = `${Year}-${Month}-${Day}` | string; // TODO: This type doesn't work very well
export const dbDateFormat = 'yyyy-MM-dd';

export type MonthYearDbDate = `${Year}-${Month}`;
export const monthYearDbDateFormat = 'yyyy-MM';
