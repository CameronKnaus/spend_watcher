import { ComponentProps } from 'react';
import { Control, Controller, FieldValues, Path, UseFormTrigger } from 'react-hook-form';
import { NumericFormat } from 'react-number-format';

type NumericFormatWithoutEssentialAttributes = Omit<ComponentProps<typeof NumericFormat>, 'onChange' | 'value'>;

export type NumericInputPropTypes<TFieldValues extends FieldValues, TTransformedValues = TFieldValues> = {
  control: Control<TFieldValues, any, TTransformedValues>;
  // react-number-format NumericFormat component isn't playing nice with react-hook-form
  // Validation isn't occurring onChange, only onBlur
  // Grabbing the trigger method from the form context to force validation on change
  trigger: UseFormTrigger<TFieldValues>;
  name: Path<TFieldValues>;
  isRequired?: boolean;
} & NumericFormatWithoutEssentialAttributes;

export default function NumericInput<TFieldValues extends FieldValues, TTransformedValues = TFieldValues>({
  control,
  trigger,
  name,
  isRequired = false,
  ...props
}: NumericInputPropTypes<TFieldValues, TTransformedValues>) {
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
