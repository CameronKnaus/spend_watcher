import {
  addMonths,
  addYears,
  endOfMonth,
  endOfYear,
  format,
  getMonth,
  getYear,
  startOfMonth,
  startOfYear,
  subMonths,
  subYears,
} from 'date-fns';
import { createContext, ReactNode, useState } from 'react';
import { DbDate, dbDateFormat } from 'Types/dateTypes';
import { parseDbDate } from 'Util/Formatters/dateFormatters/dateFormatters';

export enum DateRangeType {
  MONTH = 'MONTH',
  YEAR = 'YEAR',
  MAX = 'MAX',
  CUSTOM = 'CUSTOM',
}

export type SelectedTimeFrameContextAPI = {
  startDate: DbDate;
  endDate: DbDate;
  dateRangeType: DateRangeType;
  currentMonthLabel: string;
  currentYearLabel: string;
  setStartDate: (date: DbDate) => void;
  setEndDate: (date: DbDate) => void;
  forwardOneMonth: () => void;
  backOneMonth: () => void;
  forwardOneYear: () => void;
  backOneYear: () => void;
  isPresentYear: boolean;
  isPresentMonth: boolean;
  updateDateRangeType: (type: DateRangeType) => void;
  setToCurrentMonth: () => void;
};

export const SelectedTimeFrameContext = createContext<SelectedTimeFrameContextAPI | null>(null);

// Small wrapper for readability
const formatDate = (date: Date) => {
  return format(date, dbDateFormat);
};

export default function SelectedTimeFrameProvider({ children }: { children: ReactNode }) {
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>(DateRangeType.MONTH);
  // Default start date to first day of this month
  const [startDate, setStartDate] = useState<DbDate>(formatDate(startOfMonth(new Date())));
  // Default end date to today
  const [endDate, setEndDate] = useState<DbDate>(formatDate(new Date()));

  const presentDate = new Date();
  const isPresentYear = getYear(endDate) === getYear(presentDate);
  const isSameMonth = getMonth(endDate) === getMonth(presentDate);

  const parsedStartDate = parseDbDate(startDate);

  function setToCurrentMonth() {
    setStartDate(formatDate(startOfMonth(new Date())));
    setEndDate(formatDate(new Date()));
    setDateRangeType(DateRangeType.MONTH);
  }

  function updateDateRangeType(type: DateRangeType) {
    if (type === DateRangeType.MAX || type === DateRangeType.CUSTOM) {
      // TODO: Currently unsupported
      return;
    }

    if (type === DateRangeType.MONTH) {
      // When changing to monthly, set it to the current month
      setToCurrentMonth();
    }

    if (type === DateRangeType.YEAR) {
      // When changing to yearly, set it to the current year
      setStartDate(formatDate(startOfYear(new Date())));
      setEndDate(formatDate(new Date()));
      setDateRangeType(type);
    }
  }

  function forwardOneMonth() {
    // Only allowed when in monthly date range type
    if (dateRangeType !== DateRangeType.MONTH) {
      return;
    }

    // Disallow shifting forward if already at the current month and year
    if (isPresentYear && isSameMonth) {
      return;
    }

    // Use start date to determine current month for calculations
    // Forward the current date one month
    const nextMonthDate = addMonths(parsedStartDate, 1);

    // Get start and end date of next month
    const nextMonthStart = startOfMonth(nextMonthDate);
    const nextMonthEnd = endOfMonth(nextMonthDate);

    // If the new month is the current month, use today instead of the end of the month
    const isCurrentMonth =
      getMonth(nextMonthDate) === getMonth(presentDate) && getYear(nextMonthDate) === getYear(presentDate);
    setEndDate(isCurrentMonth ? formatDate(presentDate) : formatDate(nextMonthEnd));
    setStartDate(formatDate(nextMonthStart));
  }

  function backOneMonth() {
    // Only allowed when in monthly date range type
    if (dateRangeType !== DateRangeType.MONTH) {
      return;
    }

    // Use start date to determine current month for calculations
    // Back the current date one month
    const previousMonthDate = subMonths(parsedStartDate, 1);

    // Get start and end date of previous month
    const previousMonthStart = startOfMonth(previousMonthDate);
    const previousMonthEnd = endOfMonth(previousMonthDate);

    setStartDate(formatDate(previousMonthStart));
    setEndDate(formatDate(previousMonthEnd));
  }

  function forwardOneYear() {
    // Only allowed when in yearly date range type and it's not the current year
    if (dateRangeType !== DateRangeType.YEAR || isPresentYear) {
      return;
    }

    // Use start date to determine current year for calculations
    // Forward the current date one year
    const nextYearDate = addYears(parsedStartDate, 1);

    // Get start and end date of next year
    const nextYearStart = startOfYear(nextYearDate);
    const nextYearEnd = endOfYear(nextYearDate);

    // If the new year is the current year, use today instead of the end of the year
    const newYearEqualsPresentYear = getYear(nextYearDate) === getYear(presentDate);
    setEndDate(newYearEqualsPresentYear ? formatDate(presentDate) : formatDate(nextYearEnd));
    setStartDate(formatDate(nextYearStart));
  }

  function backOneYear() {
    // Only allowed when in yearly date range type
    if (dateRangeType !== DateRangeType.YEAR) {
      return;
    }

    // Use start date to determine current year for calculations
    // Back the current date one year
    const previousYearDate = subYears(parsedStartDate, 1);

    // Get start and end date of previous year
    const previousYearStart = startOfYear(previousYearDate);
    const previousYearEnd = endOfYear(previousYearDate);

    setStartDate(formatDate(previousYearStart));
    setEndDate(formatDate(previousYearEnd));
  }

  const selectedTimeFrameAPI: SelectedTimeFrameContextAPI = {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    dateRangeType,
    currentMonthLabel: format(parsedStartDate, 'LLLL'), // Not reliable for custom date ranges
    currentYearLabel: format(parsedStartDate, 'yyyy'),
    forwardOneMonth,
    backOneMonth,
    forwardOneYear,
    backOneYear,
    isPresentYear,
    isPresentMonth: isPresentYear && isSameMonth,
    updateDateRangeType,
    setToCurrentMonth,
  };

  return <SelectedTimeFrameContext.Provider value={selectedTimeFrameAPI}>{children}</SelectedTimeFrameContext.Provider>;
}
