import AccountsNeedUpdateBanner from 'Components/AccountsNeedUpdateBanner/AccountsNeedUpdateBanner';
import AlertMessage from 'Components/AlertMessage/AlertMessage';
import LogSpendButton from 'Components/LogSpendButton';
import ModuleContainer from 'Components/ModuleContainer/ModuleContainer';
import PageContainer from 'Components/PageContainer/PageContainer';
import RecurringSpendNeedsUpdateBanner from 'Components/RecurringSpendNeedsUpdateBanner/RecurringSpendNeedsUpdateBanner';
import TotalsTable from 'Components/TotalsTable/TotalsTable';
import TransactionsList from 'Components/TransactionsList/TransactionsList';
import useContent from 'Hooks/useContent';
import SummaryTotals from 'Pages/Dashboard/SummaryTotals/SummaryTotals';
import TopDiscretionaryCategories from 'Pages/Dashboard/TopDiscretionaryCategories';
import BarChartModule from './BarChartModule/BarChartModule';
import styles from './Trends.module.css';
import TrendsMobileNavigation from './TrendsMobileNavigation/TrendsMobileNavigation';

export default function Trends() {
  const getContent = useContent('trends');

  return (
    <PageContainer pageTitle={getContent('pageTitle')} className={styles.pageContainer}>
      <TrendsMobileNavigation />
      <AccountsNeedUpdateBanner />
      <RecurringSpendNeedsUpdateBanner />

      <div className={styles.contentContainer}>
        <SummaryTotals />
        <BarChartModule />
        <TotalsTable />
        <ModuleContainer heading={getContent('topCategories')} className={styles.module} elevation="low">
          <TopDiscretionaryCategories />
        </ModuleContainer>
        <LogSpendButton />
        <TransactionsList />
        <AlertMessage
          variant="error"
          title="Recurring transactions are not shown on this page yet."
          message="This page is a work in progress.  Recurring transactions will be represented here soon."
        />
      </div>
    </PageContainer>
  );
}
