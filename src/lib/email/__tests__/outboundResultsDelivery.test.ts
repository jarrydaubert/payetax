/**
 * @jest-environment node
 *
 * Boundary tests for the results-email orchestration layer: validated input
 * in, Brevo payload out. Network is mocked — no real email sends.
 */

import type { PayeEmailInput } from '@/lib/validation/emailValidation';
import { sendPayeResultsEmail } from '../outboundResultsDelivery';

const PAYE_INPUT: PayeEmailInput = {
  salary: 50000,
  payPeriod: 'annually',
  taxYear: '2026-2027',
  taxCode: '1257L',
  isScottish: false,
  isMarried: false,
  partnerGrossWage: 0,
  isBlind: false,
  payNoNI: false,
  pensionContribution: 0,
  pensionContributionType: 'percentage',
  studentLoanPlans: 'none',
  niCategory: 'A',
  hoursPerWeek: 40,
  allowancesDeductions: 0,
};

describe('sendPayeResultsEmail', () => {
  const originalApiKey = process.env.BREVO_API_KEY;
  let fetchMock: jest.SpyInstance;

  beforeEach(() => {
    process.env.BREVO_API_KEY = 'test-api-key';
    fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(new Response('{}', { status: 201 }));
  });

  afterEach(() => {
    fetchMock.mockRestore();
    if (originalApiKey === undefined) {
      delete process.env.BREVO_API_KEY;
    } else {
      process.env.BREVO_API_KEY = originalApiKey;
    }
  });

  it('recomputes results server-side and emails them to the requested recipient', async () => {
    const result = await sendPayeResultsEmail({ email: 'user@example.com', input: PAYE_INPUT });

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const payload = JSON.parse(String(init.body));

    expect(payload.to).toEqual([{ email: 'user@example.com' }]);
    // Subject embeds the server-computed annual take-home, not client-supplied data.
    expect(payload.subject).toMatch(/^Your UK Tax Calculation - £[\d,]+(\.\d{2})? take-home$/);
    expect(payload.htmlContent).toContain('2026-27');
  });

  it.each([
    ['net-pay', 'Net pay', '35,703.60'],
    ['salary-sacrifice', 'Salary sacrifice', '36,391.68'],
    [undefined, 'Salary sacrifice', '36,391.68'],
  ] as const)(
    'recomputes and labels %s pension in both email formats',
    async (pensionMethod, label, netPay) => {
      // England 2026/27 monthly Plan 5 comparison from pension-methods-2026-27.json.
      await sendPayeResultsEmail({
        email: 'user@example.com',
        input: {
          ...PAYE_INPUT,
          salary: 4500,
          payPeriod: 'monthly',
          pensionContribution: 10,
          pensionMethod,
          studentLoanPlans: ['plan5'],
        },
      });
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      const payload = JSON.parse(String(init.body));
      expect(payload.subject).toContain(netPay);
      expect(payload.htmlContent).toContain(`Pension (${label})`);
      expect(payload.textContent).toContain(`Pension (${label})`);
      expect(payload.htmlContent).toContain('Relief at source requires a separate calculation.');
      expect(payload.textContent).toContain('Relief at source requires a separate calculation.');
    },
  );

  it('rejects unaffordable net-pay deductions before reaching the provider', async () => {
    const result = await sendPayeResultsEmail({
      email: 'user@example.com',
      input: {
        ...PAYE_INPUT,
        salary: 2000,
        payPeriod: 'monthly',
        pensionContribution: 100,
        pensionMethod: 'net-pay',
      },
    });
    expect(result).toMatchObject({ ok: false, reason: 'invalid_pension' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('propagates not_configured when the email provider is unconfigured', async () => {
    delete process.env.BREVO_API_KEY;
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = await sendPayeResultsEmail({ email: 'user@example.com', input: PAYE_INPUT });

    expect(result).toEqual({ ok: false, reason: 'not_configured' });
    expect(fetchMock).not.toHaveBeenCalled();
    consoleErrorMock.mockRestore();
  });
});
