// src/lib/__tests__/rateLimit.test.ts
import { setNodeEnv } from '@/test/env';
import {
  checkRateLimit,
  checkRateLimitWithPolicy,
  clearAllRateLimits,
  createRateLimitHeaders,
  getRateLimitDiagnostics,
  getRemainingRequests,
  getRetryAfterSeconds,
  resetRateLimit,
} from '../rateLimit';

describe('Rate Limiting', () => {
  const originalUpstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const originalUpstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeAll(() => {
    // Keep unit tests deterministic and offline.
    process.env.UPSTASH_REDIS_REST_URL = undefined;
    process.env.UPSTASH_REDIS_REST_TOKEN = undefined;
  });

  afterAll(() => {
    if (originalUpstashUrl) process.env.UPSTASH_REDIS_REST_URL = originalUpstashUrl;
    if (originalUpstashToken) process.env.UPSTASH_REDIS_REST_TOKEN = originalUpstashToken;
    if (originalNodeEnv) {
      setNodeEnv(originalNodeEnv);
    }
  });

  beforeEach(() => {
    // Clear all rate limits before each test
    clearAllRateLimits();
  });

  afterEach(() => {
    // Clean up after each test
    clearAllRateLimits();
  });

  describe('checkRateLimit', () => {
    it('should allow requests under the limit', async () => {
      const ip = '192.168.1.1';

      // Should allow first 10 requests
      for (let i = 0; i < 10; i++) {
        await expect(checkRateLimit(ip)).resolves.toBe(true);
      }
    });

    it('should block requests over the limit', async () => {
      const ip = '192.168.1.2';

      // Allow first 10 requests
      for (let i = 0; i < 10; i++) {
        await checkRateLimit(ip);
      }

      // 11th request should be blocked
      await expect(checkRateLimit(ip)).resolves.toBe(false);
    });

    it('should track different IPs independently', async () => {
      const ip1 = '192.168.1.1';
      const ip2 = '192.168.1.2';

      // Max out ip1
      for (let i = 0; i < 10; i++) {
        await checkRateLimit(ip1);
      }

      // ip2 should still be allowed
      await expect(checkRateLimit(ip2)).resolves.toBe(true);
    });

    it('should allow requests after rate limit reset', async () => {
      const ip = '192.168.1.3';

      // Max out requests
      for (let i = 0; i < 10; i++) {
        await checkRateLimit(ip);
      }

      // Should be blocked
      await expect(checkRateLimit(ip)).resolves.toBe(false);

      // Reset the IP
      resetRateLimit(ip);

      // Should be allowed again
      await expect(checkRateLimit(ip)).resolves.toBe(true);
    });

    it('should respect custom rate limit config', async () => {
      const ip = '192.168.1.4';
      const customConfig = { max: 5, window: 60000 };

      // Allow first 5 requests
      for (let i = 0; i < 5; i++) {
        await expect(checkRateLimit(ip, customConfig)).resolves.toBe(true);
      }

      // 6th request should be blocked
      await expect(checkRateLimit(ip, customConfig)).resolves.toBe(false);
    });

    it('should handle unknown IP addresses', async () => {
      const ip = 'unknown';

      // Should still rate limit unknown IPs
      for (let i = 0; i < 10; i++) {
        await expect(checkRateLimit(ip)).resolves.toBe(true);
      }

      await expect(checkRateLimit(ip)).resolves.toBe(false);
    });
  });

  describe('checkRateLimitWithPolicy', () => {
    it('fails closed in production when distributed protection is required but unavailable', async () => {
      setNodeEnv('production');
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = await checkRateLimitWithPolicy(
        '192.168.9.1',
        undefined,
        'require_distributed_in_production',
      );

      expect(result).toEqual({
        allowed: false,
        backend: 'in-memory',
        fallbackPolicy: 'require_distributed_in_production',
        reason: 'distributed_unavailable',
      });
      consoleErrorSpy.mockRestore();
    });

    it('still uses in-memory fallback outside production when distributed protection is required', async () => {
      setNodeEnv('test');

      const result = await checkRateLimitWithPolicy(
        '192.168.9.2',
        { max: 1, window: 60000 },
        'require_distributed_in_production',
      );

      expect(result).toEqual({
        allowed: true,
        backend: 'in-memory',
        fallbackPolicy: 'require_distributed_in_production',
        reason: 'allowed',
      });
    });
  });

  describe('getRateLimitDiagnostics', () => {
    const originalFetch = global.fetch;

    afterEach(() => {
      global.fetch = originalFetch;
      process.env.UPSTASH_REDIS_REST_URL = undefined;
      process.env.UPSTASH_REDIS_REST_TOKEN = undefined;
      jest.resetModules();
    });

    it('reports distributed checks as not configured when REST env vars are missing', async () => {
      const diagnostics = await getRateLimitDiagnostics();

      expect(diagnostics).toMatchObject({
        configured: false,
        backend: 'in-memory',
        upstashPing: 'not_configured',
        upstashReadWriteDelete: 'not_configured',
      });
    });

    it('runs a REST ping plus write/read/delete probe when configured', async () => {
      jest.resetModules();
      process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
      let storedValue = '';

      const fetchMock = jest.fn((input: RequestInfo | URL) => {
        const url = String(input);

        if (url.includes('/PING')) {
          return Promise.resolve(new Response(JSON.stringify({ result: 'PONG' }), { status: 200 }));
        }

        if (url.includes('/SET/')) {
          const parts = url.split('/');
          storedValue = decodeURIComponent(parts.at(-3) ?? '');
          return Promise.resolve(new Response(JSON.stringify({ result: 'OK' }), { status: 200 }));
        }

        if (url.includes('/GET/')) {
          return Promise.resolve(
            new Response(JSON.stringify({ result: storedValue }), { status: 200 }),
          );
        }

        if (url.includes('/DEL/')) {
          return Promise.resolve(new Response(JSON.stringify({ result: 1 }), { status: 200 }));
        }

        return Promise.resolve(
          new Response(JSON.stringify({ error: 'unexpected command' }), { status: 400 }),
        );
      });
      global.fetch = fetchMock as typeof fetch;

      const { getRateLimitDiagnostics: getConfiguredDiagnostics } = await import('../rateLimit');
      const diagnostics = await getConfiguredDiagnostics();

      expect(diagnostics).toMatchObject({
        configured: true,
        backend: 'distributed',
        upstashPing: 'ok',
        upstashReadWriteDelete: 'ok',
      });
      expect(fetchMock).toHaveBeenCalledTimes(4);
      expect(fetchMock.mock.calls.map(([input]) => String(input))).toEqual([
        expect.stringContaining('/PING'),
        expect.stringContaining('/SET/'),
        expect.stringContaining('/GET/'),
        expect.stringContaining('/DEL/'),
      ]);
    });
  });

  describe('distributed counter (pipelined)', () => {
    const originalFetch = global.fetch;

    afterEach(() => {
      global.fetch = originalFetch;
      process.env.UPSTASH_REDIS_REST_URL = undefined;
      process.env.UPSTASH_REDIS_REST_TOKEN = undefined;
      jest.resetModules();
    });

    it('increments and sets expiry in a single pipeline request', async () => {
      jest.resetModules();
      process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';

      let counter = 0;
      const fetchMock = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        expect(url).toBe('https://example.upstash.io/pipeline');

        const commands = JSON.parse(String(init?.body)) as string[][];
        expect(commands).toHaveLength(2);
        expect(commands[0]?.[0]).toBe('INCR');
        expect(commands[1]?.[0]).toBe('PEXPIRE');
        expect(commands[1]?.[3]).toBe('NX');

        counter += 1;
        return Promise.resolve(
          new Response(JSON.stringify([{ result: counter }, { result: 1 }]), { status: 200 }),
        );
      });
      global.fetch = fetchMock as typeof fetch;

      const { checkRateLimitWithPolicy: check } = await import('../rateLimit');

      const first = await check('pipeline-test', { max: 2, window: 60000 });
      const second = await check('pipeline-test', { max: 2, window: 60000 });
      const third = await check('pipeline-test', { max: 2, window: 60000 });

      expect(first).toMatchObject({ allowed: true, backend: 'distributed' });
      expect(second).toMatchObject({ allowed: true, backend: 'distributed' });
      expect(third).toMatchObject({ allowed: false, reason: 'rate_limited' });
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it('falls back to in-memory when the pipeline request fails', async () => {
      jest.resetModules();
      process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';

      global.fetch = jest.fn(() =>
        Promise.resolve(new Response('upstream error', { status: 500 })),
      ) as typeof fetch;

      const { checkRateLimitWithPolicy: check } = await import('../rateLimit');
      const result = await check('pipeline-failure-test', { max: 2, window: 60000 });

      expect(result).toMatchObject({ allowed: true, backend: 'in-memory' });
    });
  });

  describe('getRemainingRequests', () => {
    it('should return correct remaining requests', async () => {
      const ip = '192.168.1.5';

      expect(getRemainingRequests(ip)).toBe(10);

      await checkRateLimit(ip);
      expect(getRemainingRequests(ip)).toBe(9);

      await checkRateLimit(ip);
      expect(getRemainingRequests(ip)).toBe(8);
    });

    it('should return 0 when limit is reached', async () => {
      const ip = '192.168.1.6';

      // Max out requests
      for (let i = 0; i < 10; i++) {
        await checkRateLimit(ip);
      }

      expect(getRemainingRequests(ip)).toBe(0);
    });

    it('should respect custom config', async () => {
      const ip = '192.168.1.7';
      const customConfig = { max: 3, window: 60000 };

      expect(getRemainingRequests(ip, customConfig)).toBe(3);

      await checkRateLimit(ip, customConfig);
      expect(getRemainingRequests(ip, customConfig)).toBe(2);
    });
  });

  describe('Retry-After helpers', () => {
    it('derives retry-after seconds from the active limiter window', () => {
      expect(getRetryAfterSeconds()).toBe('60');
      expect(getRetryAfterSeconds({ max: 3, window: 3600000 })).toBe('3600');
    });

    it('merges retry-after into existing headers', () => {
      const headers = createRateLimitHeaders(
        { max: 5, window: 60000 },
        { 'Content-Type': 'application/json' },
      );

      expect(headers.get('Retry-After')).toBe('60');
      expect(headers.get('Content-Type')).toBe('application/json');
    });
  });

  describe('resetRateLimit', () => {
    it('should reset rate limit for specific IP', async () => {
      const ip = '192.168.1.8';

      // Use up some requests
      for (let i = 0; i < 5; i++) {
        await checkRateLimit(ip);
      }

      expect(getRemainingRequests(ip)).toBe(5);

      // Reset
      resetRateLimit(ip);

      // Should have full limit again
      expect(getRemainingRequests(ip)).toBe(10);
    });

    it('should not affect other IPs', async () => {
      const ip1 = '192.168.1.9';
      const ip2 = '192.168.1.10';

      // Use requests on both IPs
      await checkRateLimit(ip1);
      await checkRateLimit(ip2);

      // Reset ip1
      resetRateLimit(ip1);

      // ip1 should be reset
      expect(getRemainingRequests(ip1)).toBe(10);

      // ip2 should still be at 9
      expect(getRemainingRequests(ip2)).toBe(9);
    });
  });

  describe('clearAllRateLimits', () => {
    it('should clear all rate limits', async () => {
      const ip1 = '192.168.1.11';
      const ip2 = '192.168.1.12';

      // Use requests on both IPs
      for (let i = 0; i < 5; i++) {
        await checkRateLimit(ip1);
        await checkRateLimit(ip2);
      }

      expect(getRemainingRequests(ip1)).toBe(5);
      expect(getRemainingRequests(ip2)).toBe(5);

      // Clear all
      clearAllRateLimits();

      // Both should be reset
      expect(getRemainingRequests(ip1)).toBe(10);
      expect(getRemainingRequests(ip2)).toBe(10);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string IP', async () => {
      const ip = '';

      await expect(checkRateLimit(ip)).resolves.toBe(true);
    });

    it('should handle IPv6 addresses', async () => {
      const ip = '2001:0db8:85a3:0000:0000:8a2e:0370:7334';

      await expect(checkRateLimit(ip)).resolves.toBe(true);
      expect(getRemainingRequests(ip)).toBe(9);
    });

    it('should handle very long IP strings', async () => {
      const ip = 'x'.repeat(1000);

      await expect(checkRateLimit(ip)).resolves.toBe(true);
    });

    it('should handle concurrent requests from same IP', async () => {
      const ip = '192.168.1.13';

      // Simulate concurrent requests
      const results = await Promise.all(Array.from({ length: 15 }, () => checkRateLimit(ip)));

      // First 10 should succeed, rest should fail
      expect(results.slice(0, 10).every((r) => r === true)).toBe(true);
      expect(results.slice(10).every((r) => r === false)).toBe(true);
    });
  });
});
