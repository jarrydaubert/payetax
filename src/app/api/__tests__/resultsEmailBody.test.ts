/** @jest-environment node */

import { NextRequest } from 'next/server';
import { POST as sendDirectorResults } from '@/app/api/send-director-results/route';
import { POST as sendResults } from '@/app/api/send-results/route';
import { checkRateLimitWithPolicy } from '@/lib/rateLimit';

jest.mock('@/lib/rateLimit', () => ({
  checkRateLimitWithPolicy: jest.fn(),
  createRateLimitHeaders: jest.fn(() => new Headers({ 'Retry-After': '60' })),
}));

const sendEmail = jest.fn();
jest.mock('@/lib/email/outboundResultsDelivery', () => ({
  sendPayeResultsEmail: (...args: unknown[]) => sendEmail(...args),
  sendDirectorResultsEmail: (...args: unknown[]) => sendEmail(...args),
}));

const captureFailure = jest.fn();
jest.mock('@/lib/sentry', () => ({
  captureOperationalFailureAndFlush: (...args: unknown[]) => captureFailure(...args),
}));

const LIMIT = 50 * 1024;
const encoder = new TextEncoder();
const payePayload = {
  email: 'test@example.com',
  input: {
    salary: 50000,
    payPeriod: 'annually',
    taxYear: '2025-2026',
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
    incomeSources: [{ type: 'rental', amount: 0, period: 'annually', label: 'Café' }],
  },
};
const directorPayload = {
  email: 'test@example.com',
  taxYear: '2025-2026',
  input: { region: 'rUK', revenue: 100000, includesVat: false, expenses: 20000 },
};

function streamRequest(
  chunks: Uint8Array[],
  headers: Record<string, string> = {},
  cancel = jest.fn(),
) {
  let index = 0;
  const pull = jest.fn((controller: ReadableStreamDefaultController<Uint8Array>) => {
    if (index < chunks.length) controller.enqueue(chunks[index++]);
    else controller.close();
  });
  const body = new ReadableStream({ pull, cancel }, { highWaterMark: 0 });
  const init = {
    method: 'POST',
    headers: { origin: 'https://payetax.co.uk', ...headers },
    body,
    duplex: 'half' as const,
  };
  const request = new NextRequest('https://payetax.co.uk/api/results-test', init);
  return { request, pull, cancel, body };
}

