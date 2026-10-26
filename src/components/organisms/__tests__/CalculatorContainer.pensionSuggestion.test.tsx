import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { PayPeriod } from '@/constants/taxRates';
import { useCalculatorStore } from '@/store/calculatorStore';
import payrollFixtures from '@/test/payeVerificationFixtures/salary-guides-payroll-2026-27.json';
import { CalculatorContainer } from '../CalculatorContainer';

// After £20k sacrifice from £120k, cash pay has the same tax/NI/net as the
// independently derived £100k payroll fixture. Never generate expectations from the engine.
const expected = payrollFixtures.scenarios.find(
  (scenario) => scenario.id === 'salary-guide-100k-base',
)?.expected;
if (!expected) throw new Error('Missing independent £100k payroll fixture');
const expectedTax = expected.incomeTaxAnnual;
const expectedNI = expected.nationalInsuranceAnnual;
if (expectedTax === undefined || expectedNI === undefined) {
  throw new Error('Missing tax/NI expectations in independent £100k payroll fixture');
}

describe('Tax-trap pension suggestion (mounted real inputs, store and engine)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useCalculatorStore.getState().reset();
  });

  const periods: [PayPeriod, number][] = [
    ['annually', 1],
    ['monthly', 12],
    ['weekly', 52],
  ];

  it('returns to the initial prompt when Reset discards an applied suggestion', async () => {
    const user = userEvent.setup();
    useCalculatorStore.getState().setInput({ salary: 110000, taxCode: '' });
    render(<CalculatorContainer />);
    await user.click(screen.getByTestId('calculate-button'));
    await user.click(await screen.findByRole('button', { name: 'Add £10,000 to Pension' }));
    expect(screen.getByRole('status')).toHaveTextContent('Calculate again');

    await user.click(screen.getByRole('button', { name: /Reset/i }));
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    expect(screen.getByRole('heading', { name: 'Ready to Calculate' })).toBeVisible();
    await user.click(screen.getByTestId('pension-input'));
    await user.keyboard('5');
    await user.tab();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  describe.each(periods)('%s pay', (payPeriod, periodsPerYear) => {
    it.each([
      ['no pension', 'amount', 0, 20000],
      ['existing £ pension', 'amount', 6000, 14000],
      ['existing % pension', 'percentage', 5, 14000],
    ] as const)('adds the annual suggestion to %s and waits for Calculate', async (_label, pensionContributionType, pension, addition) => {
      const user = userEvent.setup();
      useCalculatorStore.getState().setInput({
        salary: 120000 / periodsPerYear,
        payPeriod,
        taxYear: '2026-2027',
        taxCode: '',
        pensionContributionType,
        pensionContribution:
          pensionContributionType === 'amount' ? pension / periodsPerYear : pension,
      });
      render(<CalculatorContainer />);
      await user.click(screen.getByTestId('calculate-button'));
      const apply = await screen.findByRole('button', {
        name: `Add £${addition.toLocaleString('en-GB')} to Pension`,
      });

      // Seed all result variants: applying must invalidate each, including email and suggestions.
      act(() => {
        useCalculatorStore.setState({ whatIfResults: useCalculatorStore.getState().results });
      });
      await user.click(apply);

      const state = useCalculatorStore.getState();
      expect(state.input.pensionContributionType).toBe('amount');
      expect(state.input.pensionContribution).toBeCloseTo(20000 / periodsPerYear, 8);
      expect(screen.getByTestId('pension-input')).toHaveValue(
        (20000 / periodsPerYear).toLocaleString('en-GB', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      );
      expect(state.results).toBeNull();
      expect(state.previousYearResults).toBeNull();
      expect(state.whatIfResults).toBeNull();
      expect(
        screen.queryByRole('button', { name: 'Email tax calculation results' }),
      ).not.toBeInTheDocument();
      await waitFor(() => expect(apply).not.toBeInTheDocument());
      expect(screen.getByRole('status')).toHaveTextContent(
        'Calculate again to update your results',
      );
      expect(screen.getByRole('heading', { name: /^Calculate again$/ })).toBeVisible();
      if (pensionContributionType === 'percentage') {
        expect(screen.getByRole('status')).toHaveTextContent(
          'Your existing 5% pension was converted to a £ amount',
        );
      }

      await user.click(screen.getByTestId('calculate-button'));
      await waitFor(() => expect(useCalculatorStore.getState().results).not.toBeNull());
      const result = useCalculatorStore.getState().results;
      if (!result) throw new Error('Calculate did not produce results');
      expect(result.pensionContribution.annually).toBeCloseTo(20000, 2);
      expect(result.grossSalary.annually - result.pensionContribution.annually).toBeCloseTo(
        100000,
        2,
      );
      expect(result.taxFreeAmount).toBe(expected.taxFreeAmount);
      expect(result.incomeTax.annually).toBeCloseTo(expectedTax, 2);
      expect(result.nationalInsurance.annually).toBeCloseTo(expectedNI, 2);
      expect(result.netPay.annually).toBeCloseTo(expected.netPayAnnual, 2);
      expect(screen.queryByRole('button', { name: /to Pension$/ })).not.toBeInTheDocument();
      expect(screen.queryByText('Tax Trap Alert')).not.toBeInTheDocument();
    });
  });
});
