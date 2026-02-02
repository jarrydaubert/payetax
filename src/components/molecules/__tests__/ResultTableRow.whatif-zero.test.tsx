/**
 * ResultTableRow - What If Zero Values Bug Fix Test
 *
 * Tests that What If columns are rendered correctly even when values are £0
 * This was a bug where `whatIfAnnual ? value : undefined` would treat 0 as falsy
 * and not render the What If column at all.
 *
 * Bug: https://github.com/payetax/payetax/issues/xxx
 */

import { render } from '@testing-library/react';
import { PiggyBank } from 'lucide-react';
import { ResultTableRow } from '../ResultTableRow';

const periodOptions = {
  Yearly: 1,
  Monthly: 12,
  '4-Weekly': 13,
  Fortnightly: 26,
  Weekly: 52,
  Daily: 260,
  Hourly: 2080,
};

describe('ResultTableRow - What If Zero Values Bug', () => {
  it('should render What If column when whatIfAnnual is 0 (not undefined)', () => {
    const { container } = render(
      <table>
        <tbody>
          <ResultTableRow
            category='Pension'
            icon={PiggyBank}
            annual={0}
            whatIfAnnual={0}
            percentage='0.0%'
            color='text-accent-foreground'
            isHighlight={false}
            visiblePeriods={['Yearly', 'Monthly']}
            periodOptions={periodOptions}
          />
        </tbody>
      </table>,
    );

    // Should have: Category (th) + Percentage (td) + (Current + What If) × 2 periods = 6 cells
    const cells = container.querySelectorAll('th, td');
    expect(cells.length).toBe(6);

    // Verify all currency cells show £0.00 (skip category th and percentage td)
    const currencyCells = Array.from(container.querySelectorAll('td')).slice(1);
    for (const cell of currencyCells) {
      expect(cell.textContent).toBe('£0.00');
    }
  });

  it('should render What If columns for all 7 display periods when values are 0', () => {
    const allPeriods = [
      'Yearly',
      'Monthly',
      '4-Weekly',
      'Fortnightly',
      'Weekly',
      'Daily',
      'Hourly',
    ];

    const { container } = render(
      <table>
        <tbody>
          <ResultTableRow
            category='Pension'
            icon={PiggyBank}
            annual={0}
            whatIfAnnual={0}
            percentage='0.0%'
            color='text-accent-foreground'
            isHighlight={false}
            visiblePeriods={allPeriods}
            periodOptions={periodOptions}
          />
        </tbody>
      </table>,
    );

    // Should have: Category (th) + Percentage (td) + (Current + What If) × 7 periods = 16 cells
    const cells = container.querySelectorAll('th, td');
    expect(cells.length).toBe(16);

    // Verify Current columns have blue background
    const blueCells = container.querySelectorAll('td.bg-blue-500\\/10');
    expect(blueCells.length).toBe(7); // One per period

    // Verify What If columns have purple background
    const purpleCells = container.querySelectorAll('td.bg-purple-500\\/10');
    expect(purpleCells.length).toBe(7); // One per period
  });

  it('should handle mixed zero and non-zero values correctly', () => {
    const { container } = render(
      <table>
        <tbody>
          <ResultTableRow
            category='Pension'
            icon={PiggyBank}
            annual={3000} // Current: £3,000
            whatIfAnnual={0} // What If: £0 (user removed pension in scenario)
            percentage='5.0%'
            color='text-accent-foreground'
            isHighlight={false}
            visiblePeriods={['Yearly']}
            periodOptions={periodOptions}
          />
        </tbody>
      </table>,
    );

    const cells = container.querySelectorAll('th, td');
    expect(cells.length).toBe(4); // Category (th) + Percentage + Current + What If

    // Current should show £3,000 (cells[2] = first currency cell)
    const tdCells = container.querySelectorAll('td');
    expect(tdCells[1]?.textContent).toBe('£3,000.00');

    // What If should show £0.00 (not be missing!)
    expect(tdCells[2]?.textContent).toBe('£0.00');
  });

  it('should NOT render What If columns when whatIfAnnual is undefined', () => {
    const { container } = render(
      <table>
        <tbody>
          <ResultTableRow
            category='Pension'
            icon={PiggyBank}
            annual={3000}
            whatIfAnnual={undefined} // No What If scenario active
            percentage='5.0%'
            color='text-accent-foreground'
            isHighlight={false}
            visiblePeriods={['Yearly', 'Monthly']}
            periodOptions={periodOptions}
          />
        </tbody>
      </table>,
    );

    // Should have: Category (th) + Percentage + 2 periods (no What If columns) = 4 cells
    const cells = container.querySelectorAll('th, td');
    expect(cells.length).toBe(4);

    // No cells should have purple background (What If columns)
    const purpleCells = container.querySelectorAll('td.bg-purple-500\\/10');
    expect(purpleCells.length).toBe(0);
  });

  it('should handle allowances/deductions with zero values correctly', () => {
    const { container } = render(
      <table>
        <tbody>
          <ResultTableRow
            category='Non-taxable allowance(s)'
            icon={PiggyBank}
            annual={0}
            whatIfAnnual={0}
            percentage='0.0%'
            color='text-teal-600'
            isHighlight={false}
            visiblePeriods={['Yearly', 'Monthly', 'Weekly']}
            periodOptions={periodOptions}
          />
        </tbody>
      </table>,
    );

    // Should have: Category (th) + Percentage (td) + (Current + What If) × 3 periods = 8 cells
    const cells = container.querySelectorAll('th, td');
    expect(cells.length).toBe(8);

    // All currency cells should show £0.00 (skip percentage td)
    const currencyCells = Array.from(container.querySelectorAll('td')).slice(1);
    for (const cell of currencyCells) {
      expect(cell.textContent).toBe('£0.00');
    }
  });

  it('should calculate period values correctly when whatIfAnnual is 0', () => {
    const { container } = render(
      <table>
        <tbody>
          <ResultTableRow
            category='Pension'
            icon={PiggyBank}
            annual={0}
            whatIfAnnual={0}
            percentage='0.0%'
            color='text-accent-foreground'
            isHighlight={false}
            visiblePeriods={['Yearly', 'Monthly', 'Weekly', 'Daily', 'Hourly']}
            periodOptions={periodOptions}
          />
        </tbody>
      </table>,
    );

    // Skip category (th) and percentage (td), then check all period cells
    const periodCells = Array.from(container.querySelectorAll('td')).slice(1);

    // All should show £0.00 regardless of period
    for (const cell of periodCells) {
      expect(cell.textContent).toBe('£0.00');
    }
  });
});
