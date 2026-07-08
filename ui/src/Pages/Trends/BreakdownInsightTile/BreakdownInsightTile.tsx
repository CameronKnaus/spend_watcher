import ModuleContainer from 'Components/ModuleContainer/ModuleContainer';
import { spendCategoryColorMapper } from 'Components/Shared/Icons/spendCategoryIconMapper';
import SkeletonLoader from 'Components/Shared/SkeletonLoader/SkeletonLoader';
import createContentGetter from 'Content/createContentGetter';
import useSelectedTimeFrame from 'Hooks/useSelectedTimeFrame/useSelectedTimeFrame';
import useSpendingDetailsService from 'Hooks/useSpendingService/useSpendingDetailsService';
import styles from './BreakdownInsightTile.module.css';

const MAX_NAMED_SEGMENTS = 4;

export default function BreakdownInsightTile() {
  const { isLoading, data: spendingData } = useSpendingDetailsService();
  const { currentMonthLabel } = useSelectedTimeFrame();
  const getContent = createContentGetter('trends');
  const getCategoryLabel = createContentGetter('SPENDING_CATEGORIES');

  if (isLoading || !spendingData) {
    return (
      <ModuleContainer className={styles.tile} elevation="low">
        <div className={styles.label}>{getContent('breakdownInsightLabel')}</div>
        <SkeletonLoader style={{ height: 20, maxWidth: 200 }} />
        <SkeletonLoader style={{ height: 46, marginTop: 10 }} />
      </ModuleContainer>
    );
  }

  const sortedList = [...spendingData.spendCategoryOverview.categoryDetailsList]
    .filter((categoryDetails) => categoryDetails.combinedTotals.amount > 0)
    .sort((a, b) => b.combinedTotals.amount - a.combinedTotals.amount);

  if (sortedList.length === 0) {
    return (
      <ModuleContainer className={styles.tile} elevation="low">
        <div className={styles.label}>{getContent('breakdownInsightLabel')}</div>
        <div className={styles.emptyMessage}>{getContent('breakdownInsightEmpty')}</div>
      </ModuleContainer>
    );
  }

  const namedSegments = sortedList.slice(0, MAX_NAMED_SEGMENTS);
  const namedShare = namedSegments.reduce(
    (sum, categoryDetails) => sum + categoryDetails.combinedTotals.percentageOfTotalAmount,
    0,
  );
  const remainderShare = Math.max(100 - namedShare, 0);

  const topLabel = getCategoryLabel(sortedList[0].category);
  const headline =
    sortedList.length === 1
      ? getContent('breakdownInsightHeadlineSingle', [
          topLabel,
          Math.round(sortedList[0].combinedTotals.percentageOfTotalAmount),
          currentMonthLabel,
        ])
      : getContent('breakdownInsightHeadlinePair', [
          topLabel,
          getCategoryLabel(sortedList[1].category),
          Math.round(
            sortedList[0].combinedTotals.percentageOfTotalAmount + sortedList[1].combinedTotals.percentageOfTotalAmount,
          ),
          currentMonthLabel,
        ]);

  return (
    <ModuleContainer className={styles.tile} elevation="low">
      <div className={styles.label}>{getContent('breakdownInsightLabel')}</div>
      <div className={styles.headline}>{headline}</div>
      <div className={styles.band}>
        {namedSegments.map((categoryDetails) => (
          <div
            key={categoryDetails.category}
            data-testid="breakdown-segment"
            style={{
              width: `${categoryDetails.combinedTotals.percentageOfTotalAmount}%`,
              background: spendCategoryColorMapper[categoryDetails.category],
            }}
          />
        ))}
        {remainderShare > 0.5 && (
          <div
            data-testid="breakdown-segment"
            className={styles.remainderSegment}
            style={{ width: `${remainderShare}%` }}
          />
        )}
      </div>
    </ModuleContainer>
  );
}
