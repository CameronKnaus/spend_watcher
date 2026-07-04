import { describe, it, expect } from 'vitest';
import { http, HttpResponse, renderWithProviders, screen, server } from 'test/testUtils';
import type { YearlyAverageResponse } from '@spend-watcher/contract';
import AvgSpentPerMonth from './AvgSpentPerMonth';

describe('AvgSpentPerMonth', () => {
  function renderTile(data: YearlyAverageResponse) {
    server.use(http.get('*/api/spending/yearly-average', () => HttpResponse.json(data)));
    return renderWithProviders(<AvgSpentPerMonth />);
  }

  it('shows the compact monthly average and a positive (spending up) comparison chip', async () => {
    renderTile({
      monthlyAverage: 1234,
      comparison: { year: 2025, monthlyAverage: 1000, percentChange: 0.234 },
    } satisfies YearlyAverageResponse);

    expect(screen.getByRole('heading', { name: 'Avg spent · per month' })).toBeInTheDocument();
    expect(await screen.findByText('$1.2K')).toBeInTheDocument(); // compact format of 1234
    expect(screen.getByText('+23.4%')).toBeInTheDocument(); // 0.234 -> +23.4%
    expect(screen.getByText(/vs 2025 avg \(\$1K\)/)).toBeInTheDocument();
  });

  it('renders the "--" fallback and no comparison chip when there is no data', async () => {
    renderTile({ monthlyAverage: 0, comparison: null } satisfies YearlyAverageResponse);

    expect(await screen.findByText('--')).toBeInTheDocument();
    expect(screen.queryByText(/%$/)).toBeNull();
  });

  it('shows a negative (spending down) comparison chip without a plus sign', async () => {
    renderTile({
      monthlyAverage: 900,
      comparison: { year: 2025, monthlyAverage: 1000, percentChange: -0.1 },
    } satisfies YearlyAverageResponse);

    expect(await screen.findByText('$900')).toBeInTheDocument();
    expect(screen.getByText('-10.0%')).toBeInTheDocument();
  });
});
