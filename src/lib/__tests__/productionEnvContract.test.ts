import { describe, expect, it } from '@jest/globals';
import { evaluateProductionEnvContract, parseDotEnvContent } from '../productionEnvContract';

describe('productionEnvContract', () => {
  it('parses dotenv content with comments, export prefixes, and quoted values', () => {
    const parsed = parseDotEnvContent(`
# Comment
NEXT_PUBLIC_SITE_URL="https://payetax.co.uk"
export NEXT_PUBLIC_GA_ID='G-TEST123456'
KIT_API_SECRET=kit_secret
`);

    expect(parsed.NEXT_PUBLIC_SITE_URL).toBe('https://payetax.co.uk');
    expect(parsed.NEXT_PUBLIC_GA_ID).toBe('G-TEST123456');
    expect(parsed.KIT_API_SECRET).toBe('kit_secret');
  });

  it('requires GA only when analytics are enabled', () => {
    const enabledEvaluation = evaluateProductionEnvContract({
      NEXT_PUBLIC_SITE_URL: 'https://payetax.co.uk',
      NEXT_PUBLIC_ENABLE_ANALYTICS: 'true',
    });
    const disabledEvaluation = evaluateProductionEnvContract({
      NEXT_PUBLIC_SITE_URL: 'https://payetax.co.uk',
      NEXT_PUBLIC_ENABLE_ANALYTICS: 'false',
    });

    const analyticsWhenEnabled = enabledEvaluation.features.find(
      (feature) => feature.id === 'analytics',
    );
    const analyticsWhenDisabled = disabledEvaluation.features.find(
      (feature) => feature.id === 'analytics',
    );

    expect(analyticsWhenEnabled?.enabled).toBe(true);
    expect(analyticsWhenEnabled?.missingRequiredEnv).toContain('NEXT_PUBLIC_GA_ID');
    expect(analyticsWhenDisabled?.enabled).toBe(false);
    expect(analyticsWhenDisabled?.missingRequiredEnv).toHaveLength(0);
  });

  it('does not fail disabled features that are held out by contract', () => {
    const evaluation = evaluateProductionEnvContract({
      NEXT_PUBLIC_SITE_URL: 'https://payetax.co.uk',
      NEXT_PUBLIC_GA_ID: 'G-TEST123456',
      KIT_API_SECRET: 'kit_secret',
      KIT_FORM_ID: '12345',
      UNSUBSCRIBE_SECRET: 'unsub_secret',
      RESEND_API_KEY: 're_test123',
      REFERRAL_PARTNER_EMAIL: 'partner@payetax.co.uk',
      UPSTASH_REDIS_REST_URL: 'https://example.upstash.io',
      UPSTASH_REDIS_REST_TOKEN: 'upstash_token',
      RATE_LIMIT_HEALTH_SECRET: 'health_secret',
      SENTRY_WEBHOOK_SECRET: 'sentry_secret',
      LINEAR_API_KEY: 'linear_api_key',
    });

    const indexNowFeature = evaluation.features.find((feature) => feature.id === 'indexnow-submit');
    const rateLimitFeature = evaluation.features.find(
      (feature) => feature.id === 'rate-limit-health',
    );

    expect(indexNowFeature?.enabled).toBe(false);
    expect(indexNowFeature?.missingRequiredEnv).toHaveLength(0);
    expect(rateLimitFeature?.verificationMode).toBe('runtime');
    expect(evaluation.missingRequiredEnv).toHaveLength(0);
  });

  it('reports only env-verified missing vars from env snapshots', () => {
    const evaluation = evaluateProductionEnvContract({
      NEXT_PUBLIC_SITE_URL: 'https://payetax.co.uk',
      NEXT_PUBLIC_GA_ID: 'G-TEST123456',
      KIT_API_SECRET: 'kit_secret',
      KIT_FORM_ID: '12345',
      UNSUBSCRIBE_SECRET: 'unsub_secret',
      RESEND_API_KEY: 're_test123',
    });

    expect(evaluation.missingRequiredEnv).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          featureId: 'sentry-webhook',
          envKey: 'SENTRY_WEBHOOK_SECRET',
        }),
        expect.objectContaining({
          featureId: 'sentry-webhook',
          envKey: 'LINEAR_API_KEY',
        }),
      ]),
    );
    expect(
      evaluation.missingRequiredEnv.some((missing) => missing.featureId === 'rate-limit-health'),
    ).toBe(false);
  });
});
