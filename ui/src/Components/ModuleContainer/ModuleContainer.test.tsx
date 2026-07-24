import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen } from 'test/testUtils';
import ModuleContainer from './ModuleContainer';

describe('ModuleContainer', () => {
  it('renders the heading and children', () => {
    renderWithProviders(<ModuleContainer heading="Net worth">Content</ModuleContainer>);

    expect(screen.getByRole('heading', { name: 'Net worth' })).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('shows the skeleton loader instead of children when isLoading', () => {
    renderWithProviders(<ModuleContainer isLoading>Content</ModuleContainer>);

    expect(screen.queryByText('Content')).toBeNull();
  });

  it('attaches a passed ref to the root div', () => {
    const ref = vi.fn();
    renderWithProviders(<ModuleContainer ref={ref}>Content</ModuleContainer>);

    expect(ref).toHaveBeenCalledTimes(1);
    const node = ref.mock.calls[0][0] as HTMLDivElement;
    expect(node).toBeInstanceOf(HTMLDivElement);
    expect(node).toBe(screen.getByText('Content'));
  });
});
