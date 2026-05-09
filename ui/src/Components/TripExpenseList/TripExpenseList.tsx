import AlertMessage from 'Components/AlertMessage/AlertMessage';
import LoadingInteractiveRow from 'Components/InteractiveRow/LoadingInteractiveRow';
import TransactionRow from 'Components/TransactionRow';
import useContent from 'Hooks/useContent';
import useTripLinkedExpenses from 'Hooks/useTripLinkedExpenses/useTripLinkedExpenses';
import { DiscretionarySpendTransaction } from 'Types/Services/spending.model';
import { formatToMonthDay } from 'Util/Formatters/dateFormatters/dateFormatters';
import styles from './TripExpenseList.module.css';

type TripExpenseListPropTypes = {
  tripId: string;
  setTransactionToEdit: (transaction: DiscretionarySpendTransaction) => void;
};

export default function TripExpenseList({ tripId, setTransactionToEdit }: TripExpenseListPropTypes) {
  const getContent = useContent('trips');
  const { isLoading, expenseList, isError } = useTripLinkedExpenses(tripId);

  const linkedTransactionsLabel = getContent('linkedTransactions');

  if (isLoading) {
    return (
      <div>
        <div className={styles.linkedTransactionsLabel}>{linkedTransactionsLabel}</div>
        {Array.from({ length: 5 }).map((_, index) => (
          <div className={styles.row} key={index}>
            <LoadingInteractiveRow />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <div className={styles.linkedTransactionsLabel}>{linkedTransactionsLabel}</div>
        <AlertMessage
          variant="error"
          title={getContent('linkedTransactionsErrorTitle')}
          message={getContent('linkedTransactionsErrorMessage')}
        />
      </div>
    );
  }

  if (expenseList.length === 0) {
    return (
      <>
        <div className={styles.linkedTransactionsLabel}>{linkedTransactionsLabel}</div>
        <AlertMessage
          variant="info"
          title={getContent('linkedTransactionsEmptyTitle')}
          message={getContent('linkedTransactionsEmptyMessage')}
        />
      </>
    );
  }

  return (
    <>
      <div className={styles.linkedTransactionsLabel}>{getContent('linkedTransactions')}</div>
      {expenseList.map((transaction) => (
        <div className={`${styles.row} background-secondary-elevation-low`} key={transaction.transactionId}>
          <TransactionRow
            transactionId={transaction.transactionId}
            category={transaction.category}
            onClick={() => setTransactionToEdit(transaction)}
            amountSpent={transaction.amountSpent}
            note={transaction.note}
            secondaryNote={formatToMonthDay(transaction.spentDate)}
          />
        </div>
      ))}
    </>
  );
}
