import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from 'apiClient/orpc';
import BottomSheet from 'Components/BottomSheet/BottomSheet';
import CustomButton from 'Components/CustomButton/CustomButton';
import FilterableSelect from 'Components/FormInputs/FilterableSelect/FilterableSelectController';
import useAccountCategoryList from 'Components/FormInputs/FilterableSelect/presetLists/useAccountCategoryList/useAccountCategoryList';
import PercentageInput from 'Components/FormInputs/PercentageInput/PercentageInput';
import createContentGetter from 'Content/createContentGetter';
import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { AccountCategory, accountEditInputSchema, AccountWithStatus, AppInputs } from '@spend-watcher/contract';
import styles from './EditAccountForm.module.css';

type EditAccountDetailsRequestParams = AppInputs['accounts']['edit'];

type EditAccountFormPropTypes = {
  accountToEdit: AccountWithStatus;
  onSubmit: () => void;
  onCancel: () => void;
};

export default function EditAccountForm({ onSubmit, onCancel, accountToEdit }: EditAccountFormPropTypes) {
  const queryClient = useQueryClient();
  const accountCategoryList = useAccountCategoryList();
  const getContent = createContentGetter('accounts');
  const id = useId();
  const nameId = `${id}-accountName`;
  const categoryId = `${id}-accountCategory`;
  const rateId = `${id}-annualPercentageRate`;
  const fixedRateId = `${id}-isFixedRate`;

  const editAccountService = useMutation(orpc.accounts.edit.mutationOptions());

  const form = useForm<EditAccountDetailsRequestParams>({
    resolver: zodResolver(accountEditInputSchema),
    mode: 'onChange', // Least performant but not a concern here
    defaultValues: {
      accountName: accountToEdit.name,
      accountCategory: accountToEdit.category,
      isFixedRate: accountToEdit.isFixedRate,
      annualPercentageRate: accountToEdit.annualPercentageRate,
      accountId: accountToEdit.id,
    },
  });

  function handleCancel() {
    form.reset();
    onCancel();
  }

  async function handleSubmission(submission: EditAccountDetailsRequestParams) {
    await editAccountService.mutateAsync(submission);
    queryClient.invalidateQueries({ queryKey: orpc.accounts.key() });
    onSubmit();
  }

  const formIsValidForSubmission = form.formState.isValid && !editAccountService.isPending && form.formState.isDirty;
  return (
    <>
      <form className={styles.form} onSubmit={form.handleSubmit(handleSubmission)}>
        <label htmlFor={nameId}>{getContent('accountNameLabel')}</label>
        <input
          id={nameId}
          className={styles.textInput}
          placeholder={getContent('accountNamePlaceholder')}
          autoComplete="off"
          {...form.register('accountName', { maxLength: 50, required: true })}
        />
        <label htmlFor={categoryId}>{getContent('accountTypeLabel')}</label>
        <FilterableSelect
          id={categoryId}
          control={form.control}
          name="accountCategory"
          className={styles.textInput}
          defaultValue={AccountCategory.CHECKING}
          optionsList={accountCategoryList}
        />
        <label htmlFor={rateId}>{getContent('annualGrowthRateLabel')}</label>
        <PercentageInput
          id={rateId}
          control={form.control}
          trigger={form.trigger}
          name="annualPercentageRate"
          placeholder={getContent('percentagePlaceholder')}
          className={styles.textInput}
        />
        <div className={styles.checkInputContainer}>
          <label htmlFor={fixedRateId}>{getContent('fixedRateLabel')}</label>
          <input
            id={fixedRateId}
            className={styles.checkBox}
            type="checkbox"
            {...form.register('isFixedRate')}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </form>
      <BottomSheet>
        <CustomButton variant="secondary" onClick={handleCancel} layout="full-width">
          {getContent('cancel')}
        </CustomButton>
        <CustomButton
          isDisabled={!formIsValidForSubmission}
          variant="primary"
          onClick={form.handleSubmit(handleSubmission)}
          layout="full-width"
        >
          {getContent('submit')}
        </CustomButton>
      </BottomSheet>
    </>
  );
}
