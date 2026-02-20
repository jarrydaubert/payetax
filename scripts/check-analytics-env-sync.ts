#!/usr/bin/env bun
/**
 * Ensures runtime environment variables stay in sync across:
 * 1) .env.template
 * 2) PublicEnvSchema/ServerEnvSchema in src/lib/env.ts
 * 3) validatePublicEnv()/validateServerEnv() safeParse mappings in src/lib/env.ts
 *
 * NOTE:
 * - Script name kept for backward compatibility with existing package scripts.
 * - Scope now enforces runtime usage parity for all process.env keys in src/.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SOURCE_ROOT = join(ROOT, 'src');

const REQUIRED_PUBLIC_ENV_KEYS = [
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_ENABLE_ANALYTICS',
  'NEXT_PUBLIC_GA_ID',
  'NEXT_PUBLIC_AHREFS_KEY',
] as const;

const REQUIRED_SERVER_ENV_KEYS = [
  'UNSUBSCRIBE_SECRET',
  'SENTRY_WEBHOOK_SECRET',
  'LINEAR_API_KEY',
  'LINEAR_TEAM_KEY',
  'REFERRAL_PARTNER_EMAIL',
  'INDEXNOW_SUBMIT_SECRET',
] as const;

const NON_TEMPLATE_RUNTIME_ENV = new Set([
  // Platform/system-provided at runtime
  'NODE_ENV',
  'VERCEL_URL',
  'VERCEL_PROJECT_PRODUCTION_URL',
  'NEXT_PUBLIC_VERCEL_URL',
]);

const SOURCE_FILE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);
const IGNORED_DIRS = new Set([
  '__tests__',
  '__mocks__',
  '.next',
  'node_modules',
  'audit-outputs',
  'coverage',
]);

function getSection(content: string, startPattern: RegExp, endPattern: RegExp): string {
  const startMatch = content.match(startPattern);
  if (!startMatch || startMatch.index === undefined) {
    throw new Error(`Could not find section start: ${startPattern}`);
  }

  const startIndex = startMatch.index + startMatch[0].length;
  const rest = content.slice(startIndex);
  const endMatch = rest.match(endPattern);

  if (!endMatch || endMatch.index === undefined) {
    throw new Error(`Could not find section end: ${endPattern}`);
  }

  return rest.slice(0, endMatch.index);
}

function extractObjectKeys(section: string): Set<string> {
  const keys = new Set<string>();
  const regex = /^\s*([A-Z][A-Z0-9_]+)\s*:/gm;
  for (const match of section.matchAll(regex)) {
    if (match[1]) keys.add(match[1]);
  }
  return keys;
}

function extractTemplateKeys(template: string): Set<string> {
  const keys = new Set<string>();
  const regex = /^\s*#?\s*([A-Z][A-Z0-9_]+)=/gm;
  for (const match of template.matchAll(regex)) {
    if (match[1]) keys.add(match[1]);
  }
  return keys;
}

function extractProcessEnvKeys(source: string): Set<string> {
  const keys = new Set<string>();
  const regex = /process\.env\.([A-Z0-9_]+)/g;
  for (const match of source.matchAll(regex)) {
    if (match[1]) keys.add(match[1]);
  }
  return keys;
}

function collectSourceFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const entryPath = join(dir, entry);
    const stats = statSync(entryPath);

    if (stats.isDirectory()) {
      if (IGNORED_DIRS.has(entry)) continue;
      files.push(...collectSourceFiles(entryPath));
      continue;
    }

    const extension = extname(entry);
    if (SOURCE_FILE_EXTENSIONS.has(extension)) {
      files.push(entryPath);
    }
  }
  return files;
}

function ensureTemplateSchemaAndMappingPresence(
  key: string,
  schemaKeys: Set<string>,
  mappingKeys: Set<string>,
  templateKeys: Set<string>,
  errors: string[],
): void {
  if (!schemaKeys.has(key)) {
    errors.push(
      `${key} missing from ${key.startsWith('NEXT_PUBLIC_') ? 'Public' : 'Server'}EnvSchema`,
    );
  }
  if (!mappingKeys.has(key)) {
    errors.push(
      `${key} missing from ${key.startsWith('NEXT_PUBLIC_') ? 'validatePublicEnv()' : 'validateServerEnv()'} mapping`,
    );
  }
  if (!(NON_TEMPLATE_RUNTIME_ENV.has(key) || templateKeys.has(key))) {
    errors.push(`${key} missing from .env.template`);
  }
}

function main(): void {
  const templatePath = join(ROOT, '.env.template');
  const envPath = join(ROOT, 'src/lib/env.ts');

  const template = readFileSync(templatePath, 'utf-8');
  const envSource = readFileSync(envPath, 'utf-8');
  const templateKeys = extractTemplateKeys(template);

  const publicSchema = getSection(
    envSource,
    /export const PublicEnvSchema = z\.object\(\{/,
    /\n\}\);/,
  );
  const serverSchema = getSection(
    envSource,
    /export const ServerEnvSchema = z\.object\(\{/,
    /\n\}\);/,
  );
  const publicSafeParse = getSection(envSource, /PublicEnvSchema\.safeParse\(\{/, /\n\s*\}\);/);
  const serverSafeParse = getSection(envSource, /ServerEnvSchema\.safeParse\(\{/, /\n\s*\}\);/);
  const publicSchemaKeys = extractObjectKeys(publicSchema);
  const serverSchemaKeys = extractObjectKeys(serverSchema);
  const publicSafeParseKeys = extractObjectKeys(publicSafeParse);
  const serverSafeParseKeys = extractObjectKeys(serverSafeParse);

  const sourceFiles = collectSourceFiles(SOURCE_ROOT);
  const runtimeKeys = new Set<string>();
  for (const filePath of sourceFiles) {
    const source = readFileSync(filePath, 'utf-8');
    for (const key of extractProcessEnvKeys(source)) {
      runtimeKeys.add(key);
    }
  }
  const runtimePublicKeys = [...runtimeKeys].filter((key) => key.startsWith('NEXT_PUBLIC_')).sort();
  const runtimeServerKeys = [...runtimeKeys]
    .filter((key) => !key.startsWith('NEXT_PUBLIC_'))
    .sort();

  const errors: string[] = [];

  for (const key of REQUIRED_PUBLIC_ENV_KEYS) {
    ensureTemplateSchemaAndMappingPresence(
      key,
      publicSchemaKeys,
      publicSafeParseKeys,
      templateKeys,
      errors,
    );
  }

  for (const key of REQUIRED_SERVER_ENV_KEYS) {
    ensureTemplateSchemaAndMappingPresence(
      key,
      serverSchemaKeys,
      serverSafeParseKeys,
      templateKeys,
      errors,
    );
  }

  // Runtime parity: every process.env key used in src must be schematized + mapped + documented.
  for (const key of runtimePublicKeys) {
    ensureTemplateSchemaAndMappingPresence(
      key,
      publicSchemaKeys,
      publicSafeParseKeys,
      templateKeys,
      errors,
    );
  }
  for (const key of runtimeServerKeys) {
    ensureTemplateSchemaAndMappingPresence(
      key,
      serverSchemaKeys,
      serverSafeParseKeys,
      templateKeys,
      errors,
    );
  }

  // Schema parity: every schema key should be read from process.env in safeParse mappings.
  for (const key of publicSchemaKeys) {
    if (!publicSafeParseKeys.has(key)) {
      errors.push(`${key} is in PublicEnvSchema but missing from validatePublicEnv() mapping`);
    }
  }
  for (const key of serverSchemaKeys) {
    if (!serverSafeParseKeys.has(key)) {
      errors.push(`${key} is in ServerEnvSchema but missing from validateServerEnv() mapping`);
    }
  }

  console.log('🔎 Checking env contract sync...');
  console.log(`   Runtime env keys discovered in src/: ${runtimeKeys.size}`);
  console.log(`   - Public keys: ${runtimePublicKeys.length}`);
  console.log(`   - Server keys: ${runtimeServerKeys.length}`);
  console.log('   Critical public keys:');
  for (const key of REQUIRED_PUBLIC_ENV_KEYS) {
    console.log(`   - ${key}`);
  }
  console.log('   Critical server keys:');
  for (const key of REQUIRED_SERVER_ENV_KEYS) {
    console.log(`   - ${key}`);
  }

  if (errors.length > 0) {
    console.error('\n❌ Env contract sync check failed:');
    for (const error of errors) {
      console.error(`   - ${error}`);
    }
    process.exit(1);
  }

  console.log(
    '\n✅ Runtime env usage is in sync across .env.template, env schemas, and validation mappings',
  );
}

main();
