const sendMock = jest.fn();

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: sendMock,
    },
  })),
}));

import { sendOutboundEmail } from '@/lib/email/emailDelivery';

const ORIGINAL_ENV = process.env;

describe('emailDelivery', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    sendMock.mockReset();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    process.env = ORIGINAL_ENV;
  });

  test('returns not_configured when RESEND_API_KEY is missing', async () => {
    process.env = { ...ORIGINAL_ENV, RESEND_API_KEY: undefined };

    await expect(
      sendOutboundEmail(
        {
          from: 'PayeTax <noreply@payetax.co.uk>',
          to: 'test@payetax.co.uk',
          subject: 'Test',
          html: '<p>Hello</p>',
          text: 'Hello',
        },
        'test-email',
      ),
    ).resolves.toEqual({ ok: false, reason: 'not_configured' });
  });

  test('returns delivery_failed when Resend reports an error', async () => {
    process.env = { ...ORIGINAL_ENV, RESEND_API_KEY: 'test' };
    sendMock.mockResolvedValue({ error: { message: 'failed' } });

    await expect(
      sendOutboundEmail(
        {
          from: 'PayeTax <noreply@payetax.co.uk>',
          to: 'test@payetax.co.uk',
          subject: 'Test',
          html: '<p>Hello</p>',
          text: 'Hello',
        },
        'test-email',
      ),
    ).resolves.toEqual({ ok: false, reason: 'delivery_failed' });
  });

  test('returns ok when Resend accepts the message', async () => {
    process.env = { ...ORIGINAL_ENV, RESEND_API_KEY: 'test' };
    sendMock.mockResolvedValue({ error: null });

    await expect(
      sendOutboundEmail(
        {
          from: 'PayeTax <noreply@payetax.co.uk>',
          to: 'test@payetax.co.uk',
          subject: 'Test',
          html: '<p>Hello</p>',
          text: 'Hello',
        },
        'test-email',
      ),
    ).resolves.toEqual({ ok: true });

    expect(sendMock).toHaveBeenCalledTimes(1);
  });
});
