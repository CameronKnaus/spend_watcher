import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import BottomSheet from 'Components/BottomSheet/BottomSheet';
import CustomButton from 'Components/CustomButton/CustomButton';
import FilterableSelect from 'Components/FormInputs/FilterableSelect/FilterableSelectController';
import useAccountCategoryList from 'Components/FormInputs/FilterableSelect/presetLists/useAccountCategoryList/useAccountCategoryList';
import MoneyInput from 'Components/FormInputs/MoneyInput/MoneyInput';
import PercentageInput from 'Components/FormInputs/PercentageInput/PercentageInput';
import SERVICE_ROUTES from 'Constants/ServiceRoutes';
import useContent from 'Hooks/useContent';
import { useForm } from 'react-hook-form';
import { AccountCategory, AddAccountRequestParams, addAccountRequestParamSchema } from 'Types/Services/accounts.model';
import styles from './AddAccountForm.module.css';

type AddAccountFormPropTypes = {
  onSubmit: () => void;
  onCancel: () => void;
};

export default function AddAccountForm({ onSubmit, onCancel }: AddAccountFormPropTypes) {
  const queryClient = useQueryClient();
  const accountCategoryList = useAccountCategoryList();
  const getContent = useContent('accounts');

  const addAccountService = useMutation({
    mutationKey: ['add-account'],
    mutationFn: (params: AddAccountRequestParams) => axios.post(SERVICE_ROUTES.postAddAccount, params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['accounts'],
      });
    },
  });

  const form = useForm<AddAccountRequestParams>({
    resolver: zodResolver(addAccountRequestParamSchema),
    mode: 'onChange', // Least performant but not a concern here
    defaultValues: {
      accountName: '',
      accountCategory: AccountCategory.CHECKING,
      isFixedRate: true,
    },
  });

  function handleCancel() {
    form.reset();
    onCancel();
  }

  async function handleSubmission(submission: AddAccountRequestParams) {
    await addAccountService.mutateAsync(submission);
    onSubmit();
  }

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
        <label>{getContent('startingAccountValueLabel')}</label>
        <MoneyInput
          isRequired
          control={form.control}
          trigger={form.trigger}
          name="startingAccountValue"
          placeholder={getContent('amountPlaceholder')}
          className={styles.textInput}
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
          isDisabled={!form.formState.isValid || addAccountService.isPending}
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
