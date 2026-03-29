/**
 * Environment Variables Validation
 * PAYTAX-129 (Environment & External Data Validation)
 *
 * Validates environment variables at runtime using Zod.
 * Provides type-safe access to env vars with clear error messages.
 *
 * Why This Matters:
 * - Catches missing env vars early (at build/runtime startup)
 * - Provides clear error messages (better than undefined)
 * - Type-safe access to validated env vars
 * - Self-documenting (schema shows what's required vs optional)
 *
 * @module lib/env
 */

import { z } from 'zod';

const GA_ID_SCHEMA = z
  .string()
  .regex(/^G-[A-Z0-9]{10}$/i, 'Google Analytics ID must be in format G-XXXXXXXXXX');
const CLARITY_ID_SCHEMA = z
  .string()
  .regex(/^[a-z0-9]{10}$/i, 'Microsoft Clarity ID must be 10 alphanumeric characters');

/**
 * Zod Schema for Public Environment Variables
 * These are exposed to the browser (NEXT_PUBLIC_* prefix)
 */
export const PublicEnvSchema = z.object({
  // Analytics
  NEXT_PUBLIC_GA_ID: GA_ID_SCHEMA.optional(),
  NEXT_PUBLIC_CLARITY_ID: CLARITY_ID_SCHEMA.optional(),
  NEXT_PUBLIC_AHREFS_KEY: z.string().min(1, 'Ahrefs key must not be empty').optional(),

  // Error Monitoring
  NEXT_PUBLIC_SENTRY_DSN: z.string().url('Sentry DSN must be a valid URL').optional(),

  // Site Configuration
  NEXT_PUBLIC_SITE_URL: z.string().url('Site URL must be a valid URL').optional(),
  NEXT_PUBLIC_BASE_URL: z.string().url('Base URL must be a valid URL').optional(),
  NEXT_PUBLIC_VERCEL_URL: z.string().min(1, 'Vercel URL must not be empty').optional(),

  // UI/Embed Configuration
  NEXT_PUBLIC_KIT_EMBED_UID: z.string().min(1, 'Kit embed UID must not be empty').optional(),
  NEXT_PUBLIC_KIT_EMBED_VERSION: z
    .string()
    .min(1, 'Kit embed version must not be empty')
    .optional(),
  NEXT_PUBLIC_APP_VERSION: z.string().min(1, 'App version must not be empty').optional(),
  NEXT_PUBLIC_SHOW_DEBUG_ERRORS: z
    .string()
    .transform((val) => val === 'true')
    .optional(),

  // Feature Flags
  NEXT_PUBLIC_ENABLE_PWA: z
    .string()
    .transform((val) => val === 'true')
    .optional(),

  NEXT_PUBLIC_ENABLE_ANALYTICS: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});

/**
 * Zod Schema for Server-Only Environment Variables
 * These are only available on the server (never exposed to browser)
 */
export const ServerEnvSchema = z.object({
  // Transactional Email Service
  RESEND_API_KEY: z
    .string()
    .min(1, 'Resend API key is required for email functionality')
    .optional(),
  // Newsletter Service (Kit)
  KIT_API_SECRET: z.string().min(1, 'Kit API secret is required for newsletter').optional(),
  KIT_FORM_ID: z.string().min(1, 'Kit form identifier is required for newsletter').optional(),
  UNSUBSCRIBE_SECRET: z.string().min(1, 'Unsubscribe secret must not be empty').optional(),
  UPSTASH_REDIS_REST_URL: z.string().url('Upstash Redis REST URL must be a valid URL').optional(),
  UPSTASH_REDIS_REST_TOKEN: z
    .string()
    .min(1, 'Upstash Redis REST token must not be empty')
    .optional(),
  RATE_LIMIT_HEALTH_SECRET: z
    .string()
    .min(1, 'Rate-limit health secret must not be empty')
    .optional(),
  // Sentry Build Configuration
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_WEBHOOK_SECRET: z.string().min(1, 'Sentry webhook secret must not be empty').optional(),

  // Vercel Deployment
  VERCEL_TOKEN: z.string().optional(),
  VERCEL_ORG_ID: z.string().optional(),
  VERCEL_PROJECT_ID: z.string().optional(),
  VERCEL_URL: z.string().min(1, 'VERCEL_URL must not be empty').optional(),
  VERCEL_PROJECT_PRODUCTION_URL: z
    .string()
    .min(1, 'VERCEL_PROJECT_PRODUCTION_URL must not be empty')
    .optional(),

  // IndexNow API
  INDEXNOW_KEY: z
    .string()
    .uuid('IndexNow key must be a valid UUID')
    .optional()
    .or(z.literal('').transform(() => undefined)), // Allow empty string
  INDEXNOW_SUBMIT_SECRET: z.string().min(1, 'IndexNow submit secret must not be empty').optional(),
  REFERRAL_PARTNER_EMAIL: z
    .string()
    .email('Referral partner email must be a valid email address')
    .optional(),
  LINEAR_API_KEY: z.string().min(1, 'Linear API key must not be empty').optional(),
  LINEAR_TEAM_KEY: z.string().min(1, 'Linear team key must not be empty').optional(),

  // Build Configuration
  ANALYZE: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  SKIP_CONFIG_VALIDATION: z
    .string()
    .transform((val) => val === 'true')
    .optional(),

  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
});

