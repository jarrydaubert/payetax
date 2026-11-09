import { fireEvent, render, screen } from '@testing-library/react';
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

jest.mock('@/lib/sentry', () => ({
  ...jest.requireActual('@/lib/sentry'),
  captureCalculatorError: jest.fn(),
}));

const fixture = payrollFixtures.scenarios.find(({ id }) => id === 'salary-guide-40k-base');
if (!fixture) throw new Error('Missing the independent £40,000 PAYE fixture');
const calculate = () => fireEvent.click(screen.getByTestId('calculate-button'));
const emailButton = () => screen.queryByRole('button', { name: 'Email tax calculation results' });

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
    'keeps a $stage exception inline, clears results and supports retry',
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
      expect(screen.queryByTestId('tax-results')).not.toBeInTheDocument();
      expect(emailButton()).not.toBeInTheDocument();
      expect(useCalculatorStore.getState()).toMatchObject({
        results: null,
        previousYearResults: null,
        whatIfResults: null,
      });
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
});
