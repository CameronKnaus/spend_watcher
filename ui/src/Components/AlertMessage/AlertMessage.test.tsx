import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from 'test/testUtils';
import AlertMessage from './AlertMessage';

describe('AlertMessage', () => {
  it('renders the title and optional message (the Trends WIP notice content)', () => {
    renderWithProviders(
      <AlertMessage
        variant="error"
        title="Recurring transactions are not shown on this page yet."
        message="This page is a work in progress.  Recurring transactions will be represented here soon."
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Recurring transactions are not shown on this page yet.' }),
    ).toBeInTheDocument();
    // RTL normalizes the double space in the source copy to a single space.
    expect(
      screen.getByText('This page is a work in progress. Recurring transactions will be represented here soon.'),
    ).toBeInTheDocument();
  });

  it('omits the message paragraph when no message is provided', () => {
    const { container } = renderWithProviders(<AlertMessage variant="info" title="Heads up" />);

    expect(screen.getByRole('heading', { name: 'Heads up' })).toBeInTheDocument();
    expect(container.querySelector('p')).toBeNull();
  });

  it('applies variant-specific styling tokens', () => {
    const { container } = renderWithProviders(<AlertMessage variant="error" title="Boom" />);
    const box = container.firstElementChild as HTMLElement;

    expect(box.style.backgroundColor).toContain('error');
    expect(box.style.border).toContain('error');
  });
});
