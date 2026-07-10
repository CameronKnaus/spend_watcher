import { useQuery } from '@tanstack/react-query';
import BottomSheet from 'Components/BottomSheet/BottomSheet';
import CustomButton from 'Components/CustomButton/CustomButton';
import { format, parse } from 'date-fns';
import createContentGetter from 'Content/createContentGetter';
import { accountHistoryQueryOptions } from 'queryOptions/accountHistoryQueryOptions';
import { useState } from 'react';
import { MonthYearDbDate, monthYearDbDateFormat } from 'Types/dateTypes';
import { AccountWithStatus } from '@spend-watcher/contract';
import buildMonthLedger from 'Util/Time/buildMonthLedger';
import AddAccountUpdateRow from './AddAccountUpdateRow/AddAccountUpdateRow';
import EditAccountUpdateRow from './EditAccountUpdateRow/EditAccountUpdateRow';

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
    // TODO:
    return <h2>Loading...</h2>;
  }

  const { updateHistory } = accountHistory;
  // The contract validates this as a yyyy-MM string at runtime but types it as plain `string`.
  const oldestAccountUpdateDate = updateHistory.at(-1)?.date as MonthYearDbDate | undefined;
  const { months: applicableMonths, monthBeforeOldest } = buildMonthLedger(oldestAccountUpdateDate, now);

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
      <AddAccountUpdateRow key={monthBeforeOldest} accountId={accountId} date={monthBeforeOldest} />
      <BottomSheet>
        <CustomButton variant="secondary" onClick={onBack} layout="full-width">
          {getContent('backButton')}
        </CustomButton>
      </BottomSheet>
    </>
  );
}
