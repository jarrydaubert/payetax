import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { trackEmailOpened, trackEmailSent } from '@/lib/directorGuideAnalytics';
import type { StrategyComparison } from '@/lib/tax/strategyComparison';
import type { DirectorEmailInput } from '@/lib/validation/emailValidation';
import { EmailResultsDialog } from '../EmailResultsDialog';

jest.mock('@/lib/directorGuideAnalytics', () => ({
  trackEmailOpened: jest.fn(),
  trackEmailSent: jest.fn(),
}));

// Make Radix Dialog inert in unit tests (no portals/focus trapping).
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ open, children }: { open: boolean; children: ReactNode }) =>
    open ? <div>{children}</div> : null,
  DialogContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

describe('EmailResultsDialog analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('tracks email_opened on open, and email_sent on success', async () => {
    const onOpenChange = jest.fn();

    const comparison: StrategyComparison = {
      grossProfit: 50000,
      grossProfitAfterPension: 50000,
      alreadyTaken: 0,
      availableForExtraction: 0,
      strategies: {
        allSalary: {
          name: 'All Salary',
          salary: 0,
          dividends: 0,
          pension: 0,
          companyCarBIK: 0,
          employerNI: 0,
          employeeNI: 0,
          incomeTax: 0,
          corporationTax: 0,
          dividendTax: 0,
          studentLoan: 0,
          totalPersonalTax: 0,
          companyCost: 0,
          takeHome: 0,
          effectiveRate: 0,
        },
        optimalMix: {
          name: 'Baseline Mix',
          salary: 0,
          dividends: 0,
          pension: 0,
          companyCarBIK: 0,
          employerNI: 0,
          employeeNI: 0,
          incomeTax: 0,
          corporationTax: 0,
          dividendTax: 0,
          studentLoan: 0,
          totalPersonalTax: 0,
          companyCost: 0,
          takeHome: 0,
          effectiveRate: 0,
        },
        allDividends: {
          name: 'All Dividends',
          salary: 0,
          dividends: 0,
          pension: 0,
          companyCarBIK: 0,
          employerNI: 0,
          employeeNI: 0,
          incomeTax: 0,
          corporationTax: 0,
          dividendTax: 0,
          studentLoan: 0,
          totalPersonalTax: 0,
          companyCost: 0,
          takeHome: 0,
          effectiveRate: 0,
        },
      },
      recommended: 'optimalMix',
      savingsVsAllSalary: 0,
    };

    const directorEmailInput: DirectorEmailInput = {
      region: 'rUK',
      revenue: 100000,
      includesVat: false,
      expenses: 20000,
      lossesBroughtForward: 0,
      otherIncome: 0,
      employmentAllowance: false,
      studentLoanPlans: [],
      pensionContribution: 0,
      companyCarBIK: 0,
      minimumSalaryRequirement: 0,
      hasOtherPAYEEmployment: false,
      ytdSalary: 0,
      ytdDividends: 0,
      ytdDrawings: 0,
      yourSetupSalary: 0,
      yourSetupDividends: 0,
    };

    // Mock fetch success.
    global.fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    })) as unknown as typeof fetch;

    const { rerender } = render(
      <EmailResultsDialog
        open={true}
        onOpenChange={onOpenChange}
        comparison={comparison}
        emailInput={directorEmailInput}
      />,
    );

    expect(trackEmailOpened).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Company key dates are not included/)).toBeInTheDocument();
    expect(screen.queryByText(/with tax rates and key dates/)).not.toBeInTheDocument();

    const emailField = screen.getByLabelText('Email address');
    fireEvent.change(emailField, { target: { value: 'test@example.com' } });

    fireEvent.click(screen.getByRole('button', { name: 'Send Results' }));

    await waitFor(() => {
      expect(trackEmailSent).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText(/Results sent to test@example.com/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Send Another' }));
    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: 'test@example.com' },
    });
    const unavailableReason = 'Email does not include this what-if salary.';
    rerender(
      <EmailResultsDialog
        open={true}
        onOpenChange={onOpenChange}
        comparison={comparison}
        emailInput={directorEmailInput}
        unavailableReason={unavailableReason}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent(unavailableReason);
    expect(screen.getByRole('button', { name: 'Send Results' })).toBeDisabled();
    const form = screen.getByLabelText('Email address').closest('form');
    if (!form) throw new Error('Expected email form');
    fireEvent.submit(form);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('alert')).toHaveTextContent(unavailableReason);
  });
});
