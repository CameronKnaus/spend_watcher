import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen } from 'test/testUtils';
import SlideUpPanel from './SlideUpPanel';

function renderPanel(isOpen = true) {
  const handlePanelWillClose = vi.fn();
  const utils = renderWithProviders(
    <SlideUpPanel title="Groceries" tagColor="green" isOpen={isOpen} handlePanelWillClose={handlePanelWillClose}>
      <p>Panel content</p>
    </SlideUpPanel>,
  );
  return { ...utils, handlePanelWillClose };
}

describe('SlideUpPanel', () => {
  it('renders a modal dialog with its title and content when open', () => {
    renderPanel();

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Groceries', level: 2 })).toBeInTheDocument();
    expect(screen.getByText('Panel content')).toBeInTheDocument();
  });

  it('renders nothing when closed', () => {
    renderPanel(false);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('requests close when the backdrop is clicked', async () => {
    const { user, container, handlePanelWillClose } = renderPanel();

    // The backdrop is a purely visual scrim with no accessible role — the class selector is the
    // only handle it exposes.
    const backdrop = container.querySelector('[class*="lockedBackground"]');
    expect(backdrop).not.toBeNull();
    await user.click(backdrop as Element);

    expect(handlePanelWillClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when clicking inside the panel', async () => {
    const { user, handlePanelWillClose } = renderPanel();

    await user.click(screen.getByText('Panel content'));

    expect(handlePanelWillClose).not.toHaveBeenCalled();
  });
});
