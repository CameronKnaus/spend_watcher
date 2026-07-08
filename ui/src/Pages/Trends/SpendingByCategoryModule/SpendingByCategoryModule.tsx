import Currency from 'Components/Currency/Currency';
import ModuleContainer from 'Components/ModuleContainer/ModuleContainer';
import { spendCategoryColorMapper } from 'Components/Shared/Icons/spendCategoryIconMapper';
import SpendingCategoryIcon from 'Components/Shared/Icons/SpendingCategoryIcon';
import SkeletonLoader from 'Components/Shared/SkeletonLoader/SkeletonLoader';
import createContentGetter from 'Content/createContentGetter';
import { DateRangeType } from 'Contexts/SelectedTimeFrame.context';
import useSelectedTimeFrame from 'Hooks/useSelectedTimeFrame/useSelectedTimeFrame';
import useSpendingDetailsService from 'Hooks/useSpendingService/useSpendingDetailsService';
import styles from './SpendingByCategoryModule.module.css';

const SKELETON_KEYS = Array.from({ length: 6 }, (_, i) => `spending-by-category-skeleton-${i}`);

export default function SpendingByCategoryModule() {
  const { isLoading, data: spendingData } = useSpendingDetailsService();
  const { dateRangeType, currentMonthLabel, currentYearLabel } = useSelectedTimeFrame();
  const getContent = createContentGetter('trends');
  const getCategoryLabel = createContentGetter('SPENDING_CATEGORIES');

  const periodLabel = dateRangeType === DateRangeType.YEAR ? currentYearLabel : currentMonthLabel;

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
        <div className={styles.emptyMessage}>{getContent('spendingByCategoryEmpty')}</div>
      </ModuleContainer>
    );
  }

  return (
    <ModuleContainer heading={getContent('spendingByCategory')} className={styles.module} elevation="medium">
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.headerRow}>
              <th align="left">{getContent('category')}</th>
              <th align="right">{periodLabel}</th>
              <th align="left" className={styles.shareHeader}>
                {getContent('shareOfTotal')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedList.map((categoryDetails) => {
              const share = Math.round(categoryDetails.combinedTotals.percentageOfTotalAmount);

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
