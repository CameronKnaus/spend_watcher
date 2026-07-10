import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from 'apiClient/orpc';
import BottomSheet from 'Components/BottomSheet/BottomSheet';
import CustomButton from 'Components/CustomButton/CustomButton';
import DeleteButton from 'Components/DeleteButton/DeleteButton';
import DatePicker from 'Components/FormInputs/DatePickerController/DatePickerController';
import { format } from 'date-fns';
import createContentGetter from 'Content/createContentGetter';
import { useEffect, useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { dbDateFormat } from 'Types/dateTypes';
import { AppInputs, Trip, tripInputSchema } from '@spend-watcher/contract';
import getDateFromDBDateString from 'Util/Time/getDateFromDBDateString';
import styles from './TripForm.module.css';

type AddTripRequestParams = AppInputs['trips']['add'];

type NewTripForm = {
  onSubmit: () => void;
  onCancel: () => void;
  onDelete?: never;
  tripToEdit?: never;
};

type EditTripForm = {
  onSubmit: () => void;
  onCancel: () => void;
  onDelete: () => void;
  tripToEdit: Trip;
};

type TripFormPropTypes = NewTripForm | EditTripForm;

export default function TripForm({ onSubmit, onCancel, onDelete, tripToEdit }: TripFormPropTypes) {
  const queryClient = useQueryClient();
  const getContent = createContentGetter('trips');
  const getGeneralContent = createContentGetter('general');
  const id = useId();
  const tripNameId = `${id}-tripName`;
  const startDateId = `${id}-startDate`;
  const endDateId = `${id}-endDate`;

  const editMode = Boolean(tripToEdit);

  function onTripSaved() {
    queryClient.invalidateQueries({ queryKey: orpc.trips.key() });
    form.reset();
  }

  const addTripMutation = useMutation(orpc.trips.add.mutationOptions({ onSuccess: onTripSaved }));
  const editTripMutation = useMutation(orpc.trips.edit.mutationOptions({ onSuccess: onTripSaved }));

  const [defaultStartDate] = useState(() => format(new Date(), dbDateFormat));
  const form = useForm<AddTripRequestParams>({
    resolver: zodResolver(tripInputSchema),
    mode: 'onChange', // Least performant but not a concern here
    defaultValues: {
      tripName: '',
      startDate: defaultStartDate,
      endDate: defaultStartDate,
    },
  });

  useEffect(() => {
    form.reset(tripToEdit);
  }, [tripToEdit, form]);

  function handleCancel() {
    form.reset();
    onCancel();
  }

  function handleSubmission(submission: AddTripRequestParams) {
    if (editMode) {
      editTripMutation.mutate({ ...submission, tripId: tripToEdit!.tripId });
    } else {
      addTripMutation.mutate(submission);
    }
    onSubmit();
  }

  const startDate = getDateFromDBDateString(form.watch('startDate'));
  const endDate = getDateFromDBDateString(form.watch('endDate'));

  return (
    <>
      <form className={styles.tripForm} onSubmit={form.handleSubmit(handleSubmission)}>
        <label htmlFor={tripNameId}>{getContent('tripName')}</label>
        <input
          id={tripNameId}
          className={styles.textInput}
          placeholder={getContent('tripNamePlaceholder')}
          autoComplete="off"
          {...form.register('tripName', { minLength: 1, maxLength: 30, required: true })}
        />
        <label htmlFor={startDateId} className={styles.dateLabel}>
          {getContent('startDate')}
        </label>
        <DatePicker
          id={startDateId}
          isRequired
          control={form.control}
          name="startDate"
          views={['year', 'month', 'day']}
          format="MMMM do, yyyy"
          maxDate={endDate}
          className={styles.textInput}
        />
        <label htmlFor={endDateId} className={styles.dateLabel}>
          {getContent('endDate')}
        </label>
        <DatePicker
          id={endDateId}
          isRequired
          control={form.control}
          name="endDate"
          views={['year', 'month', 'day']}
          format="MMMM do, yyyy"
          minDate={startDate}
          className={styles.textInput}
        />
      </form>
      {editMode && (
        <div className={styles.deleteButtonContainer}>
          <DeleteButton label={getContent('deleteButtonLabel')} onClick={onDelete} />
        </div>
      )}
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
          {getGeneralContent('submit')}
        </CustomButton>
      </BottomSheet>
    </>
  );
}
