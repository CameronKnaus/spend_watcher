import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import Sparkline from 'Components/charts/Sparkline/Sparkline';
import Currency from 'Components/Currency/Currency';
import ModuleContainer from 'Components/ModuleContainer/ModuleContainer';
import { spendCategoryColorMapper } from 'Components/Shared/Icons/spendCategoryIconMapper';
import SpendingCategoryIcon from 'Components/Shared/Icons/SpendingCategoryIcon';
import SkeletonLoader from 'Components/Shared/SkeletonLoader/SkeletonLoader';
import createContentGetter from 'Content/createContentGetter';
import { DateRangeType } from 'Contexts/SelectedTimeFrame.context';
import { format } from 'date-fns';
import useSelectedTimeFrame from 'Hooks/useSelectedTimeFrame/useSelectedTimeFrame';
import useSessionStatus from 'Hooks/useSessionStatus/useSessionStatus';
import useSpendingDetailsService from 'Hooks/useSpendingService/useSpendingDetailsService';
import { categoryTrendsQueryOptions } from 'queryOptions/categoryTrendsQueryOptions';
import { useState } from 'react';
import { DiscretionarySpendTransaction, SpendingCategory } from '@spend-watcher/contract';
import { parseDbDate } from 'Util/Formatters/dateFormatters/dateFormatters';
import formatCurrency from 'Util/Formatters/formatCurrency/formatCurrency';
import styles from './CategoryLedgerTile.module.css';

const BASELINE_MONTHS = 3;
const MAX_BAR_HEIGHT = 87;

type LedgerRow = {
  category: SpendingCategory;
  monthlyTotals: number[];
  current: number;
  baselineAverage: number;
  change: number | null;
};

function ChangeBadge({ change, fallback }: { change: number | null; fallback: string }) {
  if (change === null) {
    return <span className={styles.newBadge}>{fallback}</span>;
  }

  const isUp = change > 0;
  return (
    <span
      className={styles.changeBadge}
      style={{
        color:
          change === 0
            ? 'var(--token-color-text-subdued)'
            : isUp
              ? 'var(--token-color-semantic-loss)'
              : 'var(--token-color-semantic-gain)',
      }}
    >
      {change === 0 ? '0%' : `${isUp ? '+' : '−'}${Math.abs(Math.round(change * 100))}%`}
    </span>
  );
}

