// src/lib/__tests__/rateLimit.test.ts
import {
  checkRateLimit,
  clearAllRateLimits,
  getRemainingRequests,
  resetRateLimit,
} from '../rateLimit';

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Clear all rate limits before each test
    clearAllRateLimits();
  });

  afterEach(() => {
    // Clean up after each test
    clearAllRateLimits();
  });

  describe('checkRateLimit', () => {
    it('should allow requests under the limit', () => {
      const ip = '192.168.1.1';

      // Should allow first 10 requests
      for (let i = 0; i < 10; i++) {
        expect(checkRateLimit(ip)).toBe(true);
      }
    });

    it('should block requests over the limit', () => {
      const ip = '192.168.1.2';

      // Allow first 10 requests
      for (let i = 0; i < 10; i++) {
        checkRateLimit(ip);
      }

      // 11th request should be blocked
      expect(checkRateLimit(ip)).toBe(false);
    });

    it('should track different IPs independently', () => {
      const ip1 = '192.168.1.1';
      const ip2 = '192.168.1.2';

      // Max out ip1
      for (let i = 0; i < 10; i++) {
        checkRateLimit(ip1);
      }

      // ip2 should still be allowed
      expect(checkRateLimit(ip2)).toBe(true);
    });

    it('should allow requests after rate limit reset', () => {
      const ip = '192.168.1.3';

      // Max out requests
      for (let i = 0; i < 10; i++) {
        checkRateLimit(ip);
      }

      // Should be blocked
      expect(checkRateLimit(ip)).toBe(false);

      // Reset the IP
      resetRateLimit(ip);

      // Should be allowed again
      expect(checkRateLimit(ip)).toBe(true);
    });

    it('should respect custom rate limit config', () => {
      const ip = '192.168.1.4';
      const customConfig = { max: 5, window: 60000 };

      // Allow first 5 requests
      for (let i = 0; i < 5; i++) {
        expect(checkRateLimit(ip, customConfig)).toBe(true);
      }

      // 6th request should be blocked
      expect(checkRateLimit(ip, customConfig)).toBe(false);
    });

    it('should handle unknown IP addresses', () => {
      const ip = 'unknown';

      // Should still rate limit unknown IPs
      for (let i = 0; i < 10; i++) {
        expect(checkRateLimit(ip)).toBe(true);
      }

      expect(checkRateLimit(ip)).toBe(false);
    });
  });

  describe('getRemainingRequests', () => {
    it('should return correct remaining requests', () => {
      const ip = '192.168.1.5';

      expect(getRemainingRequests(ip)).toBe(10);

      checkRateLimit(ip);
      expect(getRemainingRequests(ip)).toBe(9);

      checkRateLimit(ip);
      expect(getRemainingRequests(ip)).toBe(8);
    });

    it('should return 0 when limit is reached', () => {
      const ip = '192.168.1.6';

      // Max out requests
      for (let i = 0; i < 10; i++) {
        checkRateLimit(ip);
      }

      expect(getRemainingRequests(ip)).toBe(0);
    });

    it('should respect custom config', () => {
      const ip = '192.168.1.7';
      const customConfig = { max: 3, window: 60000 };

      expect(getRemainingRequests(ip, customConfig)).toBe(3);

      checkRateLimit(ip, customConfig);
      expect(getRemainingRequests(ip, customConfig)).toBe(2);
    });
  });

  describe('resetRateLimit', () => {
    it('should reset rate limit for specific IP', () => {
      const ip = '192.168.1.8';

      // Use up some requests
      for (let i = 0; i < 5; i++) {
        checkRateLimit(ip);
      }

      expect(getRemainingRequests(ip)).toBe(5);

      // Reset
      resetRateLimit(ip);

      // Should have full limit again
      expect(getRemainingRequests(ip)).toBe(10);
    });

    it('should not affect other IPs', () => {
      const ip1 = '192.168.1.9';
      const ip2 = '192.168.1.10';

      // Use requests on both IPs
      checkRateLimit(ip1);
      checkRateLimit(ip2);

      // Reset ip1
      resetRateLimit(ip1);

      // ip1 should be reset
      expect(getRemainingRequests(ip1)).toBe(10);

      // ip2 should still be at 9
      expect(getRemainingRequests(ip2)).toBe(9);
    });
  });

  describe('clearAllRateLimits', () => {
    it('should clear all rate limits', () => {
      const ip1 = '192.168.1.11';
      const ip2 = '192.168.1.12';

      // Use requests on both IPs
      for (let i = 0; i < 5; i++) {
        checkRateLimit(ip1);
        checkRateLimit(ip2);
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
    it('should handle empty string IP', () => {
      const ip = '';

      expect(checkRateLimit(ip)).toBe(true);
    });

    it('should handle IPv6 addresses', () => {
      const ip = '2001:0db8:85a3:0000:0000:8a2e:0370:7334';

      expect(checkRateLimit(ip)).toBe(true);
      expect(getRemainingRequests(ip)).toBe(9);
    });

    it('should handle very long IP strings', () => {
      const ip = 'x'.repeat(1000);

      expect(checkRateLimit(ip)).toBe(true);
    });

    it('should handle concurrent requests from same IP', () => {
      const ip = '192.168.1.13';

      // Simulate concurrent requests
      const results = Array.from({ length: 15 }, () => checkRateLimit(ip));

      // First 10 should succeed, rest should fail
      expect(results.slice(0, 10).every((r) => r === true)).toBe(true);
      expect(results.slice(10).every((r) => r === false)).toBe(true);
    });
  });
});
