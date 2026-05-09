import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import CustomButton from 'Components/CustomButton/CustomButton';
import EditableAmountRow from 'Components/EditableAmountRow/EditableAmountRow';
import SERVICE_ROUTES from 'Constants/ServiceRoutes';
import { format, parse } from 'date-fns';
import useContent from 'Hooks/useContent';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { MonthYearDbDate, monthYearDbDateFormat } from 'Types/dateTypes';
import {
  Account,
  addAccountUpdateRequestParamSchema,
  AddAccountUpdateV1RequestParams,
} from 'Types/Services/accounts.model';
import styles from './AddAccountUpdateRow.module.css';

type AddAccountUpdateRowPropTypes = {
  accountId: Account['id'];
  date: MonthYearDbDate;
};

export default function AddAccountUpdateRow({ accountId, date }: AddAccountUpdateRowPropTypes) {
  const getContent = useContent('accounts');
  const [isActive, setIsActive] = useState(false);

  const queryClient = useQueryClient();
  const accountUpdateMutation = useMutation({
    mutationKey: ['accounts'],
    mutationFn: (params: AddAccountUpdateV1RequestParams) => {
      return axios.post(SERVICE_ROUTES.postAddAccountUpdate, {
        ...params,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['accounts'],
      });
    },
    onError: () => {
      // TODO: Error handling
    },
  });

  const form = useForm<AddAccountUpdateV1RequestParams>({
    resolver: zodResolver(addAccountUpdateRequestParamSchema),
    defaultValues: {
      accountId,
      date,
    },
  });

  const formattedDate = format(parse(date, monthYearDbDateFormat, new Date()), 'MMMM yyyy');
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
