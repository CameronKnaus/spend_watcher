import Currency from 'Components/Currency/Currency';
import ModuleContainer from 'Components/ModuleContainer/ModuleContainer';
import SkeletonLoader from 'Components/Shared/SkeletonLoader/SkeletonLoader';
import createContentGetter from 'Content/createContentGetter';
import useSpendingDetailsService from 'Hooks/useSpendingService/useSpendingDetailsService';
import styles from './RecurringTotalTile.module.css';

export default function RecurringTotalTile() {
  const { isLoading, isFetching, data: spendingData } = useSpendingDetailsService();
  const pageLoading = isLoading || isFetching || !spendingData;
  const getContent = createContentGetter('dashboard');

  return (
    <ModuleContainer heading={getContent('recurringTotal')} className={styles.tile} elevation="low">
      {pageLoading ? (
        <SkeletonLoader style={{ height: 30, maxWidth: 130 }} />
      ) : (
        <Currency
          className="font-heading-medium font-thin"
          amount={-spendingData.summary.recurringTotals.amount}
          isGainLoss
        />
      )}
    </ModuleContainer>
  );
}
