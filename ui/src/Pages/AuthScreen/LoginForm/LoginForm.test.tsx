import { afterEach, describe, expect, it, vi } from 'vitest';
import { captureRequests, http, HttpResponse, renderWithProviders, screen, server, waitFor } from 'test/testUtils';
import { createQueryClient } from 'queryClient';
import { clearAllToasts } from 'Util/Toast/toastStore';
import ToastContainer from 'Util/Toast/ToastContainer';
import LoginForm from './LoginForm';

function renderForm() {
  const switchToRegister = vi.fn();
  const logins = captureRequests('/api/auth/login');
  const utils = renderWithProviders(<LoginForm switchToRegister={switchToRegister} />);
  return { ...utils, switchToRegister, logins };
}

describe('LoginForm', () => {
  it('blocks submit while the username is too short', async () => {
    const { user, logins } = renderForm();

    await user.type(screen.getByPlaceholderText('Username'), 'short');
    await user.type(screen.getByPlaceholderText('Password'), 'aValidPassword1');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(logins).toHaveLength(0);
  });

  it('POSTs the credentials when the form is valid', async () => {
    const { user, logins } = renderForm();

    await user.type(screen.getByPlaceholderText('Username'), 'e2euser_abc');
    await user.type(screen.getByPlaceholderText('Password'), 'aValidPassword1');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(logins).toHaveLength(1);
      expect(logins[0].body).toMatchObject({ username: 'e2euser_abc', password: 'aValidPassword1' });
    });
  });

  it('switches to the register form via the Register button', async () => {
    const { user, switchToRegister, logins } = renderForm();

    await user.click(screen.getByRole('button', { name: 'Register' }));

    expect(switchToRegister).toHaveBeenCalledTimes(1);
    expect(logins).toHaveLength(0);
  });
});

describe('LoginForm failed login', () => {
  afterEach(() => {
    // The toast store is module-scoped and outlives this test, so clear it explicitly.
    clearAllToasts();
  });

  it('shows the inline credentials message and suppresses the global error toast', async () => {
    server.use(http.post('*/api/auth/login', () => HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })));
    const switchToRegister = vi.fn();
    // The app's real QueryClient, since this is exercising the production
    // `meta.suppressGlobalError` opt-out rather than a form-local concern.
    const { user } = renderWithProviders(
      <>
        <ToastContainer />
        <LoginForm switchToRegister={switchToRegister} />
      </>,
      { queryClient: createQueryClient() },
    );

    await user.type(screen.getByPlaceholderText('Username'), 'e2euser_abc');
    await user.type(screen.getByPlaceholderText('Password'), 'aWrongPassword1');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByText('Check your username and password and try again.')).toBeInTheDocument();
    expect(screen.queryByText("Couldn't save your changes")).not.toBeInTheDocument();
  });
});
