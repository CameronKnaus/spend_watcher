import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from 'api/orpc';
import EditableAmountRow from 'Components/EditableAmountRow/EditableAmountRow';
import createContentGetter from 'Content/createContentGetter';
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
  const getContent = createContentGetter('accounts');

  const queryClient = useQueryClient();
  const accountUpdateMutation = useMutation(
    orpc.accounts.updateEdit.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.accounts.key() });
      },
      onError: () => {
        // TODO: Error handling
      },
    }),
  );

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
