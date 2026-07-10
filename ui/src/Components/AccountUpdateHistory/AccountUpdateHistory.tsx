import { useQuery } from '@tanstack/react-query';
import BottomSheet from 'Components/BottomSheet/BottomSheet';
import CustomButton from 'Components/CustomButton/CustomButton';
import LoadingInteractiveRow from 'Components/InteractiveRow/LoadingInteractiveRow';
import { format, parse } from 'date-fns';
import createContentGetter from 'Content/createContentGetter';
import { accountHistoryQueryOptions } from 'queryOptions/accountHistoryQueryOptions';
import { useState } from 'react';
import { MonthYearDbDate, monthYearDbDateFormat } from 'Types/dateTypes';
import { AccountWithStatus } from '@spend-watcher/contract';
import AddAccountUpdateRow from './AddAccountUpdateRow/AddAccountUpdateRow';
import EditAccountUpdateRow from './EditAccountUpdateRow/EditAccountUpdateRow';

// Static keys for the fixed-size loading placeholder list (it never reorders).
const SKELETON_KEYS = Array.from({ length: 4 }, (_, i) => `account-update-history-skeleton-${i}`);

const formatDate = (date: string) => format(parse(date, monthYearDbDateFormat, new Date()), 'MMMM yyyy');

type AccountUpdateHistoryPropTypes = {
  accountId: AccountWithStatus['id'];
  onBack: () => void;
};

export default function AccountUpdateHistory({ accountId, onBack }: AccountUpdateHistoryPropTypes) {
  const getContent = createContentGetter('accounts');
  const { data: accountHistory, isLoading } = useQuery(accountHistoryQueryOptions(accountId));
  const [now] = useState(() => new Date());

  if (isLoading || !accountHistory) {
    return (
      <>
        {SKELETON_KEYS.map((key) => (
          <LoadingInteractiveRow key={key} />
        ))}
      </>
    );
  }

  const { updateHistory } = accountHistory;
  const oldestAccountUpdateDate = updateHistory[updateHistory.length - 1].date;
  // Starting with the current date, iterate backwards until we reach the oldest account update date.
  // Copied from the mount snapshot because the loop below mutates it, and state must stay untouched.
  const currentDate = new Date(now);
  const applicableMonths: MonthYearDbDate[] = [];
  let lastUpdateDateReached = false;
  while (!lastUpdateDateReached) {
    const formattedCurrentDate = format(currentDate, monthYearDbDateFormat) as MonthYearDbDate;
    applicableMonths.push(formattedCurrentDate);

    if (formattedCurrentDate === oldestAccountUpdateDate) {
      lastUpdateDateReached = true;
    }

    // Update current date to the previous month for next iteration
    currentDate.setMonth(currentDate.getMonth() - 1);
  }

  return (
    <>
      {applicableMonths.map((date) => {
        const accountUpdate = updateHistory.find((update) => update.date === date);
        const formattedDate = formatDate(date);

        if (accountUpdate) {
          // Month already has update logged
          return (
            <EditAccountUpdateRow
              key={formattedDate}
              accountId={accountId}
              updateId={accountUpdate.updateId}
              dateLabel={formattedDate}
              currentAmount={accountUpdate.amount}
            />
          );
        }

        // Month does not have an update logged
        return <AddAccountUpdateRow key={formattedDate} accountId={accountId} date={date} />;
      })}
      {/* Add button for the month prior to the oldest month logged */}
      <AddAccountUpdateRow
        key={currentDate.toISOString()}
        accountId={accountId}
        date={format(currentDate, 'yyyy-MM') as MonthYearDbDate}
      />
      <BottomSheet>
        <CustomButton variant="secondary" onClick={onBack} layout="full-width">
          {getContent('backButton')}
        </CustomButton>
      </BottomSheet>
    </>
  );
}
