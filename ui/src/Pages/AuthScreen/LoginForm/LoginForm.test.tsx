import { describe, expect, it, vi } from 'vitest';
import { captureRequests, renderWithProviders, screen, waitFor } from 'test/testUtils';
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
