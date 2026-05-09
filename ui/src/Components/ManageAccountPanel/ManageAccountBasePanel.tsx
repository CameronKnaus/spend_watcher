import BottomSheet from 'Components/BottomSheet/BottomSheet';
import CustomButton from 'Components/CustomButton/CustomButton';
import PanelOptionButton from 'Components/SlideUpPanel/Addons/PanelOptionButton/PanelOptionButton';
import PanelOptionButtonContainer from 'Components/SlideUpPanel/Addons/PanelOptionButtonContainer/PanelOptionButtonContainer';
import useContent from 'Hooks/useContent';
import { FaEdit, FaHistory, FaTrashAlt } from 'react-icons/fa';
import { MdUpdateDisabled } from 'react-icons/md';
import { PanelTabs } from './ManageAccountPanel';

type ManageAccountBasePanelPropTypes = {
  setSelectedTab: (selectedTab: PanelTabs) => void;
  onClose: () => void;
};

export default function ManageAccountBasePanel({ setSelectedTab, onClose }: ManageAccountBasePanelPropTypes) {
  const getContent = useContent('accounts');

  return (
    <>
      <PanelOptionButtonContainer>
        <PanelOptionButton onClick={() => setSelectedTab(PanelTabs.EDIT_ACCOUNT)}>
          <FaEdit size={20} />
          {getContent('editAccountOption')}
        </PanelOptionButton>
        <PanelOptionButton onClick={() => setSelectedTab(PanelTabs.HISTORY)}>
          <FaHistory size={20} />
          {getContent('accountHistoryOption')}
        </PanelOptionButton>
        <PanelOptionButton onClick={() => setSelectedTab(PanelTabs.SET_INACTIVE)}>
          <MdUpdateDisabled size={20} />
          {getContent('setInactiveOption')}
        </PanelOptionButton>
        <PanelOptionButton onClick={() => setSelectedTab(PanelTabs.DELETE_ACCOUNT)}>
          <FaTrashAlt size={20} />
          {getContent('deleteAccountOption')}
        </PanelOptionButton>
      </PanelOptionButtonContainer>
      <BottomSheet>
        <CustomButton layout="full-width" variant="secondary" onClick={onClose}>
          {getContent('close')}
        </CustomButton>
      </BottomSheet>
    </>
  );
}
