import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import EditableAmountRow from 'Components/EditableAmountRow/EditableAmountRow';
import SERVICE_ROUTES from 'Constants/ServiceRoutes';
import useContent from 'Hooks/useContent';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Account,
  editAccountUpdateRequestParamSchema,
  EditAccountUpdateV1RequestParams,
} from 'Types/Services/accounts.model';

type EditAccountUpdateRowPropTypes = {
  accountId: Account['id'];
  updateId: number;
  dateLabel: string;
  currentAmount: number;
};

export default function EditAccountUpdateRow({
  accountId,
  updateId,
  dateLabel,
  currentAmount,
}: EditAccountUpdateRowPropTypes) {
  const getContent = useContent('accounts');

  const queryClient = useQueryClient();
  const accountUpdateMutation = useMutation({
    mutationKey: ['accounts'],
    mutationFn: (params: EditAccountUpdateV1RequestParams) => {
      return axios.post(SERVICE_ROUTES.postEditAccountUpdate, {
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

  const form = useForm<EditAccountUpdateV1RequestParams>({
    resolver: zodResolver(editAccountUpdateRequestParamSchema),
    defaultValues: {
      accountId,
      updateId,
    },
  });

  useEffect(() => {
    form.setValue('amount', currentAmount);
  }, [currentAmount, form]);

  function handleSubmission(submission: EditAccountUpdateV1RequestParams) {
    if (accountUpdateMutation.isPending) {
      return;
    }

    accountUpdateMutation.mutate(submission);
  }

  const formAccountAmount = form.watch('amount');
  const isDirty = formAccountAmount !== currentAmount;
  const isValidInput = formAccountAmount > 0;
  const isLoading = accountUpdateMutation.isPending;

  return (
    <EditableAmountRow
      form={form}
      label={dateLabel}
      onSubmission={handleSubmission}
      amountLabel={getContent('amountLabel')}
      showConfirmButton={isValidInput && isDirty}
      isLoading={isLoading}
      amountFormFieldName="amount"
    />
  );
}
