import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from 'apiClient/orpc';
import CustomButton from 'Components/CustomButton/CustomButton';
import EditableAmountRow from 'Components/EditableAmountRow/EditableAmountRow';
import { format, parse } from 'date-fns';
import createContentGetter from 'Content/createContentGetter';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { MonthYearDbDate, monthYearDbDateFormat } from 'Types/dateTypes';
import { AccountWithStatus, accountUpdateAddInputSchema, AppInputs } from '@spend-watcher/contract';
import styles from './AddAccountUpdateRow.module.css';

type AddAccountUpdateV1RequestParams = AppInputs['accounts']['updateAdd'];

type AddAccountUpdateRowPropTypes = {
  accountId: AccountWithStatus['id'];
  date: MonthYearDbDate;
};

export default function AddAccountUpdateRow({ accountId, date }: AddAccountUpdateRowPropTypes) {
  const getContent = createContentGetter('accounts');
  const [isActive, setIsActive] = useState(false);

  const queryClient = useQueryClient();
  const accountUpdateMutation = useMutation(
    orpc.accounts.updateAdd.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.accounts.key() });
      },
      onError: () => {
        // TODO: Error handling
      },
    }),
  );

  const form = useForm<AddAccountUpdateV1RequestParams>({
    resolver: zodResolver(accountUpdateAddInputSchema),
    defaultValues: {
      accountId,
      date,
    },
  });

  const formattedDate = format(parse(date, monthYearDbDateFormat, new Date(0)), 'MMMM yyyy');
  if (!isActive) {
    return (
      <CustomButton
        key={date}
        variant="detail"
        layout="full-width"
        className={styles.addNewRow}
        onClick={() => setIsActive(true)}
      >
        {getContent('addNewRow', [formattedDate])}
      </CustomButton>
    );
  }

  function handleSubmission(submission: AddAccountUpdateV1RequestParams) {
    if (accountUpdateMutation.isPending) {
      return;
    }
    accountUpdateMutation.mutate(submission);
  }

  const isValidInput = form.formState.isValid;
  const isLoading = accountUpdateMutation.isPending;

  return (
    <EditableAmountRow
      form={form}
      label={formattedDate}
      onSubmission={handleSubmission}
      amountLabel={getContent('amountLabel')}
      showConfirmButton={isValidInput}
      isLoading={isLoading}
      amountFormFieldName="amount"
      amountPlaceholder={getContent('amountPlaceholder')}
    />
  );
}