export default function CategoryLedgerTile() {
  const { isAuthenticated } = useSessionStatus();
  const { dateRangeType, startDate, currentMonthLabel } = useSelectedTimeFrame();
  const getContent = createContentGetter('trends');
  const getCategoryLabel = createContentGetter('SPENDING_CATEGORIES');
  const [selectedCategory, setSelectedCategory] = useState<SpendingCategory>();

  const isMonthView = dateRangeType === DateRangeType.MONTH;
  const { isLoading, data: trendsData } = useQuery({
    ...categoryTrendsQueryOptions({ targetMonth: startDate.slice(0, 7) }),
    enabled: isAuthenticated && isMonthView,
  });
  const { data: spendingData } = useSpendingDetailsService();

  if (!isMonthView) {
    return null;
  }

  if (isLoading || !trendsData) {
    return (
      <ModuleContainer heading={getContent('categoryLedgerHeading')} className={styles.module} elevation="medium">
        <SkeletonLoader style={{ height: 240 }} />
      </ModuleContainer>
    );
  }

  const windowLength = trendsData.months.length;
  const rows: LedgerRow[] = trendsData.categories
    .map((trend) => {
      const current = trend.monthlyTotals[windowLength - 1];
      const baseline = trend.monthlyTotals.slice(windowLength - 1 - BASELINE_MONTHS, windowLength - 1);
      const baselineAverage = baseline.reduce((sum, amount) => sum + amount, 0) / BASELINE_MONTHS;

      return {
        category: trend.category,
        monthlyTotals: trend.monthlyTotals,
        current,
        baselineAverage,
        change: baselineAverage > 0 ? (current - baselineAverage) / baselineAverage : null,
      };
    })
    .sort((a, b) => {
      if (a.change === null && b.change === null) {
        return b.current - a.current;
      }
      if (a.change === null) {
        return 1;
      }
      if (b.change === null) {
        return -1;
      }
      return b.change - a.change;
    });

  if (rows.length === 0) {
    return (
      <ModuleContainer heading={getContent('categoryLedgerHeading')} className={styles.module} elevation="medium">
        <div className={styles.emptyMessage}>{getContent('categoryLedgerEmpty')}</div>
      </ModuleContainer>
    );
  }

  const activeRow = rows.find((row) => row.category === selectedCategory) ?? rows[0];
  const activeColor = spendCategoryColorMapper[activeRow.category];
  const activeMax = Math.max(...activeRow.monthlyTotals, 1);
  const monthYearLabel = format(parseDbDate(startDate), 'LLLL yyyy');

  const transactions = Object.values(spendingData?.transactionDictionary ?? {})
    .filter(
      (transaction): transaction is DiscretionarySpendTransaction =>
        !transaction.isRecurring && transaction.category === activeRow.category,
    )
    .sort((a, b) => (a.spentDate < b.spentDate ? 1 : -1));

  return (
    <ModuleContainer heading={getContent('categoryLedgerHeading')} className={styles.module} elevation="medium">
      <div className={styles.subheading}>{getContent('categoryLedgerSubheading', [currentMonthLabel])}</div>
      <div className={styles.contentRow}>
        <div className={styles.listColumn}>
          {rows.map((row) => (
            <button
              key={row.category}
              type="button"
              data-testid="ledger-category-row"
              className={clsx(styles.categoryRow, { [styles.selectedRow]: row.category === activeRow.category })}
              onClick={() => setSelectedCategory(row.category)}
            >
              <SpendingCategoryIcon size={34} category={row.category} />
              <span className={styles.categoryText}>
                <span className={styles.categoryName}>{getCategoryLabel(row.category)}</span>
                <span className={styles.categoryAverage}>
                  {row.baselineAverage > 0
                    ? getContent('avgPerMonth', [formatCurrency(row.baselineAverage, false, true)])
                    : getContent('newCategoryBadge')}
                </span>
              </span>
              <Sparkline values={row.monthlyTotals} stroke={spendCategoryColorMapper[row.category]} />
              <span className={styles.categoryAmounts}>
                <Currency amount={row.current} />
                <ChangeBadge change={row.change} fallback={getContent('newCategoryBadge')} />
              </span>
            </button>
          ))}
          <div className={styles.recurringNote}>{getContent('recurringExcludedNote')}</div>
        </div>
        <div className={styles.detailColumn}>
          <div className={styles.detailHeader}>
            <div className={styles.detailIdentity}>
              <SpendingCategoryIcon size={40} category={activeRow.category} />
              <div>
                <div className={styles.detailName}>{getCategoryLabel(activeRow.category)}</div>
                <div className={styles.detailSubline}>
                  {getContent('categoryLedgerTransactionCount', [monthYearLabel, transactions.length])}
                </div>
              </div>
            </div>
            <div className={styles.detailTotals}>
              <Currency className={styles.detailTotal} amount={activeRow.current} />
              <div className={styles.detailChange}>
                <ChangeBadge change={activeRow.change} fallback={getContent('newCategoryBadge')} />
                {activeRow.change !== null && (
                  <span className={styles.detailChangeSuffix}>{getContent('vsThreeMonthAvgSuffix')}</span>
                )}
              </div>
            </div>
          </div>
          <div className={styles.historyCard}>
            <div className={styles.historyHeader}>
              <span>{getContent('lastSixMonthsHeader')}</span>
              {activeRow.baselineAverage > 0 && (
                <span className={styles.historyHint}>
                  {getContent('dashedAverageLabel', [formatCurrency(activeRow.baselineAverage, false, true)])}
                </span>
              )}
            </div>
            <div className={styles.historyChart}>
              {activeRow.baselineAverage > 0 && (
                <div
                  className={styles.historyAverageLine}
                  style={{ bottom: `${(activeRow.baselineAverage / activeMax) * MAX_BAR_HEIGHT + 18}px` }}
                />
              )}
              <div className={styles.historyBars}>
                {activeRow.monthlyTotals.map((amount, index) => (
                  <div key={trendsData.months[index]} className={styles.historyBarColumn}>
                    <div
                      data-testid="ledger-history-bar"
                      className={styles.historyBar}
                      style={{
                        height: `${Math.max((amount / activeMax) * MAX_BAR_HEIGHT, 2)}px`,
                        background: activeColor,
                        opacity: index === windowLength - 1 ? 1 : 0.45,
                      }}
                    />
                    <span
                      className={clsx(styles.historyBarLabel, {
                        [styles.currentBarLabel]: index === windowLength - 1,
                      })}
                    >
                      {format(parseDbDate(`${trendsData.months[index]}-01`), 'LLL')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className={styles.transactionsCard}>
            <div className={styles.historyHeader}>
              <span>{getContent('transactionsInMonth', [currentMonthLabel])}</span>
              <span className={styles.historyHint}>{getContent('newestFirst')}</span>
            </div>
            {transactions.length === 0 ? (
              <div className={styles.noTransactions}>{getContent('noTransactionsForMonth')}</div>
            ) : (
              transactions.map((transaction) => (
                <div key={transaction.transactionId} className={styles.transactionRow}>
                  <span className={styles.transactionDate}>{format(parseDbDate(transaction.spentDate), 'MMM d')}</span>
                  <span className={styles.transactionLabel}>
                    {transaction.note || getCategoryLabel(transaction.category)}
                  </span>
                  <Currency amount={transaction.amountSpent} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </ModuleContainer>
  );
}
