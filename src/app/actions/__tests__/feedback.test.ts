import { submitFeedback } from '../feedback';

const checkRateLimitWithPolicy = jest.fn();
const ORIGINAL_ENV = process.env;

jest.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-forwarded-for': '1.2.3.4' }),
}));

jest.mock('next/server', () => ({
  after: (cb: () => void) => cb(),
}));

jest.mock('@/lib/rateLimit', () => ({
  checkRateLimitWithPolicy: (ip: string, config?: unknown, policy?: unknown) =>
    checkRateLimitWithPolicy(ip, config, policy),
}));

describe('submitFeedback', () => {
  beforeEach(() => {
    checkRateLimitWithPolicy.mockReset();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
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
    checkRateLimitWithPolicy.mockReturnValue({ allowed: false, reason: 'rate_limited' });

    const formData = new FormData();
    formData.set('email', 'user@example.com');
    formData.set('message', 'This is a valid feedback message.');

    const result = await submitFeedback({ success: false }, formData);

    expect(checkRateLimitWithPolicy).toHaveBeenCalledWith(
      'feedback:1.2.3.4',
      undefined,
      'require_distributed_in_production',
    );
    expect(result.success).toBe(false);
    expect(result.error).toBe('Too many requests. Please try again in a minute.');
  });

  it('returns a generic error when Resend is not configured', async () => {
    checkRateLimitWithPolicy.mockReturnValue({ allowed: true, reason: 'allowed' });
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

  it('returns a generic error when distributed protection is unavailable in production', async () => {
    process.env.NODE_ENV = 'production';
    checkRateLimitWithPolicy.mockReturnValue({
      allowed: false,
      reason: 'distributed_unavailable',
    });

    const formData = new FormData();
    formData.set('email', 'user@example.com');
    formData.set('message', 'This is a valid feedback message.');

    const result = await submitFeedback({ success: false }, formData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Something went wrong. Please try again later.');
  });
});
