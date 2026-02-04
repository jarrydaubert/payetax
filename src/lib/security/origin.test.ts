import { getDefaultCsrfAllowedHosts, isValidRequestOrigin } from '@/lib/security/origin';

function makeRequest(headersInit: Record<string, string | undefined>) {
  const headers = new Headers();
  for (const [k, v] of Object.entries(headersInit)) {
    if (v !== undefined) headers.set(k, v);
  }
  return { headers };
}

describe('security/origin', () => {
  describe('isValidRequestOrigin', () => {
    test('rejects requests with no origin/referer by default', () => {
      expect(isValidRequestOrigin(makeRequest({}))).toBe(false);
    });

    test('allows https origin on allowlist', () => {
      expect(isValidRequestOrigin(makeRequest({ origin: 'https://payetax.co.uk' }))).toBe(true);
      expect(isValidRequestOrigin(makeRequest({ origin: 'https://www.payetax.co.uk' }))).toBe(true);
    });

    test('rejects invalid or non-allowlisted origins', () => {
      expect(isValidRequestOrigin(makeRequest({ origin: 'https://evil.com' }))).toBe(false);
      expect(isValidRequestOrigin(makeRequest({ origin: 'not-a-url' }))).toBe(false);
    });

    test('uses referer when origin is absent', () => {
      expect(isValidRequestOrigin(makeRequest({ referer: 'https://payetax.co.uk/tools' }))).toBe(
        true,
      );
      expect(isValidRequestOrigin(makeRequest({ referer: 'https://evil.com/tools' }))).toBe(false);
    });
  });

  describe('getDefaultCsrfAllowedHosts', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv;
      process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
    });

    test('includes localhost in non-production', () => {
      process.env.NODE_ENV = 'test';
      expect(getDefaultCsrfAllowedHosts()).toContain('localhost:3000');
    });

    test('excludes localhost in production', () => {
      process.env.NODE_ENV = 'production';
      expect(getDefaultCsrfAllowedHosts()).not.toContain('localhost:3000');
    });

    test('adds host from NEXT_PUBLIC_SITE_URL when provided', () => {
      process.env.NODE_ENV = 'production';
      process.env.NEXT_PUBLIC_SITE_URL = 'https://custom-domain.example/path';
      expect(getDefaultCsrfAllowedHosts()).toContain('custom-domain.example');
    });
  });
});
