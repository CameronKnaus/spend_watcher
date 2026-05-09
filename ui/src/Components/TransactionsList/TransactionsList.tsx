import Currency from 'Components/Currency/Currency';
import DiscretionarySpendPanel from 'Components/DiscretionarySpendForm/DiscretionarySpendPanel';
import LoadingInteractiveRow from 'Components/InteractiveRow/LoadingInteractiveRow';
import ModuleContainer from 'Components/ModuleContainer/ModuleContainer';
import TransactionRow from 'Components/TransactionRow';
import { format, parseISO } from 'date-fns';
import useContent from 'Hooks/useContent';
import useSpendingDetailsService from 'Hooks/useSpendingService';
import { useState } from 'react';
import { DiscretionarySpendTransaction } from 'Types/Services/spending.model';
import { isDiscretionaryTransactionId } from 'Util/SpendTransactionUtils/narrowIdType';
import styles from './TransactionsList.module.css';

export default function TransactionsList() {
  const getContent = useContent('trends');
  const { data: spendingData, isLoading } = useSpendingDetailsService();
  const [transactionToEdit, setTransactionToEdit] = useState<DiscretionarySpendTransaction | undefined>(undefined);

  return (
    <>
      <ModuleContainer heading={getContent('transactionsTitle')} className={styles.module} elevation="low">
        <>
          {isLoading || !spendingData
            ? Array.from({ length: 5 }).map((_, index) => <LoadingInteractiveRow key={index} />)
            : Object.entries(spendingData.transactionsByDate)
                // TODO: Have this list support more than just discretionary transactions (remove filter)
                .filter(([, datesTransactions]) => datesTransactions.discretionaryTotals.amount > 0)
                .map(([dbDate, datesTransactions]) => {
                  const date = parseISO(dbDate);
                  const dateLabel = format(date, 'MMM do');
                  return (
                    <>
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
                    </>
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
