import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import BottomSheet from 'Components/BottomSheet/BottomSheet';
import CustomButton from 'Components/CustomButton/CustomButton';
import RecurringExpenseForm from 'Components/RecurringExpenseForm/RecurringExpenseForm';
import RecurringTransactionsList from 'Components/RecurringTransactionsList/RecurringTransactionsList';
import PanelOptionButton from 'Components/SlideUpPanel/Addons/PanelOptionButton/PanelOptionButton';
import PanelOptionButtonContainer from 'Components/SlideUpPanel/Addons/PanelOptionButtonContainer/PanelOptionButtonContainer';
import SpeedBump from 'Components/SlideUpPanel/Addons/SpeedBump/SpeedBump';
import SlideUpPanel from 'Components/SlideUpPanel/SlideUpPanel';
import SERVICE_ROUTES from 'Constants/ServiceRoutes';
import useContent from 'Hooks/useContent';
import { useEffect, useState } from 'react';
import { FaEdit, FaHistory, FaTrashAlt } from 'react-icons/fa';
import { MdUpdate, MdUpdateDisabled } from 'react-icons/md';
import {
  DeleteRecurringSpendRequestParams,
  RecurringSpendTransaction,
  SetActiveRecurringSpendRequestParams,
} from 'Types/Services/spending.model';
import styles from './ManageRecurringSpendPanel.module.css';

type ManageRecurringSpendPanelPropTypes = {
  recurringSpendTransaction?: RecurringSpendTransaction;
  closePanel: () => void;
};

enum ManageRecurringSpendPanels {
  base = 'base',
  edit = 'edit',
  setInactive = 'setInactive',
  setActive = 'setActive',
  delete = 'delete',
  history = 'history',
}