/**
 * Combined Environment Schema
 * Validates both public and server environment variables
 */
export const EnvSchema = z.object({
  public: PublicEnvSchema,
  server: ServerEnvSchema,
});

export const RequiredProductionEnvSchema = z
  .object({
    NEXT_PUBLIC_SITE_URL: z.string().url('Site URL must be a valid URL'),
    RESEND_API_KEY: z.string().min(1, 'Resend API key is required for email functionality'),
    KIT_API_SECRET: z.string().min(1, 'Kit API secret is required for newsletter'),
    KIT_FORM_ID: z.string().min(1, 'Kit form identifier is required for newsletter'),
    UNSUBSCRIBE_SECRET: z.string().min(1, 'Unsubscribe secret is required in production'),
    REFERRAL_PARTNER_EMAIL: z.string().email('Referral partner email is required in production'),
    INDEXNOW_SUBMIT_SECRET: z.string().min(1, 'IndexNow submit secret is required in production'),
    NEXT_PUBLIC_ENABLE_ANALYTICS: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
    NEXT_PUBLIC_GA_ID: GA_ID_SCHEMA.optional(),
    SENTRY_WEBHOOK_SECRET: z.string().optional(),
    LINEAR_API_KEY: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const analyticsEnabled = data.NEXT_PUBLIC_ENABLE_ANALYTICS ?? true;
    if (analyticsEnabled && !data.NEXT_PUBLIC_GA_ID) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Google Analytics ID is required in production when analytics are enabled (set NEXT_PUBLIC_ENABLE_ANALYTICS=false to disable analytics).',
        path: ['NEXT_PUBLIC_GA_ID'],
      });
    }

    const webhookConfigured = Boolean(data.SENTRY_WEBHOOK_SECRET || data.LINEAR_API_KEY);
    if (webhookConfigured) {
      if (!data.SENTRY_WEBHOOK_SECRET) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'SENTRY_WEBHOOK_SECRET is required when Linear webhook integration is configured.',
          path: ['SENTRY_WEBHOOK_SECRET'],
        });
      }
      if (!data.LINEAR_API_KEY) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'LINEAR_API_KEY is required when Sentry webhook integration is configured.',
          path: ['LINEAR_API_KEY'],
        });
      }
    }
  });

export type PublicEnv = z.infer<typeof PublicEnvSchema>;
export type ServerEnv = z.infer<typeof ServerEnvSchema>;
export type Env = z.infer<typeof EnvSchema>;
export type RequiredProductionEnv = z.infer<typeof RequiredProductionEnvSchema>;

/**
 * Validates public environment variables (safe to use in browser)
 * @returns Validated public environment variables
 * @throws Error if validation fails
 */
export function validatePublicEnv(): PublicEnv {
  const result = PublicEnvSchema.safeParse({
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    NEXT_PUBLIC_CLARITY_ID: process.env.NEXT_PUBLIC_CLARITY_ID,
    NEXT_PUBLIC_AHREFS_KEY: process.env.NEXT_PUBLIC_AHREFS_KEY,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
    NEXT_PUBLIC_KIT_EMBED_UID: process.env.NEXT_PUBLIC_KIT_EMBED_UID,
    NEXT_PUBLIC_KIT_EMBED_VERSION: process.env.NEXT_PUBLIC_KIT_EMBED_VERSION,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
    NEXT_PUBLIC_SHOW_DEBUG_ERRORS: process.env.NEXT_PUBLIC_SHOW_DEBUG_ERRORS,
    NEXT_PUBLIC_ENABLE_PWA: process.env.NEXT_PUBLIC_ENABLE_PWA,
    NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
  });

  if (!result.success) {
    console.error('❌ Public environment validation failed:', result.error.issues);
    throw new Error(
      `Invalid public environment variables: ${result.error.issues.map((i) => i.message).join(', ')}`,
    );
  }

  return result.data;
}

/**
 * Validates server-only environment variables
 * @returns Validated server environment variables
 * @throws Error if validation fails
 */
