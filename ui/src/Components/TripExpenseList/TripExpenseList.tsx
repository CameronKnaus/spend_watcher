import { useQuery } from '@tanstack/react-query';
import AlertMessage from 'Components/AlertMessage/AlertMessage';
import LoadingInteractiveRow from 'Components/InteractiveRow/LoadingInteractiveRow';
import TransactionRow from 'Components/TransactionRow/TransactionRow';
import createContentGetter from 'Content/createContentGetter';
import { tripExpensesQueryOptions } from 'queryOptions/tripExpensesQueryOptions';
import { DiscretionarySpendTransaction } from 'Types/Services/spending.model';
import { formatToMonthDay } from 'Util/Formatters/dateFormatters/dateFormatters';
import styles from './TripExpenseList.module.css';

// Static keys for the fixed-size loading placeholder list (it never reorders).
const SKELETON_KEYS = Array.from({ length: 5 }, (_, i) => `trip-expense-skeleton-${i}`);

type TripExpenseListPropTypes = {
  tripId: string;
  setTransactionToEdit: (transaction: DiscretionarySpendTransaction) => void;
};

export default function TripExpenseList({ tripId, setTransactionToEdit }: TripExpenseListPropTypes) {
  const getContent = createContentGetter('trips');
  const { data, isLoading, isFetching, isError } = useQuery(tripExpensesQueryOptions(tripId));
  const expenseList = data?.expenseList ?? [];

  const linkedTransactionsLabel = getContent('linkedTransactions');

  if (isLoading || isFetching) {
    return (
      <div>
        <div className={styles.linkedTransactionsLabel}>{linkedTransactionsLabel}</div>
        {SKELETON_KEYS.map((key) => (
          <div className={styles.row} key={key}>
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
