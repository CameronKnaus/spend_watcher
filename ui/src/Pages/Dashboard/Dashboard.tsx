import AccountsList from 'Components/AccountsList/AccountsList';
import AccountsNeedUpdateBanner from 'Components/AccountsNeedUpdateBanner/AccountsNeedUpdateBanner';
import AddAccountButton from 'Components/AddAccountButton/AddAccountButton';
import LogSpendButton from 'Components/LogSpendButton/LogSpendButton';
import ModuleContainer from 'Components/ModuleContainer/ModuleContainer';
import PageContainer from 'Components/PageContainer/PageContainer';
import RecurringSpendNeedsUpdateBanner from 'Components/RecurringSpendNeedsUpdateBanner/RecurringSpendNeedsUpdateBanner';
import { format } from 'date-fns';
import createContentGetter from 'Content/createContentGetter';
import useSelectedTimeFrame from 'Hooks/useSelectedTimeFrame/useSelectedTimeFrame';
import { useEffect, useState } from 'react';
import AvgSpentPerMonth from './AvgSpentPerMonth/AvgSpentPerMonth';
import styles from './Dashboard.module.css';
import RecentTransactions from './RecentTransactions/RecentTransactions';
import SummaryTotals from './SummaryTotals/SummaryTotals';
import TopDiscretionaryCategories from './TopDiscretionaryCategories/TopDiscretionaryCategories';

export default function Dashboard() {
  const { setToCurrentMonth } = useSelectedTimeFrame();
  const getContent = createContentGetter('dashboard');
  const [currentMonth] = useState(() => format(new Date(), 'LLLL'));
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
            <AvgSpentPerMonth />
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
