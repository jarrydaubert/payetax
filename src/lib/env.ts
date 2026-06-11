/**
 * Environment variable validation for retained PayeTax runtime integrations.
 */

import { z } from 'zod';

const GA_ID_SCHEMA = z
  .string()
  .regex(/^G-[A-Z0-9]{10}$/i, 'Google Analytics ID must be in format G-XXXXXXXXXX');

export const PublicEnvSchema = z.object({
  NEXT_PUBLIC_GA_ID: GA_ID_SCHEMA.optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url('Sentry DSN must be a valid URL').optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url('Site URL must be a valid URL').optional(),
  NEXT_PUBLIC_BASE_URL: z.string().url('Base URL must be a valid URL').optional(),
  NEXT_PUBLIC_VERCEL_URL: z.string().min(1, 'Vercel URL must not be empty').optional(),
  NEXT_PUBLIC_APP_VERSION: z.string().min(1, 'App version must not be empty').optional(),
  NEXT_PUBLIC_SHOW_DEBUG_ERRORS: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  NEXT_PUBLIC_ENABLE_PWA: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  NEXT_PUBLIC_ENABLE_ANALYTICS: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});

export const ServerEnvSchema = z.object({
  BREVO_API_KEY: z.string().min(1, 'Brevo API key must not be empty').optional(),
  BREVO_FROM_EMAIL: z.string().min(1, 'Brevo from email must not be empty').optional(),
  UPSTASH_REDIS_REST_URL: z.string().url('Upstash Redis REST URL must be a valid URL').optional(),
  UPSTASH_REDIS_REST_TOKEN: z
    .string()
    .min(1, 'Upstash Redis REST token must not be empty')
    .optional(),
  RATE_LIMIT_HEALTH_SECRET: z
    .string()
    .min(1, 'Rate-limit health secret must not be empty')
    .optional(),
  TRUST_CF_CONNECTING_IP: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  VERCEL_URL: z.string().min(1, 'VERCEL_URL must not be empty').optional(),
  VERCEL_PROJECT_PRODUCTION_URL: z
    .string()
    .min(1, 'VERCEL_PROJECT_PRODUCTION_URL must not be empty')
    .optional(),
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

export const EnvSchema = z.object({
  public: PublicEnvSchema,
  server: ServerEnvSchema,
});

export const RequiredProductionEnvSchema = z
  .object({
    NEXT_PUBLIC_SITE_URL: z.string().url('Site URL must be a valid URL'),
    BREVO_API_KEY: z.string().min(1, 'Brevo API key is required'),
    BREVO_FROM_EMAIL: z.string().min(1, 'Brevo from email is required'),
    NEXT_PUBLIC_ENABLE_ANALYTICS: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
    NEXT_PUBLIC_GA_ID: GA_ID_SCHEMA.optional(),
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
  });

export type PublicEnv = z.infer<typeof PublicEnvSchema>;
export type ServerEnv = z.infer<typeof ServerEnvSchema>;
export type Env = z.infer<typeof EnvSchema>;
export type RequiredProductionEnv = z.infer<typeof RequiredProductionEnvSchema>;

export function validatePublicEnv(): PublicEnv {
  const result = PublicEnvSchema.safeParse({
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
    NEXT_PUBLIC_SHOW_DEBUG_ERRORS: process.env.NEXT_PUBLIC_SHOW_DEBUG_ERRORS,
    NEXT_PUBLIC_ENABLE_PWA: process.env.NEXT_PUBLIC_ENABLE_PWA,
    NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
  });

  if (!result.success) {
    console.error('Public environment validation failed:', result.error.issues);
    throw new Error(
      `Invalid public environment variables: ${result.error.issues.map((i) => i.message).join(', ')}`,
    );
  }

  return result.data;
}

export function validateServerEnv(): ServerEnv {
  const result = ServerEnvSchema.safeParse({
    BREVO_API_KEY: process.env.BREVO_API_KEY,
    BREVO_FROM_EMAIL: process.env.BREVO_FROM_EMAIL,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    RATE_LIMIT_HEALTH_SECRET: process.env.RATE_LIMIT_HEALTH_SECRET,
    TRUST_CF_CONNECTING_IP: process.env.TRUST_CF_CONNECTING_IP,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    VERCEL_URL: process.env.VERCEL_URL,
    VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
    ANALYZE: process.env.ANALYZE,
    SKIP_CONFIG_VALIDATION: process.env.SKIP_CONFIG_VALIDATION,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!result.success) {
    console.error('Server environment validation failed:', result.error.issues);
    throw new Error(
      `Invalid server environment variables: ${result.error.issues.map((i) => i.message).join(', ')}`,
    );
  }

  return result.data;
}

export function validateEnv(): Env {
  return {
    public: validatePublicEnv(),
    server: validateServerEnv(),
  };
}

export function validateProductionEnv(): RequiredProductionEnv {
  const result = RequiredProductionEnvSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    BREVO_API_KEY: process.env.BREVO_API_KEY,
    BREVO_FROM_EMAIL: process.env.BREVO_FROM_EMAIL,
    NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  });

  if (!result.success) {
    console.error('Production environment validation failed:', result.error.issues);
    throw new Error(
      `Missing or invalid required production environment variables: ${result.error.issues.map((i) => i.message).join(', ')}`,
    );
  }

  return result.data;
}

export function getPublicEnv<K extends keyof PublicEnv>(key: K): PublicEnv[K] {
  const env = validatePublicEnv();
  return env[key];
}

export function getServerEnv<K extends keyof ServerEnv>(key: K): ServerEnv[K] {
  const env = validateServerEnv();
  return env[key];
}

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

if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
  try {
    validateProductionEnv();
  } catch (error) {
    console.error('Required production env validation failed at startup:', error);
    throw error;
  }
}
