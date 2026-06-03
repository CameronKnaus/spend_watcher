import CustomButton from 'Components/CustomButton/CustomButton';
import MoneyInput from 'Components/FormInputs/MoneyInput/MoneyInput';
import SkeletonLoader from 'Components/Shared/SkeletonLoader';
import useContent from 'Hooks/useContent';
import { FieldValues, Path, SubmitHandler, UseFormReturn } from 'react-hook-form';
import { FaPencilAlt } from 'react-icons/fa';
import styles from './EditableAmountRow.module.css';

type EditableAmountRowPropTypes<TFieldValues extends FieldValues, TTransformedValues = TFieldValues> = {
  form: UseFormReturn<TFieldValues, any, TTransformedValues>;
  label: string;
  amountLabel: string;
  showConfirmButton: boolean;
  isLoading: boolean;
  amountFormFieldName: Path<TFieldValues>;
  amountPlaceholder?: string;
  onSubmission: SubmitHandler<TTransformedValues>;
};

export default function EditableAmountRow<TFieldValues extends FieldValues, TTransformedValues = TFieldValues>({
  form,
  label,
  amountLabel,
  showConfirmButton,
  isLoading,
  amountFormFieldName,
  amountPlaceholder = '',
  onSubmission,
}: EditableAmountRowPropTypes<TFieldValues, TTransformedValues>) {
  const getContent = useContent('general');

  return (
    <div className={styles.rowContainer}>
      <div className={styles.label}>{label}</div>
      <div>
        <label className={styles.amountLabel}>{amountLabel}</label>
        <div className={styles.moneyInputContainer}>
          <div className={styles.editIcon}>{!isLoading && <FaPencilAlt />}</div>
          <form onSubmit={form.handleSubmit(onSubmission)}>
            {isLoading ? (
              <SkeletonLoader style={{ height: 40, width: 200 }} />
            ) : (
              <MoneyInput
                isRequired
                className={styles.moneyInput}
                control={form.control}
                trigger={form.trigger}
                name={amountFormFieldName}
                placeholder={amountPlaceholder}
              />
            )}
          </form>
        </div>
        {showConfirmButton && (
          <CustomButton
            type="submit"
            variant="primary"
            className={styles.confirmChangeButton}
            layout="full-width"
            onClick={form.handleSubmit(onSubmission)}
            isDisabled={isLoading}
          >
            {getContent('confirmChange')}
          </CustomButton>
        )}
      </div>
    </div>
  );
}
