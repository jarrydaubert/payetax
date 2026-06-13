import { evaluateProductionEnvContract, parseDotEnvContent } from '@/lib/productionEnvContract';

describe('productionEnvContract', () => {
  it('requires Sentry DSN for production observability', () => {
    const evaluation = evaluateProductionEnvContract({
      NEXT_PUBLIC_SITE_URL: 'https://payetax.co.uk',
      NEXT_PUBLIC_GA_ID: 'G-TEST123',
      BREVO_API_KEY: 'brevo-key',
      BREVO_FROM_EMAIL: 'hello@payetax.co.uk',
    });

    expect(evaluation.missingRequiredEnv).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          featureId: 'sentry',
          envKey: 'NEXT_PUBLIC_SENTRY_DSN',
        }),
      ]),
    );
  });

  it('passes Sentry monitoring when the DSN is present', () => {
    const evaluation = evaluateProductionEnvContract({
      NEXT_PUBLIC_SITE_URL: 'https://payetax.co.uk',
      NEXT_PUBLIC_GA_ID: 'G-TEST123',
      NEXT_PUBLIC_SENTRY_DSN: 'https://public@example.ingest.sentry.io/123',
      BREVO_API_KEY: 'brevo-key',
      BREVO_FROM_EMAIL: 'hello@payetax.co.uk',
    });

    expect(evaluation.missingRequiredEnv).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          featureId: 'sentry',
        }),
      ]),
    );
  });

  it('keeps GA4 optional when analytics is explicitly disabled', () => {
    const evaluation = evaluateProductionEnvContract({
      NEXT_PUBLIC_SITE_URL: 'https://payetax.co.uk',
      NEXT_PUBLIC_ENABLE_ANALYTICS: 'false',
      NEXT_PUBLIC_SENTRY_DSN: 'https://public@example.ingest.sentry.io/123',
      BREVO_API_KEY: 'brevo-key',
      BREVO_FROM_EMAIL: 'hello@payetax.co.uk',
    });

    expect(evaluation.missingRequiredEnv).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          featureId: 'analytics',
          envKey: 'NEXT_PUBLIC_GA_ID',
        }),
      ]),
    );
  });

  it('parses simple dotenv content used by the contract checker', () => {
    expect(
      parseDotEnvContent(`
        NEXT_PUBLIC_SITE_URL=https://payetax.co.uk
        NEXT_PUBLIC_SENTRY_DSN="https://public@example.ingest.sentry.io/123"
      `),
    ).toMatchObject({
      NEXT_PUBLIC_SITE_URL: 'https://payetax.co.uk',
      NEXT_PUBLIC_SENTRY_DSN: 'https://public@example.ingest.sentry.io/123',
    });
  });
});
