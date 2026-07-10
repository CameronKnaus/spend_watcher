import { useQuery } from '@tanstack/react-query';
import Currency from 'Components/Currency/Currency';
import ModuleContainer from 'Components/ModuleContainer/ModuleContainer';
import SkeletonLoader from 'Components/Shared/SkeletonLoader/SkeletonLoader';
import createContentGetter from 'Content/createContentGetter';
import { format, subMonths } from 'date-fns';
import useSessionStatus from 'Hooks/useSessionStatus/useSessionStatus';
import useSpendingDetailsService from 'Hooks/useSpendingService/useSpendingDetailsService';
import { spendingPaceQueryOptions } from 'queryOptions/spendingPaceQueryOptions';
import { useState } from 'react';
import { FaCaretDown, FaCaretUp } from 'react-icons/fa';
import { dbDateFormat } from 'Types/dateTypes';
import styles from './DiscretionaryTotalTile.module.css';

export default function DiscretionaryTotalTile() {
  const { isLoading, isFetching, data: spendingData } = useSpendingDetailsService();
  const { isAuthenticated } = useSessionStatus();
  const pageLoading = isLoading || isFetching || !spendingData;
  const getContent = createContentGetter('dashboard');

  const [now] = useState(() => new Date());
  const { data: paceData } = useQuery({
    ...spendingPaceQueryOptions({ targetDate: format(now, dbDateFormat) }),
    enabled: isAuthenticated,
  });

  if (pageLoading) {
    return (
      <ModuleContainer heading={getContent('discretionaryTotal')} className={styles.tile} elevation="low">
        <SkeletonLoader style={{ height: 30, maxWidth: 130 }} />
      </ModuleContainer>
    );
  }

  const previousDiscretionary = paceData?.previousMonthSameDay.discretionary ?? 0;
  const paceChange =
    previousDiscretionary > 0
      ? (spendingData.summary.discretionaryTotals.amount - previousDiscretionary) / previousDiscretionary
      : null;
  const isIncrease = paceChange !== null && paceChange > 0;
  const deltaColor = isIncrease ? 'var(--token-color-semantic-loss)' : 'var(--token-color-semantic-gain)';

  return (
    <ModuleContainer heading={getContent('discretionaryTotal')} className={styles.tile} elevation="low">
      <div className={styles.amountRow}>
        <Currency
          className="font-heading-medium font-thin"
          amount={-spendingData.summary.discretionaryTotals.amount}
          isGainLoss
        />
        {paceChange !== null && (
          <span className={styles.deltaBadge} style={{ color: deltaColor }}>
            {isIncrease ? <FaCaretUp /> : <FaCaretDown />}
            {getContent('deltaVsPrevMonth', [Math.abs(Math.round(paceChange * 100)), format(subMonths(now, 1), 'LLL')])}
          </span>
        )}
      </div>
    </ModuleContainer>
  );
}