export function validateServerEnv(): ServerEnv {
  const result = ServerEnvSchema.safeParse({
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    KIT_API_SECRET: process.env.KIT_API_SECRET,
    KIT_FORM_ID: process.env.KIT_FORM_ID,
    UNSUBSCRIBE_SECRET: process.env.UNSUBSCRIBE_SECRET,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    RATE_LIMIT_HEALTH_SECRET: process.env.RATE_LIMIT_HEALTH_SECRET,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    SENTRY_WEBHOOK_SECRET: process.env.SENTRY_WEBHOOK_SECRET,
    VERCEL_TOKEN: process.env.VERCEL_TOKEN,
    VERCEL_ORG_ID: process.env.VERCEL_ORG_ID,
    VERCEL_PROJECT_ID: process.env.VERCEL_PROJECT_ID,
    VERCEL_URL: process.env.VERCEL_URL,
    VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
    INDEXNOW_KEY: process.env.INDEXNOW_KEY,
    INDEXNOW_SUBMIT_SECRET: process.env.INDEXNOW_SUBMIT_SECRET,
    REFERRAL_PARTNER_EMAIL: process.env.REFERRAL_PARTNER_EMAIL,
    LINEAR_API_KEY: process.env.LINEAR_API_KEY,
    LINEAR_TEAM_KEY: process.env.LINEAR_TEAM_KEY,
    ANALYZE: process.env.ANALYZE,
    SKIP_CONFIG_VALIDATION: process.env.SKIP_CONFIG_VALIDATION,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!result.success) {
    console.error('❌ Server environment validation failed:', result.error.issues);
    throw new Error(
      `Invalid server environment variables: ${result.error.issues.map((i) => i.message).join(', ')}`,
    );
  }

  return result.data;
}

/**
 * Validates all environment variables
 * @returns Validated environment variables (public + server)
 * @throws Error if validation fails
 */
export function validateEnv(): Env {
  return {
    public: validatePublicEnv(),
    server: validateServerEnv(),
  };
}

/**
 * Validates required environment variables for production
 * @returns Validated required production environment variables
 * @throws Error if required variables are missing or invalid
 */
export function validateProductionEnv(): RequiredProductionEnv {
  const result = RequiredProductionEnvSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    KIT_API_SECRET: process.env.KIT_API_SECRET,
    KIT_FORM_ID: process.env.KIT_FORM_ID,
    UNSUBSCRIBE_SECRET: process.env.UNSUBSCRIBE_SECRET,
    REFERRAL_PARTNER_EMAIL: process.env.REFERRAL_PARTNER_EMAIL,
    INDEXNOW_SUBMIT_SECRET: process.env.INDEXNOW_SUBMIT_SECRET,
    NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    SENTRY_WEBHOOK_SECRET: process.env.SENTRY_WEBHOOK_SECRET,
    LINEAR_API_KEY: process.env.LINEAR_API_KEY,
  });

  if (!result.success) {
    console.error('❌ Production environment validation failed:', result.error.issues);
    throw new Error(
      `Missing or invalid required production environment variables: ${result.error.issues.map((i) => i.message).join(', ')}`,
    );
  }

  return result.data;
}

/**
 * Safe helper to get a specific public env var
 * @param key - The environment variable key
 * @returns The validated value or undefined if not set
 */
export function getPublicEnv<K extends keyof PublicEnv>(key: K): PublicEnv[K] {
  const env = validatePublicEnv();
  return env[key];
}

/**
 * Safe helper to get a specific server env var
 * @param key - The environment variable key
 * @returns The validated value or undefined if not set
 */
export function getServerEnv<K extends keyof ServerEnv>(key: K): ServerEnv[K] {
  const env = validateServerEnv();
  return env[key];
}

/**
 * Check if a specific feature is enabled
 * @param feature - The feature flag to check
 * @returns True if the feature is enabled
 */
export function isFeatureEnabled(feature: 'PWA' | 'ANALYTICS'): boolean {
  const env = validatePublicEnv();
  switch (feature) {
    case 'PWA':
      return env.NEXT_PUBLIC_ENABLE_PWA === true;
    case 'ANALYTICS':
      return env.NEXT_PUBLIC_ENABLE_ANALYTICS !== false;
    default:
      return false;
  }
}

/**
 * Runtime Validation (Optional - only in production)
 * Validates critical environment variables on module load
 *
 * Disabled in test mode to avoid breaking tests
 */
if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
  // Server-side validation only in production
  try {
    validateProductionEnv();
  } catch (error) {
    console.error('❌ Required production env validation failed at startup:', error);
    throw error;
  }
}
