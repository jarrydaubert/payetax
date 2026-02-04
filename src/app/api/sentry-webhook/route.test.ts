/**
 * @jest-environment node
 *
 * Bug class: SECURITY-ABUSE
 * What bug will this test find?
 * - Missing secret enforcement
 * - Signature verification regressions
 * - Payload size checks
 * - Linear integration failures
 */

import { createHmac } from 'node:crypto';
import { NextRequest } from 'next/server';
import { LinearClient } from '@linear/sdk';
import { checkRateLimit } from '@/lib/rateLimit';

jest.mock('@linear/sdk', () => ({
  LinearClient: jest.fn(),
}));

jest.mock('@/lib/rateLimit', () => ({
  checkRateLimit: jest.fn(() => true),
}));

const ORIGINAL_ENV = process.env;
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;

function signBody(body: string, secret: string): string {
  return createHmac('sha256', secret).update(Buffer.from(body)).digest('hex');
}

function buildRequest(
  body: string,
  headers: Record<string, string>,
  url = 'https://payetax.co.uk/api/sentry-webhook',
) {
  return new NextRequest(url, {
    method: 'POST',
    headers: new Headers(headers),
    body,
  });
}

async function loadRoute(envOverrides: Record<string, string | undefined> = {}) {
  jest.resetModules();
  process.env = { ...ORIGINAL_ENV, ...envOverrides };
  const module = await import('./route');
  return module.POST;
}

function setRateLimitResult(value: boolean) {
  const mocked = jest.requireMock('@/lib/rateLimit') as {
    checkRateLimit: jest.MockedFunction<typeof checkRateLimit>;
  };
  mocked.checkRateLimit.mockReturnValue(value);
}

const basePayload = {
  action: 'created',
  data: {
    issue: {
      id: '123',
      title: 'Error',
      culprit: 'app.ts',
      shortId: 'PAYE-1',
      permalink: 'https://sentry.example.com',
      logger: null,
      level: 'error',
      status: 'unresolved',
      platform: 'node',
      project: { id: '1', name: 'PayeTax', slug: 'payetax' },
      metadata: { type: 'TypeError', value: 'Boom' },
      count: '12',
      userCount: 3,
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
    },
  },
};

describe('/api/sentry-webhook POST', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
    mockCheckRateLimit.mockReturnValue(true);
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
    consoleInfoSpy?.mockRestore();
    process.env = ORIGINAL_ENV;
  });

  it('returns 500 when the webhook secret is missing', async () => {
    const POST = await loadRoute({ SENTRY_WEBHOOK_SECRET: undefined });
    const body = JSON.stringify(basePayload);
    const request = buildRequest(body, { 'sentry-hook-signature': 'bad' });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({ error: 'Webhook not configured' });
  });

  it('returns 429 when rate limited', async () => {
    const POST = await loadRoute({ SENTRY_WEBHOOK_SECRET: 'secret' });
    setRateLimitResult(false);
    const body = JSON.stringify(basePayload);
    const signature = signBody(body, 'secret');
    const request = buildRequest(body, { 'sentry-hook-signature': signature });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(429);
    expect(json).toEqual({ error: 'Too many requests' });
  });

  it('rejects invalid signatures', async () => {
    const POST = await loadRoute({ SENTRY_WEBHOOK_SECRET: 'secret' });
    const body = JSON.stringify(basePayload);
    const request = buildRequest(body, { 'sentry-hook-signature': 'bad' });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toEqual({ error: 'Invalid signature' });
  });

  it('rejects oversized payloads via content-length', async () => {
    const POST = await loadRoute({ SENTRY_WEBHOOK_SECRET: 'secret' });
    const body = JSON.stringify(basePayload);
    const signature = signBody(body, 'secret');
    const request = buildRequest(body, {
      'sentry-hook-signature': signature,
      'content-length': String(1024 * 1024 + 1),
    });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(413);
    expect(json).toEqual({ error: 'Payload too large' });
  });

  it('ignores non-issue resources', async () => {
    const POST = await loadRoute({ SENTRY_WEBHOOK_SECRET: 'secret' });
    const body = JSON.stringify(basePayload);
    const signature = signBody(body, 'secret');
    const request = buildRequest(body, {
      'sentry-hook-signature': signature,
      'sentry-hook-resource': 'event',
    });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.status).toBe('ignored');
  });

  it('ignores non-created actions', async () => {
    const POST = await loadRoute({ SENTRY_WEBHOOK_SECRET: 'secret', LINEAR_API_KEY: 'key' });
    const payload = { ...basePayload, action: 'resolved' };
    const body = JSON.stringify(payload);
    const signature = signBody(body, 'secret');
    const request = buildRequest(body, {
      'sentry-hook-signature': signature,
      'sentry-hook-resource': 'issue',
    });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.status).toBe('ignored');
  });

  it('creates a Linear issue for valid payloads', async () => {
    const POST = await loadRoute({
      SENTRY_WEBHOOK_SECRET: 'secret',
      LINEAR_API_KEY: 'key',
    });

    const teamsMock = jest.fn().mockResolvedValue({ nodes: [{ key: 'PAYTAX', id: 'team-1' }] });
    const createIssueMock = jest.fn().mockResolvedValue({
      success: true,
      issue: Promise.resolve({ identifier: 'PAY-1' }),
    });
    const { LinearClient } = jest.requireMock('@linear/sdk') as {
      LinearClient: jest.Mock;
    };
    LinearClient.mockImplementation(
      () =>
        ({
          teams: teamsMock,
          createIssue: createIssueMock,
        }) as unknown as LinearClient,
    );

    const body = JSON.stringify(basePayload);
    const signature = signBody(body, 'secret');
    const request = buildRequest(body, {
      'sentry-hook-signature': signature,
      'sentry-hook-resource': 'issue',
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.status).toBe('created');
    expect(json.linearIssue).toBe('PAY-1');
    expect(createIssueMock).toHaveBeenCalledTimes(1);
  });
});
