import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orpc } from 'apiClient/orpc';
import AlertMessage from 'Components/AlertMessage/AlertMessage';
import BottomSheet from 'Components/BottomSheet/BottomSheet';
import CustomButton from 'Components/CustomButton/CustomButton';
import DatePicker from 'Components/FormInputs/DatePickerController/DatePickerController';
import FilterableSelect from 'Components/FormInputs/FilterableSelect/FilterableSelectController';
import useSpendCategoryList from 'Components/FormInputs/FilterableSelect/presetLists/useSpendCategoryList/useSpendCategoryList';
import MoneyInput from 'Components/FormInputs/MoneyInput/MoneyInput';
import LoadingSpinner from 'Components/LoadingSpinner/LoadingSpinner';
import createContentGetter from 'Content/createContentGetter';
import { tripsListQueryOptions } from 'queryOptions/tripsListQueryOptions';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { discretionaryInputSchema, SpendingCategory } from '@spend-watcher/contract';
import styles from './DiscretionarySpendForm.module.css';
import { SpendFormAttributes } from './EditSpendForm';

type NewSpendFormPropTypes = {
  onCancel: () => void;
  onSubmit: () => void;
};

export default function NewSpendForm({ onCancel, onSubmit }: NewSpendFormPropTypes) {
  const getContent = createContentGetter('transactions');
  const getGeneralContent = createContentGetter('general');
  const spendingCategoryList = useSpendCategoryList();
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
        {/* Amount spent */}
        <label>{getContent('amountLabel')}</label>
        <MoneyInput
          isRequired
          control={form.control}
          trigger={form.trigger}
          name="amountSpent"
          placeholder={getContent('amountPlaceholder')}
          className={styles.textInput}
        />

        {/* Spend category */}
        <label>{getContent('categoryLabel')}</label>
        <FilterableSelect
          control={form.control}
          name="category"
          className={styles.textInput}
          defaultValue={SpendingCategory.OTHER}
          optionsList={spendingCategoryList}
        />

        {/* A short note about the transaction */}
        <label>{getContent('notesLabel')}</label>
        <input
          className={styles.textInput}
          placeholder={getContent('notesPlaceholder')}
          autoComplete="off"
          {...form.register('note', { maxLength: 60 })}
        />

        {/* Date of the transaction */}
        <label className={styles.dateLabel}>{getContent('dateLabel')}</label>
        <DatePicker
          isRequired
          control={form.control}
          name="spentDate"
          disableFuture
          views={['year', 'month', 'day']}
          format="MMMM do, yyyy"
          className={styles.textInput}
        />

        {/* Trip the transaction is linked to */}
        <label>{getContent('tripLabel')}</label>
        <FilterableSelect
          control={form.control}
          name="linkedTripId"
          opens="up"
          className={styles.textInput}
          noSelectionText={getContent('emptyPlaceholder')}
          optionsList={
            tripsList?.map((tripDetails) => ({
              value: tripDetails.trip.tripId,
              optionName: tripDetails.trip.tripName,
            })) ?? []
          }
          clearLabel={getContent('clearSelection')}
        />
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
