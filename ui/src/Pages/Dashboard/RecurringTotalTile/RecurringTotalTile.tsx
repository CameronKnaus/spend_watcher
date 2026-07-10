import { useQuery } from '@tanstack/react-query';
import Currency from 'Components/Currency/Currency';
import ModuleContainer from 'Components/ModuleContainer/ModuleContainer';
import SkeletonLoader from 'Components/Shared/SkeletonLoader/SkeletonLoader';
import createContentGetter from 'Content/createContentGetter';
import { format, subMonths } from 'date-fns';
import useSessionStatus from 'Hooks/useSessionStatus/useSessionStatus';
import useSpendingDetailsService from 'Hooks/useSpendingService/useSpendingDetailsService';
import { recurringSummaryQueryOptions } from 'queryOptions/recurringSummaryQueryOptions';
import { spendingPaceQueryOptions } from 'queryOptions/spendingPaceQueryOptions';
import { useState } from 'react';
import { dbDateFormat } from 'Types/dateTypes';
import styles from './RecurringTotalTile.module.css';

// Below this the month-over-month movement reads as noise, not a trend.
const FLAT_THRESHOLD = 0.02;

export default function RecurringTotalTile() {
  const { isLoading, isFetching, data: spendingData } = useSpendingDetailsService();
  const { isAuthenticated } = useSessionStatus();
  const pageLoading = isLoading || isFetching || !spendingData;
  const getContent = createContentGetter('dashboard');

  const [now] = useState(() => new Date());
  const { data: paceData } = useQuery({
    ...spendingPaceQueryOptions({ targetDate: format(now, dbDateFormat) }),
    enabled: isAuthenticated,
  });
  const { data: recurringSummary } = useQuery({ ...recurringSummaryQueryOptions, enabled: isAuthenticated });

  if (pageLoading) {
    return (
      <ModuleContainer heading={getContent('recurringTotal')} className={styles.tile} elevation="low">
        <SkeletonLoader style={{ height: 30, maxWidth: 130 }} />
      </ModuleContainer>
    );
  }

  const previousRecurring = paceData?.previousMonthSameDay.recurring ?? 0;
  const paceChange =
    previousRecurring > 0
      ? (spendingData.summary.recurringTotals.amount - previousRecurring) / previousRecurring
      : null;
  const previousMonthName = format(subMonths(now, 1), 'LLL');

  const contextParts: string[] = [];
  if (paceChange !== null) {
    contextParts.push(
      Math.abs(paceChange) < FLAT_THRESHOLD
        ? getContent('flatVsPrevMonth', [previousMonthName])
        : getContent('deltaVsPrevMonth', [
            `${paceChange > 0 ? '+' : '-'}${Math.abs(Math.round(paceChange * 100))}`,
            previousMonthName,
          ]),
    );
  }
  const awaitingUpdateCount = recurringSummary?.spendsRequiringUpdatesCount ?? 0;
  if (awaitingUpdateCount > 0) {
    contextParts.push(getContent('awaitingUpdate', [awaitingUpdateCount]));
  }

  return (
    <ModuleContainer heading={getContent('recurringTotal')} className={styles.tile} elevation="low">
      <div className={styles.amountRow}>
        <Currency
          className="font-heading-medium font-thin"
          amount={-spendingData.summary.recurringTotals.amount}
          isGainLoss
        />
        {contextParts.length > 0 && <span className={styles.contextLine}>{contextParts.join(' · ')}</span>}
      </div>
    </ModuleContainer>
  );
}
