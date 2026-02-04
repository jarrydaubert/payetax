/**
 * @jest-environment node
 *
 * Bug class: SECURITY-ABUSE
 * What bug will this test find?
 * - Origin allowlist regressions (CSRF bypass)
 * - Rate-limit bypass
 * - Resend/audience configuration errors
 * - JSON/Zod validation failures
 */

import { NextRequest } from 'next/server';

jest.mock('@/lib/rateLimit', () => ({
  checkRateLimit: jest.fn(),
}));

jest.mock('@/lib/newsletter/unsubscribeToken', () => ({
  createUnsubscribeToken: jest.fn(),
  resolveUnsubscribeSecret: jest.fn(),
}));

const sendMock = jest.fn();
const contactsCreateMock = jest.fn();

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: sendMock,
    },
    contacts: {
      create: contactsCreateMock,
    },
  })),
}));

const ORIGINAL_ENV = process.env;

function buildRequest(
  body: unknown,
  headers?: Record<string, string>,
  url = 'https://payetax.co.uk/api/newsletter/subscribe',
) {
  return new NextRequest(url, {
    method: 'POST',
    headers: new Headers({
      'content-type': 'application/json',
      ...headers,
    }),
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

async function loadRoute(envOverrides: Record<string, string | undefined> = {}, rateLimit = true) {
  jest.resetModules();
  process.env = { ...ORIGINAL_ENV, ...envOverrides };
  const module = await import('./route');
  const { checkRateLimit } = jest.requireMock('@/lib/rateLimit') as {
    checkRateLimit: jest.Mock;
  };
  checkRateLimit.mockReturnValue(rateLimit);
  const { createUnsubscribeToken, resolveUnsubscribeSecret } = jest.requireMock(
    '@/lib/newsletter/unsubscribeToken',
  ) as {
    createUnsubscribeToken: jest.Mock;
    resolveUnsubscribeSecret: jest.Mock;
  };
  createUnsubscribeToken.mockReturnValue('token');
  resolveUnsubscribeSecret.mockReturnValue('secret');
  return module.POST;
}

describe('/api/newsletter/subscribe POST', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    sendMock.mockReset();
    contactsCreateMock.mockReset();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
    process.env = ORIGINAL_ENV;
  });

  it('rejects invalid origins', async () => {
    const POST = await loadRoute({ RESEND_API_KEY: 'test', RESEND_AUDIENCE_ID: 'aud' });
    const request = buildRequest({ email: 'test@payetax.co.uk' }, { origin: 'https://evil.com' });
    const response = await POST(request);

    expect(response.status).toBe(403);
  });

  it('rate limits when the limiter denies the client', async () => {
    const POST = await loadRoute({ RESEND_API_KEY: 'test', RESEND_AUDIENCE_ID: 'aud' }, false);
    const request = buildRequest(
      { email: 'test@payetax.co.uk' },
      { origin: 'https://payetax.co.uk' },
    );
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(429);
    expect(json).toEqual({ error: 'Too many requests. Please try again later.' });
  });

  it('returns 503 when Resend is not configured', async () => {
    const POST = await loadRoute({ RESEND_API_KEY: undefined, RESEND_AUDIENCE_ID: 'aud' });
    const request = buildRequest(
      { email: 'test@payetax.co.uk' },
      { origin: 'https://payetax.co.uk' },
    );
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(503);
    expect(json).toEqual({ error: 'Email service not configured' });
  });

  it('returns 503 when audience is not configured', async () => {
    const POST = await loadRoute({ RESEND_API_KEY: 'test', RESEND_AUDIENCE_ID: undefined });
    const request = buildRequest(
      { email: 'test@payetax.co.uk' },
      { origin: 'https://payetax.co.uk' },
    );
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(503);
    expect(json).toEqual({ error: 'Newsletter not configured' });
  });

  it('rejects invalid JSON payloads', async () => {
    const POST = await loadRoute({ RESEND_API_KEY: 'test', RESEND_AUDIENCE_ID: 'aud' });
    const request = buildRequest('{', { origin: 'https://payetax.co.uk' });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ error: 'Invalid JSON body' });
  });

  it('rejects invalid email payloads', async () => {
    const POST = await loadRoute({ RESEND_API_KEY: 'test', RESEND_AUDIENCE_ID: 'aud' });
    const request = buildRequest({ email: 'bad' }, { origin: 'https://payetax.co.uk' });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Invalid email address');
  });

  it('returns success without sending a welcome email when contact exists', async () => {
    contactsCreateMock.mockResolvedValue({ error: { message: 'already exists' } });
    const POST = await loadRoute({ RESEND_API_KEY: 'test', RESEND_AUDIENCE_ID: 'aud' });
    const request = buildRequest(
      { email: 'test@payetax.co.uk' },
      { origin: 'https://payetax.co.uk' },
    );
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('creates contact and sends welcome email for new subscribers', async () => {
    contactsCreateMock.mockResolvedValue({ error: null });
    sendMock.mockResolvedValue({});
    const POST = await loadRoute({
      RESEND_API_KEY: 'test',
      RESEND_AUDIENCE_ID: 'aud',
      UNSUBSCRIBE_SECRET: 'secret',
    });
    const request = buildRequest(
      { email: 'test@payetax.co.uk' },
      { origin: 'https://payetax.co.uk' },
    );
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(contactsCreateMock).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalled();
  });
});
