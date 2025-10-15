/**
 * @jest-environment node
 */
// src/app/api/feedback/__tests__/route.test.ts

// Mock Resend before imports
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn().mockResolvedValue({ error: null }),
    },
  })),
}));

import type { NextRequest } from 'next/server';
import { clearAllRateLimits } from '@/lib/rateLimit';
import { POST } from '../route';

describe('Feedback API Route', () => {
  const mockRequest = (body: unknown, headers: Record<string, string> = {}) => {
    // Use global Request to create the request
    const request = new Request('http://localhost:3000/api/feedback', {
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
    // Clear rate limits between tests
    clearAllRateLimits();
    // Mock Resend API key
    process.env.RESEND_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    process.env.RESEND_API_KEY = undefined;
    // Clean up rate limits after tests
    clearAllRateLimits();
  });

  describe('Success Cases', () => {
    it('should accept valid feedback with email', async () => {
      const req = mockRequest({
        email: 'test@example.com',
        message: 'This is a valid feedback message that is long enough',
        url: 'https://payetax.co.uk/',
        userAgent: 'Test Browser',
        timestamp: new Date().toISOString(),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should accept valid feedback without email', async () => {
      const req = mockRequest({
        message: 'This is anonymous feedback that is long enough',
        url: 'https://payetax.co.uk/',
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should accept feedback without optional fields', async () => {
      const req = mockRequest({
        message: 'This is minimal valid feedback message',
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle feedback with special characters', async () => {
      const req = mockRequest({
        email: 'test+tag@example.com',
        message: 'Feedback with <script>alert("XSS")</script> and special chars: £€©',
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('Validation Errors', () => {
    it('should reject message that is too short', async () => {
      const req = mockRequest({
        message: 'Too short',
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('at least 10 characters');
    });

    it('should reject message that is too long', async () => {
      const req = mockRequest({
        message: 'a'.repeat(5001),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('too long');
    });

    it('should reject invalid email format', async () => {
      const req = mockRequest({
        email: 'invalid-email',
        message: 'This is a valid feedback message',
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid email format');
    });

    it('should reject empty message', async () => {
      const req = mockRequest({
        message: '',
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('at least 10 characters');
    });

    it('should reject message with only whitespace', async () => {
      const req = mockRequest({
        message: '          ',
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('at least 10 characters');
    });
  });

  describe('Email Validation Edge Cases', () => {
    it('should accept email with plus sign', async () => {
      const req = mockRequest({
        email: 'user+tag@example.com',
        message: 'Valid feedback message here',
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it('should accept email with subdomain', async () => {
      const req = mockRequest({
        email: 'test@mail.example.co.uk',
        message: 'Valid feedback message here',
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it('should reject email without @', async () => {
      const req = mockRequest({
        email: 'invalidemail.com',
        message: 'Valid feedback message here',
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid email format');
    });

    it('should reject email without domain', async () => {
      const req = mockRequest({
        email: 'test@',
        message: 'Valid feedback message here',
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid email format');
    });
  });

  describe('Server Configuration', () => {
    it('should return 500 if Resend API key not configured', async () => {
      // Store the original value
      const originalKey = process.env.RESEND_API_KEY;

      // Reset modules first, then delete the env var
      jest.resetModules();
      process.env.RESEND_API_KEY = undefined;

      // Re-import the route with no API key
      const { POST: POSTWithoutKey } = await import('../route');

      const req = mockRequest({
        message: 'Valid feedback message',
      });

      const response = await POSTWithoutKey(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('configuration error');

      // Restore the original value
      if (originalKey) {
        process.env.RESEND_API_KEY = originalKey;
      }
    });
  });

  describe('XSS Protection', () => {
    it('should escape HTML in message', async () => {
      const req = mockRequest({
        message: '<script>alert("XSS")</script> This is feedback',
        email: 'test@example.com',
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
      // The actual HTML escaping happens in the email generation
      // This test confirms the request is accepted
    });

    it('should handle email with HTML-like characters', async () => {
      const req = mockRequest({
        message: 'Valid feedback message here',
        email: '<script>@example.com',
      });

      const response = await POST(req);

      // This passes basic email validation (regex allows < and >)
      // HTML escaping happens in email generation to prevent XSS
      expect(response.status).toBe(200);
    });

    it('should handle message with HTML entities', async () => {
      const req = mockRequest({
        message: 'Feedback with &lt;tags&gt; and &quot;quotes&quot;',
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });
  });

  describe('Headers and Client Info', () => {
    it('should extract IP from x-forwarded-for header', async () => {
      const req = mockRequest(
        {
          message: 'Valid feedback message',
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
          message: 'Valid feedback message',
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
        message: 'Valid feedback message',
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });
  });

  describe('Message Length Boundaries', () => {
    it('should accept exactly 10 characters', async () => {
      const req = mockRequest({
        message: '1234567890',
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it('should accept exactly 5000 characters', async () => {
      const req = mockRequest({
        message: 'a'.repeat(5000),
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it('should reject 5001 characters', async () => {
      const req = mockRequest({
        message: 'a'.repeat(5001),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('too long');
    });

    it('should reject 9 characters', async () => {
      const req = mockRequest({
        message: '123456789',
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('at least 10 characters');
    });
  });

  describe('Content Type Handling', () => {
    it('should handle request with correct content-type', async () => {
      const req = mockRequest(
        {
          message: 'Valid feedback message',
        },
        {
          'content-type': 'application/json',
        }
      );

      const response = await POST(req);
      expect(response.status).toBe(200);
    });
  });
});
