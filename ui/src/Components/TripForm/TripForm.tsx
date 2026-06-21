import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from 'api/orpc';
import BottomSheet from 'Components/BottomSheet/BottomSheet';
import CustomButton from 'Components/CustomButton/CustomButton';
import DeleteButton from 'Components/DeleteButton/DeleteButton';
import DatePicker from 'Components/FormInputs/DatePickerController/DatePickerController';
import { format, parse } from 'date-fns';
import useContent from 'Hooks/useContent/useContent';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { dbDateFormat } from 'Types/dateTypes';
import { AddTripRequestParams, Trip, v1AddTripSchema } from 'Types/Services/trips.model';
import styles from './TripForm.module.css';

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
  const getContent = useContent('trips');
  const getGeneralContent = useContent('general');

  const editMode = Boolean(tripToEdit);

  function onTripSaved() {
    queryClient.invalidateQueries({ queryKey: orpc.trips.key() });
    form.reset();
  }

  const addTripMutation = useMutation(orpc.trips.add.mutationOptions({ onSuccess: onTripSaved }));
  const editTripMutation = useMutation(orpc.trips.edit.mutationOptions({ onSuccess: onTripSaved }));

  const defaultStartDate = format(new Date(), dbDateFormat);
  const form = useForm<AddTripRequestParams>({
    resolver: zodResolver(v1AddTripSchema),
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

  const startDate = parse(form.watch('startDate'), dbDateFormat, new Date());
  const endDate = parse(form.watch('endDate'), dbDateFormat, new Date());

  return (
    <>
      <form className={styles.tripForm} onSubmit={form.handleSubmit(handleSubmission)}>
        <label>{getContent('tripName')}</label>
        <input
          className={styles.textInput}
          placeholder={getContent('tripNamePlaceholder')}
          autoComplete="off"
          {...form.register('tripName', { minLength: 1, maxLength: 100, required: true })}
        />
        <label className={styles.dateLabel}>{getContent('startDate')}</label>
        <DatePicker
          isRequired
          control={form.control}
          name="startDate"
          views={['year', 'month', 'day']}
          format="MMMM do, yyyy"
          maxDate={endDate}
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
