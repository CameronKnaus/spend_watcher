import clsx from 'clsx';
import Currency from 'Components/Currency/Currency';
import SpendingCategoryIcon from 'Components/Shared/Icons/SpendingCategoryIcon';
import SkeletonLoader from 'Components/Shared/SkeletonLoader';
import useContent from 'Hooks/useContent';
import useSpendingDetailsService from 'Hooks/useSpendingService';
import CategoryTransactionListPanel from 'Pages/Trends/CategoryTransactionListPanel/CategoryTransactionListPanel';
import { useState } from 'react';
import { SpendingCategory } from 'Types/SpendingCategory';
import styles from './TotalsTable.module.css';

export default function TotalsTable() {
  const [selectedCategoryForTransactions, setSelectedCategoryForTransactions] = useState<SpendingCategory>();
  const { isLoading, data: spendingData } = useSpendingDetailsService();
  const getContent = useContent('trends');
  const getCategoryLabel = useContent('SPENDING_CATEGORIES');

  if (isLoading || !spendingData) {
    return Array.from({ length: 10 }).map((_, index) => (
      <SkeletonLoader key={index} className={styles.placeholder_skeleton} />
    ));
  }

  // Sort by total amount spent descending
  const sortedList = spendingData.spendCategoryOverview.categoryDetailsList.sort(
    (a, b) => b.combinedTotals.amount - a.combinedTotals.amount,
  );

  // TODO: Table config
  return (
    <>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.headerRow}>
              <th className={styles.categoryColumn} align="left">
                {getContent('category')}
              </th>
              <th align="right">{getContent('totalAmountSpentHeader')}</th>
              <th align="right">{getContent('totalCountHeader')}</th>
              <th align="right">{getContent('totalPercentageHeader')}</th>
              <th align="right">{getContent('totalCountPercentageHeader')}</th>
              <th align="right">{getContent('discretionaryTotalHeader')}</th>
              <th align="right">{getContent('discretionaryTotalCountHeader')}</th>
              <th align="right">{getContent('discretionaryTotalPercentageHeader')}</th>
              <th align="right">{getContent('discretionaryTotalCountPercentageHeader')}</th>
              <th align="right">{getContent('recurringTotalHeader')}</th>
              <th align="right">{getContent('recurringTotalCountHeader')}</th>
              <th align="right">{getContent('recurringTotalPercentageHeader')}</th>
              <th align="right">{getContent('recurringTotalCountPercentageHeader')}</th>
            </tr>
          </thead>

          <tbody>
            {sortedList.map((categoryDetails, index) => (
              <tr key={categoryDetails.category} className={index % 2 === 0 ? styles.dark : styles.light}>
                <td className={styles.categoryColumn} align="left">
                  <button
                    className={styles.categoryLayout}
                    onClick={() => setSelectedCategoryForTransactions(categoryDetails.category)}
                  >
                    <SpendingCategoryIcon size={24} className={styles.icon} category={categoryDetails.category} />
                    <div>{getCategoryLabel(categoryDetails.category)}</div>
                  </button>
                </td>
                <td align="right">
                  <Currency isGainLoss amount={-categoryDetails.combinedTotals.amount} />
                </td>
                <td align="right">{categoryDetails.combinedTotals.count}</td>
                <td align="right">{categoryDetails.combinedTotals.percentageOfTotalAmount + '%'}</td>
                <td align="right">{categoryDetails.combinedTotals.percentageOfTotalCount + '%'}</td>
                <td align="right">
                  <Currency isGainLoss amount={-categoryDetails.discretionaryTotals.amount} />
                </td>
                <td align="right">{categoryDetails.discretionaryTotals.count}</td>
                <td align="right">{categoryDetails.discretionaryTotals.percentageOfTotalAmount + '%'}</td>
                <td align="right">{categoryDetails.discretionaryTotals.percentageOfTotalCount + '%'}</td>
                <td align="right">
                  <Currency isGainLoss amount={-categoryDetails.recurringTotals.amount} />
                </td>
                <td align="right">{categoryDetails.recurringTotals.count}</td>
                <td align="right">{categoryDetails.recurringTotals.percentageOfTotalAmount + '%'}</td>
                <td align="right">{categoryDetails.recurringTotals.percentageOfTotalCount + '%'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className={clsx(sortedList.length % 2 === 0 ? styles.dark : styles.light, styles.footerRow)}>
              <td className={styles.categoryColumn}>{getContent('total')}</td>
              <td align="right">
                <Currency isGainLoss amount={-spendingData.summary.total.amount} />
              </td>
              <td align="right">{spendingData.summary.total.count}</td>
              <td></td>
              <td></td>
              <td align="right">
                <Currency isGainLoss amount={-spendingData.summary.discretionaryTotals.amount} />
              </td>
              <td align="right">{spendingData.summary.discretionaryTotals.count}</td>
              <td></td>
              <td></td>
              <td align="right">
                <Currency isGainLoss amount={-spendingData.summary.recurringTotals.amount} />
              </td>
              <td align="right">{spendingData.summary.recurringTotals.count}</td>
              <td></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <CategoryTransactionListPanel
        category={selectedCategoryForTransactions}
        transactionDictionary={spendingData.transactionDictionary}
        onPanelClose={() => setSelectedCategoryForTransactions(undefined)}
      />
    </>
  );
}
