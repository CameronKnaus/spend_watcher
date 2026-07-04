import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen } from 'test/testUtils';
import CustomButton from './CustomButton';

describe('CustomButton', () => {
  it('calls onClick when enabled', async () => {
    const onClick = vi.fn();
    const { user } = renderWithProviders(<CustomButton onClick={onClick}>Submit</CustomButton>);

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('swallows the click when isDisabled', async () => {
    const onClick = vi.fn();
    const { user } = renderWithProviders(
      <CustomButton isDisabled onClick={onClick}>
        Submit
      </CustomButton>,
    );

    const button = screen.getByRole('button', { name: 'Submit' });
    expect(button).toBeDisabled();
    expect(button.className).toMatch(/disabled/);

    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