export default function ManageRecurringSpendPanel({
  recurringSpendTransaction,
  closePanel,
}: ManageRecurringSpendPanelPropTypes) {
  const getContent = useContent('recurringSpending');
  const getGeneralContent = useContent('general');
  const [currentPanelContents, setCurrentPanelContents] = useState(ManageRecurringSpendPanels.base);
  const queryClient = useQueryClient();

  function invalidateRecurring() {
    queryClient.invalidateQueries({
      queryKey: ['recurring'],
    });
    queryClient.invalidateQueries({
      queryKey: ['spending'],
    });
  }

  const deleteMutation = useMutation({
    mutationFn: (params: DeleteRecurringSpendRequestParams) =>
      axios.post(SERVICE_ROUTES.postDeleteRecurringSpend, params),
    onSuccess: () => {
      invalidateRecurring();
    },
    onError: () => {
      // TODO: Error handling
    },
  });
  const activeStatusMutation = useMutation({
    mutationFn: (params: SetActiveRecurringSpendRequestParams) =>
      axios.post(SERVICE_ROUTES.postUpdateRecurringSpendStatus, params),
    onSuccess: () => {
      invalidateRecurring();
    },
    onError: () => {
      // TODO: Error handling
    },
  });

  useEffect(() => {
    if (recurringSpendTransaction?.requiresMonthlyUpdate) {
      // Open straight to the history page to update transaction for the month
      setCurrentPanelContents(ManageRecurringSpendPanels.history);
    } else {
      returnToBase();
    }
  }, [recurringSpendTransaction]);

  function returnToBase() {
    setCurrentPanelContents(ManageRecurringSpendPanels.base);
  }

  function getTagTitle() {
    const spendName = recurringSpendTransaction?.recurringSpendName;
    if (!spendName) {
      return '';
    }

    if (currentPanelContents === ManageRecurringSpendPanels.edit) {
      return getContent('editingTransaction', [spendName]);
    }

    if (currentPanelContents === ManageRecurringSpendPanels.delete) {
      return getContent('deletingTransaction', [spendName]);
    }

    return spendName;
  }

  const panelIsSetActive = currentPanelContents === ManageRecurringSpendPanels.setActive;
  const panelIsChangingActiveStatus =
    panelIsSetActive || currentPanelContents === ManageRecurringSpendPanels.setInactive;
  return (
    <SlideUpPanel
      isOpen={Boolean(recurringSpendTransaction)}
      title={getTagTitle()}
      handlePanelWillClose={closePanel}
      tagColor="var(--token-color-semantic-expense)"
    >
      <>
        {currentPanelContents === ManageRecurringSpendPanels.base && (
          <>
            <h3 className={styles.header}>{getContent('chooseOption')}</h3>
            <PanelOptionButtonContainer>
              <PanelOptionButton onClick={() => setCurrentPanelContents(ManageRecurringSpendPanels.edit)}>
                <FaEdit size={20} />
                {getContent('edit')}
              </PanelOptionButton>
              <PanelOptionButton onClick={() => setCurrentPanelContents(ManageRecurringSpendPanels.history)}>
                <FaHistory size={20} />
                {getContent('transactionHistory')}
              </PanelOptionButton>
              <PanelOptionButton
                onClick={() =>
                  setCurrentPanelContents(
                    recurringSpendTransaction?.isActive
                      ? ManageRecurringSpendPanels.setInactive
                      : ManageRecurringSpendPanels.setActive,
                  )
                }
              >
                {recurringSpendTransaction?.isActive ? <MdUpdateDisabled size={20} /> : <MdUpdate size={20} />}
                {getContent(recurringSpendTransaction?.isActive ? 'markInactive' : 'markActive')}
              </PanelOptionButton>
              <PanelOptionButton onClick={() => setCurrentPanelContents(ManageRecurringSpendPanels.delete)}>
                <FaTrashAlt size={20} />
                {getContent('permanentlyDelete')}
              </PanelOptionButton>
            </PanelOptionButtonContainer>
            <BottomSheet>
              <CustomButton layout="full-width" variant="secondary" onClick={closePanel}>
                {getContent('cancel')}
              </CustomButton>
            </BottomSheet>
          </>
        )}
        {recurringSpendTransaction && currentPanelContents === ManageRecurringSpendPanels.history && (
          <RecurringTransactionsList
            recurringSpendTransaction={recurringSpendTransaction}
            onBack={() => setCurrentPanelContents(ManageRecurringSpendPanels.base)}
          />
        )}
        {currentPanelContents === ManageRecurringSpendPanels.edit && (
          <RecurringExpenseForm
            onCancel={returnToBase}
            onSubmit={closePanel}
            expenseToEdit={recurringSpendTransaction}
          />
        )}
        {recurringSpendTransaction && currentPanelContents === ManageRecurringSpendPanels.delete && (
          <SpeedBump
            warningTitle={getContent('deleteSpeedBumpHeader')}
            warningDescription={getContent('deleteSpeedBumpDescription', [
              recurringSpendTransaction.recurringSpendName,
            ])}
            proceedText={getGeneralContent('delete')}
            finalWarningText={getContent('finalDeletionWarning')}
            onCancel={returnToBase}
            onProceed={() => {
              deleteMutation.mutate({
                recurringSpendId: recurringSpendTransaction.recurringSpendId,
              });
              closePanel();
            }}
          />
        )}
        {recurringSpendTransaction && panelIsChangingActiveStatus && (
          <SpeedBump
            warningTitle={getContent(panelIsSetActive ? 'setActiveTitle' : 'setInactiveTitle')}
            warningDescription={getContent(panelIsSetActive ? 'setActiveDescription' : 'setInactiveDescription')}
            proceedText={getGeneralContent('confirm')}
            onCancel={returnToBase}
            onProceed={() => {
              activeStatusMutation.mutate({
                recurringSpendId: recurringSpendTransaction.recurringSpendId,
                isActive: panelIsSetActive,
              });
              closePanel();
            }}
          />
        )}
      </>
    </SlideUpPanel>
  );
}
