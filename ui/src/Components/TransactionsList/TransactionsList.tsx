import Currency from 'Components/Currency/Currency';
import DiscretionarySpendPanel from 'Components/DiscretionarySpendForm/DiscretionarySpendPanel';
import LoadingInteractiveRow from 'Components/InteractiveRow/LoadingInteractiveRow';
import ModuleContainer from 'Components/ModuleContainer/ModuleContainer';
import TransactionRow from 'Components/TransactionRow/TransactionRow';
import { format, parseISO } from 'date-fns';
import createContentGetter from 'Content/createContentGetter';
import useSpendingDetailsService from 'Hooks/useSpendingService/useSpendingDetailsService';
import { Fragment, useState } from 'react';
import { DiscretionarySpendTransaction } from '@spend-watcher/contract';
import { isDiscretionaryTransactionId } from 'Util/SpendTransactionUtils/narrowIdType';
import styles from './TransactionsList.module.css';

// Static keys for the fixed-size loading placeholder list (it never reorders).
const SKELETON_KEYS = Array.from({ length: 5 }, (_, i) => `transactions-skeleton-${i}`);

export default function TransactionsList() {
  const getContent = createContentGetter('trends');
  const { data: spendingData, isLoading } = useSpendingDetailsService();
  const [transactionToEdit, setTransactionToEdit] = useState<DiscretionarySpendTransaction | undefined>(undefined);

  return (
    <>
      <ModuleContainer heading={getContent('transactionsTitle')} className={styles.module} elevation="low">
        <>
          {isLoading || !spendingData
            ? SKELETON_KEYS.map((key) => <LoadingInteractiveRow key={key} />)
            : Object.entries(spendingData.transactionsByDate)
                // TODO: Have this list support more than just discretionary transactions (remove filter)
                .filter(([, datesTransactions]) => datesTransactions.discretionaryTotals.amount > 0)
                .map(([dbDate, datesTransactions]) => {
                  const date = parseISO(dbDate);
                  const dateLabel = format(date, 'MMM do');
                  return (
                    <Fragment key={dbDate}>
                      <h3 className={styles.dateHeader}>
                        {dateLabel}
                        <div className={styles.daysTotalAmount}>
                          <Currency amount={-datesTransactions.discretionaryTotals.amount} isGainLoss />
                        </div>
                      </h3>
                      <div className={styles.transactionGroup}>
                        {datesTransactions.includedTransactions
                          .filter(isDiscretionaryTransactionId)
                          .map((transactionId) => {
                            const transaction = spendingData.transactionDictionary[transactionId];
                            // Ids were filtered to discretionary, so narrow the union value to match.
                            if (!transaction || transaction.isRecurring) {
                              return null;
                            }
                            return (
                              <TransactionRow
                                key={transactionId}
                                transactionId={transactionId}
                                category={transaction.category}
                                amountSpent={transaction.amountSpent}
                                note={transaction.note}
                                onClick={() => {
                                  setTransactionToEdit(transaction);
                                }}
                              />
                            );
                          })}
                      </div>
                    </Fragment>
                  );
                })}
        </>
      </ModuleContainer>
      <DiscretionarySpendPanel
        isOpen={Boolean(transactionToEdit)}
        transactionToEdit={transactionToEdit}
        onPanelClose={() => setTransactionToEdit(undefined)}
      />
    </>
  );
}
