import { useQuery } from '@tanstack/react-query';
import Currency from 'Components/Currency/Currency';
import InteractiveRow from 'Components/InteractiveRow/InteractiveRow';
import LoadingInteractiveRow from 'Components/InteractiveRow/LoadingInteractiveRow';
import ManageAccountPanel from 'Components/ManageAccountPanel/ManageAccountPanel';
import ModuleContainer from 'Components/ModuleContainer/ModuleContainer';
import AccountCategoryIcon from 'Components/Shared/Icons/AccountCategoryIcon';
import SkeletonLoader from 'Components/Shared/SkeletonLoader/SkeletonLoader';
import createContentGetter from 'Content/createContentGetter';
import { accountsSummaryQueryOptions } from 'queryOptions/accountsSummaryQueryOptions';
import { useState } from 'react';
import { AccountWithStatus } from '@spend-watcher/contract';
import { formatMonthYearDBDateAsReadable, getCurrentMonthLabel } from 'Util/Formatters/dateFormatters/dateFormatters';
import styles from './AccountsList.module.css';

// Static keys for the fixed-size loading placeholder list (it never reorders).
const ACCOUNT_SKELETON_KEYS = Array.from({ length: 3 }, (_, i) => `account-loading-${i}`);

export default function AccountsList() {
  const [accountToEdit, setAccountToEdit] = useState<AccountWithStatus | null>(null);
  const { isLoading, data: accountsSummary } = useQuery(accountsSummaryQueryOptions);
  const getCategoryLabel = createContentGetter('ACCOUNT_CATEGORIES');
  const getContent = createContentGetter('accounts');

  return (
    <>
      <ModuleContainer heading={getContent('accountsList')} elevation="low">
        <div className={styles.totalAmount}>
          {isLoading ? (
            <SkeletonLoader className={styles.totalSkeleton} />
          ) : (
            <Currency amount={accountsSummary!.totalEquity} />
          )}
        </div>
        <div className={styles.accountsList}>
          {isLoading
            ? ACCOUNT_SKELETON_KEYS.map((key) => <LoadingInteractiveRow key={key} />)
            : accountsSummary?.accountsList.map((account) => (
                <InteractiveRow
                  key={`account--row-${account.id}`}
                  icon={<AccountCategoryIcon category={account.category} size={36} />}
                  primaryLabel={account.name}
                  primaryDataPoint={<Currency amount={account.currentAccountValue} />}
                  secondaryLabel={getCategoryLabel(account.category)}
                  secondaryDataPoint={getContent('asOf', [formatMonthYearDBDateAsReadable(account.lastUpdated)])}
                  onClick={() => setAccountToEdit(account)}
                  callToActionText={
                    account.requiresNewUpdate ? getContent('accountRequiresUpdateCTA', [getCurrentMonthLabel()]) : ''
                  }
                />
              ))}
        </div>
      </ModuleContainer>
      <ManageAccountPanel account={accountToEdit} onPanelClose={() => setAccountToEdit(null)} />
    </>
  );
}
