import { render, screen, within } from '@testing-library/react';
import { ScottishTaxBandsTable, ScottishTaxExamplesTable } from '../ScottishTaxComparisonTables';

describe('Scottish comparison article tables', () => {
  it('renders 2026/27 bands from the selected policy', () => {
    render(<ScottishTaxBandsTable taxYear='2026-2027' />);

    const tables = screen.getAllByRole('table');
    expect(tables).toHaveLength(2);
    expect(screen.getByRole('heading', { name: 'Scotland (2026/27)' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'England (2026/27)' })).toBeInTheDocument();
    expect(within(tables[0] as HTMLElement).getByText('£29,527 to £43,662')).toBeInTheDocument();
    expect(within(tables[0] as HTMLElement).getByText('£75,001 to £125,140')).toBeInTheDocument();
    expect(within(tables[0] as HTMLElement).getByText('Over £125,140')).toBeInTheDocument();
    expect(within(tables[0] as HTMLElement).getByText('48%')).toBeInTheDocument();
    expect(within(tables[1] as HTMLElement).getByText('£50,271 to £125,140')).toBeInTheDocument();
  });

  it('renders policy-calculated examples, including the corrected £150k result', () => {
    render(<ScottishTaxExamplesTable taxYear='2026-2027' />);

    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');
    expect(rows).toHaveLength(7);

    const highIncomeRow = within(table).getByRole('row', { name: /£150,000/ });
    expect(within(highIncomeRow).getByText('£59,634')).toBeInTheDocument();
    expect(within(highIncomeRow).getByText('£53,703')).toBeInTheDocument();
    expect(within(highIncomeRow).getByText('Scotland £5,931 higher')).toBeInTheDocument();
  });

  it('normalises a short display-style tax year for both sibling tables', () => {
    render(
      <>
        <ScottishTaxBandsTable taxYear='2026-27' />
        <ScottishTaxExamplesTable taxYear='2026-27' />
      </>,
    );

    expect(screen.getByRole('heading', { name: 'Scotland (2026/27)' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'England (2026/27)' })).toBeInTheDocument();
    expect(screen.getByText('Annual Income Tax for 2026/27, rounded to the nearest pound')).toBe(
      screen.getByRole('caption'),
    );
    expect(screen.getByRole('row', { name: /£150,000.*£59,634.*£53,703/ })).toBeInTheDocument();
  });
});
