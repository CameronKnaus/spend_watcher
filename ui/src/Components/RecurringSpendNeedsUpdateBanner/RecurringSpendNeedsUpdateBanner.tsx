import { useQuery } from '@tanstack/react-query';
import AlertMessage from 'Components/AlertMessage/AlertMessage';
import createContentGetter from 'Content/createContentGetter';
import { recurringSummaryQueryOptions } from 'queryOptions/recurringSummaryQueryOptions';
import styles from './RecurringSpendNeedsUpdateBanner.module.css';

export default function RecurringSpendNeedsUpdateBanner() {
  const getContent = createContentGetter('recurringSpending');
  const { data: spendData } = useQuery(recurringSummaryQueryOptions);

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
