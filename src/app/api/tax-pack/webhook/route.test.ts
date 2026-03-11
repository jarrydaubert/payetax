/**
 * @jest-environment node
 *
 * Bug class: PAYMENT-FOUNDATION
 * What bug will this test find?
 * - Unsigned or invalid Tax Pack webhooks being accepted
 * - Duplicate payment events generating duplicate fulfillment side effects
 * - Paid orders never reaching ready state with an artifact
 */

import { createHmac } from 'node:crypto';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

jest.mock('@/lib/rateLimit', () => ({
  checkRateLimitWithPolicy: jest.fn(),
}));

const ORIGINAL_ENV = process.env;

const checkoutPayload = {
  email: 'buyer@payetax.co.uk',
  input: {
    region: 'rUK',
    revenue: 100000,
    includesVat: false,
    expenses: 20000,
    lossesBroughtForward: 0,
    otherIncome: 5000,
    employmentAllowance: false,
    studentLoanPlans: ['plan2'],
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

function buildCheckoutRequest(body: unknown) {
  return new NextRequest('https://payetax.co.uk/api/tax-pack/checkout', {
    method: 'POST',
    headers: new Headers({
      'content-type': 'application/json',
      origin: 'https://payetax.co.uk',
    }),
    body: JSON.stringify(body),
  });
}

function buildWebhookRequest(body: string, secret: string, signatureOverride?: string) {
  const signature = signatureOverride ?? createHmac('sha256', secret).update(body).digest('hex');
  return new NextRequest('https://payetax.co.uk/api/tax-pack/webhook', {
    method: 'POST',
    headers: new Headers({
      'content-type': 'application/json',
      'x-tax-pack-signature': signature,
    }),
    body,
  });
}

async function loadModules() {
  jest.resetModules();
  process.env = { ...ORIGINAL_ENV, TAX_PACK_WEBHOOK_SECRET: 'tax-pack-secret' };

  const checkoutModule = await import('../checkout/route');
  const webhookModule = await import('./route');
  const statusModule = await import('../status/[orderId]/route');
  const { resetTaxPackTestState } = await import('@/lib/taxPack/orderStore');
  const { setTaxPackPaymentGatewayForTests } = await import('@/lib/taxPack/paymentGateway');
  const { checkRateLimitWithPolicy } = jest.requireMock('@/lib/rateLimit') as {
    checkRateLimitWithPolicy: jest.Mock;
  };

  resetTaxPackTestState();
  checkRateLimitWithPolicy.mockResolvedValue({ allowed: true, reason: 'allowed' });
  setTaxPackPaymentGatewayForTests({
    createCheckoutSession: jest.fn().mockResolvedValue({
      sessionId: 'cs_test_tax_pack',
      url: 'https://checkout.stripe.test/session/cs_test_tax_pack',
    }),
  });

  return {
    checkoutPOST: checkoutModule.POST,
    webhookPOST: webhookModule.POST,
    statusGET: statusModule.GET,
  };
}

describe('/api/tax-pack/webhook POST', () => {
  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it('rejects invalid signatures', async () => {
    const { webhookPOST } = await loadModules();
    const rawBody = JSON.stringify({
      id: 'evt_invalid',
      type: 'checkout.session.completed',
      data: { orderId: 'f5bd1b4b-1d28-4fea-a4fb-4f799d70afeb', sessionId: 'cs_invalid' },
    });

    const response = await webhookPOST(
      buildWebhookRequest(rawBody, 'tax-pack-secret', 'bad-signature'),
    );
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toEqual({ error: 'Invalid webhook signature' });
  });

  it('marks the order ready and keeps duplicate completion events idempotent', async () => {
    const { checkoutPOST, webhookPOST, statusGET } = await loadModules();
    const checkoutResponse = await checkoutPOST(buildCheckoutRequest(checkoutPayload));
    const checkoutJson = await checkoutResponse.json();
    const orderId = checkoutJson.orderId as string;

    const rawBody = JSON.stringify({
      id: 'evt_checkout_complete',
      type: 'checkout.session.completed',
      data: {
        orderId,
        sessionId: 'cs_test_tax_pack',
        paymentIntentId: 'pi_tax_pack_123',
      },
    });

    const firstResponse = await webhookPOST(buildWebhookRequest(rawBody, 'tax-pack-secret'));
    const firstJson = await firstResponse.json();
    const duplicateResponse = await webhookPOST(buildWebhookRequest(rawBody, 'tax-pack-secret'));
    const duplicateJson = await duplicateResponse.json();
    const statusResponse = await statusGET(
      new NextRequest(`https://payetax.co.uk/api/tax-pack/status/${orderId}`),
      { params: Promise.resolve({ orderId }) },
    );
    const statusJson = await statusResponse.json();

    expect(firstResponse.status).toBe(200);
    expect(firstJson.status).toBe('ready');
    expect(firstJson.artifact.fileName).toBe(`tax-pack-${orderId}.json`);
    expect(firstJson.artifact.byteSize).toBeGreaterThan(0);

    expect(duplicateResponse.status).toBe(200);
    expect(duplicateJson.status).toBe('ready');
    expect(duplicateJson.artifact.checksumSha256).toBe(firstJson.artifact.checksumSha256);

    expect(statusResponse.status).toBe(200);
    expect(statusJson.status).toBe('ready');
    expect(statusJson.artifact.fileName).toBe(`tax-pack-${orderId}.json`);
  });
});
