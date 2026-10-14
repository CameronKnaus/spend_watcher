import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orpc } from 'apiClient/orpc';
import BottomSheet from 'Components/BottomSheet/BottomSheet';
import CustomButton from 'Components/CustomButton/CustomButton';
import DeleteButton from 'Components/DeleteButton/DeleteButton';
import LoadingSpinner from 'Components/LoadingSpinner/LoadingSpinner';
import createContentGetter from 'Content/createContentGetter';
import { tripsListQueryOptions } from 'queryOptions/tripsListQueryOptions';
import { useForm } from 'react-hook-form';
import { DiscretionarySpendTransaction, discretionaryInputSchema } from '@spend-watcher/contract';
import styles from './DiscretionarySpendForm.module.css';
import SpendFormFields, { SpendFormAttributes } from './SpendFormFields';

type EditSpendFormPropTypes = {
  transactionToEdit: DiscretionarySpendTransaction;
  onCancel: () => void;
  onSubmit: () => void;
};

export default function EditSpendForm({ transactionToEdit, onCancel, onSubmit }: EditSpendFormPropTypes) {
  const getContent = createContentGetter('transactions');
  const getGeneralContent = createContentGetter('general');
  const queryClient = useQueryClient();
  const { data: tripsListData } = useQuery(tripsListQueryOptions);
  const tripsList = tripsListData?.tripsList;

  function invalidateRelevantQueries() {
    queryClient.invalidateQueries({ queryKey: orpc.spending.key() });
    queryClient.invalidateQueries({ queryKey: orpc.trips.key() });
  }

  const editTransactionService = useMutation(
    orpc.spending.discretionaryEdit.mutationOptions({
      onSuccess: () => {
        invalidateRelevantQueries();

        form.reset();
        onSubmit();
      },
      onError: () => {
        // TODO: Error handling
      },
    }),
  );

  // All form handling managed here
  const form = useForm<SpendFormAttributes>({
    resolver: zodResolver(discretionaryInputSchema),
    mode: 'onChange', // Least performant but not a concern here
    defaultValues: transactionToEdit,
  });

  function handleCancel() {
    form.reset();
    onCancel();
  }

  function handleSubmission(submission: SpendFormAttributes) {
    if (editTransactionService.isPending) {
      return;
    }

    editTransactionService.mutate({ ...submission, transactionId: transactionToEdit.transactionId });
  }

  const deleteTransaction = useMutation(
    orpc.spending.discretionaryDelete.mutationOptions({
      onSuccess: () => {
        invalidateRelevantQueries();
        onCancel();
      },
      onError: () => {
        // TODO: Error handling
      },
    }),
  );

  function handleDelete() {
    if (!transactionToEdit || deleteTransaction.isPending) {
      return;
    }

    deleteTransaction.mutate({ transactionId: transactionToEdit.transactionId });
  }

  return (
    <>
      <form className={styles.transactionForm} onSubmit={form.handleSubmit(handleSubmission)}>
        <SpendFormFields form={form} tripsList={tripsList} />
      </form>
      <div className={styles.deleteButtonContainer}>
        <DeleteButton
          label={getContent('deleteExpense')}
          onClick={handleDelete}
          isLoading={deleteTransaction.isPending}
        />
      </div>
      <BottomSheet>
        <CustomButton variant="secondary" onClick={handleCancel} layout="full-width">
          {getGeneralContent('cancel')}
        </CustomButton>
        <CustomButton
          isDisabled={!form.formState.isValid}
          variant="primary"
          onClick={form.handleSubmit(handleSubmission)}
          layout="full-width"
        >
          {editTransactionService.isPending ? <LoadingSpinner /> : getGeneralContent('submit')}
        </CustomButton>
      </BottomSheet>
    </>
  );
}
