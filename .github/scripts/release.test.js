const assert = require('node:assert/strict');
const { test } = require('node:test');
const { release } = require('./release.js');

const sha = 'a'.repeat(40);
const older = 'b'.repeat(40);
const mainHead = 'c'.repeat(40);
const evidence = 'docs/reports/releases/production-v5.2.5.md';
const event = (inputs = {}) => ({
  ref: 'refs/heads/main',
  repository: { full_name: 'owner/repo', default_branch: 'main' },
  inputs: { sha, version: '5.2.5', evidence, publish: true, ...inputs },
});

function fixture(options = {}) {
  const calls = [];
  const tags = new Map(Object.entries(options.tags ?? {}));
  const releases = options.releases ?? [];
  const run = (tool, args) => {
    calls.push([tool, ...args]);
    if (options.fail?.(tool, args)) throw new Error(`${tool} ${args[0]} failed`);
    if (tool === 'git') {
      if (args[0] === 'rev-list') return options.history ?? `${mainHead}\n${sha}\n${older}`;
      if (args[0] === 'rev-parse') return mainHead;
      if (args[0] === 'cat-file') {
        if (args[2] !== `origin/main:${evidence}`) throw new Error('missing');
        return '';
      }
      if (args[0] === 'show') {
        const ref = args[1].split(':')[0];
        return JSON.stringify({ version: options.versions?.[ref] ?? '5.2.5' });
      }
      if (args[0] === 'ls-remote') {
        const tag = tags.get(args[3].replace('refs/tags/', ''));
        if (!tag) return '';
        const ref = args[3];
        return tag.annotated
          ? `${'d'.repeat(40)}\t${ref}\n${tag.commit}\t${ref}^{}`
          : `${tag.commit}\t${ref}`;
      }
      if (args[0] === 'push') {
        tags.set(
          args[2].replace('refs/tags/', ''),
          options.pushed ?? { commit: sha, annotated: true },
        );
      }
      if (args[0] === 'describe') return 'v5.20';
      return '';
    }
    if (args[0] === 'api') {
      if (args.includes('--method')) return '## What changed\n* fix: example (#1)';
      const path = args.at(-1);
      if (path.includes('/statuses')) {
        return JSON.stringify(
          options.statuses ?? [{ state: 'success', creator: { login: 'vercel[bot]' } }],
        );
      }
      if (path.includes('/deployments')) {
        assert.match(path, new RegExp(`sha=${sha}&environment=Production`));
        return JSON.stringify(
          options.deployments ?? [{ id: 1, sha, creator: { login: 'vercel[bot]' } }],
        );
      }
      if (path.includes('/actions/')) {
        assert.match(path, new RegExp(`event=push&branch=main&head_sha=${sha}`));
        const ci = options.ci === undefined ? {} : options.ci;
        return JSON.stringify({
          workflow_runs: ci
            ? [
                {
                  head_sha: sha,
                  event: 'push',
                  head_branch: 'main',
                  status: 'completed',
                  conclusion: 'success',
                  ...ci,
                },
              ]
            : [],
        });
      }
      return JSON.stringify([releases]);
    }
    return '';
  };
  const writes = () =>
    calls.filter(
      ([tool, ...args]) =>
        (tool === 'git' && (args[0] === 'push' || args.includes('-a'))) ||
        (tool === 'gh' && args[0] === 'release'),
    );
  return { run, calls, writes };
}

const releaseCall = (latest = true) => [
  'gh',
  'release',
  'create',
  'v5.2.5',
  '--repo',
  'owner/repo',
  '--verify-tag',
  '--title',
  'PayeTax v5.2.5',
  '--notes',
  `Production verification: https://github.com/owner/repo/blob/${mainHead}/${evidence}\nSource commit: ${sha}`,
  '--generate-notes',
  '--notes-start-tag',
  'v5.20',
  `--latest=${latest}`,
];

