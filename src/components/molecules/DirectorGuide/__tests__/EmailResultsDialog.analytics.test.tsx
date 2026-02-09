import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { trackEmailOpened, trackEmailSent } from '@/lib/directorGuideAnalytics';
import type { StrategyComparison } from '@/lib/tax/strategyComparison';
import type { DirectorEmailInput } from '@/lib/validation/emailValidation';
import { EmailResultsDialog } from '../EmailResultsDialog';

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

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

    render(
      <EmailResultsDialog
        open={true}
        onOpenChange={onOpenChange}
        comparison={comparison}
        emailInput={directorEmailInput}
      />,
    );

    expect(trackEmailOpened).toHaveBeenCalledTimes(1);

    const emailField = screen.getByLabelText('Email address');
    fireEvent.change(emailField, { target: { value: 'test@example.com' } });

    fireEvent.click(screen.getByRole('button', { name: 'Send Results' }));

    await waitFor(() => {
      expect(trackEmailSent).toHaveBeenCalledTimes(1);
    });

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
