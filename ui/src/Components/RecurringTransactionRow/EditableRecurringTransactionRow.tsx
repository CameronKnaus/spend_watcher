import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from 'apiClient/orpc';
import EditableAmountRow from 'Components/EditableAmountRow/EditableAmountRow';
import createContentGetter from 'Content/createContentGetter';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { RecurringTransactionId, v1EditRecurringTransactionSchema } from 'Types/Services/spending.model';
import { z as zod } from 'zod';

const editRecurringFormSchema = v1EditRecurringTransactionSchema.partial({ amountSpent: true });
type EditRecurringFormValues = zod.infer<typeof editRecurringFormSchema>;

type EditableRecurringTransactionRowPropTypes = {
  transactionId: RecurringTransactionId;
  label: string;
  amountSpent: number;
};

export default function EditableRecurringTransactionRow({
  transactionId,
  label,
  amountSpent,
}: EditableRecurringTransactionRowPropTypes) {
  const queryClient = useQueryClient();
  const recurringTransactionMutation = useMutation(
    orpc.spending.recurringTransactionEdit.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.spending.key() });
      },
      onError: () => {
        // TODO: Error handling
      },
    }),
  );

  const getContent = createContentGetter('recurringTransactionsList');
  const form = useForm({
    resolver: zodResolver(editRecurringFormSchema),
    defaultValues: {
      transactionId,
    },
  });

  function handleSubmission(submission: EditRecurringFormValues) {
    if (!submission.amountSpent || recurringTransactionMutation.isPending) {
      return;
    }

    recurringTransactionMutation.mutate({
      ...submission,
      amountSpent: submission.amountSpent,
    });
  }

  useEffect(() => {
    form.setValue('amountSpent', amountSpent);
  }, [amountSpent, form]);

  const formAmountSpentValue = form.watch('amountSpent') ?? 0;
  const isDirty = formAmountSpentValue !== amountSpent;
  const isValidInput = formAmountSpentValue > 0;
  const isLoading = recurringTransactionMutation.isPending;

  return (
    <EditableAmountRow
      form={form}
      label={label}
      onSubmission={handleSubmission}
      amountLabel={getContent('amountSpentLabel')}
      showConfirmButton={isDirty && isValidInput}
      isLoading={isLoading}
      amountFormFieldName="amountSpent"
    />
  );
}
