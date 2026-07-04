import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from 'api/orpc';
import CustomButton from 'Components/CustomButton/CustomButton';
import EditableAmountRow from 'Components/EditableAmountRow/EditableAmountRow';
import { format, parse } from 'date-fns';
import createContentGetter from 'Content/createContentGetter';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { MonthYearDbDate, monthYearDbDateFormat } from 'Types/dateTypes';
import { v1AddRecurringTransactionSchema } from 'Types/Services/spending.model';
import formatCurrency from 'Util/Formatters/formatCurrency/formatCurrency';
import { z as zod } from 'zod';
import styles from './RecurringTransactionRow.module.css';

const addRecurringFormSchema = v1AddRecurringTransactionSchema.partial({
  amountSpent: true, // Make amountSpent optional as this will be handled manually
});
type AddRecurringFormValues = zod.infer<typeof addRecurringFormSchema>;

type AddRecurringTransactionRowPropTypes = {
  expectedMonthlyAmount: number;
  recurringSpendId: string;
  date: MonthYearDbDate;
};

export default function AddRecurringTransactionRow({
  date,
  recurringSpendId,
  expectedMonthlyAmount,
}: AddRecurringTransactionRowPropTypes) {
  const [isActive, setIsActive] = useState(false);

  const getContent = createContentGetter('recurringTransactionsList');
  const queryClient = useQueryClient();
  const recurringTransactionMutation = useMutation(
    orpc.spending.recurringTransactionAdd.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.spending.key() });
      },
      onError: () => {
        // TODO: Error handling
      },
    }),
  );

  const form = useForm({
    resolver: zodResolver(addRecurringFormSchema),
    defaultValues: {
      recurringSpendId,
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

  function handleSubmission(submission: AddRecurringFormValues) {
    if (recurringTransactionMutation.isPending) return;

    recurringTransactionMutation.mutate({
      ...submission,
      amountSpent: submission.amountSpent ?? expectedMonthlyAmount,
    });
  }

  const isValidInput = form.formState.isValid;
  const isLoading = recurringTransactionMutation.isPending;

  return (
    <EditableAmountRow
      form={form}
      label={formattedDate}
      onSubmission={handleSubmission}
      amountLabel={getContent('amountSpentLabel')}
      showConfirmButton={isValidInput}
      isLoading={isLoading}
      amountFormFieldName="amountSpent"
      amountPlaceholder={formatCurrency(expectedMonthlyAmount)}
    />
  );
}
