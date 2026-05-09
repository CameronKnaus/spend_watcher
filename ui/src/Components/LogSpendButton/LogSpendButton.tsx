import CustomButton from 'Components/CustomButton/CustomButton';
import DiscretionarySpendPanel from 'Components/DiscretionarySpendForm/DiscretionarySpendPanel';
import useContent from 'Hooks/useContent';
import { useState } from 'react';
import styles from './LogSpendButton.module.css';

export default function LogSpendButton() {
  const [logExpensePanelOpen, setLogExpensePanelOpen] = useState(false);
  const getTransactionContent = useContent('transactions');

  return (
    <>
      <CustomButton
        variant="tertiary"
        layout="full-width"
        onClick={() => {
          setLogExpensePanelOpen(true);
        }}
        className={styles.logExpenseButton}
      >
        {getTransactionContent('logExpense')}
      </CustomButton>
      <DiscretionarySpendPanel onPanelClose={() => setLogExpensePanelOpen(false)} isOpen={logExpensePanelOpen} />
    </>
  );
}
