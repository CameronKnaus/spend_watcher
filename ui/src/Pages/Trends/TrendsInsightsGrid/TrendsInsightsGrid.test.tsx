import { describe, it, expect } from 'vitest';
import { makeTimeFrame, renderWithProviders, screen } from 'test/testUtils';
import { DateRangeType } from 'Contexts/SelectedTimeFrame.context';
import TrendsInsightsGrid from './TrendsInsightsGrid';

describe('TrendsInsightsGrid', () => {
  it('renders the insight tiles in monthly mode', async () => {
    renderWithProviders(<TrendsInsightsGrid />, { timeFrame: makeTimeFrame() });

    expect(await screen.findByText('Months')).toBeInTheDocument();
  });

  it('renders nothing in yearly mode', () => {
    const { container } = renderWithProviders(<TrendsInsightsGrid />, {
      timeFrame: makeTimeFrame({ dateRangeType: DateRangeType.YEAR }),
    });

    expect(container).toBeEmptyDOMElement();
  });
});
