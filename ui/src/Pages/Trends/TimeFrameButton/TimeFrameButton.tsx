import { clsx } from 'clsx';
import { DateRangeType } from 'Contexts/SelectedTimeFrame.context';
import { isSameMonth, isSameYear } from 'date-fns';
import useSelectedTimeFrame from 'Hooks/useSelectedTimeFrame/useSelectedTimeFrame';
import useTransactionHistoryStart from 'Hooks/useTransactionHistoryStart/useTransactionHistoryStart';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { parseDbDate } from 'Util/Formatters/dateFormatters/dateFormatters';
import styles from './TimeFrameButton.module.css';

export default function TimeFrameButton() {
  const { data: earliestStartDate } = useTransactionHistoryStart();
  const {
    startDate,
    forwardOneMonth,
    backOneMonth,
    forwardOneYear,
    backOneYear,
    dateRangeType,
    currentMonthLabel,
    currentYearLabel,
    isPresentMonth,
    isPresentYear,
  } = useSelectedTimeFrame();

  const forwardButtonDisabled =
    (dateRangeType === 'MONTH' && isPresentMonth) || (dateRangeType === 'YEAR' && isPresentYear);

  let backButtonDisabled = false;
  if (earliestStartDate) {
    const currentStartDate = parseDbDate(startDate);
    const earliestDate = parseDbDate(earliestStartDate.earliestTransactionDate);
    if (dateRangeType === DateRangeType.MONTH) {
      backButtonDisabled = isSameMonth(earliestDate, currentStartDate) && isSameYear(earliestDate, currentStartDate);
    } else if (dateRangeType === DateRangeType.YEAR) {
      backButtonDisabled = isSameYear(earliestDate, currentStartDate);
    }
  }

  function backClick() {
    if (backButtonDisabled || !earliestStartDate) {
      return;
    }

    if (dateRangeType === DateRangeType.MONTH) {
      backOneMonth();
    } else {
      backOneYear();
    }
  }

  function forwardClick() {
    if (forwardButtonDisabled) {
      return;
    }

    if (dateRangeType === DateRangeType.MONTH) {
      forwardOneMonth();
    } else {
      forwardOneYear();
    }
  }

  return (
    <div className={styles.container}>
      <button
        className={clsx(styles.arrowButton, backButtonDisabled && styles.disabledArrowButton)}
        onClick={backClick}
      >
        <FaArrowLeft />
      </button>
      <button className={styles.timeFrameButton}>
        {dateRangeType === DateRangeType.MONTH && (
          <>
            <div>{currentMonthLabel}</div>
            <div className={styles.yearLabel}>{currentYearLabel}</div>
          </>
        )}
        {dateRangeType === DateRangeType.YEAR && <div>{currentYearLabel}</div>}
      </button>
      <button
        className={clsx(styles.arrowButton, forwardButtonDisabled && styles.disabledArrowButton)}
        onClick={forwardClick}
      >
        <FaArrowRight />
      </button>
    </div>
  );
}
