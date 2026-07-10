import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orpc } from 'apiClient/orpc';
import AlertMessage from 'Components/AlertMessage/AlertMessage';
import BottomSheet from 'Components/BottomSheet/BottomSheet';
import CustomButton from 'Components/CustomButton/CustomButton';
import LoadingSpinner from 'Components/LoadingSpinner/LoadingSpinner';
import createContentGetter from 'Content/createContentGetter';
import { tripsListQueryOptions } from 'queryOptions/tripsListQueryOptions';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { discretionaryInputSchema, SpendingCategory } from '@spend-watcher/contract';
import styles from './DiscretionarySpendForm.module.css';
import SpendFormFields, { SpendFormAttributes } from './SpendFormFields';

type NewSpendFormPropTypes = {
  onCancel: () => void;
  onSubmit: () => void;
};

export default function NewSpendForm({ onCancel, onSubmit }: NewSpendFormPropTypes) {
  const getContent = createContentGetter('transactions');
  const getGeneralContent = createContentGetter('general');
  const queryClient = useQueryClient();
  const { data: tripsListData } = useQuery(tripsListQueryOptions);
  const tripsList = tripsListData?.tripsList;
  const activeTrip = tripsListData?.activeTrip;

  // All form handling managed here
  const form = useForm<SpendFormAttributes>({
    resolver: zodResolver(discretionaryInputSchema),
    mode: 'onChange', // Least performant but not a concern here
    defaultValues: {
      category: SpendingCategory.OTHER,
    },
  });

  const transactionService = useMutation(
    orpc.spending.discretionaryAdd.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.spending.key() });
        queryClient.invalidateQueries({ queryKey: orpc.trips.key() });

        form.reset();
        onSubmit();
      },
      onError: () => {
        // TODO: Error handling
      },
    }),
  );

  useEffect(() => {
    if (activeTrip) {
      form.setValue('linkedTripId', activeTrip.tripId);
    }
  }, [activeTrip, form]);

  function handleCancel() {
    form.reset();
    onCancel();
  }

  function handleSubmission(submission: SpendFormAttributes) {
    if (transactionService.isPending) {
      return;
    }

    transactionService.mutate(submission);
  }

  return (
    <>
      {activeTrip && (
        <AlertMessage
          title={getContent('tripNotice', [activeTrip.tripName])}
          variant="info"
          className={styles.tripNotice}
        />
      )}
      <form className={styles.transactionForm} onSubmit={form.handleSubmit(handleSubmission)}>
        <SpendFormFields form={form} tripsList={tripsList} />
      </form>
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
          {transactionService.isPending ? <LoadingSpinner /> : getGeneralContent('submit')}
        </CustomButton>
      </BottomSheet>
    </>
  );
}
