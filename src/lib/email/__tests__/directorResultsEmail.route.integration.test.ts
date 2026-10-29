/** @jest-environment node */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/send-director-results/route';
import { CURRENT_TAX_YEAR } from '@/constants/taxRates';
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
  it('validates inputs and builds both formats with the provider fully stubbed', async () => {
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
            taxYear: CURRENT_TAX_YEAR,
            input: {
              region: 'rUK',
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
      expect(network).not.toHaveBeenCalled();
    } finally {
      network.mockRestore();
    }
  });
});
