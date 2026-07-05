import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AccountCategory } from '@spend-watcher/contract';
import { captureRequests, http, HttpResponse, renderWithProviders, screen, server, within } from 'test/testUtils';
import { AccountWithStatus } from '@spend-watcher/contract';
import ManageAccountPanel from './ManageAccountPanel';

const BASE_ACCOUNT = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Test Checking',
  currentAccountValue: 5000,
  category: AccountCategory.CHECKING,
  isFixedRate: true,
  annualPercentageRate: 0,
  lastUpdated: '2026-06',
  requiresNewUpdate: false,
} satisfies AccountWithStatus;

function makeAccount(overrides: Partial<AccountWithStatus> = {}) {
  return { ...BASE_ACCOUNT, ...overrides };
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date(2026, 5, 15));
});

function renderPanel(accountOverrides: Partial<AccountWithStatus> = {}) {
  const account = makeAccount(accountOverrides);
  server.use(
    http.get('*/api/accounts/history', () =>
      HttpResponse.json({
        accountId: account.id,
        updateHistory: [{ date: '2026-06', amount: 5000, updateId: 1 }],
      }),
    ),
  );
  // Capture all mutations the panel can fire so the cancel flows can assert nothing was sent.
  const deletes = captureRequests('/api/accounts/delete');
  const setActives = captureRequests('/api/accounts/set-active');
  const edits = captureRequests('/api/accounts/edit');
  const onPanelClose = vi.fn();
  const utils = renderWithProviders(<ManageAccountPanel account={account} onPanelClose={onPanelClose} />);
  return { ...utils, account, onPanelClose, deletes, setActives, edits };
}

describe('ManageAccountPanel base view', () => {
  it('shows the manage title and the three management options', () => {
    renderPanel();

    expect(screen.getByRole('heading', { name: 'Manage Test Checking' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit account' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Stop tracking this account' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete account' })).toBeInTheDocument();
  });
});

describe('ManageAccountPanel tab navigation', () => {
  it('edit tab: cancel returns to the base view without any request', async () => {
    const { user, edits } = renderPanel();

    await user.click(screen.getByRole('button', { name: 'Edit account' }));
    expect(screen.getByRole('heading', { name: 'Edit Test Checking' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('heading', { name: 'Manage Test Checking' })).toBeInTheDocument();
    expect(edits).toHaveLength(0);
  });

  it('delete tab: the speed bump warns, and cancel backs out without a DELETE', async () => {
    const { user, deletes } = renderPanel();

    await user.click(screen.getByRole('button', { name: 'Delete account' }));
    expect(screen.getByText('Permanently delete "Test Checking"')).toBeInTheDocument();
    expect(screen.getByText(/permanently delete this account and all of its data/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('heading', { name: 'Manage Test Checking' })).toBeInTheDocument();
    expect(deletes).toHaveLength(0);
  });

  it('stop-tracking tab: the speed bump explains data is kept, and cancel sends nothing', async () => {
    const { user, setActives } = renderPanel();

    await user.click(screen.getByRole('button', { name: 'Stop tracking this account' }));
    expect(screen.getByText('Stop tracking "Test Checking"')).toBeInTheDocument();
    expect(screen.getByText(/This will not delete the account or its data/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('heading', { name: 'Manage Test Checking' })).toBeInTheDocument();
    expect(setActives).toHaveLength(0);
  });
});

describe('ManageAccountPanel update-required auto-open', () => {
  it('opens straight to the history tab when the account requires a new update', async () => {
    renderPanel({ requiresNewUpdate: true });

    expect(screen.getByRole('heading', { name: '"Test Checking" history' })).toBeInTheDocument();
    // The current-month history row is rendered from the (mocked) history response.
    const dialog = screen.getByRole('dialog');
    expect(await within(dialog).findByText('June 2026')).toBeInTheDocument();
  });
});
