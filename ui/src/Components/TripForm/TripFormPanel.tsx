import SlideUpPanel from 'Components/SlideUpPanel/SlideUpPanel';
import createContentGetter from 'Content/createContentGetter';
import TripForm from './TripForm';

type TripFormPanelPropTypes = {
  isOpen: boolean;
  onPanelClose: () => void;
};

export default function TripFormPanel({ isOpen, onPanelClose }: TripFormPanelPropTypes) {
  const getContent = createContentGetter('trips');

  return (
    <SlideUpPanel
      isOpen={isOpen}
      title={getContent('newTrip')}
      tagColor="var(--token-color-semantic-addition)"
      handlePanelWillClose={onPanelClose}
    >
      <TripForm onSubmit={onPanelClose} onCancel={onPanelClose} />
    </SlideUpPanel>
  );
}
