import BottomSheet from 'Components/BottomSheet/BottomSheet';
import CustomButton from 'Components/CustomButton/CustomButton';
import EditableRecurringTransactionRow from 'Components/RecurringTransactionRow';
import AddRecurringTransactionRow from 'Components/RecurringTransactionRow/AddRecurringTransactionRow';
import { format, parse, subMonths } from 'date-fns';
import useContent from 'Hooks/useContent';
import useRecurringTransactionsList from 'Hooks/useRecurringTransactionsList/useRecurringTransactionsList';
import { MonthYearDbDate, monthYearDbDateFormat } from 'Types/dateTypes';
import { RecurringSpendTransaction } from 'Types/Services/spending.model';

type RecurringTransactionsListPropTypes = {
  recurringSpendTransaction: RecurringSpendTransaction;
  onBack: () => void;
};

const formatDate = (date: string) => format(parse(date, monthYearDbDateFormat, new Date()), 'MMMM yyyy');

export default function RecurringTransactionsList({
  recurringSpendTransaction,
  onBack,
}: RecurringTransactionsListPropTypes) {
  const { recurringTransactionsList, isLoading } = useRecurringTransactionsList(
    recurringSpendTransaction.recurringSpendId,
  );
  const getContent = useContent('recurringTransactionsList');

  if (!recurringTransactionsList || isLoading) {
    // TODO:
    return <h1>Loading...</h1>;
  }

  const oldestTransactionDate = recurringTransactionsList[recurringTransactionsList.length - 1].date;
  // Starting with the current date, we will iterate backwards until we reach the oldest transaction date
  let currentDate = new Date();
  const applicableMonths: MonthYearDbDate[] = [];
  let lastTransactionDateReached = false;
  while (!lastTransactionDateReached) {
    const formattedCurrentDate = format(currentDate, monthYearDbDateFormat) as MonthYearDbDate;
    applicableMonths.push(formattedCurrentDate);

    if (formattedCurrentDate === oldestTransactionDate) {
      lastTransactionDateReached = true;
    }

    // Update current date to the previous month for next iteration
    currentDate = subMonths(currentDate, 1);
  }

  return (
    <>
      {applicableMonths.map((date) => {
        const transaction = recurringTransactionsList.find((transaction) => transaction.date === date);
        const formattedDate = formatDate(date);

        if (transaction) {
          // Month already has transaction logged
          return (
            <EditableRecurringTransactionRow
              key={transaction.date}
              label={formattedDate}
              transactionId={transaction.transactionId}
              amountSpent={transaction.amountSpent}
            />
          );
        }

        // Month has no transaction logged, show add button only if still active
        if (recurringSpendTransaction.isActive) {
          return (
            <AddRecurringTransactionRow
              key={date}
              date={date}
              expectedMonthlyAmount={recurringSpendTransaction.expectedMonthlyAmount}
              recurringSpendId={recurringSpendTransaction.recurringSpendId}
            />
          );
        }

        // Transaction missing for the month, but is not active so don't show anything
        return null;
      })}
      {/* Add button for the month prior to the oldest month logged */}
      <AddRecurringTransactionRow
        key={currentDate.toISOString()}
        date={format(currentDate, 'yyyy-MM') as MonthYearDbDate}
        expectedMonthlyAmount={recurringSpendTransaction.expectedMonthlyAmount}
        recurringSpendId={recurringSpendTransaction.recurringSpendId}
      />
      <BottomSheet>
        <CustomButton variant="secondary" onClick={onBack} layout="full-width">
          {getContent('backButton')}
        </CustomButton>
      </BottomSheet>
    </>
  );
}
