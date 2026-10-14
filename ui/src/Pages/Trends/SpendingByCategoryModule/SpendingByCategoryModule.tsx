import { useQuery } from '@tanstack/react-query';
import Sparkline from 'Components/charts/Sparkline/Sparkline';
import Currency from 'Components/Currency/Currency';
import ModuleContainer from 'Components/ModuleContainer/ModuleContainer';
import EmptyState from 'Components/Shared/EmptyState/EmptyState';
import { spendCategoryColorMapper } from 'Components/Shared/Icons/spendCategoryIconMapper';
import SpendingCategoryIcon from 'Components/Shared/Icons/SpendingCategoryIcon';
import SkeletonLoader from 'Components/Shared/SkeletonLoader/SkeletonLoader';
import createContentGetter from 'Content/createContentGetter';
import { DateRangeType } from 'Contexts/SelectedTimeFrame.context';
import { format, subMonths } from 'date-fns';
import useSelectedTimeFrame from 'Hooks/useSelectedTimeFrame/useSelectedTimeFrame';
import useSessionStatus from 'Hooks/useSessionStatus/useSessionStatus';
import useSpendingDetailsService from 'Hooks/useSpendingService/useSpendingDetailsService';
import { categoryTrendsQueryOptions } from 'queryOptions/categoryTrendsQueryOptions';
import { FaCaretDown, FaCaretUp } from 'react-icons/fa';
import { CategoryTrendsResponse } from '@spend-watcher/contract';
import { parseDbDate } from 'Util/Formatters/dateFormatters/dateFormatters';
import styles from './SpendingByCategoryModule.module.css';

const SKELETON_KEYS = Array.from({ length: 6 }, (_, i) => `spending-by-category-skeleton-${i}`);

function DeltaCell({ trend }: { trend?: CategoryTrendsResponse['categories'][number] }) {
  if (!trend || trend.percentChange === null) {
    return <span className={styles.neutralDelta}>—</span>;
  }

  if (trend.percentChange === 0) {
    return <span className={styles.neutralDelta}>0%</span>;
  }

  // Rising spend reads as a loss, falling as a gain — same semantics as everywhere else.
  const isRising = trend.percentChange > 0;
  return (
    <span
      className={styles.deltaBadge}
      style={{ color: isRising ? 'var(--token-color-semantic-loss)' : 'var(--token-color-semantic-gain)' }}
    >
      {isRising ? <FaCaretUp /> : <FaCaretDown />}
      {Math.abs(Math.round(trend.percentChange * 100))}%
    </span>
  );
}

export default function SpendingByCategoryModule() {
  const { isLoading, data: spendingData } = useSpendingDetailsService();
  const { isAuthenticated } = useSessionStatus();
  const { dateRangeType, startDate, currentMonthLabel, currentYearLabel } = useSelectedTimeFrame();
  const getContent = createContentGetter('trends');
  const getCategoryLabel = createContentGetter('SPENDING_CATEGORIES');

  const isMonthView = dateRangeType === DateRangeType.MONTH;
  const { data: trendsData } = useQuery({
    ...categoryTrendsQueryOptions({ targetMonth: startDate.slice(0, 7) }),
    enabled: isAuthenticated && isMonthView,
  });

  const periodLabel = isMonthView ? currentMonthLabel : currentYearLabel;

  if (isLoading || !spendingData) {
    return (
      <ModuleContainer heading={getContent('spendingByCategory')} className={styles.module} elevation="medium">
        {SKELETON_KEYS.map((key) => (
          <SkeletonLoader key={key} className={styles.placeholderSkeleton} />
        ))}
      </ModuleContainer>
    );
  }

  const sortedList = [...spendingData.spendCategoryOverview.categoryDetailsList].sort(
    (a, b) => b.combinedTotals.amount - a.combinedTotals.amount,
  );

  if (sortedList.length === 0) {
    return (
      <ModuleContainer heading={getContent('spendingByCategory')} className={styles.module} elevation="medium">
        <EmptyState message={getContent('spendingByCategoryEmpty')} />
      </ModuleContainer>
    );
  }

  const trendsByCategory = new Map(trendsData?.categories.map((trend) => [trend.category, trend]) ?? []);
  const previousMonthLabel = format(subMonths(parseDbDate(startDate), 1), 'LLL');

  return (
    <ModuleContainer heading={getContent('spendingByCategory')} className={styles.module} elevation="medium">
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.headerRow}>
              <th align="left">{getContent('category')}</th>
              <th align="right">{periodLabel}</th>
              {isMonthView && (
                <>
                  <th align="right">{getContent('vsPrevMonthHeader', [previousMonthLabel])}</th>
                  <th align="left">{getContent('lastSixMonthsHeader')}</th>
                </>
              )}
              <th align="left" className={styles.shareHeader}>
                {getContent('shareOfTotal')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedList.map((categoryDetails) => {
              const share = Math.round(categoryDetails.combinedTotals.percentageOfTotalAmount);
              const trend = trendsByCategory.get(categoryDetails.category);

              return (
                <tr key={categoryDetails.category} className={styles.categoryRow}>
                  <td>
                    <div className={styles.categoryCell}>
                      <SpendingCategoryIcon size={24} className={styles.icon} category={categoryDetails.category} />
                      <span>{getCategoryLabel(categoryDetails.category)}</span>
                    </div>
                  </td>
                  <td align="right">
                    <Currency isGainLoss amount={-categoryDetails.combinedTotals.amount} />
                  </td>
                  {isMonthView && (
                    <>
                      <td align="right">
                        <DeltaCell trend={trend} />
                      </td>
                      <td>
                        {trend ? (
                          <Sparkline
                            values={trend.monthlyTotals}
                            stroke={spendCategoryColorMapper[categoryDetails.category]}
                          />
                        ) : (
                          <span className={styles.neutralDelta}>—</span>
                        )}
                      </td>
                    </>
                  )}
                  <td>
                    <div className={styles.shareCell}>
                      <div className={styles.shareTrack}>
                        <div
                          className={styles.shareFill}
                          style={{
                            width: `${share}%`,
                            background: spendCategoryColorMapper[categoryDetails.category],
                          }}
                        />
                      </div>
                      <span className={styles.shareLabel}>{share}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ModuleContainer>
  );
}
