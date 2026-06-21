import { useQuery } from '@tanstack/react-query';
import Currency from 'Components/Currency/Currency';
import ModuleContainer from 'Components/ModuleContainer/ModuleContainer';
import AccountCategoryIcon from 'Components/Shared/Icons/AccountCategoryIcon';
import SkeletonLoader from 'Components/Shared/SkeletonLoader/SkeletonLoader';
import useContent from 'Hooks/useContent/useContent';
import { accountsSummaryQueryOptions } from 'queryOptions/accountsSummaryQueryOptions';
import { AccountCategory } from '@spend-watcher/contract';
import styles from './TotalsByAccountType.module.css';

export default function TotalsByAccountType() {
  const getContent = useContent('savings');
  const getCategoryLabel = useContent('ACCOUNT_CATEGORIES');
  const { isLoading, data: accountsSummary } = useQuery(accountsSummaryQueryOptions);

  const headerLabel = getContent('accountTotalByType');
  if (isLoading || !accountsSummary) {
    <ModuleContainer heading={headerLabel} elevation="low">
      <SkeletonLoader />
    </ModuleContainer>;
  }

  return (
    <ModuleContainer heading={headerLabel} elevation="low">
      {accountsSummary?.accountTotalsByType &&
        Object.entries(accountsSummary.accountTotalsByType)
          .sort(([, a], [, b]) => b - a)
          .map(([accountCategory, total]) => (
            <div key={accountCategory} className={styles.accountRow}>
              <AccountCategoryIcon category={accountCategory as AccountCategory} size={36} />
              <div>{getCategoryLabel(accountCategory as AccountCategory)}</div>
              <div className={styles.totalAmount}>
                <Currency amount={total} isGainLoss />
              </div>
            </div>
          ))}
    </ModuleContainer>
  );
}
