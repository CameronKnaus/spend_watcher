import Currency from 'Components/Currency/Currency';
import ModuleContainer from 'Components/ModuleContainer/ModuleContainer';
import SkeletonLoader from 'Components/Shared/SkeletonLoader/SkeletonLoader';
import createContentGetter from 'Content/createContentGetter';
import { format, getDate, getDaysInMonth } from 'date-fns';
import useSpendingDetailsService from 'Hooks/useSpendingService/useSpendingDetailsService';
import { useState } from 'react';
import formatCurrency from 'Util/Formatters/formatCurrency/formatCurrency';
import styles from './TotalSpentHero.module.css';

export default function TotalSpentHero() {
  const { isLoading, isFetching, data: spendingData } = useSpendingDetailsService();
  const pageLoading = isLoading || isFetching || !spendingData;
  const getContent = createContentGetter('dashboard');

  // The dashboard always views the current month (it calls setToCurrentMonth on mount), so the
  // progress and projection math can key off a mount-time snapshot of "now".
  const [now] = useState(() => new Date());
  const dayOfMonth = getDate(now);
  const daysInMonth = getDaysInMonth(now);
  const monthProgressPercent = Math.round((dayOfMonth / daysInMonth) * 100);
  const monthName = format(now, 'LLLL');

  if (pageLoading) {
    return (
      <ModuleContainer heading={getContent('totalSpent')} className={styles.hero} elevation="medium">
        <SkeletonLoader style={{ height: 30, maxWidth: 130 }} />
        <SkeletonLoader style={{ height: 14, maxWidth: 220, marginTop: 12 }} />
      </ModuleContainer>
    );
  }

  const totalSpent = spendingData.summary.total.amount;
  const projectedMonthTotal = (totalSpent / dayOfMonth) * daysInMonth;

  return (
    <ModuleContainer heading={getContent('totalSpent')} className={styles.hero} elevation="medium">
      <Currency className="font-heading-medium font-thin" amount={-totalSpent} isGainLoss />
      <div className={styles.progressLabels}>
        <span>{getContent('dayOfMonthProgress', [dayOfMonth, daysInMonth])}</span>
        <span>{getContent('percentOfMonth', [monthProgressPercent, monthName])}</span>
      </div>
      <div className={styles.progressTrack}>
        <div className={styles.progressFill} style={{ width: `${monthProgressPercent}%` }} />
      </div>
      {totalSpent > 0 && (
        <div className={styles.projection}>{getContent('onPaceFor', [formatCurrency(projectedMonthTotal)])}</div>
      )}
    </ModuleContainer>
  );
}