describe.each([
  ['send-results', sendResults, payePayload],
  ['send-director-results', sendDirectorResults, directorPayload],
] as const)('%s body boundary', (_name, POST, payload) => {
  beforeEach(() => {
    sendEmail.mockReset().mockResolvedValue({ ok: true });
    captureFailure.mockReset();
    jest.mocked(checkRateLimitWithPolicy).mockResolvedValue({
      allowed: true,
      reason: 'allowed',
      backend: 'distributed',
      fallbackPolicy: 'require_distributed_in_production',
    });
  });

  it.each([undefined, '1', String(LIMIT + 1)])(
    'stops and cancels at the byte limit with Content-Length %s',
    async (contentLength) => {
      const headers: Record<string, string> =
        contentLength === undefined ? {} : { 'content-length': contentLength };
      const { request, pull, cancel, body } = streamRequest(
        [encoder.encode(' '.repeat(LIMIT)), encoder.encode(' '), encoder.encode('unread tail')],
        headers,
      );
      expect(request.headers.get('content-length')).toBe(contentLength ?? null);
      const response = await POST(request);

      expect(response.status).toBe(413);
      expect(await response.json()).toEqual({ error: 'Request body too large' });
      expect(pull).toHaveBeenCalledTimes(2);
      expect(cancel).toHaveBeenCalledTimes(1);
      expect(body.locked).toBe(false);
      expect(sendEmail).not.toHaveBeenCalled();
      expect(captureFailure).not.toHaveBeenCalled();
    },
  );

  it('rejects an oversized first chunk by bytes rather than UTF-16 length', async () => {
    const { request, cancel } = streamRequest([encoder.encode(`"${'é'.repeat(LIMIT / 2)}"`)]);
    const response = await POST(request);

    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({ error: 'Request body too large' });
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it.each([0, 1])('handles valid JSON padded to the byte limit plus %i', async (extra) => {
    const json = JSON.stringify(payload);
    const bytes = encoder.encode(
      json + ' '.repeat(LIMIT + extra - encoder.encode(json).byteLength),
    );
    const { request, cancel } = streamRequest([bytes.subarray(0, 37), bytes.subarray(37)]);
    const response = await POST(request);

    if (extra === 0) {
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ success: true });
      expect(sendEmail).toHaveBeenCalledTimes(1);
      expect(sendEmail).toHaveBeenCalledWith(payload);
      expect(cancel).not.toHaveBeenCalled();
    } else {
      expect(response.status).toBe(413);
      expect(await response.json()).toEqual({ error: 'Request body too large' });
      expect(sendEmail).not.toHaveBeenCalled();
      expect(cancel).toHaveBeenCalledTimes(1);
    }
  });

  it('preserves Request.text UTF-8 BOM handling', async () => {
    const { request } = streamRequest([
      Uint8Array.of(0xef),
      Uint8Array.of(0xbb, 0xbf),
      encoder.encode(JSON.stringify(payload)),
    ]);
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(sendEmail).toHaveBeenCalledWith(payload);
  });

  it('preserves UTF-8 decoding when a character spans chunks', async () => {
    const bytes = encoder.encode(JSON.stringify(payload));
    const { request } = streamRequest(Array.from(bytes, (byte) => Uint8Array.of(byte)));
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(sendEmail).toHaveBeenCalledWith(payload);
  });

  it.each([
    ['rejects', () => Promise.reject(new Error('cancel failed'))],
    ['stalls', () => new Promise<void>(() => {})],
  ] as const)('keeps the 413 when source cancellation %s', async (_label, cancelSource) => {
    const { request } = streamRequest([new Uint8Array(LIMIT + 1)], {}, jest.fn(cancelSource));
    const response = await POST(request);

    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({ error: 'Request body too large' });
    expect(captureFailure).not.toHaveBeenCalled();
  });

  it('preserves the read-failure response and releases the reader', async () => {
    // A source failure after a partial read must not reach parsing or delivery.
    const source = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode('{'));
      },
      pull(controller) {
        controller.error(new Error('read failed'));
      },
    });
    const init = {
      method: 'POST',
      headers: { origin: 'https://payetax.co.uk' },
      body: source,
      duplex: 'half' as const,
    };
    const request = new NextRequest('https://payetax.co.uk/api/results-test', init);
    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Failed to read request body' });
    expect(source.locked).toBe(false);
    expect(sendEmail).not.toHaveBeenCalled();
    expect(captureFailure).not.toHaveBeenCalled();
  });

  it('keeps an absent body as invalid JSON', async () => {
    const request = new NextRequest('https://payetax.co.uk/api/results-test', {
      method: 'POST',
      headers: { origin: 'https://payetax.co.uk' },
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Invalid JSON body' });
  });

  it.each([
    ['invalid origin', 'https://evil.example', 'allowed', 403, 'Invalid request origin'],
    [
      'quota exceeded',
      'https://payetax.co.uk',
      'rate_limited',
      429,
      'Too many requests. Please try again later.',
    ],
    [
      'limiter unavailable',
      'https://payetax.co.uk',
      'distributed_unavailable',
      503,
      'Email service temporarily unavailable. Please try again later.',
    ],
  ] as const)(
    'checks %s before reading oversized bodies',
    async (_label, origin, reason, status, error) => {
      jest.mocked(checkRateLimitWithPolicy).mockResolvedValue({
        allowed: reason === 'allowed',
        reason,
        backend: 'distributed',
        fallbackPolicy: 'require_distributed_in_production',
      });
      const { request, pull } = streamRequest([new Uint8Array(LIMIT + 1)], { origin });
      const response = await POST(request);

      expect(response.status).toBe(status);
      expect(await response.json()).toEqual({ error });
      expect(pull).not.toHaveBeenCalled();
      expect(sendEmail).not.toHaveBeenCalled();
    },
  );
});
