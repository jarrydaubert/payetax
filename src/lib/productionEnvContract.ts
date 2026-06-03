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

export const PRODUCTION_ENV_CONTRACT_SCOPE = 'Retained R&D project flows only.';

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
    notes: ['Used by metadata, sitemap generation, email URLs, and origin validation.'],
  },
  {
    id: 'analytics',
    label: 'Basic GA4 analytics',
    enabled: isAnalyticsEnabled,
    requiredEnv: ['NEXT_PUBLIC_GA_ID'],
    verificationMode: 'env',
    notes: ['Analytics defaults to enabled unless NEXT_PUBLIC_ENABLE_ANALYTICS=false is set.'],
  },
  {
    id: 'results-email',
    label: 'PAYE, director results, and feedback email delivery',
    enabled: true,
    requiredEnv: ['BREVO_SMTP_HOST', 'BREVO_SMTP_PORT', 'BREVO_SMTP_LOGIN', 'BREVO_SMTP_PASSWORD'],
    verificationMode: 'env',
  },
  {
    id: 'rate-limit-health',
    label: 'Distributed rate-limit verification path',
    enabled: true,
    requiredEnv: ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN', 'RATE_LIMIT_HEALTH_SECRET'],
    verificationMode: 'runtime',
    notes: [
      'Verified via the live health endpoint because Vercel env pull may return blank values for sensitive vars.',
    ],
  },
  {
    id: 'sentry-webhook',
    label: 'Sentry webhook to Linear integration',
    enabled: true,
    requiredEnv: ['SENTRY_WEBHOOK_SECRET', 'LINEAR_API_KEY'],
    verificationMode: 'env',
    notes: [
      'LINEAR_TEAM_KEY is optional because the route defaults to PAYTAX when unset.',
      'Reconfirm LINEAR_TEAM_KEY after Linear workspace or project moves.',
    ],
  },
] as const;

export function parseDotEnvContent(content: string): ProductionEnvMap {
  const env: ProductionEnvMap = {};
  const lines = content.split(/\r?\n/u);

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith('#')) continue;

    const normalized = trimmed.startsWith('export ') ? trimmed.slice(7).trim() : trimmed;
    const separatorIndex = normalized.indexOf('=');
    if (separatorIndex <= 0) continue;

    const key = normalized.slice(0, separatorIndex).trim();
    let value = normalized.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
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
