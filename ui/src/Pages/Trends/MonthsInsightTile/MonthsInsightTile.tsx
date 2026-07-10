import { useQuery } from '@tanstack/react-query';
import ModuleContainer from 'Components/ModuleContainer/ModuleContainer';
import SkeletonLoader from 'Components/Shared/SkeletonLoader/SkeletonLoader';
import createContentGetter from 'Content/createContentGetter';
import { format } from 'date-fns';
import useSelectedTimeFrame from 'Hooks/useSelectedTimeFrame/useSelectedTimeFrame';
import useSessionStatus from 'Hooks/useSessionStatus/useSessionStatus';
import { categoryTrendsQueryOptions } from 'queryOptions/categoryTrendsQueryOptions';
import { parseDbDate } from 'Util/Formatters/dateFormatters/dateFormatters';
import formatCurrency from 'Util/Formatters/formatCurrency/formatCurrency';
import styles from './MonthsInsightTile.module.css';

const MAX_BAR_HEIGHT = 46;

export default function MonthsInsightTile() {
  const { isAuthenticated } = useSessionStatus();
  const { startDate } = useSelectedTimeFrame();
  const getContent = createContentGetter('trends');
  const { isLoading, data: trendsData } = useQuery({
    ...categoryTrendsQueryOptions({ targetMonth: startDate.slice(0, 7) }),
    enabled: isAuthenticated,
  });

  if (isLoading || !trendsData) {
    return (
      <ModuleContainer className={styles.tile} elevation="low">
        <div className={styles.label}>{getContent('monthsInsightLabel')}</div>
        <SkeletonLoader style={{ height: 20, maxWidth: 200 }} />
        <SkeletonLoader style={{ height: 46, marginTop: 10 }} />
      </ModuleContainer>
    );
  }

  const monthTotals = trendsData.months.map((month, index) => ({
    month,
    total: trendsData.categories.reduce((sum, category) => sum + (category.monthlyTotals[index] ?? 0), 0),
  }));
  const monthsWithData = monthTotals.filter((entry) => entry.total > 0);

  if (monthsWithData.length < 2) {
    return (
      <ModuleContainer className={styles.tile} elevation="low">
        <div className={styles.label}>{getContent('monthsInsightLabel')}</div>
        <div className={styles.emptyMessage}>{getContent('monthsInsightEmpty')}</div>
      </ModuleContainer>
    );
  }

  const priciest = monthTotals.reduce((best, entry) => (entry.total >= best.total ? entry : best));
  const average = monthsWithData.reduce((sum, entry) => sum + entry.total, 0) / monthsWithData.length;
  const priciestName = format(parseDbDate(`${priciest.month}-01`), 'LLLL');
  const maxTotal = priciest.total;
  const selectedMonth = trendsData.months[trendsData.months.length - 1];

  return (
    <ModuleContainer className={styles.tile} elevation="low">
      <div className={styles.label}>{getContent('monthsInsightLabel')}</div>
      <div className={styles.headline}>
        {getContent('monthsInsightHeadlinePrefix', [priciestName])}
        <span className={styles.deltaHighlight}>
          {getContent('monthsInsightHeadlineDelta', [formatCurrency(priciest.total - average)])}
        </span>
        {getContent('monthsInsightHeadlineSuffix')}
      </div>
      <div className={styles.barRow}>
        {monthTotals.map((entry) => {
          const isPriciest = entry.month === priciest.month;
          const isSelected = entry.month === selectedMonth;

          return (
            <div
              key={entry.month}
              data-testid="months-insight-bar"
              className={styles.bar}
              style={{
                height: `${maxTotal > 0 ? Math.max((entry.total / maxTotal) * MAX_BAR_HEIGHT, 2) : 2}px`,
                background: isPriciest
                  ? 'var(--token-color-semantic-loss)'
                  : isSelected
                    ? 'var(--theme-color-primary-500)'
                    : 'var(--theme-color-neutral-600)',
              }}
            />
          );
        })}
      </div>
    </ModuleContainer>
  );
}
