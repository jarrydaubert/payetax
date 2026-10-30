#!/usr/bin/env bun
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// Stable releases only. Cache schemas and Git tags are deliberately independent.
function parseVersion(value: unknown): number[] {
  if (
    typeof value !== 'string' ||
    value !== value.trim() ||
    !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(value)
  ) {
    throw new Error(`Expected a stable MAJOR.MINOR.PATCH version; received ${String(value)}`);
  }
  const parts = value.split('.').map(Number);
  if (!parts.every(Number.isSafeInteger))
    throw new Error('Version components must be safe integers');
  return parts;
}

function isProductionFacing(path: string): boolean {
  return !(
    /^(docs\/|\.github\/|\.claude\/|e2e\/|src\/test\/)/.test(path) ||
    /(^|\/)(__tests__|__mocks__)\//.test(path) ||
    /\.(test|spec)\.[cm]?[jt]sx?$/.test(path) ||
    /^(AGENTS\.md|CLAUDE\.md|README\.md|LICENSE|\.gitignore|biome\.json|jest\.[^/]+|playwright\.config\.ts|tsconfig\.(jest|e2e)\.json)$/.test(
      path,
    )
  );
}

function main() {
  const args = process.argv.slice(2);
  if (args.length !== 0 && (args.length !== 2 || args[0] !== '--base' || !args[1])) {
    throw new Error('Usage: bun run check-version [--base <git-ref>]');
  }

  const version = JSON.parse(readFileSync('package.json', 'utf8')).version;
  const current = parseVersion(version);
  console.log(`package.json: ${version} (stable SemVer)`);

  if (args.length === 0) {
    console.log('Format checked only. Use --base <git-ref> to enforce the PR version bump.');
    return;
  }

  const git = (...gitArgs: string[]) =>
    execFileSync('git', gitArgs, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  // Resolve first: invalid or missing history must fail, never silently skip the guard.
  const base = git('rev-parse', '--verify', '--end-of-options', `${args[1]}^{commit}`).trim();
  const baseVersion = JSON.parse(git('show', `${base}:package.json`)).version;
  const previous = parseVersion(baseVersion);
  // Includes staged/unstaged tracked edits locally. CI checks the PR merge tree.
  // --no-renames keeps both paths visible when production code moves into a test/doc path.
  const paths = git('diff', '--name-only', '--no-renames', '-z', base, '--')
    .split('\0')
    .filter(Boolean);
  const productionChange = paths.some(isProductionFacing);

  if (version === baseVersion && !productionChange) {
    console.log(`No production-facing changes since ${args[1]}; no version bump required.`);
    return;
  }

  const [major = 0, minor = 0, patch = 0] = previous;
  const nextVersions = [
    `${major}.${minor}.${patch + 1}`,
    `${major}.${minor + 1}.0`,
    `${major + 1}.0.0`,
  ];
  if (!nextVersions.includes(current.join('.'))) {
    throw new Error(
      `Bump package.json from ${baseVersion}: patch ${nextVersions[0]} for fixes/maintenance, ` +
        `minor ${nextVersions[1]} for capabilities/tax-year support, or major ${nextVersions[2]} for breaking changes.`,
    );
  }
  console.log(
    `Version bump accepted: ${baseVersion} -> ${version}. Review the SemVer category in the PR.`,
  );
}

try {
  main();
} catch (error) {
  console.error(`Version check failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
