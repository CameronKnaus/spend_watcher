import AccountsList from 'Components/AccountsList/AccountsList';
import AccountsNeedUpdateBanner from 'Components/AccountsNeedUpdateBanner/AccountsNeedUpdateBanner';
import AddAccountButton from 'Components/AddAccountButton/AddAccountButton';
import LogSpendButton from 'Components/LogSpendButton';
import ModuleContainer from 'Components/ModuleContainer/ModuleContainer';
import PageContainer from 'Components/PageContainer/PageContainer';
import RecurringSpendNeedsUpdateBanner from 'Components/RecurringSpendNeedsUpdateBanner/RecurringSpendNeedsUpdateBanner';
import { format } from 'date-fns';
import useContent from 'Hooks/useContent';
import useSelectedTimeFrame from 'Hooks/useSelectedTimeFrame/useSelectedTimeFrame';
import { useEffect } from 'react';
import styles from './Dashboard.module.css';
import RecentTransactions from './RecentTransactions';
import SummaryTotals from './SummaryTotals/SummaryTotals';
import TopDiscretionaryCategories from './TopDiscretionaryCategories';

export default function Dashboard() {
  const { setToCurrentMonth } = useSelectedTimeFrame();
  const getContent = useContent('dashboard');
  const currentMonth = format(new Date(), 'LLLL');
  const pageTitle = getContent('monthOverview', [currentMonth]);

  useEffect(() => {
    setToCurrentMonth();
  }, [setToCurrentMonth]);

  // TODO: This layout is currently beyond cursed
  return (
    <PageContainer pageTitle={pageTitle} className={styles.dashboard}>
      <AccountsNeedUpdateBanner />
      <RecurringSpendNeedsUpdateBanner />
      <div className={styles.contentContainer}>
        <div className={styles.leftSection}>
          <div className={styles.spendingGrid}>
            <SummaryTotals />
            {/* Top categories */}
            <ModuleContainer
              heading={getContent('topCategories')}
              className={styles.topDiscretionaryCategories}
              elevation="low"
            >
              <TopDiscretionaryCategories />
            </ModuleContainer>
          </div>
        </div>
        <div className={styles.rightSection}>
          <LogSpendButton />
          <RecentTransactions />
          <AccountsList />
          <AddAccountButton />
        </div>
      </div>
    </PageContainer>
  );
}
