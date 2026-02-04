import { submitFeedback } from '../feedback';

const checkRateLimit = jest.fn();

jest.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-forwarded-for': '1.2.3.4' }),
}));

jest.mock('next/server', () => ({
  after: (cb: () => void) => cb(),
}));

jest.mock('@/lib/rateLimit', () => ({
  checkRateLimit: (ip: string) => checkRateLimit(ip),
}));

describe('submitFeedback', () => {
  beforeEach(() => {
    checkRateLimit.mockReset();
  });

  it('returns validation errors for invalid form data', async () => {
    const formData = new FormData();
    formData.set('email', 'not-an-email');
    formData.set('message', 'short');

    const result = await submitFeedback({ success: false }, formData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid email address');
  });

  it('rate limits feedback submissions', async () => {
    checkRateLimit.mockReturnValue(false);

    const formData = new FormData();
    formData.set('email', 'user@example.com');
    formData.set('message', 'This is a valid feedback message.');

    const result = await submitFeedback({ success: false }, formData);

    expect(checkRateLimit).toHaveBeenCalledWith('1.2.3.4');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Too many requests. Please try again in a minute.');
  });

  it('returns a generic error when Resend is not configured', async () => {
    checkRateLimit.mockReturnValue(true);
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    const formData = new FormData();
    formData.set('email', 'user@example.com');
    formData.set('message', 'This is a valid feedback message.');

    const result = await submitFeedback({ success: false }, formData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Something went wrong. Please try again later.');
    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });
});
