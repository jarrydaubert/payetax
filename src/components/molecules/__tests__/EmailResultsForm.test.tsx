import type { PayeEmailInput } from '@/lib/validation/emailValidation';
import { fireEvent, render, screen, waitFor } from '@/test/testing-library';
import { EmailResultsForm } from '../EmailResultsForm';

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
  });

  it('submits and shows sent confirmation', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });

    render(<EmailResultsForm prepare={() => ({ input: makeInput(), isCurrent: () => true })} />);

    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute(
      'href',
      '/privacy',
    );

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
  });

  it('shows scenario validation feedback without requesting delivery', () => {
    global.fetch = jest.fn();
    render(
      <EmailResultsForm
        prepare={() => {
          throw new Error('Correct the invalid amount in Salary');
        }}
      />,
    );
    fireEvent.change(screen.getByLabelText('Email address for results'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Email Results/i }));
    expect(global.fetch).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Correct the invalid amount in Salary');
  });

  it('ignores duplicate submissions and attributes a late delivery to the earlier calculation', async () => {
    let resolveRequest: (response: Response) => void = () => {};
    const response = new Promise<Response>((resolve) => {
      resolveRequest = resolve;
    });
    global.fetch = jest.fn().mockReturnValue(response);
    let current = true;
    const { container } = render(
      <EmailResultsForm prepare={() => ({ input: makeInput(), isCurrent: () => current })} />,
    );
    fireEvent.change(screen.getByLabelText('Email address for results'), {
      target: { value: 'test@example.com' },
    });
    const form = container.querySelector('form');
    if (!form) throw new Error('Missing email form');
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    current = false;
    resolveRequest({ ok: true } as Response);
    expect(await screen.findByRole('status')).toHaveTextContent('Earlier results sent to');
  });
});
