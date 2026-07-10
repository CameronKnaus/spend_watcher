import Currency from 'Components/Currency/Currency';
import DiscretionarySpendPanel from 'Components/DiscretionarySpendForm/DiscretionarySpendPanel';
import LoadingInteractiveRow from 'Components/InteractiveRow/LoadingInteractiveRow';
import ModuleContainer from 'Components/ModuleContainer/ModuleContainer';
import EmptyState from 'Components/Shared/EmptyState/EmptyState';
import TransactionRow from 'Components/TransactionRow/TransactionRow';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import createContentGetter from 'Content/createContentGetter';
import useSpendingDetailsService from 'Hooks/useSpendingService/useSpendingDetailsService';
import { useMemo, useState } from 'react';
import { DbDate } from 'Types/dateTypes';
import { DiscretionarySpendTransaction, TransactionsByDate } from '@spend-watcher/contract';
import { isDiscretionaryTransactionId } from 'Util/SpendTransactionUtils/narrowIdType';
import styles from './RecentTransactions.module.css';

// Static keys for the fixed-size loading placeholder list (it never reorders).
const SKELETON_KEYS = Array.from({ length: 5 }, (_, i) => `recent-transactions-skeleton-${i}`);

export default function RecentTransactions() {
  const getContent = createContentGetter('transactions');
  const { data: spendingData } = useSpendingDetailsService();
  const [transactionToEdit, setTransactionToEdit] = useState<DiscretionarySpendTransaction>();

  // Aim to show 5 recent transactions. However, ensures that all transactions for a given day are shown.
  const applicableTransactionsByDate = useMemo(() => {
    if (!spendingData) {
      return {};
    }

    // Payload to return
    const applicableTransactions: TransactionsByDate = {};

    // The ideal number of transactions to show
    const targetTransactionCount = 5;

    // The absolute maximum number of transactions to show
    const absoluteMaxTransactionCount = 10;

    let index = 0;
    let transactionCount = 0;
    const allDateEntries = Object.entries(spendingData.transactionsByDate);
    while (index < allDateEntries.length && transactionCount <= targetTransactionCount) {
      const [date, dateSpendSummary] = allDateEntries[index];
      const transactionsCountForDate = dateSpendSummary.discretionaryTotals.count;

      // Add date's transactions to transaction count
      const newCount = transactionCount + transactionsCountForDate;

      // If adding the date's transactions would exceed the absolute maximum
      if (!transactionsCountForDate || newCount > absoluteMaxTransactionCount) {
        // Don't add anymore transactions
        break;
      }

      transactionCount = newCount;
      applicableTransactions[date as DbDate] = dateSpendSummary;

      index++;
    }

    return applicableTransactions;
  }, [spendingData]);

  if (!spendingData) {
    return (
      <ModuleContainer heading={getContent('recent')} elevation="low">
        {SKELETON_KEYS.map((key) => (
          <LoadingInteractiveRow key={key} />
        ))}
      </ModuleContainer>
    );
  }

  const noTransactions = Object.keys(applicableTransactionsByDate).length === 0;

  return (
    <>
      <ModuleContainer heading={getContent('recent')} elevation="low">
        {/* Loop through each date group */}
        {noTransactions ? (
          <EmptyState message={getContent('noRecentTransactions')} />
        ) : (
          Object.entries(applicableTransactionsByDate).map(([dateString, dateSpendSummary]) => {
            const date = parseISO(dateString);
            let dateLabel = format(date, 'MMM do');
            if (isToday(date)) {
              dateLabel = getContent('todayLabel', [dateLabel]);
            } else if (isYesterday(date)) {
              dateLabel = getContent('yesterdayLabel', [dateLabel]);
            }

            return (
              <div key={dateLabel}>
                <h3 className={styles.dateHeader}>
                  {dateLabel}
                  <div className={styles.daysTotalAmount}>
                    (<Currency amount={-dateSpendSummary.discretionaryTotals.amount} isGainLoss />)
                  </div>
                </h3>
                <div className={styles.transactionGroup}>
                  {/* Loop through each transaction associated with the given date */}
                  {dateSpendSummary.includedTransactions.filter(isDiscretionaryTransactionId).map((transactionId) => {
                    const transaction = spendingData.transactionDictionary[transactionId];
                    // Ids were filtered to discretionary, so narrow the union value to match.
                    if (transaction.isRecurring) {
                      return null;
                    }

                    return (
                      <TransactionRow
                        key={transactionId}
                        transactionId={transaction.transactionId}
                        category={transaction.category}
                        onClick={() => setTransactionToEdit(transaction)}
                        amountSpent={transaction.amountSpent}
                        note={transaction.note}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </ModuleContainer>
      <DiscretionarySpendPanel
        isOpen={Boolean(transactionToEdit)}
        transactionToEdit={transactionToEdit}
        onPanelClose={() => setTransactionToEdit(undefined)}
      />
    </>
  );
}
