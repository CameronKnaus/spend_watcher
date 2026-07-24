import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import ModuleContainer from 'Components/ModuleContainer/ModuleContainer';
import SkeletonLoader from 'Components/Shared/SkeletonLoader/SkeletonLoader';
import createContentGetter from 'Content/createContentGetter';
import { format, getDate } from 'date-fns';
import useSelectedTimeFrame from 'Hooks/useSelectedTimeFrame/useSelectedTimeFrame';
import useSessionStatus from 'Hooks/useSessionStatus/useSessionStatus';
import { spendingRhythmQueryOptions } from 'queryOptions/spendingRhythmQueryOptions';
import { parseDbDate } from 'Util/Formatters/dateFormatters/dateFormatters';
import styles from './RhythmInsightTile.module.css';

// Below 3× the median a pricey day is just a pricey day, not a rhythm break.
const UNUSUAL_RATIO = 3;
const STRIP_DAYS = 7;

export default function RhythmInsightTile() {
  const { isAuthenticated } = useSessionStatus();
  const { endDate, currentMonthLabel, isPresentMonth } = useSelectedTimeFrame();
  const getContent = createContentGetter('trends');
  const { isLoading, data: rhythmData } = useQuery({
    ...spendingRhythmQueryOptions({ targetDate: endDate }),
    enabled: isAuthenticated,
  });

  if (isLoading || !rhythmData) {
    return (
      <ModuleContainer className={styles.tile} elevation="low">
        <div className={styles.label}>{getContent('rhythmInsightLabel')}</div>
        <SkeletonLoader style={{ height: 20, maxWidth: 200 }} />
        <SkeletonLoader style={{ height: 34, marginTop: 10 }} />
      </ModuleContainer>
    );
  }

  const median = rhythmData.dailyMedian;
  const isUnusual = (amount: number) => median !== null && median > 0 && amount / median >= UNUSUAL_RATIO;
  const biggestUnusualDay =
    median === null || median <= 0
      ? null
      : rhythmData.days.reduce<(typeof rhythmData.days)[number] | null>(
          (best, day) => (isUnusual(day.amount) && day.amount > (best?.amount ?? 0) ? day : best),
          null,
        );

  const headline =
    median === null ? (
      <div className={styles.headline}>{getContent('rhythmInsightEmpty')}</div>
    ) : biggestUnusualDay ? (
      <div className={styles.headline}>
        {getContent('rhythmInsightHeadlinePrefix', [format(parseDbDate(biggestUnusualDay.date), 'MMM d')])}
        <span className={styles.unusualHighlight}>
          {getContent('rhythmInsightHeadlineRatio', [(biggestUnusualDay.amount / median).toFixed(1)])}
        </span>
      </div>
    ) : (
      <div className={styles.headline}>{getContent('rhythmInsightCalm', [currentMonthLabel])}</div>
    );

  const stripDays = rhythmData.days.slice(-STRIP_DAYS);

  return (
    <ModuleContainer className={styles.tile} elevation="low">
      <div className={styles.label}>{getContent('rhythmInsightLabel')}</div>
      {headline}
      <div className={styles.strip}>
        {stripDays.map((day, index) => {
          const unusual = isUnusual(day.amount);
          const isToday = isPresentMonth && index === stripDays.length - 1;

          return (
            <div
              key={day.date}
              data-testid="rhythm-day"
              className={clsx(styles.dayCell, {
                [styles.unusualDay ?? '']: unusual,
                [styles.todayDay ?? '']: isToday && !unusual,
              })}
            >
              {unusual && <span className={styles.dayNumber}>{getDate(parseDbDate(day.date))}</span>}
            </div>
          );
        })}
      </div>
    </ModuleContainer>
  );
}
