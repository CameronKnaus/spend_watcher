import { describe, expect, it, vi } from 'vitest';
import { useForm } from 'react-hook-form';
import { renderWithProviders, screen } from 'test/testUtils';
import NumericInput from './NumericInput';

type CountForm = { count?: number };

// NumericInput is the base react-number-format wrapper that MoneyInput/PercentageInput
// specialize with a prefix/suffix; test it here bare, with no prefix or suffix.
function CountField({
  defaultValue,
  isRequired,
  onSubmit,
}: {
  defaultValue?: number;
  isRequired?: boolean;
  onSubmit?: (values: CountForm) => void;
}) {
  const form = useForm<CountForm>({ defaultValues: { count: defaultValue } });
  return (
    <form onSubmit={form.handleSubmit((values) => onSubmit?.(values))}>
      <NumericInput
        isRequired={isRequired}
        control={form.control}
        trigger={form.trigger}
        name="count"
        placeholder="0"
      />
      <button type="submit">Submit</button>
    </form>
  );
}

describe('NumericInput display', () => {
  it('shows the placeholder when no value is provided', () => {
    renderWithProviders(<CountField />);

    expect(screen.getByPlaceholderText('0')).toHaveValue('');
  });

  it('formats a provided default value with a thousand separator and fixed decimal scale', () => {
    renderWithProviders(<CountField defaultValue={1234.5} />);

    expect(screen.getByPlaceholderText('0')).toHaveValue('1,234.50');
  });
});

describe('NumericInput typing', () => {
  it('adds thousand separators and fixes the decimal scale at 2, with no prefix/suffix', async () => {
    const { user } = renderWithProviders(<CountField />);

    await user.type(screen.getByPlaceholderText('0'), '1234.5');

    expect(screen.getByPlaceholderText('0')).toHaveValue('1,234.50');
  });
});

describe('NumericInput form state', () => {
  it('submits the parsed float, not the formatted display string', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<CountField onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText('0'), '1234.5');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).toHaveBeenCalledWith({ count: 1234.5 });
  });
});

describe('NumericInput validation', () => {
  it('blocks submit while required and empty', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<CountField isRequired onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits once a value is typed', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<CountField isRequired onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText('0'), '10');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).toHaveBeenCalledWith({ count: 10 });
  });
});
