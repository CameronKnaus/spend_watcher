import { FieldValues } from 'react-hook-form';
import NumericInput, { NumericInputPropTypes } from '../NumericInput/NumericInput';

export default function MoneyInput<TFieldValues extends FieldValues, TTransformedValues = TFieldValues>(
  props: NumericInputPropTypes<TFieldValues, TTransformedValues>,
) {
  return <NumericInput {...props} prefix="$" />;
}
