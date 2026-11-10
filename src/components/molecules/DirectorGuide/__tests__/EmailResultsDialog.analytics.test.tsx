import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
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

describe('EmailResultsDialog', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  const dialog = (props: Partial<React.ComponentProps<typeof EmailResultsDialog>> = {}) => (
    <EmailResultsDialog
      open
      onOpenChange={jest.fn()}
      comparison={comparison}
      emailInput={directorEmailInput}
      {...props}
    />
  );

  function send(address: string) {
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: address } });
    fireEvent.click(screen.getByRole('button', { name: 'Send Results' }));
  }

  test('discards success arriving after a forced close, before reopening for a new scenario', async () => {
    // Ignore abort deliberately so the stale completion guard is exercised as well.
    const reply = Promise.withResolvers<Response>();
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockReturnValue(reply.promise);
    global.fetch = fetchMock;
    const { rerender } = render(dialog());
    send('scenario-a@example.com');
    expect(screen.getByRole('button', { name: 'Sending...' })).toBeDisabled();
    const signal = fetchMock.mock.calls[0][1]?.signal;

    rerender(dialog({ open: false, comparison: null, emailInput: null }));
    await act(async () => reply.resolve(new Response(null, { status: 200 })));
    rerender(dialog({ comparison: { ...comparison, grossProfit: 60000 } }));

    expect(screen.queryByText(/Results sent to/)).not.toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toHaveValue('');
    expect(signal?.aborted).toBe(true);
    expect(trackEmailSent).not.toHaveBeenCalled();
  });

  test('discards a stale error body without interrupting the new send, which can fail and retry', async () => {
    const oldBody = Promise.withResolvers<{ error: string }>();
    const readOldBody = jest.fn(() => oldBody.promise);
    const newReply = Promise.withResolvers<Response>();
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockResolvedValueOnce({ ok: false, status: 500, json: readOldBody } as unknown as Response)
      .mockReturnValueOnce(newReply.promise)
      .mockResolvedValueOnce(new Response(null, { status: 200 }));
    global.fetch = fetchMock;
    const { rerender } = render(dialog());
    send('scenario-a@example.com');
    await waitFor(() => expect(readOldBody).toHaveBeenCalledTimes(1));

    rerender(dialog({ unavailableReason: 'Email is paused while results update.' }));
    expect(screen.getByRole('button', { name: 'Send Results' })).toBeDisabled();
    const scenarioB = {
      comparison: { ...comparison, grossProfit: 60000 },
      emailInput: { ...directorEmailInput, revenue: 110000 },
    };
    rerender(dialog(scenarioB));
    send('scenario-b@example.com');
    // The dashboard can rebuild the payload without changing the current scenario.
    rerender(dialog({ ...scenarioB, emailInput: { ...scenarioB.emailInput } }));
    await act(async () => oldBody.resolve({ error: 'Old request error' }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sending...' })).toBeDisabled();
    expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true);
    expect(fetchMock.mock.calls[1][1]?.signal?.aborted).toBe(false);

    await act(async () => newReply.resolve(new Response(null, { status: 429 })));
    expect(screen.getByRole('alert')).toHaveTextContent('Too many requests');
    expect(screen.getByLabelText('Email address')).toHaveValue('scenario-b@example.com');
    fireEvent.click(screen.getByRole('button', { name: 'Send Results' }));
    expect(await screen.findByText(/Results sent to scenario-b@example.com/)).toBeVisible();
    expect(trackEmailSent).toHaveBeenCalledTimes(1);
  });

  test('aborts on unmount and ignores a completion even when the fetch ignores abort', async () => {
    const reply = Promise.withResolvers<Response>();
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockReturnValue(reply.promise);
    global.fetch = fetchMock;
    const { unmount } = render(dialog());
    send('scenario-a@example.com');
    const signal = fetchMock.mock.calls[0][1]?.signal;

    unmount();
    await act(async () => reply.resolve(new Response(null, { status: 200 })));

    expect(signal?.aborted).toBe(true);
    expect(trackEmailSent).not.toHaveBeenCalled();
  });

  test('tracks email_opened on open, and email_sent on success', async () => {
    const onOpenChange = jest.fn();

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

    rerender(dialog({ comparison: { ...comparison, grossProfit: 60000 } }));
    expect(screen.getByRole('alert')).toHaveTextContent(unavailableReason);
    expect(screen.getByRole('button', { name: 'Send Results' })).toBeEnabled();
  });
});
