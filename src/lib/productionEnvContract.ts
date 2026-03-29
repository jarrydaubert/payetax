export type ProductionEnvMap = Record<string, string | undefined>;

export interface ProductionEnvFeatureContract {
  id: string;
  label: string;
  enabled: boolean | ((env: ProductionEnvMap) => boolean);
  requiredEnv: readonly string[];
  verificationMode?: 'env' | 'runtime';
  notes?: readonly string[];
}

export interface EvaluatedProductionEnvFeature {
  id: string;
  label: string;
  enabled: boolean;
  requiredEnv: readonly string[];
  verificationMode: 'env' | 'runtime';
  missingRequiredEnv: string[];
  notes: readonly string[];
}

export interface ProductionEnvContractEvaluation {
  scope: string;
  features: EvaluatedProductionEnvFeature[];
  enabledFeatures: EvaluatedProductionEnvFeature[];
  disabledFeatures: EvaluatedProductionEnvFeature[];
  missingRequiredEnv: Array<{
    featureId: string;
    featureLabel: string;
    envKey: string;
  }>;
}

export const PRODUCTION_ENV_CONTRACT_SCOPE =
  'Shipped flows only. Dormant or unshipped experiments are excluded by default.';

function isAnalyticsEnabled(env: ProductionEnvMap): boolean {
  return env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'false';
}

export const PRODUCTION_ENV_FEATURE_CONTRACT: readonly ProductionEnvFeatureContract[] = [
  {
    id: 'site-basics',
    label: 'Canonical site/origin configuration',
    enabled: true,
    requiredEnv: ['NEXT_PUBLIC_SITE_URL'],
    verificationMode: 'env',
    notes: ['Used by metadata, sitemap generation, newsletter URLs, and origin validation.'],
  },
  {
    id: 'analytics',
    label: 'Production analytics',
    enabled: isAnalyticsEnabled,
    requiredEnv: ['NEXT_PUBLIC_GA_ID'],
    verificationMode: 'env',
    notes: ['Analytics defaults to enabled unless NEXT_PUBLIC_ENABLE_ANALYTICS=false is set.'],
  },
  {
    id: 'newsletter-subscribe',
    label: 'Newsletter subscribe flow',
    enabled: true,
    requiredEnv: ['KIT_API_SECRET', 'KIT_FORM_ID'],
    verificationMode: 'env',
  },
  {
    id: 'newsletter-unsubscribe',
    label: 'Newsletter unsubscribe flow',
    enabled: true,
    requiredEnv: ['KIT_API_SECRET', 'UNSUBSCRIBE_SECRET'],
    verificationMode: 'env',
  },
  {
    id: 'results-email',
    label: 'PAYE and director results email delivery',
    enabled: true,
    requiredEnv: ['RESEND_API_KEY'],
    verificationMode: 'env',
  },
  {
    id: 'referral-lead',
    label: 'Referral lead confirmation and partner notification',
    enabled: false,
    requiredEnv: ['RESEND_API_KEY', 'REFERRAL_PARTNER_EMAIL'],
    verificationMode: 'env',
    notes: ['Held out until the referral CTA is intentionally rolled out on shipped surfaces.'],
  },
  {
    id: 'rate-limit-health',
    label: 'Distributed rate-limit verification path',
    enabled: true,
    requiredEnv: ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN', 'RATE_LIMIT_HEALTH_SECRET'],
    verificationMode: 'runtime',
    notes: [
      'Verified via the live health endpoint + throttle probe because Vercel env pull may return blank values for sensitive vars.',
    ],
  },
  {
    id: 'sentry-webhook',
    label: 'Sentry webhook to Linear integration',
    enabled: true,
    requiredEnv: ['SENTRY_WEBHOOK_SECRET', 'LINEAR_API_KEY'],
    verificationMode: 'env',
    notes: ['LINEAR_TEAM_KEY is optional because the route defaults to PAYTAX when unset.'],
  },
  {
    id: 'indexnow-submit',
    label: 'Authenticated IndexNow submission',
    enabled: false,
    requiredEnv: ['INDEXNOW_SUBMIT_SECRET', 'INDEXNOW_KEY'],
    verificationMode: 'env',
    notes: [
      'Disabled by contract until the production submission path is intentionally turned on.',
    ],
  },
] as const;

export function parseDotEnvContent(content: string): ProductionEnvMap {
  const env: ProductionEnvMap = {};
  const lines = content.split(/\r?\n/u);
  const DOUBLE_QUOTE = '"';
  const SINGLE_QUOTE = "'";

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith('#')) {
      continue;
    }

    const normalized = trimmed.startsWith('export ') ? trimmed.slice(7).trim() : trimmed;
    const separatorIndex = normalized.indexOf('=');
    if (separatorIndex <= 0) {
      continue;
    }

    const key = normalized.slice(0, separatorIndex).trim();
    let value = normalized.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith(DOUBLE_QUOTE) && value.endsWith(DOUBLE_QUOTE)) ||
      (value.startsWith(SINGLE_QUOTE) && value.endsWith(SINGLE_QUOTE))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

export function evaluateProductionEnvContract(
  env: ProductionEnvMap,
): ProductionEnvContractEvaluation {
  const features = PRODUCTION_ENV_FEATURE_CONTRACT.map((feature) => {
    const enabled = typeof feature.enabled === 'function' ? feature.enabled(env) : feature.enabled;
    const verificationMode = feature.verificationMode ?? 'env';
    const missingRequiredEnv =
      enabled && verificationMode === 'env'
        ? feature.requiredEnv.filter((envKey) => !env[envKey]?.trim().length)
        : [];

    return {
      id: feature.id,
      label: feature.label,
      enabled,
      requiredEnv: feature.requiredEnv,
      verificationMode,
      missingRequiredEnv,
      notes: feature.notes ?? [],
    };
  });

  const enabledFeatures = features.filter((feature) => feature.enabled);
  const disabledFeatures = features.filter((feature) => !feature.enabled);
  const missingRequiredEnv = enabledFeatures.flatMap((feature) =>
    feature.missingRequiredEnv.map((envKey) => ({
      featureId: feature.id,
      featureLabel: feature.label,
      envKey,
    })),
  );

  return {
    scope: PRODUCTION_ENV_CONTRACT_SCOPE,
    features,
    enabledFeatures,
    disabledFeatures,
    missingRequiredEnv,
  };
}
