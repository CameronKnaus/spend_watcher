import SlideUpPanel from 'Components/SlideUpPanel/SlideUpPanel';
import useContent from 'Hooks/useContent';
import { DiscretionarySpendTransaction } from 'Types/Services/spending.model';
import EditSpendForm from './EditSpendForm';
import NewSpendForm from './NewSpendForm';

type DiscretionarySpendPanelPropTypes = {
  isOpen: boolean;
  onPanelClose: () => void;
  transactionToEdit?: DiscretionarySpendTransaction;
};

export default function DiscretionarySpendPanel({
  isOpen,
  onPanelClose,
  // If transactionToEdit is provided, the panel will be in edit mode
  transactionToEdit,
}: DiscretionarySpendPanelPropTypes) {
  const editMode = Boolean(transactionToEdit);
  const getContent = useContent('transactions');

  return (
    <SlideUpPanel
      isOpen={isOpen}
      title={getContent(editMode ? 'editExpense' : 'newExpense')}
      tagColor="var(--token-color-semantic-expense)"
      handlePanelWillClose={onPanelClose}
    >
      {transactionToEdit ? (
        <EditSpendForm transactionToEdit={transactionToEdit} onCancel={onPanelClose} onSubmit={onPanelClose} />
      ) : (
        <NewSpendForm onCancel={onPanelClose} onSubmit={onPanelClose} />
      )}
    </SlideUpPanel>
  );
}
