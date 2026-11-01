import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from 'apiClient/orpc';
import BottomSheet from 'Components/BottomSheet/BottomSheet';
import CustomButton from 'Components/CustomButton/CustomButton';
import DeleteButton from 'Components/DeleteButton/DeleteButton';
import DatePicker from 'Components/FormInputs/DatePickerController/DatePickerController';
import { format } from 'date-fns';
import createContentGetter from 'Content/createContentGetter';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { dbDateFormat } from 'Types/dateTypes';
import { AppInputs, Trip, tripInputSchema } from '@spend-watcher/contract';
import getDateFromDBDateString from 'Util/Time/getDateFromDBDateString';
import styles from './TripForm.module.css';

type AddTripRequestParams = AppInputs['trips']['add'];

// The pickers only limit what the calendar offers, so a typed date can still land on the wrong side
// of the other one. 'yyyy-MM-dd' strings sort chronologically, so they compare without parsing.
const tripFormSchema = tripInputSchema.refine(({ startDate, endDate }) => startDate <= endDate, {
  path: ['endDate'],
});

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

  const editMode = Boolean(tripToEdit);

  function onTripSaved() {
    queryClient.invalidateQueries({ queryKey: orpc.trips.key() });
    form.reset();
  }

  const addTripMutation = useMutation(orpc.trips.add.mutationOptions({ onSuccess: onTripSaved }));
  const editTripMutation = useMutation(orpc.trips.edit.mutationOptions({ onSuccess: onTripSaved }));

  const [defaultStartDate] = useState(() => format(new Date(), dbDateFormat));
  const form = useForm<AddTripRequestParams>({
    resolver: zodResolver(tripFormSchema),
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

  // Runs on accept rather than on every change: a date tapped and then cancelled in the mobile
  // calendar shouldn't leave the end date moved.
  function carryEndDateToStartDate() {
    const { startDate, endDate } = form.getValues();
    if (startDate > endDate) {
      form.setValue('endDate', startDate, { shouldValidate: true });
    }
  }

  const startDate = getDateFromDBDateString(form.watch('startDate'));

  return (
    <>
      <form className={styles.tripForm} onSubmit={form.handleSubmit(handleSubmission)}>
        <label>{getContent('tripName')}</label>
        <input
          className={styles.textInput}
          placeholder={getContent('tripNamePlaceholder')}
          autoComplete="off"
          {...form.register('tripName', { minLength: 1, maxLength: 30, required: true })}
        />
        <label className={styles.dateLabel}>{getContent('startDate')}</label>
        <DatePicker
          isRequired
          control={form.control}
          name="startDate"
          views={['year', 'month', 'day']}
          format="MMMM do, yyyy"
          onAccept={carryEndDateToStartDate}
          className={styles.textInput}
        />
        <label className={styles.dateLabel}>{getContent('endDate')}</label>
        <DatePicker
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
