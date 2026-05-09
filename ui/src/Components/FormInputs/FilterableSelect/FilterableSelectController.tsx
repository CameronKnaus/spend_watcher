import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import FilterableSelect, { FilterableSelectPropTypes } from './FilterableSelect';

type CompWithoutEssentialAttributes<TOptionName> = Omit<
  FilterableSelectPropTypes<TOptionName>,
  'ref' | 'value' | 'onChange' | 'onBlur'
>;

type FilterableSelectControllerPropTypes<TOptionName extends string, KFormControl extends FieldValues> = {
  name: Path<KFormControl>;
  control: Control<KFormControl>;
} & CompWithoutEssentialAttributes<TOptionName>;

// This is a wrapper to use FilterableSelect with react-hook-form.
export default function FilterableSelectController<TOptionName extends string, KFormControl extends FieldValues>({
  control,
  name,
  ...filterSelectProps
}: FilterableSelectControllerPropTypes<TOptionName, KFormControl>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => <FilterableSelect {...field} {...filterSelectProps} />}
    />
  );
}
