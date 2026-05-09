import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import BottomSheet from 'Components/BottomSheet/BottomSheet';
import CustomButton from 'Components/CustomButton/CustomButton';
import FilterableSelect from 'Components/FormInputs/FilterableSelect/FilterableSelectController';
import useAccountCategoryList from 'Components/FormInputs/FilterableSelect/presetLists/useAccountCategoryList/useAccountCategoryList';
import PercentageInput from 'Components/FormInputs/PercentageInput/PercentageInput';
import SERVICE_ROUTES from 'Constants/ServiceRoutes';
import useContent from 'Hooks/useContent';
import { useForm } from 'react-hook-form';
import {
  Account,
  AccountCategory,
  EditAccountDetailsRequestParams,
  editAccountDetailsRequestParamsSchema,
} from 'Types/Services/accounts.model';
import styles from './EditAccountForm.module.css';

type EditAccountFormPropTypes = {
  accountToEdit: Account;
  onSubmit: () => void;
  onCancel: () => void;
};

export default function EditAccountForm({ onSubmit, onCancel, accountToEdit }: EditAccountFormPropTypes) {
  const queryClient = useQueryClient();
  const accountCategoryList = useAccountCategoryList();
  const getContent = useContent('accounts');

  const editAccountService = useMutation({
    mutationKey: ['edit-account'],
    mutationFn: (params: EditAccountDetailsRequestParams) =>
      axios.post(SERVICE_ROUTES.postEditAccount, {
        ...params,
      }),
  });

  const form = useForm<EditAccountDetailsRequestParams>({
    resolver: zodResolver(editAccountDetailsRequestParamsSchema),
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
    queryClient.invalidateQueries({
      queryKey: ['accounts'],
    });
    onSubmit();
  }

  const formIsValidForSubmission = form.formState.isValid && !editAccountService.isPending && form.formState.isDirty;
  return (
    <>
      <form className={styles.form} onSubmit={form.handleSubmit(handleSubmission)}>
        <label>{getContent('accountNameLabel')}</label>
        <input
          className={styles.textInput}
          placeholder={getContent('accountNamePlaceholder')}
          autoComplete="off"
          {...form.register('accountName', { maxLength: 100, required: true })}
        />
        <label>{getContent('accountTypeLabel')}</label>
        <FilterableSelect
          control={form.control}
          name="accountCategory"
          className={styles.textInput}
          defaultValue={AccountCategory.CHECKING}
          optionsList={accountCategoryList}
        />
        <label>{getContent('annualGrowthRateLabel')}</label>
        <PercentageInput
          control={form.control}
          trigger={form.trigger}
          name="annualPercentageRate"
          placeholder={getContent('percentagePlaceholder')}
          className={styles.textInput}
        />
        <div className={styles.checkInputContainer}>
          <label aria-hidden>{getContent('fixedRateLabel')}</label>
          <input
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
