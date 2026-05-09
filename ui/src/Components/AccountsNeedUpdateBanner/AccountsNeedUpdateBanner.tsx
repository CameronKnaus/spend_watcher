import AlertMessage from 'Components/AlertMessage/AlertMessage';
import useAccountSummaryService from 'Hooks/useAccountSummaryService/useAccountSummaryService';
import useContent from 'Hooks/useContent';
import styles from './AccountsNeedUpdateBanner.module.css';

export default function AccountsNeedUpdateBanner() {
  const getContent = useContent('accounts');
  const { data: accountsSummary } = useAccountSummaryService();

  if (!accountsSummary) {
    return null;
  }

  const accountsRequiringUpdates = accountsSummary.accountsList.reduce((acc, account) => {
    if (account.requiresNewUpdate) {
      return acc + 1;
    }

    return acc;
  }, 0);

  if (accountsRequiringUpdates === 0) {
    return null;
  }

  return (
    <div className={styles.bannerContainer}>
      <AlertMessage title={getContent('accountsExpectUpdates', [accountsRequiringUpdates])} variant="info" />
    </div>
  );
}
