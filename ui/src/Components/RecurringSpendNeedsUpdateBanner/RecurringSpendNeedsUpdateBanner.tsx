import AlertMessage from 'Components/AlertMessage/AlertMessage';
import useContent from 'Hooks/useContent';
import useRecurringSummaryService from 'Hooks/useRecurringSummaryService';
import styles from './RecurringSpendNeedsUpdateBanner.module.css';

export default function RecurringSpendNeedsUpdateBanner() {
  const getContent = useContent('recurringSpending');
  const { data: spendData } = useRecurringSummaryService();

  const requiresUpdate = spendData?.recurringSpendsRequireUpdates;

  if (!requiresUpdate) {
    return null;
  }

  return (
    <div className={styles.bannerContainer}>
      <AlertMessage
        title={getContent('spendsRequiringUpdates', [spendData.spendsRequiringUpdatesCount])}
        variant="info"
      />
    </div>
  );
}
