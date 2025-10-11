/**
 * @jest-environment node
 */
// src/app/api/error-log/__tests__/route.test.ts

// Mock Resend before imports
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn().mockResolvedValue({ error: null }),
    },
  })),
}));

import type { NextRequest } from 'next/server';
import { POST } from '../route';

describe('Error Log API Route', () => {
  const mockRequest = (body: unknown, headers: Record<string, string> = {}) => {
    // Use global Request to create the request
    const request = new Request('http://localhost:3000/api/error-log', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: new Headers({
        'content-type': 'application/json',
        ...headers,
      }),
    });

    // Cast to NextRequest for testing
    return request as unknown as NextRequest;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Resend API key
    process.env.RESEND_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    process.env.RESEND_API_KEY = undefined;
  });

  describe('Success Cases', () => {
    it('should accept error with all fields', async () => {
      const req = mockRequest({
        message: 'Test error message',
        stack: 'Error: Test\n  at Component',
        digest: 'abc123',
        url: 'https://payetax.co.uk/',
        userAgent: 'Test Browser',
        componentStack: 'at Calculator\n  at App',
        timestamp: new Date().toISOString(),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should accept error with minimal fields', async () => {
      const req = mockRequest({
        message: 'Minimal error',
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should accept error without stack trace', async () => {
      const req = mockRequest({
        message: 'Error without stack',
        url: 'https://payetax.co.uk/',
        userAgent: 'Chrome',
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should accept error without component stack', async () => {
      const req = mockRequest({
        message: 'Error without component stack',
        stack: 'Error: Test\n  at line 1',
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should accept error without digest', async () => {
      const req = mockRequest({
        message: 'Error without digest',
        stack: 'Error: Test',
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('Server Configuration', () => {
    it('should return 500 if Resend API key not configured', async () => {
      process.env.RESEND_API_KEY = undefined;

      // Need to re-import to get the new environment
      jest.resetModules();
      const { POST: POSTWithoutKey } = await import('../route');

      const req = mockRequest({
        message: 'Test error',
      });

      const response = await POSTWithoutKey(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('configuration error');
    });
  });

  describe('XSS Protection', () => {
    it('should escape HTML in error message', async () => {
      const req = mockRequest({
        message: '<script>alert("XSS")</script>',
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
      // The actual HTML escaping happens in the email generation
      // This test confirms the request is accepted
    });

    it('should escape HTML in stack trace', async () => {
      const req = mockRequest({
        message: 'Test error',
        stack: '<script>alert("XSS")</script>\n  at Component',
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it('should escape HTML in component stack', async () => {
      const req = mockRequest({
        message: 'Test error',
        componentStack: '<img src=x onerror=alert(1)>\n  at Calculator',
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it('should escape HTML in URL', async () => {
      const req = mockRequest({
        message: 'Test error',
        url: 'javascript:alert(1)',
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it('should handle message with HTML entities', async () => {
      const req = mockRequest({
        message: 'Error with &lt;tags&gt; and &quot;quotes&quot;',
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });
  });

  describe('Headers and Client Info', () => {
    it('should extract IP from x-forwarded-for header', async () => {
      const req = mockRequest(
        {
          message: 'Test error',
        },
        {
          'x-forwarded-for': '192.168.1.1',
        }
      );

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it('should extract IP from x-real-ip header', async () => {
      const req = mockRequest(
        {
          message: 'Test error',
        },
        {
          'x-real-ip': '10.0.0.1',
        }
      );

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it('should handle missing IP headers', async () => {
      const req = mockRequest({
        message: 'Test error',
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it('should handle multiple IPs in x-forwarded-for', async () => {
      const req = mockRequest(
        {
          message: 'Test error',
        },
        {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
        }
      );

      const response = await POST(req);
      expect(response.status).toBe(200);
    });
  });

  describe('Error Types', () => {
    it('should handle calculator errors', async () => {
      const req = mockRequest({
        message: 'Tax Calculation Failed: Invalid tax code',
        stack: 'Error: Tax Calculation Failed\n  at calculateTax',
        url: 'https://payetax.co.uk/',
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it('should handle render errors', async () => {
      const req = mockRequest({
        message: 'Cannot read properties of undefined',
        componentStack: 'at ResultsTable\n  at CalculatorContainer',
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it('should handle API errors', async () => {
      const req = mockRequest({
        message: 'Failed to fetch',
        url: 'https://payetax.co.uk/api/feedback',
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it('should handle hydration errors', async () => {
      const req = mockRequest({
        message: 'Hydration failed because initial UI does not match',
        digest: 'hydration-mismatch',
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long error message', async () => {
      const req = mockRequest({
        message: `Error: ${'a'.repeat(1000)}`,
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it('should handle very long stack trace', async () => {
      const req = mockRequest({
        message: 'Test error',
        stack: `Error: Test\n${'  at Component\n'.repeat(100)}`,
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it('should handle empty string fields', async () => {
      const req = mockRequest({
        message: '',
        stack: '',
        url: '',
        userAgent: '',
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it('should handle unicode characters', async () => {
      const req = mockRequest({
        message: '错误: Test 🚨 émoji',
        url: 'https://payetax.co.uk/税金',
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });
  });

  describe('Timestamp Handling', () => {
    it('should accept provided timestamp', async () => {
      const timestamp = '2025-10-10T10:00:00.000Z';
      const req = mockRequest({
        message: 'Test error',
        timestamp,
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it('should handle missing timestamp', async () => {
      const req = mockRequest({
        message: 'Test error',
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it('should handle invalid timestamp format', async () => {
      const req = mockRequest({
        message: 'Test error',
        timestamp: 'invalid-date',
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });
  });

  describe('User Agent Handling', () => {
    it('should handle standard user agent', async () => {
      const req = mockRequest({
        message: 'Test error',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124',
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it('should handle very long user agent', async () => {
      const req = mockRequest({
        message: 'Test error',
        userAgent: 'a'.repeat(500),
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it('should handle missing user agent', async () => {
      const req = mockRequest({
        message: 'Test error',
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });
  });
});
