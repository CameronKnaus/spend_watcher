import { useQuery } from '@tanstack/react-query';
import Currency from 'Components/Currency/Currency';
import ModuleContainer from 'Components/ModuleContainer/ModuleContainer';
import SkeletonLoader from 'Components/Shared/SkeletonLoader/SkeletonLoader';
import createContentGetter from 'Content/createContentGetter';
import { format, getDate, getDaysInMonth, subMonths } from 'date-fns';
import useSessionStatus from 'Hooks/useSessionStatus/useSessionStatus';
import useSpendingDetailsService from 'Hooks/useSpendingService/useSpendingDetailsService';
import { spendingPaceQueryOptions } from 'queryOptions/spendingPaceQueryOptions';
import { FaCaretDown, FaCaretUp } from 'react-icons/fa';
import { useState } from 'react';
import { dbDateFormat } from 'Types/dateTypes';
import formatCurrency from 'Util/Formatters/formatCurrency/formatCurrency';
import styles from './TotalSpentHero.module.css';

export default function TotalSpentHero() {
  const { isLoading, isFetching, data: spendingData } = useSpendingDetailsService();
  const { isAuthenticated } = useSessionStatus();
  const pageLoading = isLoading || isFetching || !spendingData;
  const getContent = createContentGetter('dashboard');

  // The dashboard always views the current month (it calls setToCurrentMonth on mount), so the
  // progress and projection math can key off a mount-time snapshot of "now".
  const [now] = useState(() => new Date());
  const { data: paceData } = useQuery({
    ...spendingPaceQueryOptions({ targetDate: format(now, dbDateFormat) }),
    enabled: isAuthenticated,
  });

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

  const previousPace = paceData?.previousMonthSameDay.total ?? 0;
  const paceChange = previousPace > 0 ? (totalSpent - previousPace) / previousPace : null;
  const isOverPace = paceChange !== null && paceChange > 0;
  const paceColor = isOverPace ? 'var(--token-color-semantic-loss)' : 'var(--token-color-semantic-gain)';
  const previousMonthName = format(subMonths(now, 1), 'LLLL');

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
      <div className={styles.paceRow}>
        {totalSpent > 0 && (
          <span className={styles.projection}>{getContent('onPaceFor', [formatCurrency(projectedMonthTotal)])}</span>
        )}
        {paceChange !== null && (
          <span className={styles.paceBadge} style={{ color: paceColor }}>
            {isOverPace ? <FaCaretUp /> : <FaCaretDown />}
            {getContent(isOverPace ? 'paceOver' : 'paceUnder', [
              Math.abs(Math.round(paceChange * 100)),
              previousMonthName,
            ])}
          </span>
        )}
      </div>
    </ModuleContainer>
  );
}
