/**
 * @jest-environment node
 *
 * Bug class: PAYMENT-FOUNDATION
 * What bug will this test find?
 * - Tax Pack checkout accepting cross-site posts
 * - Checkout route proceeding without a configured payment gateway
 * - Broken order/session wiring that never creates a pending order
 */

import { describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

jest.mock('@/lib/rateLimit', () => ({
  checkRateLimitWithPolicy: jest.fn(),
}));

const validPayload = {
  email: 'buyer@payetax.co.uk',
  input: {
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
    associatedCompaniesCount: 1,
    minimumSalaryRequirement: 0,
    hasOtherPAYEEmployment: false,
    ytdSalary: 0,
    ytdDividends: 0,
    ytdDrawings: 0,
    yourSetupSalary: 0,
    yourSetupDividends: 0,
  },
  taxYear: '2025-2026',
};

function buildRequest(body: unknown, headers?: Record<string, string>) {
  return new NextRequest('https://payetax.co.uk/api/tax-pack/checkout', {
    method: 'POST',
    headers: new Headers({
      'content-type': 'application/json',
      ...headers,
    }),
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

async function loadRoute(options?: {
  rateLimit?: { allowed: boolean; reason: 'allowed' | 'rate_limited' | 'distributed_unavailable' };
  gateway?: { sessionId: string; url: string } | null;
}) {
  jest.resetModules();
  const module = await import('./route');
  const { checkRateLimitWithPolicy } = jest.requireMock('@/lib/rateLimit') as {
    checkRateLimitWithPolicy: jest.Mock;
  };
  const { resetTaxPackTestState } = await import('@/lib/taxPack/orderStore');
  const { setTaxPackPaymentGatewayForTests } = await import('@/lib/taxPack/paymentGateway');

  resetTaxPackTestState();
  checkRateLimitWithPolicy.mockResolvedValue(
    options?.rateLimit ?? { allowed: true, reason: 'allowed' },
  );
  if (options?.gateway) {
    setTaxPackPaymentGatewayForTests({
      createCheckoutSession: jest.fn().mockResolvedValue(options.gateway),
    });
  } else {
    setTaxPackPaymentGatewayForTests(null);
  }

  return module.POST;
}

describe('/api/tax-pack/checkout POST', () => {
  it('rejects invalid origins', async () => {
    const POST = await loadRoute();
    const response = await POST(buildRequest(validPayload, { origin: 'https://evil.com' }));

    expect(response.status).toBe(403);
  });

  it('returns 503 when the payment gateway is not configured', async () => {
    const POST = await loadRoute();
    const response = await POST(buildRequest(validPayload, { origin: 'https://payetax.co.uk' }));
    const json = await response.json();

    expect(response.status).toBe(503);
    expect(json).toEqual({ error: 'Tax Pack checkout is not configured' });
  });

  it('creates a pending order and checkout session for a valid request', async () => {
    const POST = await loadRoute({
      gateway: {
        sessionId: 'cs_test_tax_pack',
        url: 'https://checkout.stripe.test/session/cs_test_tax_pack',
      },
    });
    const response = await POST(buildRequest(validPayload, { origin: 'https://payetax.co.uk' }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.status).toBe('pending_payment');
    expect(json.orderId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(json.stripeSessionId).toBe('cs_test_tax_pack');
    expect(json.checkoutUrl).toBe('https://checkout.stripe.test/session/cs_test_tax_pack');
  });
});
