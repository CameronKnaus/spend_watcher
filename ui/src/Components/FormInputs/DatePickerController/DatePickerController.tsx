import { DatePicker, DatePickerProps } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import { useState } from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { dbDateFormat } from 'Types/dateTypes';
import getDateFromDBDateString from 'Util/Time/getDateFromDBDateString';

type DatePickerWithoutEssentialAttributes = Omit<DatePickerProps<Date>, 'onChange'>;

type DatePickerControllerPropTypes<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  isRequired?: boolean;
  // DatePickerProps has no top-level `id` — MUI expects it on the rendered text field's slot props.
  id?: string;
} & DatePickerWithoutEssentialAttributes;

// This is a wrapper to use MUI-DatePicker with react-hook-form. All props from DatePicker are passed through except onChange, onAccept, and value
export default function DatePickerController<T extends FieldValues>({
  control,
  name,
  isRequired = false,
  id,
  ...datePickerProps
}: DatePickerControllerPropTypes<T>) {
  const [today] = useState(() => new Date());
  const formatDate = (date: Date | null) => format(date ?? new Date(), dbDateFormat);

  return (
    <Controller
      control={control}
      name={name}
      // @ts-expect-error I should figure out the proper typing of this but it works for now
      defaultValue={formatDate(today)}
      rules={{ required: isRequired }}
      render={({ field }) => (
        <DatePicker
          {...field}
          defaultValue={today}
          // value={field.value ? new Date(field.value) : today}
          value={getDateFromDBDateString(field.value)}
          onChange={(date) => {
            field.onChange(formatDate(date));
          }}
          {...datePickerProps}
          slotProps={{
            ...datePickerProps.slotProps,
            textField: { ...datePickerProps.slotProps?.textField, id },
          }}
        />
      )}
    />
  );
}
