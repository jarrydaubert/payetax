/** @jest-environment node */

import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const script = resolve(__dirname, '../../../scripts/check-version.ts');
let root: string;

function write(path: string, content: string) {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), content);
}

function version(value: string) {
  write('package.json', JSON.stringify({ name: 'version-test', version: value }));
}

function git(...args: string[]) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: 'pipe' }).trim();
}

function check(...args: string[]) {
  const result = spawnSync('bun', ['--no-env-file', script, ...args], {
    cwd: root,
    encoding: 'utf8',
  });
  if (result.error) throw result.error;
  return { status: result.status, output: `${result.stdout}${result.stderr}` };
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'payetax-version-'));
  git('init', '--quiet');
  version('5.1.4');
  write('src/app/page.tsx', 'original page');
  write('docs/guide.md', 'original guide');
  write('public/sw.js', "const CACHE_NAME = 'payetax-v5.1.4-pwa1';");
  git('add', '.');
  git(
    '-c',
    'user.name=Version test',
    '-c',
    'user.email=version@example.test',
    'commit',
    '-qm',
    'base',
  );
});

afterEach(() => {
  if (!resolve(root).startsWith(resolve(tmpdir(), 'payetax-version-'))) {
    throw new Error('Refusing cleanup outside the version-test fixture');
  }
  rmSync(root, { recursive: true, force: true });
});

it.each([
  '5.1.5',
  '5.2.0',
  '6.0.0',
])('accepts the next SemVer bump %s with unchanged caches', (next) => {
  version(next);
  expect(check('--base', 'HEAD').status).toBe(0);
});

it.each([
  '5.1.4',
  '5.1.3',
  '4.9.9',
  '5.1.6',
  '5.3.0',
  '6.1.0',
])('rejects missing, backward or skipped bumps: %s', (next) => {
  version(next);
  write('src/app/page.tsx', 'changed page');
  const result = check('--base', 'HEAD');
  expect(result.status).toBe(1);
  expect(result.output).toContain('Bump package.json from 5.1.4');
});

it.each([
  'v5.2.0',
  '05.2.0',
  '5.2',
  '5.2.0-beta.1',
  '5.2.0+build',
  '5.2.0\n',
  ' 5.2.0',
  '9007199254740992.0.0',
])('rejects unsupported or invalid stable versions: %s', (next) => {
  version(next);
  expect(check().status).toBe(1);
});

it('allows format validation without tags or a service worker', () => {
  rmSync(join(root, 'public/sw.js'));
  expect(check().status).toBe(0);
  expect(check().output).toContain('Format checked only');
});

it.each([
  'docs/guide.md',
  'src/lib/__tests__/sample.test.ts',
  '.github/workflows/ci.yml',
  'e2e/example.spec.ts',
])('allows documentation, tests or CI changes without a bump: %s', (path) => {
  write(path, 'changed non-production file');
  git('add', path);
  expect(check('--base', 'HEAD').status).toBe(0);
});

it.each([
  'content/blog/article.md',
  'public/sw.js',
  'bun.lock',
  'next.config.ts',
  'scripts/build.ts',
  'unknown.config',
])('requires a bump for production-facing or unclassified files: %s', (path) => {
  write(path, 'changed production file');
  git('add', path);
  expect(check('--base', 'HEAD').status).toBe(1);
});

it('does not exempt a production removal disguised as a rename into documentation', () => {
  renameSync(join(root, 'src/app/page.tsx'), join(root, 'docs/page.md'));
  git('add', '.');
  expect(check('--base', 'HEAD').status).toBe(1);
});

it('fails closed when the base ref cannot be resolved', () => {
  const result = check('--base', 'missing-main');
  expect(result.status).toBe(1);
  expect(result.output).toContain('Version check failed');
});

it('checks committed production changes against the supplied base SHA', () => {
  const base = git('rev-parse', 'HEAD');
  write('src/app/page.tsx', 'committed change');
  git('add', '.');
  git(
    '-c',
    'user.name=Version test',
    '-c',
    'user.email=version@example.test',
    'commit',
    '-qm',
    'change',
  );
  expect(check('--base', base).status).toBe(1);
  version('5.2.0');
  expect(check('--base', base).status).toBe(0);
});

it('requires another bump when the target branch already has the proposed version', () => {
  version('5.2.0');
  git('add', '.');
  git(
    '-c',
    'user.name=Version test',
    '-c',
    'user.email=version@example.test',
    'commit',
    '-qm',
    'new base',
  );
  write('src/app/page.tsx', 'another fix');
  expect(check('--base', 'HEAD').status).toBe(1);
  version('5.2.1');
  expect(check('--base', 'HEAD').status).toBe(0);
});

it('rejects incomplete or unknown CLI options', () => {
  expect(check('--base').status).toBe(1);
  expect(check('--skip').status).toBe(1);
});
