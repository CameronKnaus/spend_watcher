import BottomSheet from 'Components/BottomSheet/BottomSheet';
import CustomButton from 'Components/CustomButton/CustomButton';
import EditSpendForm from 'Components/DiscretionarySpendForm/EditSpendForm';
import TripExpenseList from 'Components/TripExpenseList/TripExpenseList';
import useContent from 'Hooks/useContent';
import { Dispatch, SetStateAction, useState } from 'react';
import { DiscretionarySpendTransaction } from 'Types/Services/spending.model';
import { Trip } from 'Types/Services/trips.model';
import { TripPanelState } from '../TripDetailsPanel';
import styles from './TripDetails.module.css';

type TripDetailsPropTypes = {
  trip: Trip;
  dateLabel: string;
  setPanelState: Dispatch<SetStateAction<TripPanelState>>;
  onClose: () => void;
};

export default function TripDetails({ trip, dateLabel, setPanelState, onClose }: TripDetailsPropTypes) {
  const [transactionToEdit, setTransactionToEdit] = useState<DiscretionarySpendTransaction>();
  const getContent = useContent('trips');

  if (transactionToEdit) {
    return (
      <EditSpendForm
        transactionToEdit={transactionToEdit}
        onCancel={() => {
          setTransactionToEdit(undefined);
        }}
        onSubmit={() => {
          setTransactionToEdit(undefined);
        }}
      />
    );
  }

  return (
    <>
      <div className={styles.dateLabel}>{dateLabel}</div>
      <TripExpenseList tripId={trip.tripId} setTransactionToEdit={setTransactionToEdit} />
      <BottomSheet>
        <CustomButton layout="full-width" variant="secondary" onClick={onClose}>
          {getContent('close')}
        </CustomButton>
        <CustomButton
          layout="full-width"
          variant="primary"
          onClick={() => setPanelState(TripPanelState.editTripDetails)}
        >
          {getContent('editTripDetails')}
        </CustomButton>
      </BottomSheet>
    </>
  );
}
