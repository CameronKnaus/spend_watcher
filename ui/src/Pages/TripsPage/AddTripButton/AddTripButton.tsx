import CustomButton from 'Components/CustomButton/CustomButton';
import TripFormPanel from 'Components/TripForm/TripFormPanel';
import useContent from 'Hooks/useContent';
import { useState } from 'react';
import styles from './AddTripButton.module.css';

export default function AddTripButton() {
  const getContent = useContent('trips');
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <>
      <CustomButton variant="primary" className={styles.addTripButton} onClick={() => setPanelOpen(true)}>
        {getContent('addTrip')}
      </CustomButton>
      <TripFormPanel isOpen={panelOpen} onPanelClose={() => setPanelOpen(false)} />
    </>
  );
}
