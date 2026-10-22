import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { calculateTax } from '@/lib/tax';
import type { TaxCalculationInput } from '@/lib/types/calculator';
import baseline from '@/test/payeVerificationFixtures/uk-baseline-2026-27.json';
import { PayStatement } from '../PayStatement';

const scenario = baseline.scenarios.find((item) => item.id === 'uk-60k-1257L');
if (!scenario) throw new Error('Missing independent 60k fixture');
const input = scenario.input as TaxCalculationInput;
const results = calculateTax(input);
const props = {
  results,
  input,
  previousYearResults: null,
  period: 'monthly' as const,
  onPeriodChange: jest.fn(),
  onCompare: jest.fn(),
  emailAction: <button type='button'>Email results</button>,
};

describe('Pay statement', () => {
  it('renders exact independently derived monthly amounts with ordinary table semantics', () => {
    render(<PayStatement {...props} />);
    expect(screen.getByTestId('take-home-amount')).toHaveTextContent('£3,780.44');
    const table = screen.getByTestId('pay-statement');
    expect(within(table).getByRole('row', { name: 'Gross pay £5,000.00' })).toBeInTheDocument();
    expect(within(table).getByRole('row', { name: 'Income Tax £952.06' })).toBeInTheDocument();
    expect(
      within(table).getByRole('row', { name: 'National Insurance £267.50' }),
    ).toBeInTheDocument();
    expect(within(table).getByRole('row', { name: 'Take-home pay £3,780.44' })).toBeInTheDocument();
    expect(screen.getByText('£45,365.28 per year')).toBeInTheDocument();
    expect(screen.getByText(/Steady-pay estimate, not an exact payslip/)).toBeInTheDocument();
  });

  it('retains the mixed-income limitation beside the result when mobile inputs are hidden', () => {
    render(
      <PayStatement
        {...props}
        input={{
          ...input,
          incomeSources: [
            { id: 'example-rental', type: 'rental', amount: 1000, period: 'annually' },
          ],
        }}
      />,
    );
    expect(screen.getByText(/totals may be understated/)).toBeVisible();
  });

  it('changes the display period independently of salary frequency and exposes comparison', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<PayStatement {...props} />);
    await user.selectOptions(screen.getByRole('combobox', { name: 'View by' }), 'weekly');
    expect(props.onPeriodChange).toHaveBeenCalledWith('weekly');
    rerender(<PayStatement {...props} period='weekly' />);
    expect(screen.getByTestId('take-home-amount')).toHaveTextContent(
      `£${results.netPay.weekly.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`,
    );
    await user.click(screen.getByRole('button', { name: 'Compare all 7 periods' }));
    expect(props.onCompare).toHaveBeenCalled();
  });

  it('separates taxable earnings and employer costs from employee deductions', async () => {
    const user = userEvent.setup();
    render(<PayStatement {...props} />);
    expect(
      within(screen.getByTestId('pay-statement')).queryByText(/Income taxed at|Employer/),
    ).not.toBeInTheDocument();
    await user.click(screen.getByText('How this estimate is worked out'));
    expect(screen.getByText('Income taxed at 20%')).toBeVisible();
    expect(screen.getByText(/not a statutory marginal rate/)).toBeVisible();
    expect(screen.getByTestId('tax-code-basis-notice')).toBeVisible();
    await user.click(screen.getByText('Employer costs and previous year'));
    expect(screen.getByText(/not deducted from your pay/)).toBeVisible();
  });
});
