#!/usr/bin/env bun
/** Check staged paths and contents without opening local env files or Git history. */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';

// The cache namespace is public, not a credential. Match only that value in that file.
export const SCANNER_CONFIG = String.raw`[extend]
useDefault = true

[[allowlists]]
description = "Public service-worker cache namespace"
targetRules = ["generic-api-key"]
condition = "AND"
regexTarget = "secret"
paths = ['''(?:^|[/\\])public[/\\]sw\.js$''']
regexes = ['''^payetax-api-v\d+\.\d+\.\d+$''']
`;

export function trackedEnvironmentFiles(paths: readonly string[]): string[] {
  return paths.filter(
    (path) => path !== '.env.template' && path.split('/').some((part) => /^\.env/i.test(part)),
  );
}

/** Never forward scanner logs, matched source, credentials or error objects to CI output. */
export function scanPassed(status: number | null, report: unknown): boolean {
  if (!Array.isArray(report) || (status !== 0 && status !== 1)) {
    console.error(
      'Secret scanner could not complete; diagnostics withheld. Check the installation.',
    );
    return false;
  }
  if (report.length > 0) {
    console.error(`Secret scan rejected ${report.length} finding(s); values and source withheld.`);
    return false;
  }
  if (status !== 0) {
    console.error('Secret scanner failed without a usable finding; diagnostics withheld.');
    return false;
  }
  return true;
}

export function runSecretCheck(envOnly = false): number {
  let temporaryDirectory: string | undefined;
  try {
    const paths = spawnSync('git', ['ls-files', '--cached', '-z'], { encoding: 'utf8' });
    if (paths.status !== 0) throw new Error('Cannot list staged paths');
    const tracked = paths.stdout.split('\0').filter(Boolean);
    const blocked = trackedEnvironmentFiles(tracked);
    if (blocked.length > 0) {
      console.error(
        `Rejected ${blocked.length} tracked environment path(s). Only root .env.template is allowed.`,
      );
      return 1;
    }
    if (envOnly) {
      console.log('Tracked environment-file guard passed.');
      return 0;
    }
    // Gitleaks also auto-loads the source-root ignore file, even with an explicit ignore path.
    if (tracked.some((path) => path.toLowerCase() === '.gitleaksignore')) {
      console.error('Repository .gitleaksignore files cannot suppress this check.');
      return 1;
    }

    temporaryDirectory = mkdtempSync(join(tmpdir(), 'payetax-secret-check-'));
    const snapshot = join(temporaryDirectory, 'tree');
    const config = join(temporaryDirectory, 'config.toml');
    const ignore = join(temporaryDirectory, 'empty-ignore');
    const report = join(temporaryDirectory, 'redacted-report.json');
    writeFileSync(config, SCANNER_CONFIG);
    writeFileSync(ignore, '');
    // checkout-index exports staged blobs only, never history, untracked files or local env values.
    const exported = spawnSync('git', [
      'checkout-index',
      '--all',
      `--prefix=${snapshot.replaceAll('\\', '/')}/`,
    ]);
    if (exported.status !== 0) throw new Error('Cannot export staged tree');
    const scan = spawnSync(
      process.env.GITLEAKS_BIN || 'gitleaks',
      [
        'dir',
        snapshot,
        '--config',
        config,
        '--gitleaks-ignore-path',
        ignore,
        '--ignore-gitleaks-allow',
        '--redact=100',
        '--no-banner',
        '--no-color',
        '--report-format=json',
        '--report-path',
        report,
        '--exit-code=1',
      ],
      { cwd: temporaryDirectory, encoding: 'utf8', timeout: 120_000 },
    );
    if (!scanPassed(scan.status, JSON.parse(readFileSync(report, 'utf8')))) return 1;
    console.log('Secret scan passed for the staged tree.');
    return 0;
  } catch {
    console.error('Secret check could not complete; diagnostics withheld. Check Git and Gitleaks.');
    return 1;
  } finally {
    if (temporaryDirectory) {
      const resolved = resolve(temporaryDirectory);
      if (resolved.startsWith(`${resolve(tmpdir())}${sep}payetax-secret-check-`)) {
        rmSync(resolved, { recursive: true, force: true });
      }
    }
  }
}

if (require.main === module) {
  process.exitCode = runSecretCheck(process.argv.includes('--env-only'));
}
