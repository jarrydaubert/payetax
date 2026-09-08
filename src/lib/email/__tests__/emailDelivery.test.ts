/**
 * @jest-environment node
 *
 * Boundary tests for the Brevo outbound email client. All network behaviour
 * is mocked — no real email sends.
 */

import {
  isOutboundEmailConfigured,
  type OutboundEmailMessage,
  sendOutboundEmail,
} from '../emailDelivery';

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

const MESSAGE: OutboundEmailMessage = {
  from: 'PayeTax <support@payetax.co.uk>',
  to: 'user@example.com',
  subject: 'Your UK Tax Calculation',
  html: '<p>Results</p>',
  text: 'Results',
};

describe('emailDelivery', () => {
  const originalApiKey = process.env.BREVO_API_KEY;
  let fetchMock: jest.SpyInstance;
  let consoleErrorMock: jest.SpyInstance;

  beforeEach(() => {
    process.env.BREVO_API_KEY = 'test-api-key';
    fetchMock = jest.spyOn(global, 'fetch');
    consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    fetchMock.mockRestore();
    consoleErrorMock.mockRestore();
    if (originalApiKey === undefined) {
      delete process.env.BREVO_API_KEY;
    } else {
      process.env.BREVO_API_KEY = originalApiKey;
    }
  });

  describe('isOutboundEmailConfigured', () => {
    it('is true when BREVO_API_KEY is set', () => {
      expect(isOutboundEmailConfigured()).toBe(true);
    });

    it('is false when BREVO_API_KEY is missing or blank', () => {
      delete process.env.BREVO_API_KEY;
      expect(isOutboundEmailConfigured()).toBe(false);

      process.env.BREVO_API_KEY = '   ';
      expect(isOutboundEmailConfigured()).toBe(false);
    });
  });

  describe('sendOutboundEmail', () => {
    it('returns not_configured without calling the network when the API key is missing', async () => {
      delete process.env.BREVO_API_KEY;

      const result = await sendOutboundEmail(MESSAGE, 'test');

      expect(result).toEqual({ ok: false, reason: 'not_configured' });
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('sends the expected Brevo payload and returns ok on success', async () => {
      fetchMock.mockResolvedValue(new Response('{}', { status: 201 }));

      const result = await sendOutboundEmail(MESSAGE, 'test');

      expect(result).toEqual({ ok: true });
      expect(fetchMock).toHaveBeenCalledTimes(1);

      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe(BREVO_ENDPOINT);
      expect(init.method).toBe('POST');
      expect(new Headers(init.headers).get('api-key')).toBe('test-api-key');

      const payload = JSON.parse(String(init.body));
      expect(payload.sender).toEqual({ name: 'PayeTax', email: 'support@payetax.co.uk' });
      expect(payload.to).toEqual([{ email: 'user@example.com' }]);
      expect(payload.subject).toBe(MESSAGE.subject);
      expect(payload.htmlContent).toBe(MESSAGE.html);
      expect(payload.textContent).toBe(MESSAGE.text);
      expect(payload.replyTo).toBeUndefined();
    });

    it('normalizes multiple and name-formatted recipients', async () => {
      fetchMock.mockResolvedValue(new Response('{}', { status: 201 }));

      await sendOutboundEmail(
        {
          ...MESSAGE,
          to: ['Jane Doe <jane@example.com>', 'bob@example.com'],
          replyTo: 'Support <reply@payetax.co.uk>',
        },
        'test',
      );

      const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      const payload = JSON.parse(String(init.body));
      expect(payload.to).toEqual([
        { name: 'Jane Doe', email: 'jane@example.com' },
        { email: 'bob@example.com' },
      ]);
      expect(payload.replyTo).toEqual({ name: 'Support', email: 'reply@payetax.co.uk' });
    });

    it('logs a safe diagnostic for a Brevo unauthorized-IP response', async () => {
      fetchMock.mockResolvedValue(
        new Response(
          JSON.stringify({
            code: 'unauthorized',
            message: 'We have detected you are using an unrecognised IP address 203.0.113.10.',
          }),
          { status: 401 },
        ),
      );

      const result = await sendOutboundEmail(MESSAGE, 'test');

      expect(result).toEqual({ ok: false, reason: 'delivery_failed' });
      expect(consoleErrorMock).toHaveBeenCalledWith('[test] Brevo API error:', {
        status: 401,
        category: 'unauthorized_ip',
        code: 'unauthorized',
      });
      expect(JSON.stringify(consoleErrorMock.mock.calls)).not.toContain('203.0.113.10');
    });

    it.each([
      'Requests from an unknown IP address are blocked.',
      'This IP is not authorized to use the API.',
      'The calling IP has not been verified.',
    ])('classifies Brevo IP authorization wording: %s', async (message) => {
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({ code: 'unauthorized', message }), { status: 403 }),
      );

      await sendOutboundEmail(MESSAGE, 'test');

      expect(consoleErrorMock).toHaveBeenCalledWith('[test] Brevo API error:', {
        status: 403,
        category: 'unauthorized_ip',
        code: 'unauthorized',
      });
    });

    it('keeps a generic invalid-key response in the authorization category', async () => {
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({ code: 'unauthorized', message: 'Key not found' }), {
          status: 401,
        }),
      );

      await sendOutboundEmail(MESSAGE, 'test');

      expect(consoleErrorMock).toHaveBeenCalledWith('[test] Brevo API error:', {
        status: 401,
        category: 'authorization',
        code: 'unauthorized',
      });
    });

    it.each([
      'Unauthorized API key; request received from IP address 203.0.113.10.',
      'Sender is not verified; source IP address was 203.0.113.10.',
    ])('does not treat incidental IP details as an IP authorization failure: %s', async (message) => {
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({ code: 'unauthorized', message }), { status: 401 }),
      );

      await sendOutboundEmail(MESSAGE, 'test');

      expect(consoleErrorMock).toHaveBeenCalledWith('[test] Brevo API error:', {
        status: 401,
        category: 'authorization',
        code: 'unauthorized',
      });
    });

    it('returns delivery_failed when the network request throws', async () => {
      fetchMock.mockRejectedValue(new TypeError('fetch failed'));

      const result = await sendOutboundEmail(MESSAGE, 'test');

      expect(result).toEqual({ ok: false, reason: 'delivery_failed' });
    });
  });
});
