import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import Currency from 'Components/Currency/Currency';
import ModuleContainer from 'Components/ModuleContainer/ModuleContainer';
import EmptyState from 'Components/Shared/EmptyState/EmptyState';
import { spendCategoryColorMapper } from 'Components/Shared/Icons/spendCategoryIconMapper';
import SkeletonLoader from 'Components/Shared/SkeletonLoader/SkeletonLoader';
import createContentGetter from 'Content/createContentGetter';
import { DateRangeType } from 'Contexts/SelectedTimeFrame.context';
import { endOfMonth, format, isSameMonth } from 'date-fns';
import useSelectedTimeFrame from 'Hooks/useSelectedTimeFrame/useSelectedTimeFrame';
import useSessionStatus from 'Hooks/useSessionStatus/useSessionStatus';
import { categoryTrendsQueryOptions } from 'queryOptions/categoryTrendsQueryOptions';
import { spendingDetailsQueryOptions } from 'queryOptions/spendingDetailsQueryOptions';
import { useState } from 'react';
import { DiscretionarySpendTransaction } from '@spend-watcher/contract';
import { parseDbDate } from 'Util/Formatters/dateFormatters/dateFormatters';
import formatCurrency from 'Util/Formatters/formatCurrency/formatCurrency';
import styles from './SpendingByMonthTile.module.css';

const STACK_CATEGORIES = 4;
const MAX_BAR_HEIGHT = 200;
const TOP_TRANSACTIONS = 3;

type StackLayer = {
  key: string;
  label: string;
  color: string;
  amounts: number[];
};

