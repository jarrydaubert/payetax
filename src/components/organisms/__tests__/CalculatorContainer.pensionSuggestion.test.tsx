import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { PayPeriod } from '@/constants/taxRates';
import { parseCurrencyInput } from '@/lib/currencyInput';
import type { TaxCalculationResults } from '@/lib/tax';
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

const expectPayrollForCashPay = (result: TaxCalculationResults, cashPay: number) => {
  expect(result.taxFreeAmount).toBe(12570);
  expect(result.grossSalary.annually - result.pensionContribution.annually).toBeLessThanOrEqual(
    100000,
  );
  expect(result.incomeTax.annually).toBeLessThanOrEqual(expectedTax);
  expect(result.nationalInsurance.annually).toBeLessThanOrEqual(expectedNI);
  // Independent £100k fixture: Tables A free pay £1048.26, whole-pound taxable pay.
  // Extra sacrifice is in the 40% band. Each lost monthly taxable pound saves 40p;
  // final-penny truncation has the same fractional penny as the anchor fixture.
  const wholePoundsLost = Math.floor(100000 / 12 - 1048.26) - Math.floor(cashPay / 12 - 1048.26);
  const tax = (Math.round(expectedTax * 100) - wholePoundsLost * 40 * 12) / 100;
  // NI falls at 2% above £4189/month, after 8% on £1048–£4189.
  // Round monthly NI to pennies before annualising; do not round the annual 2% estimate.
  const ni = (Math.round(((4189 - 1048) * 0.08 + (cashPay / 12 - 4189) * 0.02) * 100) * 12) / 100;
  expect(result.incomeTax.annually).toBeCloseTo(tax, 2);
  expect(result.nationalInsurance.annually).toBeCloseTo(ni, 2);
  expect(result.netPay.annually).toBeCloseTo(cashPay - tax - ni, 2);
};

async function expectPersistenceRoundTrip(value: number) {
  const key = 'tax-calculator-storage';
  const saved = window.localStorage.getItem(key);
  if (!saved) throw new Error('Pension was not persisted');
  expect(JSON.parse(saved).state.input.pensionContribution).toBe(value);
  cleanup();
  act(() => {
    useCalculatorStore.getState().reset();
    window.localStorage.setItem(key, saved);
  });
  await act(async () => {
    await useCalculatorStore.persist.rehydrate();
  });
  expect(useCalculatorStore.getState().input.pensionContribution).toBe(value);
  expect(useCalculatorStore.getState().input.pensionContributionType).toBe('amount');
  expect(
    parseCurrencyInput(String(useCalculatorStore.getState().input.pensionContribution)),
  ).toEqual({ status: 'valid', value });
  render(<CalculatorContainer />);
}

describe('Tax-trap pension suggestion (mounted real inputs, store and engine)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useCalculatorStore.getState().reset();
  });

  const periods: [PayPeriod, number, number][] = [
    ['annually', 1, 20000],
    ['monthly', 12, 1666.67],
    ['weekly', 52, 384.62],
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

  describe.each(periods)('%s pay', (payPeriod, periodsPerYear, storedAmount) => {
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
      expect(parseCurrencyInput(String(state.input.pensionContribution))).toEqual({
        status: 'valid',
        value: storedAmount,
      });
      expect(state.input.pensionContribution).toBe(storedAmount);
      expect(screen.getByTestId('pension-input')).toHaveValue(
        storedAmount.toLocaleString('en-GB', {
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

      const annualPension = storedAmount * periodsPerYear;
      expect(annualPension).toBeGreaterThanOrEqual(20000);
      expect(annualPension - 20000).toBeLessThan(0.01 * periodsPerYear);
      if (payPeriod === 'annually') {
        expect(screen.getByRole('status')).not.toHaveTextContent('Rounded up');
      } else {
        expect(screen.getByRole('status')).toHaveTextContent('Rounded up to the next penny');
      }
      await expectPersistenceRoundTrip(storedAmount);

      await user.click(screen.getByTestId('calculate-button'));
      await waitFor(() => expect(useCalculatorStore.getState().results).not.toBeNull());
      const result = useCalculatorStore.getState().results;
      if (!result) throw new Error('Calculate did not produce results');
      expect(result.pensionContribution.annually).toBeCloseTo(annualPension, 2);
      if (payPeriod === 'annually') {
        expect(result.taxFreeAmount).toBe(expected.taxFreeAmount);
        expect(result.incomeTax.annually).toBeCloseTo(expectedTax, 2);
        expect(result.nationalInsurance.annually).toBeCloseTo(expectedNI, 2);
        expect(result.netPay.annually).toBeCloseTo(expected.netPayAnnual, 2);
      } else {
        expectPayrollForCashPay(result, 120000 - annualPension);
      }
      expect(screen.queryByRole('button', { name: /to Pension$/ })).not.toBeInTheDocument();
      expect(screen.queryByText('Tax Trap Alert')).not.toBeInTheDocument();
    });
  });

  it.each([
    ['monthly', 112000 / 12, 12000, 1000, 12],
    ['hourly', 50, 4000, 1.93, 2080],
  ] as const)('%s exact/rounded conversion survives rehydration and Calculate', async (payPeriod, salary, target, storedAmount, periodsPerYear) => {
    const user = userEvent.setup();
    useCalculatorStore
      .getState()
      .setInput({ salary, payPeriod, taxCode: '', taxYear: '2026-2027', hoursPerWeek: 40 });
    render(<CalculatorContainer />);
    await user.click(screen.getByTestId('calculate-button'));
    await user.click(
      await screen.findByRole('button', {
        name: `Add £${target.toLocaleString('en-GB')} to Pension`,
      }),
    );
    expect(useCalculatorStore.getState().input.pensionContribution).toBe(storedAmount);
    expect(useCalculatorStore.getState().results).toBeNull();
    expect(useCalculatorStore.getState().previousYearResults).toBeNull();
    expect(useCalculatorStore.getState().whatIfResults).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('Calculate again');
    expect(screen.getByRole('status').textContent?.includes('Rounded up')).toBe(
      payPeriod === 'hourly',
    );
    const annualPension = storedAmount * periodsPerYear;
    expect(annualPension).toBeGreaterThanOrEqual(target);
    expect(annualPension - target).toBeLessThan(0.01 * periodsPerYear);
    await expectPersistenceRoundTrip(storedAmount);
    expect(screen.getByTestId('pension-input')).toHaveValue(
      storedAmount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    );
    await user.click(screen.getByTestId('calculate-button'));
    const result = useCalculatorStore.getState().results;
    if (!result) throw new Error('Calculate did not produce results');
    expectPayrollForCashPay(result, salary * periodsPerYear - annualPension);
    expect(screen.queryByText('Tax Trap Alert')).not.toBeInTheDocument();
  });
});
