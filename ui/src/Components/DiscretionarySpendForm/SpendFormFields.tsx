import DatePicker from 'Components/FormInputs/DatePickerController/DatePickerController';
import FilterableSelect from 'Components/FormInputs/FilterableSelect/FilterableSelectController';
import useSpendCategoryList from 'Components/FormInputs/FilterableSelect/presetLists/useSpendCategoryList/useSpendCategoryList';
import MoneyInput from 'Components/FormInputs/MoneyInput/MoneyInput';
import createContentGetter from 'Content/createContentGetter';
import { UseFormReturn } from 'react-hook-form';
import { DiscretionarySpendTransaction, SpendingCategory, TripsListResponse } from '@spend-watcher/contract';
import styles from './DiscretionarySpendForm.module.css';

export type SpendFormAttributes = Omit<DiscretionarySpendTransaction, 'transactionId' | 'isRecurring'>;

type SpendFormFieldsPropTypes = {
  form: UseFormReturn<SpendFormAttributes>;
  tripsList: TripsListResponse['tripsList'] | undefined;
};

export default function SpendFormFields({ form, tripsList }: SpendFormFieldsPropTypes) {
  const getContent = createContentGetter('transactions');
  const spendingCategoryList = useSpendCategoryList();

  return (
    <>
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
    </>
  );
}
