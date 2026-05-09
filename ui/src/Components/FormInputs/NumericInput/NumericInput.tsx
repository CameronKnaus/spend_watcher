import { ComponentProps } from 'react';
import { Control, Controller, FieldValues, Path, UseFormTrigger } from 'react-hook-form';
import { NumericFormat } from 'react-number-format';

type NumericFormatWithoutEssentialAttributes = Omit<ComponentProps<typeof NumericFormat>, 'onChange' | 'value'>;

export type NumericInputPropTypes<T extends FieldValues> = {
  control: Control<T>;
  // react-number-format NumericFormat component isn't playing nice with react-hook-form
  // Validation isn't occurring onChange, only onBlur
  // Grabbing the trigger method from the form context to force validation on change
  trigger: UseFormTrigger<T>;
  name: Path<T>;
  isRequired?: boolean;
} & NumericFormatWithoutEssentialAttributes;

export default function NumericInput<T extends FieldValues>({
  control,
  trigger,
  name,
  isRequired = false,
  ...props
}: NumericInputPropTypes<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={{ required: isRequired }}
      render={({ field: { ref, onChange, value, ...rest } }) => (
        <NumericFormat
          fixedDecimalScale
          inputMode="decimal"
          thousandSeparator=","
          decimalSeparator="."
          decimalScale={2}
          getInputRef={ref}
          autoComplete="off"
          value={value ?? ''}
          onValueChange={({ floatValue }) => {
            onChange(floatValue);
            trigger(name);
          }}
          {...props}
          {...rest}
        />
      )}
    />
  );
}
