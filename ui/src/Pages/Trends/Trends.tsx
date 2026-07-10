import AccountsNeedUpdateBanner from 'Components/AccountsNeedUpdateBanner/AccountsNeedUpdateBanner';
import AlertMessage from 'Components/AlertMessage/AlertMessage';
import LogSpendButton from 'Components/LogSpendButton/LogSpendButton';
import ModuleContainer from 'Components/ModuleContainer/ModuleContainer';
import PageContainer from 'Components/PageContainer/PageContainer';
import RecurringSpendNeedsUpdateBanner from 'Components/RecurringSpendNeedsUpdateBanner/RecurringSpendNeedsUpdateBanner';
import TotalsTable from 'Components/TotalsTable/TotalsTable';
import TransactionsList from 'Components/TransactionsList/TransactionsList';
import createContentGetter from 'Content/createContentGetter';
import SummaryTotals from 'Pages/Dashboard/SummaryTotals/SummaryTotals';
import TopDiscretionaryCategories from 'Pages/Dashboard/TopDiscretionaryCategories/TopDiscretionaryCategories';
import BarChartModule from './BarChartModule/BarChartModule';
import SpendingByCategoryModule from './SpendingByCategoryModule/SpendingByCategoryModule';
import SpendingByMonthTile from './SpendingByMonthTile/SpendingByMonthTile';
import styles from './Trends.module.css';
import TrendsInsightsGrid from './TrendsInsightsGrid/TrendsInsightsGrid';
import TrendsMobileNavigation from './TrendsMobileNavigation/TrendsMobileNavigation';

export default function Trends() {
  const getContent = createContentGetter('trends');

  return (
    <PageContainer pageTitle={getContent('pageTitle')} className={styles.pageContainer}>
      <TrendsMobileNavigation />
      <AccountsNeedUpdateBanner />
      <RecurringSpendNeedsUpdateBanner />

      <div className={styles.contentContainer}>
        <TrendsInsightsGrid />
        <SummaryTotals />
        <BarChartModule />
        <SpendingByCategoryModule />
        <TotalsTable />
        <ModuleContainer heading={getContent('topCategories')} className={styles.module} elevation="low">
          <TopDiscretionaryCategories />
        </ModuleContainer>
        <LogSpendButton />
        <TransactionsList />
        <SpendingByMonthTile />
        <AlertMessage
          variant="error"
          title="Recurring transactions are not shown on this page yet."
          message="This page is a work in progress.  Recurring transactions will be represented here soon."
        />
      </div>
    </PageContainer>
  );
}
