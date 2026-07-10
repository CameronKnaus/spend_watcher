import { DateRangeType } from 'Contexts/SelectedTimeFrame.context';
import useSelectedTimeFrame from 'Hooks/useSelectedTimeFrame/useSelectedTimeFrame';
import BreakdownInsightTile from '../BreakdownInsightTile/BreakdownInsightTile';
import CategoriesInsightTile from '../CategoriesInsightTile/CategoriesInsightTile';
import MonthsInsightTile from '../MonthsInsightTile/MonthsInsightTile';
import styles from './TrendsInsightsGrid.module.css';

// Layout-only wrapper for the insight tiles so each tile stays an independently removable unit.
// The month-anchored insights have no yearly equivalent, so the whole grid sits out yearly mode.
export default function TrendsInsightsGrid() {
  const { dateRangeType } = useSelectedTimeFrame();

  if (dateRangeType !== DateRangeType.MONTH) {
    return null;
  }

  return (
    <div className={styles.grid}>
      <CategoriesInsightTile />
      <MonthsInsightTile />
      <BreakdownInsightTile />
    </div>
  );
}
