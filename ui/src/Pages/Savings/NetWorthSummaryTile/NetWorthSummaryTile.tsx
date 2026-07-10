import { useQuery } from '@tanstack/react-query';
import Currency from 'Components/Currency/Currency';
import ModuleContainer from 'Components/ModuleContainer/ModuleContainer';
import SkeletonLoader from 'Components/Shared/SkeletonLoader/SkeletonLoader';
import createContentGetter from 'Content/createContentGetter';
import { accountsSummaryQueryOptions } from 'queryOptions/accountsSummaryQueryOptions';
import { AccountCategory } from '@spend-watcher/contract';
import styles from './NetWorthSummaryTile.module.css';

function categoryColor(category: AccountCategory) {
  return `var(--theme-color-account-category-${category})`;
}

export default function NetWorthSummaryTile() {
  const getContent = createContentGetter('savings');
  const getCategoryLabel = createContentGetter('ACCOUNT_CATEGORIES');
  const { isLoading, data: accountsSummary } = useQuery(accountsSummaryQueryOptions);

  if (isLoading || !accountsSummary) {
    return (
      <ModuleContainer heading={getContent('netWorth')} elevation="medium">
        <SkeletonLoader style={{ height: 30, maxWidth: 130 }} />
        <SkeletonLoader style={{ height: 10, marginTop: 12 }} />
      </ModuleContainer>
    );
  }

  const { totalEquity } = accountsSummary;
  const allocations = Object.entries(accountsSummary.accountTotalsByType)
    .filter(([, amount]) => amount > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([category, amount]) => ({
      category: category as AccountCategory,
      amount,
      share: (amount / totalEquity) * 100,
    }));
  const hasAllocation = totalEquity > 0 && allocations.length > 0;

  return (
    <ModuleContainer heading={getContent('netWorth')} elevation="medium">
      <div className={styles.totalRow}>
        <Currency className="font-heading-medium font-thin" amount={totalEquity} />
        {accountsSummary.yearStartNetWorth !== null && (
          <div className={styles.ytdBadge}>
            <Currency
              className={styles.ytdAmount}
              amount={totalEquity - accountsSummary.yearStartNetWorth}
              isGainLoss
            />
            <div className={styles.ytdLabel}>{getContent('ytdGrowth')}</div>
          </div>
        )}
      </div>
      {hasAllocation ? (
        <>
          <div className={styles.allocationBar}>
            {allocations.map((allocation) => (
              <div
                key={allocation.category}
                data-testid="allocation-segment"
                style={{ width: `${allocation.share}%`, background: categoryColor(allocation.category) }}
              />
            ))}
          </div>
          <div className={styles.legend}>
            {allocations.map((allocation) => (
              <span key={allocation.category} data-testid="allocation-legend-item" className={styles.legendItem}>
                <span className={styles.legendSwatch} style={{ background: categoryColor(allocation.category) }} />
                {getCategoryLabel(allocation.category)} <Currency amount={allocation.amount} /> ·{' '}
                {Math.round(allocation.share)}%
              </span>
            ))}
          </div>
        </>
      ) : (
        <div className={styles.emptyMessage}>{getContent('netWorthAllocationEmpty')}</div>
      )}
    </ModuleContainer>
  );
}
