import AccountForm from 'Components/AddAccountForm/AddAccountForm';
import SlideUpPanel from 'Components/SlideUpPanel/SlideUpPanel';
import createContentGetter from 'Content/createContentGetter';

type AddAccountPanelPropTypes = {
  isOpen: boolean;
  onPanelClose: () => void;
};

export default function AddAccountPanel({ isOpen, onPanelClose }: AddAccountPanelPropTypes) {
  const getContent = createContentGetter('accounts');

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
