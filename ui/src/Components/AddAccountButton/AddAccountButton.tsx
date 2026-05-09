import CustomButton from 'Components/CustomButton/CustomButton';
import useContent from 'Hooks/useContent';
import { useState } from 'react';
import styles from './AddAccountButton.module.css';
import AddAccountPanel from './AddAccountPanel';

export default function AddAccountButton() {
  const getContent = useContent('accounts');
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <>
      <CustomButton
        variant="secondary"
        layout="full-width"
        onClick={() => {
          setPanelOpen(true);
        }}
        className={styles.addAccountButton}
      >
        {getContent('addAccount')}
      </CustomButton>
      <AddAccountPanel isOpen={panelOpen} onPanelClose={() => setPanelOpen(false)} />
    </>
  );
}
