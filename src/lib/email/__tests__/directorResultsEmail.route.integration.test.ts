/** @jest-environment node */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/send-director-results/route';
import { sendOutboundEmail } from '../emailDelivery';

jest.mock('../../../../sentry.server.config', () => ({}));
jest.mock('@/lib/rateLimit', () => ({
  checkRateLimitWithPolicy: jest.fn().mockResolvedValue({ allowed: true, reason: 'allowed' }),
  createRateLimitHeaders: jest.fn(),
}));
jest.mock('@/lib/sentry', () => ({ captureOperationalFailureAndFlush: jest.fn() }));
jest.mock('../emailDelivery', () => ({
  sendOutboundEmail: jest.fn().mockResolvedValue({ ok: true }),
}));

describe('Director results route → real orchestration/templates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each(
    [
      { taxYear: '2025-2026', januaryReminder: '31 January 2027' },
      { taxYear: '2026-2027', januaryReminder: '31 January 2028' },
    ].flatMap(({ taxYear, januaryReminder }) =>
      [
        { scenario: 'rUK', region: 'rUK', otherIncome: 0 },
        { scenario: 'Scottish', region: 'scotland', otherIncome: 0 },
        { scenario: 'high-income rUK', region: 'rUK', otherIncome: 120000 },
        { scenario: 'high-income Scottish', region: 'scotland', otherIncome: 120000 },
      ].map((sample) => ({ taxYear, januaryReminder, ...sample })),
    ),
  )(
    '$taxYear $scenario email qualifies tax dates and omits generic rates in both formats',
    async ({ taxYear, januaryReminder, region, otherIncome }) => {
      const network = jest
        .spyOn(global, 'fetch')
        .mockRejectedValue(new Error('No network allowed in email audit'));
      try {
        const response = await POST(
          new NextRequest('https://payetax.co.uk/api/send-director-results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', origin: 'https://payetax.co.uk' },
            body: JSON.stringify({
              email: 'audit@example.com',
              taxYear,
              input: {
                region,
                otherIncome,
                revenue: 100000,
                includesVat: false,
                expenses: 20000,
                minimumSalaryRequirement: 20000,
              },
            }),
          }),
        );
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ success: true });
        expect(sendOutboundEmail).toHaveBeenCalledWith(
          expect.objectContaining({
            to: 'audit@example.com',
            subject: expect.stringContaining('Director Tax Strategy Report'),
            html: expect.stringContaining('Personal tax pot'),
            text: expect.stringContaining('Employee NI:'),
          }),
          'send-director-results',
        );
        expect(sendOutboundEmail).toHaveBeenCalledTimes(1);
        const message = jest.mocked(sendOutboundEmail).mock.calls[0][0];
        for (const content of [message.html, message.text]) {
          const yearLabel = `${taxYear.slice(0, 5)}${taxYear.slice(-2)}`;
          expect(content).toContain(
            `Self Assessment for ${yearLabel}: ${januaryReminder} is the usual deadline to file online and pay any balance due.`,
          );
          expect(content).toContain('Payments on account, if required,');
          expect(content).toContain('31 January and 31 July');
          expect(content).toContain('This report does not include company deadlines.');
          expect(content).toContain('follow the company accounting period');
          expect(content).toContain('Instalment rules may change when Corporation Tax is due.');
          expect(content).toContain('https://www.gov.uk/pay-corporation-tax');
          expect(content).toContain('https://www.gov.uk/company-tax-returns');
          expect(content).toContain(
            'https://www.gov.uk/understand-self-assessment-bill/payments-on-account',
          );
          expect(content).not.toContain('Self Assessment deadline');
          expect(content).not.toMatch(
            /Rates used|Personal Allowance|Basic Rate band|Higher Rate band|Dividend Allowance|Small Profits Rate|Main CT Rate/i,
          );
        }
        expect(network).not.toHaveBeenCalled();
      } finally {
        network.mockRestore();
      }
    },
  );
});
