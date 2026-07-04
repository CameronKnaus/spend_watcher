import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen } from 'test/testUtils';
import SpeedBump from './SpeedBump';

describe('SpeedBump', () => {
  const baseProps = {
    warningTitle: 'Permanently delete "Test Checking"',
    warningDescription: 'This will permanently delete this account and all of its data.',
    proceedText: 'Delete account',
  };

  it('bolds the final warning and uses the tertiary (destructive) proceed style when finalWarningText is set', async () => {
    const onProceed = vi.fn();
    const onCancel = vi.fn();
    const { container, user } = renderWithProviders(
      <SpeedBump
        {...baseProps}
        finalWarningText="This action cannot be undone."
        onProceed={onProceed}
        onCancel={onCancel}
      />,
    );

    const strong = container.querySelector('strong');
    expect(strong).toHaveTextContent('This action cannot be undone.');

    const proceed = screen.getByRole('button', { name: 'Delete account' });
    expect(proceed.className).toContain('tertiary');
    expect(proceed.className).not.toContain('primary');

    await user.click(proceed);
    expect(onProceed).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('uses the primary proceed style and no bold warning when finalWarningText is omitted', () => {
    const { container } = renderWithProviders(
      <SpeedBump {...baseProps} proceedText="Stop tracking" onProceed={vi.fn()} onCancel={vi.fn()} />,
    );

    expect(container.querySelector('strong')).toBeNull();
    const proceed = screen.getByRole('button', { name: 'Stop tracking' });
    expect(proceed.className).toContain('primary');
    expect(proceed.className).not.toContain('tertiary');
  });
});
