import Currency from 'Components/Currency/Currency';
import ModuleContainer from 'Components/ModuleContainer/ModuleContainer';
import SkeletonLoader from 'Components/Shared/SkeletonLoader';
import useContent from 'Hooks/useContent';
import useYearlyAverageService from 'Hooks/useYearlyAverageService';
import { FaCaretDown, FaCaretUp } from 'react-icons/fa';
import styles from './AvgSpentPerMonth.module.css';

export default function AvgSpentPerMonth() {
  const { isLoading, isFetching, data } = useYearlyAverageService();
  const getContent = useContent('dashboard');
  const pageLoading = isLoading || isFetching || !data;

  if (pageLoading) {
    return (
      <ModuleContainer heading={getContent('avgSpentPerMonth')} className={styles.tile} elevation="low">
        <SkeletonLoader style={{ height: 30, maxWidth: 130 }} />
        <SkeletonLoader style={{ height: 14, maxWidth: 110, marginTop: 8 }} />
      </ModuleContainer>
    );
  }

  const hasNoData = data.monthlyAverage === 0 && data.comparison === null;
  const isIncrease = data.comparison ? data.comparison.percentChange >= 0 : false;
  const chipColor = isIncrease ? 'var(--token-color-semantic-loss)' : 'var(--token-color-semantic-gain)';

  return (
    <ModuleContainer heading={getContent('avgSpentPerMonth')} className={styles.tile} elevation="low">
      <Currency
        className="font-heading-medium font-thin"
        amount={hasNoData ? undefined : data.monthlyAverage}
        defaultValue="--"
        compact
      />
      {data.comparison && (
        <div className={styles.comparisonRow}>
          {isIncrease ? <FaCaretUp color={chipColor} /> : <FaCaretDown color={chipColor} />}
          <span style={{ color: chipColor }}>
            {isIncrease ? '+' : ''}
            {(data.comparison.percentChange * 100).toFixed(1)}%
          </span>
          <span className={styles.comparisonSuffix}>
            {getContent('vsYearAvg', [String(data.comparison.year)])}
          </span>
        </div>
      )}
    </ModuleContainer>
  );
}
