import { describe, expect, it, vi } from 'vitest';
import { useForm } from 'react-hook-form';
import { renderWithProviders, screen } from 'test/testUtils';
import MoneyInput from './MoneyInput';

type MoneyForm = { amount?: number };

// Mirrors how the app's forms wire MoneyInput into react-hook-form (see NewSpendForm, AddAccountForm).
function AmountField({
  defaultValue,
  isRequired,
  onSubmit,
}: {
  defaultValue?: number;
  isRequired?: boolean;
  onSubmit?: (values: MoneyForm) => void;
}) {
  const form = useForm<MoneyForm>({ defaultValues: { amount: defaultValue } });
  return (
    <form onSubmit={form.handleSubmit((values) => onSubmit?.(values))}>
      <MoneyInput
        isRequired={isRequired}
        control={form.control}
        trigger={form.trigger}
        name="amount"
        placeholder="$0.00"
      />
      <button type="submit">Submit</button>
    </form>
  );
}

describe('MoneyInput display', () => {
  it('shows the placeholder when no value is provided', () => {
    renderWithProviders(<AmountField />);

    expect(screen.getByPlaceholderText('$0.00')).toHaveValue('');
  });

  it('formats a provided default value as currency', () => {
    renderWithProviders(<AmountField defaultValue={99.5} />);

    expect(screen.getByPlaceholderText('$0.00')).toHaveValue('$99.50');
  });
});

describe('MoneyInput typing', () => {
  it('prefixes with $, adds thousand separators, and fixes the decimal scale at 2', async () => {
    const { user } = renderWithProviders(<AmountField />);

    await user.type(screen.getByPlaceholderText('$0.00'), '1234.5');

    expect(screen.getByPlaceholderText('$0.00')).toHaveValue('$1,234.50');
  });
});

describe('MoneyInput form state', () => {
  it('submits the parsed float, not the formatted display string', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<AmountField onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText('$0.00'), '1234.5');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).toHaveBeenCalledWith({ amount: 1234.5 });
  });

  it('clearing the field submits undefined rather than a stale value', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<AmountField defaultValue={5} onSubmit={onSubmit} />);

    await user.clear(screen.getByPlaceholderText('$0.00'));
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).toHaveBeenCalledWith({ amount: undefined });
  });
});

describe('MoneyInput validation', () => {
  it('blocks submit while required and empty', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<AmountField isRequired onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits once a value is typed', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<AmountField isRequired onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText('$0.00'), '10');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).toHaveBeenCalledWith({ amount: 10 });
  });
});
