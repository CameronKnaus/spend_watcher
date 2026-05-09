import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import BottomSheet from 'Components/BottomSheet/BottomSheet';
import CustomButton from 'Components/CustomButton/CustomButton';
import FilterableSelect from 'Components/FormInputs/FilterableSelect/FilterableSelectController';
import useSpendCategoryList from 'Components/FormInputs/FilterableSelect/presetLists/useSpendCategoryList/useSpendCategoryList';
import MoneyInput from 'Components/FormInputs/MoneyInput/MoneyInput';
import SERVICE_ROUTES from 'Constants/ServiceRoutes';
import useContent from 'Hooks/useContent';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  AddRecurringSpendRequestParams,
  EditRecurringSpendRequestParams,
  RecurringSpendTransaction,
  v1AddRecurringSpendSchema,
} from 'Types/Services/spending.model';
import { SpendingCategory } from 'Types/SpendingCategory';
import styles from './RecurringExpenseForm.module.css';

type RecurringExpenseFormPropTypes = {
  onSubmit: () => void;
  onCancel: () => void;
  expenseToEdit?: RecurringSpendTransaction;
};

export default function RecurringExpenseForm({ onCancel, onSubmit, expenseToEdit }: RecurringExpenseFormPropTypes) {
  const getContent = useContent('recurringSpending');
  const getGeneralContent = useContent('general');
  const spendingCategoryList = useSpendCategoryList();
  const queryClient = useQueryClient();

  const form = useForm<AddRecurringSpendRequestParams>({
    resolver: zodResolver(v1AddRecurringSpendSchema),
    mode: 'onChange',
    defaultValues: {
      isVariableRecurring: false,
      category: SpendingCategory.OTHER,
    },
  });

  const editRecurringMutation = useMutation({
    mutationFn: (params: EditRecurringSpendRequestParams) => {
      return axios.post(SERVICE_ROUTES.postEditRecurringSpend, params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['recurring'],
      });
    },
    onError: () => {
      // TODO: Error handling
    },
  });

  const addRecurringMutation = useMutation({
    mutationFn: (params: AddRecurringSpendRequestParams) => axios.post(SERVICE_ROUTES.postAddRecurringSpend, params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['recurring'],
      });
      queryClient.invalidateQueries({
        queryKey: ['spending'],
      });
    },
    onError: () => {
      // TODO: Error handling
    },
  });

  useEffect(() => {
    form.reset(expenseToEdit);
  }, [expenseToEdit, form]);

  function handleCancel() {
    form.reset();
    onCancel();
  }

  function handleSubmit(submission: AddRecurringSpendRequestParams) {
    if (expenseToEdit) {
      // Edit mode
      editRecurringMutation.mutate({ ...submission, recurringSpendId: expenseToEdit.recurringSpendId });
    } else {
      addRecurringMutation.mutate(submission);
    }
    form.reset();
    onSubmit();
  }

  // If editing a transaction: disable the button if the form is not dirty. If new transaction: disable if form is not valid
  const confirmButtonDisabled = expenseToEdit
    ? !form.formState.isDirty || !form.formState.isValid
    : !form.formState.isValid;
  return (
    <>
      <form className={styles.newRecurringSpendForm} onSubmit={form.handleSubmit(handleSubmit)}>
        {/* Expense name */}
        <label>{getContent('recurringSpendName')}</label>
        <input
          className={styles.textInput}
          placeholder={getContent('newSpendNamePlaceholder')}
          autoComplete="off"
          {...form.register('recurringSpendName', { required: true, maxLength: 60 })}
        />

        {/* Spend category */}
        <label>{getContent('categoryLabel')}</label>
        <FilterableSelect
          control={form.control}
          name="category"
          className={styles.textInput}
          defaultValue={SpendingCategory.OTHER}
          optionsList={spendingCategoryList}
        />

        {/* Is variable expense */}
        {/* TODO: Fix this so the touching anywhere on container updates checked status AND validates */}
        <div className={styles.checkInputContainer}>
          <input
            className={styles.checkBox}
            type="checkbox"
            aria-label={`${getContent('variableExpenseLabel')}. ${getContent('variableExpenseDescription')}`}
            {...form.register('isVariableRecurring')}
            onClick={(e) => e.stopPropagation()}
          />
          <label aria-hidden>{getContent('variableExpenseLabel')}</label>
          <span className={styles.varyingDescription}>{getContent('variableExpenseDescription')}</span>
        </div>

        {/* Monthly amount */}
        <label>
          {getContent(form.watch('isVariableRecurring') ? 'monthlyAmountVariesLabel' : 'monthlyAmountLabel')}
        </label>
        <MoneyInput
          isRequired
          control={form.control}
          trigger={form.trigger}
          name="expectedMonthlyAmount"
          placeholder={getContent('monthlyAmountPlaceholder')}
          className={styles.textInput}
        />
      </form>
      <BottomSheet>
        <CustomButton variant="secondary" onClick={handleCancel} layout="full-width">
          {getGeneralContent('cancel')}
        </CustomButton>
        <CustomButton
          isDisabled={confirmButtonDisabled}
          variant="primary"
          onClick={form.handleSubmit(handleSubmit)}
          layout="full-width"
        >
          {getGeneralContent('submit')}
        </CustomButton>
      </BottomSheet>
    </>
  );
}
