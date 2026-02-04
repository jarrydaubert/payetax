import { fireEvent, render, screen, waitFor } from '@/test/testing-library';

import { EmailResultsForm } from '../EmailResultsForm';
import type { TaxCalculationResults } from '@/lib/taxCalculator';

const toastSuccess = jest.fn();
const toastError = jest.fn();

jest.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

const makeResults = (): TaxCalculationResults => {
  const periods = {
    annually: 1000,
    monthly: 100,
    fourWeekly: 90,
    fortnightly: 50,
    weekly: 25,
    daily: 5,
    hourly: 1,
  };

  return {
    grossSalary: { ...periods },
    taxFreeAmount: 12570,
    taxableIncome: 20000,
    incomeTax: { ...periods },
    nationalInsurance: { ...periods },
    studentLoan: { ...periods },
    pensionContribution: { ...periods },
    employerNI: 100,
    netPay: { ...periods },
    taxBands: [{ name: 'Basic', rate: 20, amount: 2000 }],
  };
};

describe('EmailResultsForm', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    toastSuccess.mockReset();
    toastError.mockReset();
  });

  it('submits and shows sent confirmation', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });

    render(<EmailResultsForm results={makeResults()} />);

    const button = screen.getByRole('button', { name: /Email Results/i });
    expect(button).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Email address for results'), {
      target: { value: 'test@example.com' },
    });

    expect(button).not.toBeDisabled();

    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Results sent to t***@example.com');
    });

    expect(toastSuccess).toHaveBeenCalled();
  });
});
