/**
 * Tests for Environment Variables Validation
 * PAYTAX-129 (Environment & External Data Validation)
 *
 * Tests Zod schemas for environment variable validation:
 * - PublicEnvSchema (browser-safe variables)
 * - ServerEnvSchema (server-only variables)
 * - Validation functions
 * - Helper functions
 */

import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import {
  EnvSchema,
  getPublicEnv,
  getServerEnv,
  isFeatureEnabled,
  PublicEnvSchema,
  RequiredProductionEnvSchema,
  ServerEnvSchema,
  validateEnv,
  validateProductionEnv,
  validatePublicEnv,
  validateServerEnv,
} from '../env';

describe('Environment Variable Validation', () => {
  // Store original env vars to restore after tests
  const originalEnv = { ...process.env };
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    // Reset to original state
    process.env = { ...originalEnv };
    // Clear problematic env vars that might have invalid values
    process.env.INDEXNOW_KEY = undefined;
    process.env.RESEND_API_KEY = undefined;
    process.env.RESEND_AUDIENCE_ID = undefined;
    process.env.NEXT_PUBLIC_SITE_URL = undefined;
    process.env.NEXT_PUBLIC_GA_ID = undefined;
    process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = undefined;
  });

  afterEach(() => {
    // Restore original env vars
    process.env = originalEnv;
    consoleErrorSpy.mockRestore();
  });

  // ============================================================================
  // PUBLIC ENV SCHEMA
  // ============================================================================

  describe('PublicEnvSchema', () => {
    describe('valid public environment variables', () => {
      it('should accept valid Google Analytics ID', () => {
        const result = PublicEnvSchema.safeParse({
          NEXT_PUBLIC_GA_ID: 'G-ABCDEFGHIJ',
        });
        expect(result.success).toBe(true);
      });

      it('should accept valid Sentry DSN', () => {
        const result = PublicEnvSchema.safeParse({
          NEXT_PUBLIC_SENTRY_DSN: 'https://abc123@sentry.io/123456',
        });
        expect(result.success).toBe(true);
      });

      it('should accept valid site URL', () => {
        const result = PublicEnvSchema.safeParse({
          NEXT_PUBLIC_SITE_URL: 'https://payetax.co.uk',
        });
        expect(result.success).toBe(true);
      });

      it('should accept feature flags as strings and transform to boolean', () => {
        const result = PublicEnvSchema.safeParse({
          NEXT_PUBLIC_ENABLE_PWA: 'true',
          NEXT_PUBLIC_ENABLE_ANALYTICS: 'false',
        });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.NEXT_PUBLIC_ENABLE_PWA).toBe(true);
          expect(result.data.NEXT_PUBLIC_ENABLE_ANALYTICS).toBe(false);
        }
      });

      it('should accept all optional fields as undefined', () => {
        const result = PublicEnvSchema.safeParse({});
        expect(result.success).toBe(true);
      });

      it('should accept partial configuration', () => {
        const result = PublicEnvSchema.safeParse({
          NEXT_PUBLIC_GA_ID: 'G-TEST123456',
          // Other fields optional
        });
        expect(result.success).toBe(true);
      });
    });

    describe('invalid public environment variables', () => {
      it('should reject invalid Google Analytics ID format', () => {
        const result = PublicEnvSchema.safeParse({
          NEXT_PUBLIC_GA_ID: 'INVALID',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('G-');
        }
      });

      it('should reject invalid Google Analytics ID (too short)', () => {
        const result = PublicEnvSchema.safeParse({
          NEXT_PUBLIC_GA_ID: 'G-ABC',
        });
        expect(result.success).toBe(false);
      });

      it('should reject invalid Sentry DSN (not a URL)', () => {
        const result = PublicEnvSchema.safeParse({
          NEXT_PUBLIC_SENTRY_DSN: 'not-a-url',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('URL');
        }
      });

      it('should reject invalid site URL', () => {
        const result = PublicEnvSchema.safeParse({
          NEXT_PUBLIC_SITE_URL: 'invalid-url',
        });
        expect(result.success).toBe(false);
      });

      it('should reject non-string feature flags', () => {
        const result = PublicEnvSchema.safeParse({
          NEXT_PUBLIC_ENABLE_PWA: true, // Should be string 'true', not boolean
        });
        expect(result.success).toBe(false);
      });
    });
  });

  // ============================================================================
  // SERVER ENV SCHEMA
  // ============================================================================

  describe('ServerEnvSchema', () => {
    describe('valid server environment variables', () => {
      it('should accept valid Resend API key', () => {
        const result = ServerEnvSchema.safeParse({
          RESEND_API_KEY: 're_abc123def456',
        });
        expect(result.success).toBe(true);
      });

      it('should accept valid Resend audience ID', () => {
        const result = ServerEnvSchema.safeParse({
          RESEND_AUDIENCE_ID: 'aud_abc123def456',
        });
        expect(result.success).toBe(true);
      });

      it('should accept valid IndexNow key (UUID)', () => {
        const result = ServerEnvSchema.safeParse({
          INDEXNOW_KEY: '123e4567-e89b-12d3-a456-426614174000',
        });
        expect(result.success).toBe(true);
      });

      it('should accept valid NODE_ENV values', () => {
        const envs = ['development', 'production', 'test'];

        for (const env of envs) {
          const result = ServerEnvSchema.safeParse({
            NODE_ENV: env,
          });
          expect(result.success).toBe(true);
        }
      });

      it('should accept ANALYZE flag and transform to boolean', () => {
        const result = ServerEnvSchema.safeParse({
          ANALYZE: 'true',
        });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.ANALYZE).toBe(true);
        }
      });

      it('should accept all optional fields as undefined', () => {
        const result = ServerEnvSchema.safeParse({});
        expect(result.success).toBe(true);
      });

      it('should accept Sentry build configuration', () => {
        const result = ServerEnvSchema.safeParse({
          SENTRY_AUTH_TOKEN: 'sntrys_token123',
          SENTRY_ORG: 'payetax',
          SENTRY_PROJECT: 'javascript-nextjs',
        });
        expect(result.success).toBe(true);
      });

      it('should accept Vercel deployment configuration', () => {
        const result = ServerEnvSchema.safeParse({
          VERCEL_TOKEN: 'vercel_token_abc123',
          VERCEL_ORG_ID: 'team_abc123',
          VERCEL_PROJECT_ID: 'prj_abc123',
        });
        expect(result.success).toBe(true);
      });
    });

    describe('invalid server environment variables', () => {
      it('should reject invalid IndexNow key (not UUID)', () => {
        const result = ServerEnvSchema.safeParse({
          INDEXNOW_KEY: 'not-a-uuid',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('UUID');
        }
      });

      it('should reject invalid NODE_ENV value', () => {
        const result = ServerEnvSchema.safeParse({
          NODE_ENV: 'staging', // Not in enum
        });
        expect(result.success).toBe(false);
      });

      it('should reject empty Resend API key if provided', () => {
        const result = ServerEnvSchema.safeParse({
          RESEND_API_KEY: '',
        });
        expect(result.success).toBe(false);
      });

      it('should reject empty Resend audience ID if provided', () => {
        const result = ServerEnvSchema.safeParse({
          RESEND_AUDIENCE_ID: '',
        });
        expect(result.success).toBe(false);
      });
    });
  });

  // ============================================================================
  // COMBINED ENV SCHEMA
  // ============================================================================

  describe('EnvSchema', () => {
    it('should validate combined public and server environment', () => {
      const result = EnvSchema.safeParse({
        public: {
          NEXT_PUBLIC_GA_ID: 'G-ABC1234567',
          NEXT_PUBLIC_SENTRY_DSN: 'https://test@sentry.io/123',
        },
        server: {
          RESEND_API_KEY: 're_test123',
          NODE_ENV: 'development',
        },
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty public and server objects', () => {
      const result = EnvSchema.safeParse({
        public: {},
        server: {},
      });
      expect(result.success).toBe(true);
    });

    it('should reject if public section has invalid data', () => {
      const result = EnvSchema.safeParse({
        public: {
          NEXT_PUBLIC_GA_ID: 'INVALID',
        },
        server: {},
      });
      expect(result.success).toBe(false);
    });

    it('should reject if server section has invalid data', () => {
      const result = EnvSchema.safeParse({
        public: {},
        server: {
          NODE_ENV: 'invalid',
        },
      });
      expect(result.success).toBe(false);
    });
  });

  describe('RequiredProductionEnvSchema', () => {
    it('should accept required production env vars', () => {
      const result = RequiredProductionEnvSchema.safeParse({
        NEXT_PUBLIC_SITE_URL: 'https://payetax.co.uk',
        RESEND_API_KEY: 're_test123',
        RESEND_AUDIENCE_ID: 'aud_test123',
        NEXT_PUBLIC_ENABLE_ANALYTICS: 'true',
        NEXT_PUBLIC_GA_ID: 'G-TEST123456',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing required production env vars', () => {
      const result = RequiredProductionEnvSchema.safeParse({
        NEXT_PUBLIC_SITE_URL: undefined,
        RESEND_API_KEY: undefined,
        RESEND_AUDIENCE_ID: undefined,
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing GA ID when analytics are enabled', () => {
      const result = RequiredProductionEnvSchema.safeParse({
        NEXT_PUBLIC_SITE_URL: 'https://payetax.co.uk',
        RESEND_API_KEY: 're_test123',
        RESEND_AUDIENCE_ID: 'aud_test123',
        NEXT_PUBLIC_ENABLE_ANALYTICS: 'true',
        NEXT_PUBLIC_GA_ID: undefined,
      });
      expect(result.success).toBe(false);
    });

    it('should allow missing GA ID when analytics are disabled', () => {
      const result = RequiredProductionEnvSchema.safeParse({
        NEXT_PUBLIC_SITE_URL: 'https://payetax.co.uk',
        RESEND_API_KEY: 're_test123',
        RESEND_AUDIENCE_ID: 'aud_test123',
        NEXT_PUBLIC_ENABLE_ANALYTICS: 'false',
        NEXT_PUBLIC_GA_ID: undefined,
      });
      expect(result.success).toBe(true);
    });
  });

  // ============================================================================
  // VALIDATION FUNCTIONS
  // ============================================================================

  describe('validatePublicEnv', () => {
    it('should validate from process.env', () => {
      process.env.NEXT_PUBLIC_GA_ID = 'G-TEST123456';
      process.env.NEXT_PUBLIC_SITE_URL = 'https://payetax.co.uk';

      const env = validatePublicEnv();

      expect(env.NEXT_PUBLIC_GA_ID).toBe('G-TEST123456');
      expect(env.NEXT_PUBLIC_SITE_URL).toBe('https://payetax.co.uk');
    });

    it('should throw on invalid public env vars', () => {
      process.env.NEXT_PUBLIC_GA_ID = 'INVALID';

      expect(() => validatePublicEnv()).toThrow('Invalid public environment variables');
    });

    it('should handle missing optional env vars', () => {
      // Clear all public env vars
      process.env.NEXT_PUBLIC_GA_ID = undefined;
      process.env.NEXT_PUBLIC_SENTRY_DSN = undefined;
      process.env.NEXT_PUBLIC_SITE_URL = undefined;

      // Should not throw - all are optional
      expect(() => validatePublicEnv()).not.toThrow();
    });
  });

  describe('validateServerEnv', () => {
    it('should validate from process.env', () => {
      process.env.RESEND_API_KEY = 're_test123';
      process.env.NODE_ENV = 'test';

      const env = validateServerEnv();

      expect(env.RESEND_API_KEY).toBe('re_test123');
      expect(env.NODE_ENV).toBe('test');
    });

    it('should throw on invalid server env vars', () => {
      process.env.NODE_ENV = 'invalid' as any;

      expect(() => validateServerEnv()).toThrow('Invalid server environment variables');
    });

    it('should handle missing optional env vars', () => {
      // Clear all server env vars
      process.env.RESEND_API_KEY = undefined;
      process.env.INDEXNOW_KEY = undefined;

      // Should not throw - all are optional
      expect(() => validateServerEnv()).not.toThrow();
    });
  });

  describe('validateEnv', () => {
    it('should validate both public and server env vars', () => {
      process.env.NEXT_PUBLIC_GA_ID = 'G-TEST123456';
      process.env.RESEND_API_KEY = 're_test123';

      const env = validateEnv();

      expect(env.public.NEXT_PUBLIC_GA_ID).toBe('G-TEST123456');
      expect(env.server.RESEND_API_KEY).toBe('re_test123');
    });

    it('should throw if either validation fails', () => {
      process.env.NEXT_PUBLIC_GA_ID = 'INVALID';

      expect(() => validateEnv()).toThrow();
    });
  });

  describe('validateProductionEnv', () => {
    it('should validate required production env vars from process.env', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://payetax.co.uk';
      process.env.RESEND_API_KEY = 're_test123';
      process.env.RESEND_AUDIENCE_ID = 'aud_test123';
      process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = 'true';
      process.env.NEXT_PUBLIC_GA_ID = 'G-TEST123456';

      const env = validateProductionEnv();

      expect(env.NEXT_PUBLIC_SITE_URL).toBe('https://payetax.co.uk');
      expect(env.RESEND_API_KEY).toBe('re_test123');
      expect(env.RESEND_AUDIENCE_ID).toBe('aud_test123');
      expect(env.NEXT_PUBLIC_GA_ID).toBe('G-TEST123456');
    });

    it('should throw when required production env vars are missing', () => {
      process.env.NEXT_PUBLIC_SITE_URL = undefined;
      process.env.RESEND_API_KEY = undefined;
      process.env.RESEND_AUDIENCE_ID = undefined;

      expect(() => validateProductionEnv()).toThrow(
        'Missing or invalid required production environment variables',
      );
    });

    it('should allow missing GA ID when analytics are disabled', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://payetax.co.uk';
      process.env.RESEND_API_KEY = 're_test123';
      process.env.RESEND_AUDIENCE_ID = 'aud_test123';
      process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = 'false';
      process.env.NEXT_PUBLIC_GA_ID = undefined;

      expect(() => validateProductionEnv()).not.toThrow();
    });
  });

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  describe('getPublicEnv', () => {
    it('should get specific public env var', () => {
      process.env.NEXT_PUBLIC_GA_ID = 'G-TEST123456';

      const gaId = getPublicEnv('NEXT_PUBLIC_GA_ID');

      expect(gaId).toBe('G-TEST123456');
    });

    it('should return undefined for unset optional var', () => {
      process.env.NEXT_PUBLIC_GA_ID = undefined;

      const gaId = getPublicEnv('NEXT_PUBLIC_GA_ID');

      expect(gaId).toBeUndefined();
    });
  });

  describe('getServerEnv', () => {
    it('should get specific server env var', () => {
      process.env.RESEND_API_KEY = 're_test123';

      const apiKey = getServerEnv('RESEND_API_KEY');

      expect(apiKey).toBe('re_test123');
    });

    it('should return undefined for unset optional var', () => {
      process.env.RESEND_API_KEY = undefined;
      process.env.INDEXNOW_KEY = undefined; // Clean up to avoid validation issues

      const apiKey = getServerEnv('RESEND_API_KEY');

      expect(apiKey).toBeUndefined();
    });
  });

  describe('isFeatureEnabled', () => {
    it('should return true when PWA is enabled', () => {
      process.env.NEXT_PUBLIC_ENABLE_PWA = 'true';

      const enabled = isFeatureEnabled('PWA');

      expect(enabled).toBe(true);
    });

    it('should return false when PWA is disabled', () => {
      process.env.NEXT_PUBLIC_ENABLE_PWA = 'false';

      const enabled = isFeatureEnabled('PWA');

      expect(enabled).toBe(false);
    });

    it('should return false when PWA is not set', () => {
      process.env.NEXT_PUBLIC_ENABLE_PWA = undefined;

      const enabled = isFeatureEnabled('PWA');

      expect(enabled).toBe(false);
    });

    it('should return true when ANALYTICS is enabled', () => {
      process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = 'true';

      const enabled = isFeatureEnabled('ANALYTICS');

      expect(enabled).toBe(true);
    });

    it('should return false when ANALYTICS is disabled', () => {
      process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = 'false';

      const enabled = isFeatureEnabled('ANALYTICS');

      expect(enabled).toBe(false);
    });

    it('should default ANALYTICS to enabled when not set', () => {
      process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = undefined;

      const enabled = isFeatureEnabled('ANALYTICS');

      expect(enabled).toBe(true);
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle Google Analytics ID with all uppercase', () => {
      const result = PublicEnvSchema.safeParse({
        NEXT_PUBLIC_GA_ID: 'G-ABCDEFGHIJ',
      });
      expect(result.success).toBe(true);
    });

    it('should handle Google Analytics ID with mixed case', () => {
      const result = PublicEnvSchema.safeParse({
        NEXT_PUBLIC_GA_ID: 'G-AbCdEfGhIj',
      });
      expect(result.success).toBe(true);
    });

    it('should handle feature flags with any string value (transforms to boolean)', () => {
      const trueResult = PublicEnvSchema.safeParse({
        NEXT_PUBLIC_ENABLE_PWA: 'true',
      });
      const falseResult = PublicEnvSchema.safeParse({
        NEXT_PUBLIC_ENABLE_PWA: 'anything-else',
      });

      expect(trueResult.success).toBe(true);
      expect(falseResult.success).toBe(true);
      if (trueResult.success && falseResult.success) {
        expect(trueResult.data.NEXT_PUBLIC_ENABLE_PWA).toBe(true);
        expect(falseResult.data.NEXT_PUBLIC_ENABLE_PWA).toBe(false);
      }
    });

    it('should handle URLs with ports', () => {
      const result = PublicEnvSchema.safeParse({
        NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
      });
      expect(result.success).toBe(true);
    });

    it('should handle URLs with paths', () => {
      const result = PublicEnvSchema.safeParse({
        NEXT_PUBLIC_SENTRY_DSN: 'https://abc@sentry.io/123456/path',
      });
      expect(result.success).toBe(true);
    });
  });
});
