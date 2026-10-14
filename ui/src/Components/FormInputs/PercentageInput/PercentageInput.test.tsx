import { describe, expect, it, vi } from 'vitest';
import { useForm } from 'react-hook-form';
import { renderWithProviders, screen } from 'test/testUtils';
import PercentageInput from './PercentageInput';

type RateForm = { rate?: number };

// Mirrors AddAccountForm's annualPercentageRate field.
function RateField({
  defaultValue,
  isRequired,
  onSubmit,
}: {
  defaultValue?: number;
  isRequired?: boolean;
  onSubmit?: (values: RateForm) => void;
}) {
  const form = useForm<RateForm>({ defaultValues: { rate: defaultValue } });
  return (
    <form onSubmit={form.handleSubmit((values) => onSubmit?.(values))}>
      <PercentageInput
        isRequired={isRequired}
        control={form.control}
        trigger={form.trigger}
        name="rate"
        placeholder="0%"
      />
      <button type="submit">Submit</button>
    </form>
  );
}

describe('PercentageInput display', () => {
  it('shows the placeholder when no value is provided', () => {
    renderWithProviders(<RateField />);

    expect(screen.getByPlaceholderText('0%')).toHaveValue('');
  });

  it('suffixes a provided default value with %', () => {
    renderWithProviders(<RateField defaultValue={4.25} />);

    expect(screen.getByPlaceholderText('0%')).toHaveValue('4.25%');
  });
});

describe('PercentageInput typing', () => {
  it('suffixes with % and fixes the decimal scale at 2', async () => {
    const { user } = renderWithProviders(<RateField />);

    await user.type(screen.getByPlaceholderText('0%'), '12.5');

    expect(screen.getByPlaceholderText('0%')).toHaveValue('12.50%');
  });
});

describe('PercentageInput form state', () => {
  it('submits the parsed float, not the formatted display string', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<RateField onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText('0%'), '12.5');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).toHaveBeenCalledWith({ rate: 12.5 });
  });
});

describe('PercentageInput validation', () => {
  it('blocks submit while required and empty', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<RateField isRequired onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits once a value is typed', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<RateField isRequired onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText('0%'), '5');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).toHaveBeenCalledWith({ rate: 5 });
  });
});
