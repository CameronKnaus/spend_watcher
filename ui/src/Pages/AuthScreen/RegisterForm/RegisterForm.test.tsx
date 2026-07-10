import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen } from 'test/testUtils';
import RegisterForm from './RegisterForm';

function renderForm() {
  const switchToLogin = vi.fn();
  const utils = renderWithProviders(<RegisterForm switchToLogin={switchToLogin} />);
  return { ...utils, switchToLogin };
}

describe('RegisterForm', () => {
  it('switches to the login form via the Login button', async () => {
    const { user, switchToLogin } = renderForm();

    await user.click(screen.getByRole('button', { name: 'Login' }));

    expect(switchToLogin).toHaveBeenCalledTimes(1);
  });

  it('associates the username and password labels with their inputs via htmlFor/id', () => {
    renderForm();

    expect(screen.getByLabelText('Username')).toBe(screen.getByPlaceholderText('Username'));
    expect(screen.getByLabelText('Password')).toBe(screen.getByPlaceholderText('Password'));
  });
});
