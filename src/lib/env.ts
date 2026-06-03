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
  BREVO_SMTP_HOST: z.string().min(1, 'Brevo SMTP host must not be empty').optional(),
  BREVO_SMTP_PORT: z.string().regex(/^\d+$/, 'Brevo SMTP port must be numeric').optional(),
  BREVO_SMTP_LOGIN: z.string().min(1, 'Brevo SMTP login must not be empty').optional(),
  BREVO_SMTP_PASSWORD: z.string().min(1, 'Brevo SMTP password must not be empty').optional(),
  BREVO_FROM_EMAIL: z.string().min(1, 'Brevo from email must not be empty').optional(),
  FEEDBACK_TO_EMAIL: z.string().email('Feedback recipient must be a valid email').optional(),
  UPSTASH_REDIS_REST_URL: z.string().url('Upstash Redis REST URL must be a valid URL').optional(),
  UPSTASH_REDIS_REST_TOKEN: z
    .string()
    .min(1, 'Upstash Redis REST token must not be empty')
    .optional(),
  RATE_LIMIT_HEALTH_SECRET: z
    .string()
    .min(1, 'Rate-limit health secret must not be empty')
    .optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_WEBHOOK_SECRET: z.string().min(1, 'Sentry webhook secret must not be empty').optional(),
  VERCEL_URL: z.string().min(1, 'VERCEL_URL must not be empty').optional(),
  VERCEL_PROJECT_PRODUCTION_URL: z
    .string()
    .min(1, 'VERCEL_PROJECT_PRODUCTION_URL must not be empty')
    .optional(),
  LINEAR_API_KEY: z.string().min(1, 'Linear API key must not be empty').optional(),
  LINEAR_TEAM_KEY: z.string().min(1, 'Linear team key must not be empty').optional(),
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
    BREVO_SMTP_HOST: z.string().min(1, 'Brevo SMTP host is required'),
    BREVO_SMTP_PORT: z.string().regex(/^\d+$/, 'Brevo SMTP port must be numeric'),
    BREVO_SMTP_LOGIN: z.string().min(1, 'Brevo SMTP login is required'),
    BREVO_SMTP_PASSWORD: z.string().min(1, 'Brevo SMTP password is required'),
    BREVO_FROM_EMAIL: z.string().min(1, 'Brevo from email is required'),
    FEEDBACK_TO_EMAIL: z.string().email('Feedback recipient must be a valid email'),
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
    BREVO_SMTP_HOST: process.env.BREVO_SMTP_HOST,
    BREVO_SMTP_PORT: process.env.BREVO_SMTP_PORT,
    BREVO_SMTP_LOGIN: process.env.BREVO_SMTP_LOGIN,
    BREVO_SMTP_PASSWORD: process.env.BREVO_SMTP_PASSWORD,
    BREVO_FROM_EMAIL: process.env.BREVO_FROM_EMAIL,
    FEEDBACK_TO_EMAIL: process.env.FEEDBACK_TO_EMAIL,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    RATE_LIMIT_HEALTH_SECRET: process.env.RATE_LIMIT_HEALTH_SECRET,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    SENTRY_WEBHOOK_SECRET: process.env.SENTRY_WEBHOOK_SECRET,
    VERCEL_URL: process.env.VERCEL_URL,
    VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
    LINEAR_API_KEY: process.env.LINEAR_API_KEY,
    LINEAR_TEAM_KEY: process.env.LINEAR_TEAM_KEY,
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
    BREVO_SMTP_HOST: process.env.BREVO_SMTP_HOST,
    BREVO_SMTP_PORT: process.env.BREVO_SMTP_PORT,
    BREVO_SMTP_LOGIN: process.env.BREVO_SMTP_LOGIN,
    BREVO_SMTP_PASSWORD: process.env.BREVO_SMTP_PASSWORD,
    BREVO_FROM_EMAIL: process.env.BREVO_FROM_EMAIL,
    FEEDBACK_TO_EMAIL: process.env.FEEDBACK_TO_EMAIL,
    NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    SENTRY_WEBHOOK_SECRET: process.env.SENTRY_WEBHOOK_SECRET,
    LINEAR_API_KEY: process.env.LINEAR_API_KEY,
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
