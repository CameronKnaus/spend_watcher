import createContentGetter from 'Content/createContentGetter';
import { format } from 'date-fns';
import { SpendingPaceResponse } from '@spend-watcher/contract';
import { parseDbDate } from 'Util/Formatters/dateFormatters/dateFormatters';
import formatCurrency from 'Util/Formatters/formatCurrency/formatCurrency';
import styles from './DailySpendBars.module.css';

const CHART_WIDTH = 300;
const CHART_HEIGHT = 84;
const BASELINE_Y = 80;
const BAR_WIDTH = 14;
const MAX_BAR_HEIGHT = 60;
// Bars for zero-spend days still render a sliver so the day reads as present, not missing.
const MIN_BAR_HEIGHT = 2;

type DailySpendBarsPropTypes = {
  dailyTotals: SpendingPaceResponse['dailyTotals'];
  largestRecentExpense: SpendingPaceResponse['largestRecentExpense'];
};

export default function DailySpendBars({ dailyTotals, largestRecentExpense }: DailySpendBarsPropTypes) {
  const getContent = createContentGetter('dashboard');

  if (dailyTotals.length === 0) {
    return null;
  }

  const maxAmount = Math.max(...dailyTotals.map((day) => day.amount));
  const step = CHART_WIDTH / dailyTotals.length;

  return (
    <div className={styles.container}>
      <div className={styles.heading}>{getContent('dailySpendHeading', [dailyTotals.length])}</div>
      <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className={styles.chart} role="img">
        <line
          x1="0"
          y1={BASELINE_Y + 0.5}
          x2={CHART_WIDTH}
          y2={BASELINE_Y + 0.5}
          stroke="var(--theme-color-neutral-600)"
          strokeWidth="1"
        />
        {dailyTotals.map((day, index) => {
          const barHeight =
            maxAmount > 0 ? Math.max((day.amount / maxAmount) * MAX_BAR_HEIGHT, MIN_BAR_HEIGHT) : MIN_BAR_HEIGHT;
          const isToday = index === dailyTotals.length - 1;

          return (
            <rect
              key={day.date}
              x={index * step + (step - BAR_WIDTH) / 2}
              y={BASELINE_Y - barHeight}
              width={BAR_WIDTH}
              height={barHeight}
              rx="2"
              fill={isToday ? 'var(--theme-color-primary-500)' : 'var(--theme-color-neutral-600)'}
            />
          );
        })}
      </svg>
      <div className={styles.axisLabels}>
        <span>{format(parseDbDate(dailyTotals[0].date), 'MMM d')}</span>
        {largestRecentExpense && (
          <span className={styles.spikeLabel}>
            {getContent('bigSpikeLabel', [
              format(parseDbDate(largestRecentExpense.date), 'MMM d'),
              `${largestRecentExpense.note ? `${largestRecentExpense.note} ` : ''}${formatCurrency(largestRecentExpense.amount, false, true)}`,
            ])}
          </span>
        )}
        <span>{getContent('todayAxisLabel')}</span>
      </div>
    </div>
  );
}
