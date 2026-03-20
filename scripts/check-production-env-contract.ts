#!/usr/bin/env bun

import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  evaluateProductionEnvContract,
  PRODUCTION_ENV_CONTRACT_SCOPE,
  parseDotEnvContent,
} from '../src/lib/productionEnvContract';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

interface CliOptions {
  fromEnvFile?: string;
}

function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--from-env-file') {
      const value = args[index + 1];
      if (!value) {
        throw new Error('Missing value for --from-env-file');
      }
      options.fromEnvFile = value;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function loadEnvContentFromVercel(): { content: string; source: string } {
  const tempDir = mkdtempSync(join(tmpdir(), 'payetax-production-env-'));
  const tempEnvPath = join(tempDir, '.env.production');

  try {
    const result = spawnSync(
      'vercel',
      ['env', 'pull', tempEnvPath, '--environment=production', '--yes'],
      {
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );

    if (result.status !== 0) {
      const errorOutput = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
      throw new Error(
        errorOutput.length > 0
          ? errorOutput
          : 'vercel env pull failed without stdout/stderr output',
      );
    }

    return {
      content: readFileSync(tempEnvPath, 'utf-8'),
      source: 'Vercel production env',
    };
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

function loadEnvContent(options: CliOptions): { content: string; source: string } {
  if (options.fromEnvFile) {
    return {
      content: readFileSync(options.fromEnvFile, 'utf-8'),
      source: options.fromEnvFile,
    };
  }

  return loadEnvContentFromVercel();
}

interface RuntimeVerificationResult {
  ok: boolean;
  detail: string;
}

function verifyRateLimitRuntime(baseUrl: string, secret: string): RuntimeVerificationResult {
  const result = spawnSync('bun', ['scripts/verify-rate-limit.ts'], {
    cwd: ROOT,
    encoding: 'utf-8',
    env: {
      ...process.env,
      RATE_LIMIT_VERIFY_BASE_URL: baseUrl,
      RATE_LIMIT_HEALTH_SECRET: secret,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (result.status === 0) {
    return {
      ok: true,
      detail: `Runtime verification passed via bun run ops:verify-rate-limit against ${baseUrl}`,
    };
  }

  const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
  return {
    ok: false,
    detail:
      output.length > 0
        ? output
        : 'bun run ops:verify-rate-limit failed without stdout/stderr output',
  };
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const { content, source } = loadEnvContent(options);
  const env = parseDotEnvContent(content);
  const evaluation = evaluateProductionEnvContract(env);
  const runtimeVerificationResults = new Map<string, RuntimeVerificationResult>();
  const runtimeFailures: Array<{ featureId: string; featureLabel: string; detail: string }> = [];

  for (const feature of evaluation.enabledFeatures) {
    if (feature.verificationMode !== 'runtime') {
      continue;
    }

    if (feature.id === 'rate-limit-health') {
      const baseUrl = process.env.RATE_LIMIT_VERIFY_BASE_URL ?? env.NEXT_PUBLIC_SITE_URL;
      const secret = process.env.RATE_LIMIT_HEALTH_SECRET;

      if (!(baseUrl && secret)) {
        const missing = [
          ...(baseUrl ? [] : ['RATE_LIMIT_VERIFY_BASE_URL']),
          ...(secret ? [] : ['RATE_LIMIT_HEALTH_SECRET']),
        ];
        const detail = `Missing local runtime verification input(s): ${missing.join(', ')}`;
        runtimeVerificationResults.set(feature.id, { ok: false, detail });
        runtimeFailures.push({
          featureId: feature.id,
          featureLabel: feature.label,
          detail,
        });
        continue;
      }

      const runtimeResult = verifyRateLimitRuntime(baseUrl, secret);
      runtimeVerificationResults.set(feature.id, runtimeResult);
      if (!runtimeResult.ok) {
        runtimeFailures.push({
          featureId: feature.id,
          featureLabel: feature.label,
          detail: runtimeResult.detail,
        });
      }
    }
  }

  console.log('🔎 Checking production env contract');
  console.log(`   Scope: ${PRODUCTION_ENV_CONTRACT_SCOPE}`);
  console.log(`   Source: ${source}`);
  console.log(`   Enabled features: ${evaluation.enabledFeatures.length}`);
  console.log(`   Disabled features: ${evaluation.disabledFeatures.length}`);

  for (const feature of evaluation.features) {
    const status = feature.enabled ? 'ENABLED' : 'DISABLED';
    console.log(`\n- ${feature.label} [${status}]`);
    console.log(`  Required env: ${feature.requiredEnv.join(', ')}`);
    console.log(`  Verification: ${feature.verificationMode}`);
    if (feature.notes.length > 0) {
      for (const note of feature.notes) {
        console.log(`  Note: ${note}`);
      }
    }
    if (!feature.enabled) {
      console.log('  Result: Not required while disabled by contract');
      continue;
    }

    if (feature.verificationMode === 'runtime') {
      const runtimeResult = runtimeVerificationResults.get(feature.id);
      if (runtimeResult?.ok) {
        console.log(`  Result: OK (${runtimeResult.detail})`);
      } else {
        console.log(`  Result: RUNTIME CHECK FAILED (${runtimeResult?.detail ?? 'unavailable'})`);
      }
      continue;
    }

    if (feature.missingRequiredEnv.length === 0) {
      console.log('  Result: OK');
    } else {
      console.log(`  Result: MISSING ${feature.missingRequiredEnv.join(', ')}`);
    }
  }

  if (evaluation.missingRequiredEnv.length > 0 || runtimeFailures.length > 0) {
    console.error('\n❌ Production env contract check failed.');
    for (const missing of evaluation.missingRequiredEnv) {
      console.error(`   - ${missing.featureLabel}: ${missing.envKey}`);
    }
    for (const failure of runtimeFailures) {
      console.error(`   - ${failure.featureLabel}: ${failure.detail}`);
    }
    console.error('\nNext steps:');
    console.error('   1. Add the missing variable(s) to Vercel Production.');
    console.error(
      '   2. For runtime-verified features, provide the required local verification inputs and re-run the live check.',
    );
    console.error('   3. Redeploy if the feature reads env at build time or startup.');
    console.error('   4. Re-run: bun run check:production-env-contract');
    process.exit(1);
  }

  console.log('\n✅ Production env contract matches the enabled-feature contract');
}

main();
