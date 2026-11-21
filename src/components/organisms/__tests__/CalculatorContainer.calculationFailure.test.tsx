import { fireEvent, render, screen } from '@testing-library/react';
import { calculateMarginalTaxRate } from '@/lib/calculatorMarginalTax';
import { captureCalculatorError } from '@/lib/sentry';
import { calculateTax } from '@/lib/tax';
import { useCalculatorStore } from '@/store/calculatorStore';
import payrollFixtures from '@/test/payeVerificationFixtures/salary-guides-payroll-2026-27.json';
import { CalculatorContainer } from '../CalculatorContainer';
import { ErrorBoundary } from '../ErrorBoundary';

jest.mock('@/lib/tax', () => {
  const tax = jest.requireActual<typeof import('@/lib/tax')>('@/lib/tax');
  return { ...tax, calculateTax: jest.fn(tax.calculateTax) };
});

jest.mock('@/lib/calculatorMarginalTax', () => {
  const marginal = jest.requireActual<typeof import('@/lib/calculatorMarginalTax')>(
    '@/lib/calculatorMarginalTax',
  );
  return { calculateMarginalTaxRate: jest.fn(marginal.calculateMarginalTaxRate) };
});

jest.mock('@/lib/sentry', () => ({
  ...jest.requireActual('@/lib/sentry'),
  captureCalculatorError: jest.fn(),
}));

const fixture = payrollFixtures.scenarios.find(({ id }) => id === 'salary-guide-40k-base');
if (!fixture) throw new Error('Missing the independent £40,000 PAYE fixture');
const calculate = () => fireEvent.click(screen.getByTestId('calculate-button'));
const emailButton = () => screen.getByRole('button', { name: 'Email tax calculation results' });

describe('Mounted PAYE calculation failure', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const store = useCalculatorStore.getState();
    store.reset();
    store.setSalary(fixture.input.salary);
    store.setInput({ taxYear: '2026-2027', taxCode: fixture.input.taxCode });
  });

  afterEach(() => jest.restoreAllMocks());

  it.each([
    { stage: 'primary', taxYear: '2026-2027', calls: 1 },
    { stage: 'previous_year', taxYear: '2025-2026', calls: 2 },
  ])(
    'keeps a $stage exception inline, keeps the submitted calculation and supports retry',
    ({ stage, taxYear, calls }) => {
      render(
        <ErrorBoundary fallback={() => <div>Calculation escaped to the boundary</div>}>
          <CalculatorContainer />
        </ErrorBoundary>,
      );

      calculate();
      expect(screen.getByTestId('tax-results')).toBeInTheDocument();
      expect(emailButton()).toBeVisible();
      expect(useCalculatorStore.getState().previousYearResults).not.toBeNull();

      const submitted = useCalculatorStore.getState();
      const engine = jest.requireActual<typeof import('@/lib/tax')>('@/lib/tax').calculateTax;
      const failure = new Error('Controlled PAYE calculation failure');
      const calculateTaxMock = jest.mocked(calculateTax);
      calculateTaxMock.mockClear();
      if (calls === 2) calculateTaxMock.mockImplementationOnce(engine);
      calculateTaxMock.mockImplementationOnce(() => {
        throw failure;
      });

      calculate();
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Unable to calculate your tax. Please try again.',
      );
      expect(screen.queryByText('Calculation escaped to the boundary')).not.toBeInTheDocument();
      expect(
        screen.queryByText('Tax calculation complete. Results updated.'),
      ).not.toBeInTheDocument();
      expect(screen.getByTestId('tax-results')).toBeInTheDocument();
      expect(emailButton()).toBeVisible();
      expect(useCalculatorStore.getState().results).toBe(submitted.results);
      expect(useCalculatorStore.getState().previousYearResults).toBe(submitted.previousYearResults);
      expect(useCalculatorStore.getState().calculatedInput).toBe(submitted.calculatedInput);
      expect(calculateTaxMock).toHaveBeenCalledTimes(calls);
      expect(calculateTaxMock).toHaveBeenLastCalledWith(expect.objectContaining({ taxYear }));
      expect(captureCalculatorError).toHaveBeenCalledTimes(1);
      expect(captureCalculatorError).toHaveBeenCalledWith(failure, { stage });

      calculateTaxMock.mockClear();
      calculate();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.getByTestId('tax-results')).toBeInTheDocument();
      expect(emailButton()).toBeVisible();
      expect(useCalculatorStore.getState().results?.netPay.annually).toBe(
        fixture.expected.netPayAnnual,
      );
      expect(useCalculatorStore.getState().previousYearResults).not.toBeNull();
      expect(calculateTaxMock).toHaveBeenCalledTimes(2);
      expect(calculateTaxMock).toHaveBeenLastCalledWith(
        expect.objectContaining({ taxYear: '2025-2026' }),
      );
    },
  );
  it('retains the entire submitted result when the marginal estimate fails', () => {
    render(<CalculatorContainer />);
    calculate();
    const submitted = useCalculatorStore.getState();
    const failure = new Error('Controlled marginal estimate failure');
    jest.mocked(calculateMarginalTaxRate).mockImplementationOnce(() => {
      throw failure;
    });
    fireEvent.change(screen.getByTestId('tax-code-input'), { target: { value: 'BR' } });

    calculate();
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to calculate your tax');
    expect(useCalculatorStore.getState().results).toBe(submitted.results);
    expect(useCalculatorStore.getState().marginalTaxRate).toBe(submitted.marginalTaxRate);
    expect(captureCalculatorError).toHaveBeenCalledWith(failure, { stage: 'primary' });
  });

  it('does not send an email when a newer scenario fails to calculate', () => {
    const originalFetch = global.fetch;
    global.fetch = jest.fn();
    try {
      render(<CalculatorContainer />);
      calculate();
      const submitted = useCalculatorStore.getState().results;
      fireEvent.click(emailButton());
      const address = screen.getByLabelText('Email address for results');
      fireEvent.change(address, { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByTestId('tax-code-input'), { target: { value: 'BR' } });
      jest.mocked(calculateTax).mockImplementationOnce(() => {
        throw new Error('Controlled PAYE email calculation failure');
      });
      fireEvent.click(screen.getByRole('button', { name: /^Email Results$/ }));

      expect(screen.getByRole('alert')).toHaveTextContent('Unable to calculate your tax');
      expect(global.fetch).not.toHaveBeenCalled();
      expect(useCalculatorStore.getState().results).toBe(submitted);
    } finally {
      global.fetch = originalFetch;
    }
  });
});
