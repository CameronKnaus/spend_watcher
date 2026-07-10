import { describe, expect, it, vi } from 'vitest';
import { useForm } from 'react-hook-form';
import { FormEvent } from 'react';
import { renderWithProviders, screen } from 'test/testUtils';
import FilterableSelectController from './FilterableSelectController';

const FRUIT_OPTIONS = [
  { value: 'APPLE', optionName: 'Apple' },
  { value: 'APRICOT', optionName: 'Apricot' },
  { value: 'BANANA', optionName: 'Banana' },
];

type FruitForm = { fruit?: string };

// Minimal consumer mirroring how the app's forms wire the select into react-hook-form.
function FruitPicker({ defaultValue, onLatestValue }: { defaultValue?: string; onLatestValue?: (v: unknown) => void }) {
  const form = useForm<FruitForm>();
  onLatestValue?.(form.watch('fruit'));
  return (
    <FilterableSelectController
      control={form.control}
      name="fruit"
      defaultValue={defaultValue}
      noSelectionText="Pick a fruit"
      clearLabel="Clear selection"
      optionsList={FRUIT_OPTIONS}
    />
  );
}

describe('FilterableSelect filtering', () => {
  it('narrows the option list case-insensitively as the user types', async () => {
    const { user } = renderWithProviders(<FruitPicker />);

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();

    await user.type(screen.getByRole('combobox'), 'ap');
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Apricot')).toBeInTheDocument();
    expect(screen.queryByText('Banana')).not.toBeInTheDocument();
  });

  it('selects the clicked option and stores its value', async () => {
    let latest: unknown;
    const { user } = renderWithProviders(<FruitPicker onLatestValue={(v) => (latest = v)} />);

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Banana'));

    expect(latest).toBe('BANANA');
    expect(screen.getByRole('combobox')).toHaveValue('Banana');
    // Note: the list does NOT close on selection — the component's document-level click listener
    // sees the option click as inside the popover and keeps it open; dismissal happens on the next
    // outside click (covered below). A UX nit worth a look, pinned here so a fix updates this test.
    expect(screen.getByText('Apple')).toBeInTheDocument();
  });

  it('closes the option list when clicking outside the select', async () => {
    const { user } = renderWithProviders(
      <div>
        <FruitPicker />
        <button>elsewhere</button>
      </div>,
    );

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByText('Apple')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'elsewhere' }));
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
  });
});

describe('FilterableSelect clearing', () => {
  it("clears the field to the '' sentinel and shows the placeholder again", async () => {
    let latest: unknown;
    const { user } = renderWithProviders(<FruitPicker onLatestValue={(v) => (latest = v)} />);

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Apple'));
    expect(screen.getByRole('combobox')).toHaveValue('Apple');

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Clear selection'));

    // '' (not undefined) on purpose: a nullish value would make react-hook-form fall back to the
    // field's defaultValue and keep displaying the old selection. Consumers' schemas convert ''
    // back to undefined before submit.
    expect(latest).toBe('');
    expect(screen.getByRole('combobox')).toHaveValue('');
    expect(screen.getByRole('combobox')).toHaveAttribute('placeholder', 'Pick a fruit');
  });
});

describe('FilterableSelect keyboard navigation', () => {
  it('opens on ArrowDown, moves the highlight, and selects the active option on Enter', async () => {
    let latest: unknown;
    const { user } = renderWithProviders(<FruitPicker onLatestValue={(v) => (latest = v)} />);
    const combobox = screen.getByRole('combobox');

    // Start from closed so this exercises ArrowDown-opens-the-list, not the mouse-click path.
    await user.click(combobox);
    await user.keyboard('{Escape}');
    expect(combobox).toHaveAttribute('aria-expanded', 'false');

    await user.keyboard('{ArrowDown}');
    expect(combobox).toHaveAttribute('aria-expanded', 'true');
    expect(combobox).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'Apple' }).id);

    await user.keyboard('{ArrowDown}');
    expect(combobox).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'Apricot' }).id);

    await user.keyboard('{Enter}');

    expect(latest).toBe('APRICOT');
    expect(combobox).toHaveValue('Apricot');
    expect(combobox).toHaveAttribute('aria-expanded', 'false');
  });

  it('does not move past the last option on repeated ArrowDown', async () => {
    const { user } = renderWithProviders(<FruitPicker />);
    const combobox = screen.getByRole('combobox');

    await user.click(combobox);
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}');

    // Fourth option (index 3) is the clear row; further ArrowDowns must clamp, not wrap to index 0.
    expect(combobox).toHaveAttribute(
      'aria-activedescendant',
      screen.getByText('Clear selection').closest('[role="option"]')!.id,
    );
  });

  it('closes without selecting on Escape', async () => {
    let latest: unknown;
    const { user } = renderWithProviders(<FruitPicker onLatestValue={(v) => (latest = v)} />);
    const combobox = screen.getByRole('combobox');

    await user.click(combobox);
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Escape}');

    expect(combobox).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    expect(latest).toBeUndefined();
  });

  it('prevents Enter from submitting a wrapping form', async () => {
    const onSubmit = vi.fn((event: FormEvent) => event.preventDefault());

    function WrappedPicker() {
      const form = useForm<FruitForm>();
      return (
        <form onSubmit={onSubmit}>
          <FilterableSelectController
            control={form.control}
            name="fruit"
            noSelectionText="Pick a fruit"
            optionsList={FRUIT_OPTIONS}
          />
        </form>
      );
    }

    const { user } = renderWithProviders(<WrappedPicker />);

    await user.click(screen.getByRole('combobox'));
    await user.keyboard('{Enter}');

    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('FilterableSelectController defaultValue', () => {
  it('routes defaultValue into form state so the default option is displayed', () => {
    renderWithProviders(<FruitPicker defaultValue="APRICOT" />);

    expect(screen.getByRole('combobox')).toHaveValue('Apricot');
  });

  it('mounts without the controlled/uncontrolled input warning', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderWithProviders(<FruitPicker defaultValue="APPLE" />);

    // Regression: defaultValue used to be spread onto the always-controlled <input>, which made
    // React log the "both value and defaultValue" warning on every form mount.
    const warnings = consoleError.mock.calls.filter((call) => String(call[0]).includes('defaultValue'));
    expect(warnings).toEqual([]);
    consoleError.mockRestore();
  });
});
