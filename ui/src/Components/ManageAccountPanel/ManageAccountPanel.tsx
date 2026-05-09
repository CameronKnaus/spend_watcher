import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import AccountUpdateHistory from 'Components/AccountUpdateHistory/AccountUpdateHistory';
import EditAccountForm from 'Components/EditAccountForm/EditAccountForm';
import SpeedBump from 'Components/SlideUpPanel/Addons/SpeedBump/SpeedBump';
import SlideUpPanel from 'Components/SlideUpPanel/SlideUpPanel';
import SERVICE_ROUTES from 'Constants/ServiceRoutes';
import useContent from 'Hooks/useContent';
import { useEffect, useState } from 'react';
import {
  AccountWithStatus,
  DeleteAccountRequestParams,
  SetActiveAccountRequestParams,
} from 'Types/Services/accounts.model';
import ManageAccountBasePanel from './ManageAccountBasePanel';

type ManageAccountPanelPropTypes = {
  account: AccountWithStatus | null;
  onPanelClose: () => void;
};

export enum PanelTabs {
  BASE = 'BASE',
  EDIT_ACCOUNT = 'EDIT_ACCOUNT',
  SET_INACTIVE = 'SET_INACTIVE',
  HISTORY = 'HISTORY',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
}

export default function ManageAccountPanel({ account, onPanelClose }: ManageAccountPanelPropTypes) {
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState<PanelTabs>(PanelTabs.BASE);
  const getContent = useContent('accounts');

  useEffect(() => {
    if (!account) {
      return;
    }

    setSelectedTab(account.requiresNewUpdate ? PanelTabs.HISTORY : PanelTabs.BASE);
  }, [account]);

  function invalidateQueries() {
    queryClient.invalidateQueries({
      queryKey: ['accounts'],
    });
  }

  const activeStatusMutation = useMutation({
    mutationFn: (params: SetActiveAccountRequestParams) => axios.post(SERVICE_ROUTES.postSetActiveAccount, params),
    onSuccess: () => {
      invalidateQueries();
    },
    onError: () => {
      // TODO: Error handling
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: (params: DeleteAccountRequestParams) => axios.post(SERVICE_ROUTES.postDeleteAccount, params),
    onSuccess: () => {
      invalidateQueries();
    },
    onError: () => {
      // TODO: Error handling
    },
  });

  function onClose() {
    setSelectedTab(PanelTabs.BASE);
    onPanelClose();
  }

  function getTitle() {
    if (!account) {
      return '';
    }

    const { name } = account;
    const titleMapper = {
      [PanelTabs.BASE]: getContent('manageAccountHeader', [name]),
      [PanelTabs.EDIT_ACCOUNT]: getContent('editAccountHeader', [name]),
      [PanelTabs.SET_INACTIVE]: getContent('setInactiveHeader', [name]),
      [PanelTabs.HISTORY]: getContent('historyHeader', [name]),
      [PanelTabs.DELETE_ACCOUNT]: getContent('deleteAccountHeader'),
    };

    return titleMapper[selectedTab];
  }

  function tabRenderer() {
    if (!account) {
      return null;
    }

    switch (selectedTab) {
      case PanelTabs.BASE:
        return <ManageAccountBasePanel setSelectedTab={setSelectedTab} onClose={onClose} />;
      case PanelTabs.EDIT_ACCOUNT:
        return (
          <EditAccountForm accountToEdit={account} onSubmit={onClose} onCancel={() => setSelectedTab(PanelTabs.BASE)} />
        );
      case PanelTabs.SET_INACTIVE:
        return (
          <SpeedBump
            warningTitle={getContent('setAccountInactiveTitle', [account.name])}
            warningDescription={getContent('setAccountInactiveDescription')}
            proceedText={getContent('stopTrackingButton')}
            onCancel={() => setSelectedTab(PanelTabs.BASE)}
            onProceed={async () => {
              await activeStatusMutation.mutateAsync({
                accountId: account.id,
                isActive: false,
              });
              onClose();
            }}
          />
        );
      case PanelTabs.DELETE_ACCOUNT:
        return (
          <SpeedBump
            warningTitle={getContent('deleteAccountTitle', [account.name])}
            warningDescription={getContent('deleteAccountDescription')}
            proceedText={getContent('deleteAccountButton')}
            finalWarningText={getContent('deleteAccountFinalWarning')}
            onCancel={() => setSelectedTab(PanelTabs.BASE)}
            onProceed={async () => {
              await deleteAccountMutation.mutate({
                accountId: account.id,
              });
              onClose();
            }}
          />
        );
      case PanelTabs.HISTORY:
        return <AccountUpdateHistory accountId={account.id} onBack={() => setSelectedTab(PanelTabs.BASE)} />;
      default:
        return null;
    }
  }

  return (
    <SlideUpPanel
      title={getTitle()}
      isOpen={Boolean(account)}
      handlePanelWillClose={onClose}
      tagColor="var(--token-color-semantic-info)"
    >
      {tabRenderer()}
    </SlideUpPanel>
  );
}