test('dry run validates everything and writes nothing', () => {
  for (const publish of [false, 'false', undefined]) {
    const f = fixture();
    const message = release(event({ publish }), f.run);
    assert.match(message, /Dry run passed: v5\.2\.5 at a{40}/);
    assert.match(message, /Release notes preview:\n## What changed/);
    assert.ok(
      f.calls.some(
        (call) =>
          call.includes('repos/owner/repo/releases/generate-notes') &&
          call.includes(`target_commitish=${sha}`) &&
          call.includes('previous_tag_name=v5.20'),
      ),
    );
    assert.deepEqual(f.writes(), []);
  }
});

test('publishes an annotated tag at the verified SHA, then generated release notes', () => {
  const f = fixture();
  assert.match(release(event(), f.run), /Released v5\.2\.5/);
  const [tag, push, created] = f.writes();
  assert.deepEqual(tag.slice(5, 9), ['tag', '-a', 'v5.2.5', sha]);
  assert.deepEqual(push, ['git', 'push', 'origin', 'refs/tags/v5.2.5']);
  assert.deepEqual(created, releaseCall());
});

test('accepts a link to a PR in this repository as evidence', () => {
  const link = 'https://github.com/owner/repo/pull/161#issuecomment-1';
  const f = fixture();
  release(event({ evidence: link }), f.run);
  assert.match(f.writes().at(-1)[10], new RegExp(`^Production verification: ${link}\n`));
});

for (const [name, expected, inputs = {}, options] of [
  ['dispatched from a branch', /from main/, { ref: 'refs/heads/feature' }],
  ['short SHA', /full 40-character/, { sha: 'a'.repeat(7) }],
  ['uppercase SHA', /full 40-character/, { sha: 'A'.repeat(40) }],
  ['v-prefixed version', /stable MAJOR/, { version: 'v5.2.5' }],
  ['prerelease version', /stable MAJOR/, { version: '5.2.5-rc.1' }],
  ['legacy two-part version', /stable MAJOR/, { version: '5.20' }],
  ['version differs from package.json', /is 5.2.5, not 5.2.6/, { version: '5.2.6' }],
  [
    'package.json is not the input version',
    /is 5.2.4, not 5.2.5/,
    {},
    { versions: { [sha]: '5.2.4' } },
  ],
  [
    'SHA not on main first-parent history',
    /first-parent/,
    {},
    { history: `${mainHead}\n${older}` },
  ],
  ['evidence missing on main', /not committed on main/, { evidence: 'docs/reports/missing.md' }],
  ['evidence path traversal', /evidence must be/, { evidence: 'docs/reports/../../.env' }],
  [
    'evidence from another repository',
    /evidence must be/,
    { evidence: 'https://github.com/other/repo/pull/1' },
  ],
  ['evidence that is not a reference', /evidence must be/, { evidence: 'checked it, looks fine' }],
  ['no production deployment', /No successful Vercel/, {}, { deployments: [] }],
  [
    'deployment by another creator',
    /No successful Vercel/,
    {},
    { deployments: [{ id: 1, sha, creator: { login: 'someone' } }] },
  ],
  [
    'deployment for another SHA',
    /No successful Vercel/,
    {},
    { deployments: [{ id: 1, sha: older, creator: { login: 'vercel[bot]' } }] },
  ],
  [
    'failed deployment status',
    /No successful Vercel/,
    {},
    { statuses: [{ state: 'failure', creator: { login: 'vercel[bot]' } }] },
  ],
  [
    'status by another creator',
    /No successful Vercel/,
    {},
    { statuses: [{ state: 'success', creator: { login: 'someone' } }] },
  ],
  ['no CI run', /CI has not succeeded/, {}, { ci: null }],
  [
    'CI in progress',
    /CI has not succeeded/,
    {},
    { ci: { status: 'in_progress', conclusion: null } },
  ],
  ['CI failed', /CI has not succeeded/, {}, { ci: { conclusion: 'failure' } }],
  ['CI for another SHA', /CI has not succeeded/, {}, { ci: { head_sha: older } }],
  ['CI from a pull request', /CI has not succeeded/, {}, { ci: { event: 'pull_request' } }],
  [
    'tag at another commit',
    /already exists at b{40}/,
    {},
    { tags: { 'v5.2.5': { commit: older, annotated: true } } },
  ],
  [
    'lightweight tag at the SHA',
    /already exists as a lightweight tag at a{40}/,
    {},
    { tags: { 'v5.2.5': { commit: sha, annotated: false } } },
  ],
  [
    'draft release',
    /draft, prerelease or tagless/,
    {},
    {
      tags: { 'v5.2.5': { commit: sha, annotated: true } },
      releases: [{ tag_name: 'v5.2.5', draft: true }],
    },
  ],
  [
    'prerelease',
    /draft, prerelease or tagless/,
    {},
    {
      tags: { 'v5.2.5': { commit: sha, annotated: true } },
      releases: [{ tag_name: 'v5.2.5', prerelease: true }],
    },
  ],
  [
    'release without its tag',
    /draft, prerelease or tagless/,
    {},
    { releases: [{ tag_name: 'v5.2.5' }] },
  ],
  [
    'version published under another tag',
    /already published as v5.20/,
    { version: '5.2.0' },
    { versions: { [sha]: '5.2.0', 'refs/tags/v5.20': '5.2.0' }, releases: [{ tag_name: 'v5.20' }] },
  ],
  [
    'GitHub API error',
    /gh api failed/,
    {},
    { fail: (tool, args) => tool === 'gh' && args.at(-1).includes('/releases') },
  ],
]) {
  test(`fails before any write: ${name}`, () => {
    const { ref, ...rest } = inputs;
    const e = event(rest);
    if (ref) e.ref = ref;
    const f = fixture(options);
    assert.throws(() => release(e, f.run), expected);
    assert.deepEqual(f.writes(), []);
  });
}

test('a rejected tag push publishes no release', () => {
  const f = fixture({ fail: (tool, args) => tool === 'git' && args[0] === 'push' });
  assert.throws(() => release(event(), f.run), /push failed/);
  assert.equal(f.writes().filter((call) => call[0] === 'gh').length, 0);
});

test('a pushed tag that resolves elsewhere publishes no release', () => {
  const f = fixture({ pushed: { commit: older, annotated: true } });
  assert.throws(() => release(event(), f.run), /does not target/);
  assert.equal(f.writes().filter((call) => call[0] === 'gh').length, 0);
});

test('retry after release creation failed reuses the exact tag and creates only the release', () => {
  let failRelease = true;
  const f = fixture({
    fail: (tool, args) => tool === 'gh' && args[0] === 'release' && failRelease,
  });
  assert.throws(() => release(event(), f.run), /release failed/);
  failRelease = false;
  f.calls.length = 0;
  assert.match(release(event(), f.run), /Released v5\.2\.5/);
  assert.deepEqual(f.writes(), [releaseCall()]);
});

test('rerunning a completed release is a no-op', () => {
  const f = fixture({
    tags: { 'v5.2.5': { commit: sha, annotated: true } },
    releases: [{ tag_name: 'v5.2.5' }],
  });
  assert.match(release(event(), f.run), /Already released: v5\.2\.5/);
  assert.deepEqual(f.writes(), []);
});

test('an older version does not replace a newer release as Latest', () => {
  const f = fixture({
    releases: [{ tag_name: 'v5.10.0' }],
    versions: { 'refs/tags/v5.10.0': '5.10.0' },
  });
  release(event(), f.run);
  assert.deepEqual(f.writes().at(-1), releaseCall(false));
});
