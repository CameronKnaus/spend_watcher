import AccountForm from 'Components/AddAccountForm/AddAccountForm';
import SlideUpPanel from 'Components/SlideUpPanel/SlideUpPanel';
import useContent from 'Hooks/useContent';

type AddAccountPanelPropTypes = {
  isOpen: boolean;
  onPanelClose: () => void;
};

export default function AddAccountPanel({ isOpen, onPanelClose }: AddAccountPanelPropTypes) {
  const getContent = useContent('accounts');

  return (
    <SlideUpPanel
      isOpen={isOpen}
      title={getContent('addAccount')}
      tagColor="var(--token-color-semantic-addition)"
      handlePanelWillClose={onPanelClose}
    >
      <AccountForm onSubmit={onPanelClose} onCancel={onPanelClose} />
    </SlideUpPanel>
  );
}