export default function SpendingByMonthTile() {
  const { isAuthenticated } = useSessionStatus();
  const { dateRangeType, startDate } = useSelectedTimeFrame();
  const getContent = createContentGetter('trends');
  const getCategoryLabel = createContentGetter('SPENDING_CATEGORIES');
  const [selectedMonth, setSelectedMonth] = useState<string>();
  const [now] = useState(() => new Date());

  const isMonthView = dateRangeType === DateRangeType.MONTH;
  const { isLoading, data: trendsData } = useQuery({
    ...categoryTrendsQueryOptions({ targetMonth: startDate.slice(0, 7) }),
    enabled: isAuthenticated && isMonthView,
  });

  const monthTotals =
    trendsData?.months.map((month, index) => ({
      month,
      total: trendsData.categories.reduce((sum, category) => sum + category.monthlyTotals[index], 0),
    })) ?? [];
  const monthsWithData = monthTotals.filter((entry) => entry.total > 0);
  const priciestMonth = monthsWithData.reduce(
    (best, entry) => (best === undefined || entry.total >= best.total ? entry : best),
    undefined as (typeof monthTotals)[number] | undefined,
  );
  const activeMonth = selectedMonth ?? priciestMonth?.month;
  const activeIndex = trendsData?.months.indexOf(activeMonth ?? '') ?? -1;

  const activeMonthStart = activeMonth ? parseDbDate(`${activeMonth}-01`) : undefined;
  const { data: monthDetails } = useQuery({
    ...spendingDetailsQueryOptions({
      startDate: activeMonth ? `${activeMonth}-01` : '',
      endDate: activeMonthStart ? format(endOfMonth(activeMonthStart), 'yyyy-MM-dd') : '',
    }),
    enabled: isAuthenticated && isMonthView && activeMonth !== undefined,
  });

  if (!isMonthView) {
    return null;
  }

  if (isLoading || !trendsData) {
    return (
      <ModuleContainer heading={getContent('spendingByMonthHeading')} className={styles.module} elevation="medium">
        <SkeletonLoader style={{ height: 240 }} />
      </ModuleContainer>
    );
  }

  if (monthsWithData.length === 0 || !activeMonth || activeIndex === -1) {
    return (
      <ModuleContainer heading={getContent('spendingByMonthHeading')} className={styles.module} elevation="medium">
        <EmptyState message={getContent('spendingByMonthEmpty')} />
      </ModuleContainer>
    );
  }

  const rankedCategories = [...trendsData.categories].sort(
    (a, b) =>
      b.monthlyTotals.reduce((sum, amount) => sum + amount, 0) -
      a.monthlyTotals.reduce((sum, amount) => sum + amount, 0),
  );
  const namedCategories = rankedCategories.slice(0, STACK_CATEGORIES);
  const restCategories = rankedCategories.slice(STACK_CATEGORIES);
  const layers: StackLayer[] = [
    ...namedCategories.map((trend) => ({
      key: trend.category as string,
      label: getCategoryLabel(trend.category),
      color: spendCategoryColorMapper[trend.category],
      amounts: trend.monthlyTotals,
    })),
    ...(restCategories.length > 0
      ? [
          {
            key: 'everything-else',
            label: getContent('everythingElseLabel'),
            color: 'var(--theme-color-neutral-300)',
            amounts: trendsData.months.map((_, index) =>
              restCategories.reduce((sum, trend) => sum + trend.monthlyTotals[index], 0),
            ),
          },
        ]
      : []),
  ];

  const maxTotal = Math.max(...monthTotals.map((entry) => entry.total), 1);
  const averageTotal = monthsWithData.reduce((sum, entry) => sum + entry.total, 0) / monthsWithData.length;
  const activeTotal = monthTotals[activeIndex].total;
  const activeDelta = activeTotal - averageTotal;
  const activeMonthLabel = format(parseDbDate(`${activeMonth}-01`), 'LLLL yyyy');

  const topTransactions = Object.values(monthDetails?.transactionDictionary ?? {})
    .filter((transaction): transaction is DiscretionarySpendTransaction => !transaction.isRecurring)
    .sort((a, b) => b.amountSpent - a.amountSpent)
    .slice(0, TOP_TRANSACTIONS);

  const comparisonRows = layers.map((layer) => {
    const selectedAmount = layer.amounts[activeIndex];
    const otherAmounts = layer.amounts.filter((_, index) => index !== activeIndex);
    const otherAverage = otherAmounts.reduce((sum, amount) => sum + amount, 0) / Math.max(otherAmounts.length, 1);
    const rowMax = Math.max(selectedAmount, otherAverage, 1);

    return {
      key: layer.key,
      label: layer.label,
      color: layer.color,
      fillPercent: (selectedAmount / rowMax) * 100,
      tickPercent: (otherAverage / rowMax) * 100,
      change: otherAverage > 0 ? (selectedAmount - otherAverage) / otherAverage : null,
    };
  });

  return (
    <ModuleContainer heading={getContent('spendingByMonthHeading')} className={styles.module} elevation="medium">
      <div className={styles.subheading}>{getContent('spendingByMonthSubheading')}</div>
      <div className={styles.contentRow}>
        <div className={styles.chartColumn}>
          <div className={styles.chartArea}>
            <div
              className={styles.averageLine}
              style={{ bottom: `${(averageTotal / maxTotal) * MAX_BAR_HEIGHT + 24}px` }}
            >
              <span className={styles.averageLabel}>
                {getContent('spendingByMonthAvgLine', [formatCurrency(averageTotal, false, true)])}
              </span>
            </div>
            <div className={styles.barRow}>
              {monthTotals.map((entry, monthIndex) => {
                const isSelected = entry.month === activeMonth;
                const monthLabel = format(parseDbDate(`${entry.month}-01`), 'LLL');
                const isCurrentCalendarMonth = isSameMonth(parseDbDate(`${entry.month}-01`), now);

                return (
                  <button
                    key={entry.month}
                    type="button"
                    data-testid="month-bar"
                    className={styles.barButton}
                    onClick={() => setSelectedMonth(entry.month)}
                  >
                    <span className={styles.barTotal}>{formatCurrency(entry.total, false, true)}</span>
                    <span
                      className={clsx(styles.barStack, { [styles.selectedStack]: isSelected })}
                      style={{ height: `${Math.max((entry.total / maxTotal) * MAX_BAR_HEIGHT, 2)}px` }}
                    >
                      {layers.map(
                        (layer) =>
                          layer.amounts[monthIndex] > 0 &&
                          entry.total > 0 && (
                            <span
                              key={layer.key}
                              style={{
                                height: `${(layer.amounts[monthIndex] / entry.total) * 100}%`,
                                background: layer.color,
                              }}
                            />
                          ),
                      )}
                    </span>
                    <span className={clsx(styles.barLabel, { [styles.selectedBarLabel]: isSelected })}>
                      {monthLabel}
                      {isCurrentCalendarMonth && getContent('spendingByMonthSoFarSuffix')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className={styles.legend}>
            {layers.map((layer) => (
              <span key={layer.key} className={styles.legendItem}>
                <span className={styles.legendSwatch} style={{ background: layer.color }} />
                {layer.label}
              </span>
            ))}
          </div>
        </div>
        <div className={styles.detailColumn}>
          <div className={styles.detailLabel}>{getContent('selectedMonthLabel')}</div>
          <div className={styles.detailHeader}>
            <span className={styles.detailMonth}>{activeMonthLabel}</span>
            <Currency className={styles.detailTotal} amount={activeTotal} />
          </div>
          <div
            className={clsx(styles.deltaBadge, activeDelta > 0 ? styles.deltaAbove : styles.deltaBelow)}
            data-testid="month-delta-badge"
          >
            {getContent(activeDelta > 0 ? 'aboveYourAverage' : 'belowYourAverage', [
              formatCurrency(Math.abs(activeDelta)),
            ])}
          </div>
          <div className={styles.sectionTitle}>{getContent('whatDroveIt')}</div>
          {topTransactions.length === 0 ? (
            <EmptyState message={getContent('noTransactionsForMonth')} />
          ) : (
            topTransactions.map((transaction) => (
              <div key={transaction.transactionId} className={styles.transactionRow}>
                <span
                  className={styles.transactionDot}
                  style={{ background: spendCategoryColorMapper[transaction.category] }}
                />
                <span className={styles.transactionLabel}>
                  {transaction.note || getCategoryLabel(transaction.category)}
                </span>
                <Currency amount={transaction.amountSpent} />
              </div>
            ))
          )}
          <div className={styles.sectionTitle}>{getContent('vsYourAverageMonth')}</div>
          <div className={styles.comparisonList}>
            {comparisonRows.map((row) => (
              <div key={row.key} className={styles.comparisonRow}>
                <span className={styles.comparisonLabel}>{row.label}</span>
                <span className={styles.comparisonTrack}>
                  <span
                    className={styles.comparisonFill}
                    style={{ width: `${row.fillPercent}%`, background: row.color }}
                  />
                  <span className={styles.comparisonTick} style={{ left: `${row.tickPercent}%` }} />
                </span>
                <span
                  className={styles.comparisonChange}
                  style={{
                    color:
                      row.change === null
                        ? 'var(--token-color-text-subdued)'
                        : row.change > 0
                          ? 'var(--token-color-semantic-loss)'
                          : 'var(--token-color-semantic-gain)',
                  }}
                >
                  {row.change === null
                    ? getContent('newCategoryBadge')
                    : row.change === 0
                      ? '0%'
                      : `${row.change > 0 ? '+' : '−'}${Math.abs(Math.round(row.change * 100))}%`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ModuleContainer>
  );
}
