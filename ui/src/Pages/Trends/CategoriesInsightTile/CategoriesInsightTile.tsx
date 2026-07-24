import { useQuery } from '@tanstack/react-query';
import Sparkline from 'Components/charts/Sparkline/Sparkline';
import ModuleContainer from 'Components/ModuleContainer/ModuleContainer';
import { spendCategoryColorMapper } from 'Components/Shared/Icons/spendCategoryIconMapper';
import SpendingCategoryIcon from 'Components/Shared/Icons/SpendingCategoryIcon';
import SkeletonLoader from 'Components/Shared/SkeletonLoader/SkeletonLoader';
import createContentGetter from 'Content/createContentGetter';
import useSelectedTimeFrame from 'Hooks/useSelectedTimeFrame/useSelectedTimeFrame';
import useSessionStatus from 'Hooks/useSessionStatus/useSessionStatus';
import { categoryTrendsQueryOptions } from 'queryOptions/categoryTrendsQueryOptions';
import styles from './CategoriesInsightTile.module.css';

const BASELINE_MONTHS = 3;

export default function CategoriesInsightTile() {
  const { isAuthenticated } = useSessionStatus();
  const { startDate } = useSelectedTimeFrame();
  const getContent = createContentGetter('trends');
  const getCategoryLabel = createContentGetter('SPENDING_CATEGORIES');
  const { isLoading, data: trendsData } = useQuery({
    ...categoryTrendsQueryOptions({ targetMonth: startDate.slice(0, 7) }),
    enabled: isAuthenticated,
  });

  if (isLoading || !trendsData) {
    return (
      <ModuleContainer className={styles.tile} elevation="low">
        <div className={styles.label}>{getContent('categoriesInsightLabel')}</div>
        <SkeletonLoader style={{ height: 20, maxWidth: 200 }} />
        <SkeletonLoader style={{ height: 26, marginTop: 10, maxWidth: 130 }} />
      </ModuleContainer>
    );
  }

  const windowLength = trendsData.months.length;
  const movers = trendsData.categories
    .map((trend) => {
      const current = trend.monthlyTotals[windowLength - 1];
      const baseline = trend.monthlyTotals.slice(windowLength - 1 - BASELINE_MONTHS, windowLength - 1);
      const baselineAverage = baseline.reduce((sum, amount) => sum + amount, 0) / BASELINE_MONTHS;
      const change =
        current !== undefined && baselineAverage > 0 ? (current - baselineAverage) / baselineAverage : null;
      return { trend, change };
    })
    .filter((mover): mover is { trend: (typeof trendsData.categories)[number]; change: number } => {
      return mover.change !== null;
    });

  if (movers.length === 0) {
    return (
      <ModuleContainer className={styles.tile} elevation="low">
        <div className={styles.label}>{getContent('categoriesInsightLabel')}</div>
        <div className={styles.emptyMessage}>{getContent('categoriesInsightEmpty')}</div>
      </ModuleContainer>
    );
  }

  const biggestMover = movers.reduce((best, mover) => (Math.abs(mover.change) > Math.abs(best.change) ? mover : best));
  const isUp = biggestMover.change > 0;
  const categoryLabel = getCategoryLabel(biggestMover.trend.category);
  const changePercent = Math.abs(Math.round(biggestMover.change * 100));

  return (
    <ModuleContainer className={styles.tile} elevation="low">
      <div className={styles.label}>{getContent('categoriesInsightLabel')}</div>
      <div className={styles.headline}>
        <span style={{ color: isUp ? 'var(--token-color-semantic-loss)' : 'var(--token-color-semantic-gain)' }}>
          {getContent(isUp ? 'categoriesInsightUp' : 'categoriesInsightDown', [categoryLabel, changePercent])}
        </span>
        {getContent('categoriesInsightSuffix')}
      </div>
      <div className={styles.vizRow}>
        <SpendingCategoryIcon size={26} category={biggestMover.trend.category} />
        <Sparkline
          values={biggestMover.trend.monthlyTotals}
          stroke={spendCategoryColorMapper[biggestMover.trend.category]}
        />
      </div>
    </ModuleContainer>
  );
}
