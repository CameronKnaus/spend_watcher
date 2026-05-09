import Currency from 'Components/Currency/Currency';
import ModuleContainer from 'Components/ModuleContainer/ModuleContainer';
import SkeletonLoader from 'Components/Shared/SkeletonLoader';
import useContent from 'Hooks/useContent';
import useSpendingDetailsService from 'Hooks/useSpendingService';
import { useIsMobile } from 'Util/IsMobileContext';
import styles from './SummaryTotals.module.css';

export default function SummaryTotals() {
  const { isLoading, isFetching, data: spendingData } = useSpendingDetailsService();
  const pageLoading = isLoading || isFetching || !spendingData;
  const getContent = useContent('dashboard');
  const isMobile = useIsMobile();

  if (isMobile) {
    const totalsSkeletonLoaderStyle = { height: 30, maxWidth: 130 };
    return (
      <ModuleContainer style={{ width: '100%' }} elevation="low">
        <div className={styles.summaryDataMobileContainer}>
          <div className={styles.mobileSummaryItem}>
            <div className={styles.totalLabel}>{getContent('totalSpent')}</div>
            {pageLoading ? (
              <SkeletonLoader style={totalsSkeletonLoaderStyle} />
            ) : (
              <Currency
                className="font-heading-medium font-thin"
                amount={-spendingData.summary.total.amount}
                isGainLoss
              />
            )}
          </div>
          <div className={styles.distinctTotals}>
            <div className={styles.mobileSummaryItem}>
              <div className={styles.mobileSummaryLabel}>{getContent('discretionaryTotal')}</div>
              {pageLoading ? (
                <SkeletonLoader style={totalsSkeletonLoaderStyle} />
              ) : (
                <Currency
                  className="font-heading-small font-thin"
                  amount={-spendingData.summary.discretionaryTotals.amount}
                  isGainLoss
                />
              )}
            </div>
            <div className={styles.mobileSummaryItem}>
              <div className={styles.mobileSummaryLabel}>{getContent('recurringTotal')}</div>
              {pageLoading ? (
                <SkeletonLoader style={totalsSkeletonLoaderStyle} />
              ) : (
                <Currency
                  className="font-heading-small font-thin"
                  amount={-spendingData.summary.recurringTotals.amount}
                  isGainLoss
                />
              )}
            </div>
          </div>
        </div>
      </ModuleContainer>
    );
  }

  const totalsSkeletonLoaderStyle = { height: 30, maxWidth: 130 };

  return (
    <>
      {/* Total spent */}
      <ModuleContainer heading={getContent('totalSpent')} className={styles.summaryTile} elevation="medium">
        {pageLoading ? (
          <SkeletonLoader style={totalsSkeletonLoaderStyle} />
        ) : (
          <Currency className="font-heading-medium font-thin" amount={-spendingData.summary.total.amount} isGainLoss />
        )}
      </ModuleContainer>

      {/* Discretionary total */}
      <ModuleContainer heading={getContent('discretionaryTotal')} className={styles.summaryTile} elevation="low">
        {pageLoading ? (
          <SkeletonLoader style={totalsSkeletonLoaderStyle} />
        ) : (
          <Currency
            className="font-heading-medium font-thin"
            amount={-spendingData.summary.discretionaryTotals.amount}
            isGainLoss
          />
        )}
      </ModuleContainer>

      {/* Recurring total */}
      <ModuleContainer heading={getContent('recurringTotal')} className={styles.summaryTile} elevation="low">
        {pageLoading ? (
          <SkeletonLoader style={totalsSkeletonLoaderStyle} />
        ) : (
          <Currency
            className="font-heading-medium font-thin"
            amount={-spendingData.summary.recurringTotals.amount}
            isGainLoss
          />
        )}
      </ModuleContainer>
    </>
  );
}
