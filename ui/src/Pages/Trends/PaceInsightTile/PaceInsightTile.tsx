import { useQuery } from '@tanstack/react-query';
import ModuleContainer from 'Components/ModuleContainer/ModuleContainer';
import SkeletonLoader from 'Components/Shared/SkeletonLoader/SkeletonLoader';
import createContentGetter from 'Content/createContentGetter';
import { getDaysInMonth } from 'date-fns';
import useSelectedTimeFrame from 'Hooks/useSelectedTimeFrame/useSelectedTimeFrame';
import useSessionStatus from 'Hooks/useSessionStatus/useSessionStatus';
import { typicalPaceQueryOptions } from 'queryOptions/typicalPaceQueryOptions';
import { parseDbDate } from 'Util/Formatters/dateFormatters/dateFormatters';
import formatCurrency from 'Util/Formatters/formatCurrency/formatCurrency';
import styles from './PaceInsightTile.module.css';

const CHART_WIDTH = 240;
const CHART_HEIGHT = 100;
const PADDING_X = 8;
const BASELINE_Y = 90;
const TOP_Y = 10;

export default function PaceInsightTile() {
  const { isAuthenticated } = useSessionStatus();
  const { endDate } = useSelectedTimeFrame();
  const getContent = createContentGetter('trends');
  const { isLoading, data: paceData } = useQuery({
    ...typicalPaceQueryOptions({ targetDate: endDate }),
    enabled: isAuthenticated,
  });

  if (isLoading || !paceData) {
    return (
      <ModuleContainer className={styles.tile} elevation="medium">
        <div className={styles.label}>{getContent('paceInsightLabel')}</div>
        <SkeletonLoader style={{ height: 20, maxWidth: 280 }} />
        <SkeletonLoader style={{ height: 14, maxWidth: 200, marginTop: 8 }} />
      </ModuleContainer>
    );
  }

  const daysInMonth = getDaysInMonth(parseDbDate(endDate));
  const dayOfMonth = paceData.cumulativeByDay.length;
  const monthToDate = paceData.cumulativeByDay[dayOfMonth - 1]?.amount ?? 0;
  const projected = dayOfMonth > 0 ? (monthToDate / dayOfMonth) * daysInMonth : 0;
  const hasBaseline = paceData.typicalThroughSameDay !== null && paceData.typicalMonthTotal !== null;
  const paceDelta = hasBaseline ? (paceData.typicalThroughSameDay ?? 0) - monthToDate : null;
  const isUnder = paceDelta !== null && paceDelta >= 0;

  const yMax = Math.max(projected, paceData.typicalMonthTotal ?? 0, monthToDate, 1);
  const xForDay = (day: number) =>
    PADDING_X + ((day - 1) / Math.max(daysInMonth - 1, 1)) * (CHART_WIDTH - PADDING_X * 2);
  const yForAmount = (amount: number) => BASELINE_Y - (amount / yMax) * (BASELINE_Y - TOP_Y);
  const actualPoints = paceData.cumulativeByDay
    .map((entry, index) => `${xForDay(index + 1)},${yForAmount(entry.amount)}`)
    .join(' ');

  return (
    <ModuleContainer className={styles.tile} elevation="medium">
      <div className={styles.contentRow}>
        <div className={styles.textColumn}>
          <div className={styles.label}>{getContent('paceInsightLabel')}</div>
          {paceDelta !== null ? (
            <>
              <div className={styles.headline}>
                {getContent('paceInsightPrefix')}
                <span
                  style={{
                    color: isUnder ? 'var(--token-color-semantic-gain)' : 'var(--token-color-semantic-loss)',
                  }}
                >
                  {getContent(isUnder ? 'paceInsightUnder' : 'paceInsightOver', [formatCurrency(Math.abs(paceDelta))])}
                </span>
                {getContent('paceInsightSuffix')}
              </div>
              <div className={styles.projection}>
                {getContent('paceInsightProjection', [
                  formatCurrency(projected),
                  formatCurrency(paceData.typicalMonthTotal ?? 0),
                ])}
              </div>
            </>
          ) : (
            <div className={styles.headline}>{getContent('paceInsightEmpty')}</div>
          )}
        </div>
        <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className={styles.chart} role="img">
          {hasBaseline && (
            <line
              data-testid="pace-typical-line"
              x1={xForDay(1)}
              y1={BASELINE_Y}
              x2={xForDay(daysInMonth)}
              y2={yForAmount(paceData.typicalMonthTotal ?? 0)}
              stroke="var(--theme-color-neutral-400)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
          )}
          {dayOfMonth > 1 && (
            <polyline
              points={actualPoints}
              fill="none"
              stroke="var(--theme-color-primary-500)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          <circle
            cx={xForDay(dayOfMonth)}
            cy={yForAmount(monthToDate)}
            r="4"
            fill="var(--theme-color-primary-500)"
            stroke="var(--token-color-background-primary)"
            strokeWidth="2"
          />
        </svg>
      </div>
    </ModuleContainer>
  );
}
