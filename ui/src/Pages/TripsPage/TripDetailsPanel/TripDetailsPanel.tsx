import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import SpeedBump from 'Components/SlideUpPanel/Addons/SpeedBump/SpeedBump';
import SlideUpPanel from 'Components/SlideUpPanel/SlideUpPanel';
import TripForm from 'Components/TripForm/TripForm';
import SERVICE_ROUTES from 'Constants/ServiceRoutes';
import useContent from 'Hooks/useContent';
import { useState } from 'react';
import { Trip } from 'Types/Services/trips.model';
import TripDetails from './TripDetails/TripDetails';

type TripDetailsPanelPropTypes = {
  trip: Trip;
  dateLabel: string;
  isOpen: boolean;
  onClose: () => void;
};

export enum TripPanelState {
  base = 'base',
  editTripDetails = 'editTripDetails',
  editTransaction = 'editTransaction',
  deleteTrip = 'deleteTrip',
}

export default function TripDetailsPanel({ trip, isOpen, dateLabel, onClose }: TripDetailsPanelPropTypes) {
  const queryClient = useQueryClient();
  const [panelState, setPanelState] = useState(TripPanelState.base);
  const getContent = useContent('trips');
  const getGeneralContent = useContent('general');

  const deleteMutation = useMutation({
    mutationFn: () =>
      axios.post(SERVICE_ROUTES.postDeleteTrip, {
        tripId: trip.tripId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['trips'],
      });
    },
    onError: () => {
      // TODO: Error handling
    },
  });

  function getPanelTitle() {
    if (panelState === TripPanelState.deleteTrip) {
      return getContent('deleteTrip', [trip.tripName]);
    }

    if (panelState === TripPanelState.editTripDetails) {
      return getContent('editTripDetails');
    }

    if (panelState === TripPanelState.editTransaction) {
      return getContent('editTransaction');
    }

    return trip.tripName;
  }

  function getTagColor() {
    if (panelState === TripPanelState.deleteTrip) {
      return 'var(--token-color-semantic-danger)';
    }

    if (panelState === TripPanelState.editTripDetails) {
      return 'var(--token-color-semantic-info)';
    }

    if (panelState === TripPanelState.editTransaction) {
      return 'var(--token-color-semantic-expense)';
    }

    return 'var(--token-color-semantic-info)';
  }

  function returnToBasePage() {
    setPanelState(TripPanelState.base);
  }

  return (
    <SlideUpPanel
      isOpen={isOpen}
      title={getPanelTitle()}
      tagColor={getTagColor()}
      handlePanelWillClose={() => {
        returnToBasePage();
        onClose();
      }}
    >
      {panelState === TripPanelState.base && (
        <TripDetails trip={trip} dateLabel={dateLabel} setPanelState={setPanelState} onClose={onClose} />
      )}
      {panelState === TripPanelState.editTripDetails && (
        <TripForm
          onSubmit={returnToBasePage}
          onCancel={returnToBasePage}
          onDelete={() => setPanelState(TripPanelState.deleteTrip)}
          tripToEdit={trip}
        />
      )}
      {panelState === TripPanelState.deleteTrip && (
        <SpeedBump
          warningTitle={getContent('deleteSpeedBumpHeader')}
          warningDescription={getContent('deleteSpeedBumpDescription')}
          proceedText={getGeneralContent('confirm')}
          onCancel={() => {
            setPanelState(TripPanelState.editTripDetails);
          }}
          onProceed={() => {
            deleteMutation.mutate();
            onClose();
          }}
        />
      )}
    </SlideUpPanel>
  );
}
