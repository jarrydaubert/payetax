import type { PayeEmailInput } from '@/lib/validation/emailValidation';
import { fireEvent, render, screen, waitFor } from '@/test/testing-library';
import { EmailResultsForm } from '../EmailResultsForm';

const toastSuccess = jest.fn();
const toastError = jest.fn();

jest.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

const makeInput = (): PayeEmailInput => ({
  salary: 50000,
  payPeriod: 'annually',
  taxYear: '2025-2026',
  taxCode: '1257L',
  isScottish: false,
  isMarried: false,
  partnerGrossWage: 0,
  isBlind: false,
  age: 30,
  payNoNI: false,
  pensionContribution: 0,
  pensionContributionType: 'percentage',
  studentLoanPlans: 'none',
  niCategory: 'A',
  hoursPerWeek: 40,
  allowancesDeductions: 0,
  incomeSources: [],
});

describe('EmailResultsForm', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    toastSuccess.mockReset();
    toastError.mockReset();
  });

  it('submits and shows sent confirmation', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });

    render(<EmailResultsForm input={makeInput()} />);

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
