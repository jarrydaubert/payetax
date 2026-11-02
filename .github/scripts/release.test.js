const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const { runInNewContext } = require('node:vm');
const { release } = require('./release.js');

const sha = 'a'.repeat(40);
const older = 'b'.repeat(40);
const mainHead = 'c'.repeat(40);
const repository = { full_name: 'owner/repo', default_branch: 'main' };
const deployment = (overrides = {}) => ({
  id: 1,
  sha,
  environment: 'Production',
  production_environment: false,
  creator: { login: 'vercel[bot]' },
  ...overrides,
});
const status = (overrides = {}) => ({
  state: 'success',
  creator: { login: 'vercel[bot]' },
  ...overrides,
});
const ci = (overrides = {}) => ({
  id: 2,
  name: 'CI',
  path: '.github/workflows/ci.yml',
  repository,
  head_sha: sha,
  event: 'push',
  head_branch: 'main',
  status: 'completed',
  conclusion: 'success',
  ...overrides,
});
const event = (overrides = {}) => ({
  repository,
  deployment: deployment(),
  deployment_status: status(),
  workflow_run: ci(),
  ref: 'refs/heads/main',
  ...overrides,
});
const publish = (e, f, name = 'deployment_status') => release(e, f.run, name);

function fixture(options = {}) {
  const calls = [];
  const tags = new Map(Object.entries(options.tags ?? {}));
  const releases = [...(options.releases ?? [])];
  let taggedSha;
  const run = (tool, args) => {
    calls.push([tool, ...args]);
    if (options.fail?.(tool, args)) throw new Error(`${tool} ${args[0]} failed`);
    if (tool === 'git') {
      if (args[0] === 'rev-list') return options.history ?? `${mainHead}\n${sha}\n${older}`;
      if (args[0] === 'rev-parse') return mainHead;
      if (args[0] === 'show') {
        const ref = args[1].split(':')[0];
        return JSON.stringify({ version: options.versions?.[ref] ?? '5.2.5' });
      }
      if (args.includes('-a')) taggedSha = args[args.indexOf('-a') + 2];
      if (args[0] === 'ls-remote') {
        const tag = tags.get(args[3].replace('refs/tags/', ''));
        if (!tag) return '';
        const ref = args[3];
        return tag.annotated
          ? `${'d'.repeat(40)}\t${ref}\n${tag.commit}\t${ref}^{}`
          : `${tag.commit}\t${ref}`;
      }
      if (args[0] === 'push') {
        const name = args[2].replace('refs/tags/', '');
        if (tags.has(name)) throw new Error('tag already exists');
        tags.set(name, options.pushed ?? { commit: taggedSha, annotated: true });
      }
      if (args[0] === 'describe') return 'v5.20';
      return '';
    }
    if (args[0] === 'api') {
      if (args.includes('--method')) return '## What changed\n* fix: example (#1)';
      const path = args.at(-1);
      if (path.includes('/statuses')) {
        assert.match(path, /per_page=1$/);
        return JSON.stringify(options.statuses ?? [status()]);
      }
      if (path.includes('/deployments')) {
        const queriedSha = path.match(/sha=([^&]+)/)[1];
        assert.match(path, /environment=Production&per_page=100$/);
        assert.ok(args.includes('--paginate'));
        return JSON.stringify(
          options.deploymentPages ?? [options.deployments ?? [deployment({ sha: queriedSha })]],
        );
      }
      if (path.includes('/actions/')) {
        const queriedSha = path.match(/head_sha=([^&]+)/)[1];
        assert.match(path, /ci.yml\/runs\?event=push&branch=main&head_sha=/);
        return JSON.stringify({
          workflow_runs: options.ci === null ? [] : [ci({ head_sha: queriedSha, ...options.ci })],
        });
      }
      assert.ok(args.includes('--paginate'));
      return JSON.stringify([releases]);
    }
    if (args[0] === 'release') releases.push({ tag_name: args[2] });
    return '';
  };
  const writes = () =>
    calls.filter(
      ([tool, ...args]) =>
        (tool === 'git' && (args[0] === 'push' || args.includes('-a'))) ||
        (tool === 'gh' && args[0] === 'release'),
    );
  return { run, calls, writes, options };
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
  `Production deployment: https://github.com/owner/repo/deployments/1\nCI: https://github.com/owner/repo/actions/runs/2\nSource commit: ${sha}\n\nBrowser/PWA verification is a separate manual follow-up.`,
  '--generate-notes',
  '--notes-start-tag',
  'v5.20',
  `--latest=${latest}`,
];

for (const name of ['deployment_status', 'workflow_run']) {
  test(`${name} automatically publishes exact deployed SHA with annotated tag and generated notes`, () => {
    const f = fixture();
    assert.match(publish(event(), f, name), /Released v5\.2\.5/);
    const [tag, push, created] = f.writes();
    assert.deepEqual(tag.slice(5, 9), ['tag', '-a', 'v5.2.5', sha]);
    assert.deepEqual(push, ['git', 'push', 'origin', 'refs/tags/v5.2.5']);
    assert.deepEqual(created, releaseCall());
    assert.ok(!f.calls.some((call) => call.includes(`${mainHead}:package.json`)));
  });
}

test('deployment before CI waits; successful CI completion publishes exactly once', () => {
  const f = fixture({ ci: { status: 'in_progress', conclusion: null } });
  assert.match(publish(event(), f), /Waiting: CI/);
  assert.deepEqual(f.writes(), []);
  f.options.ci = {};
  assert.match(publish(event(), f, 'workflow_run'), /Released/);
  assert.match(publish(event(), f), /Already released/);
  assert.equal(f.writes().length, 3);
});

test('CI before deployment waits; deployment completion publishes exactly once', () => {
  const f = fixture({ deployments: [] });
  assert.match(publish(event(), f, 'workflow_run'), /Waiting: no successful/);
  assert.deepEqual(f.writes(), []);
  f.options.deployments = [deployment()];
  assert.match(publish(event(), f), /Released/);
  assert.match(publish(event(), f, 'workflow_run'), /Already released/);
  assert.equal(f.writes().length, 3);
});

test('failed CI cannot publish; its successful retry can release the deployed SHA', () => {
  const f = fixture({ ci: { conclusion: 'failure' } });
  assert.match(publish(event(), f), /Waiting: CI/);
  assert.match(
    publish(event({ workflow_run: ci({ conclusion: 'failure' }) }), f, 'workflow_run'),
    /Skipped/,
  );
  assert.deepEqual(f.writes(), []);
  f.options.ci = {};
  assert.match(publish(event(), f, 'workflow_run'), /Released/);
  assert.equal(f.writes().length, 3);
});

test('CI success cannot publish a failed deployment; successful redeployment can release', () => {
  const f = fixture({ statuses: [status({ state: 'failure' })] });
  assert.match(publish(event(), f, 'workflow_run'), /Waiting: no successful/);
  assert.match(publish(event({ deployment_status: status({ state: 'failure' }) }), f), /Skipped/);
  assert.deepEqual(f.writes(), []);
  f.options.statuses = [status()];
  assert.match(publish(event(), f), /Released/);
  assert.equal(f.writes().length, 3);
});

test('recovery defaults to a dry run and derives version and evidence', () => {
  for (const dry_run of [true, 'true', undefined]) {
    const f = fixture();
    const message = publish(event({ inputs: { sha, dry_run } }), f, 'workflow_dispatch');
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

test('manual recovery can publish without entering a SHA, version or evidence', () => {
  for (const dry_run of [false, 'false']) {
    const f = fixture();
    assert.match(publish(event({ inputs: { dry_run } }), f, 'workflow_dispatch'), /Released/);
    assert.equal(f.writes()[0][8], mainHead);
  }
});

for (const [name, e, eventName] of [
  ['preview', event({ deployment: deployment({ environment: 'Preview' }) }), 'deployment_status'],
  [
    'failed deployment',
    event({ deployment_status: status({ state: 'failure' }) }),
    'deployment_status',
  ],
  [
    'pending deployment',
    event({ deployment_status: status({ state: 'pending' }) }),
    'deployment_status',
  ],
  [
    'other deployment creator',
    event({ deployment: deployment({ creator: { login: 'someone' } }) }),
    'deployment_status',
  ],
  [
    'other status creator',
    event({ deployment_status: status({ creator: { login: 'someone' } }) }),
    'deployment_status',
  ],
  ['failed CI', event({ workflow_run: ci({ conclusion: 'failure' }) }), 'workflow_run'],
  ['incomplete CI', event({ workflow_run: ci({ status: 'in_progress' }) }), 'workflow_run'],
  ['PR CI', event({ workflow_run: ci({ event: 'pull_request' }) }), 'workflow_run'],
  ['branch CI', event({ workflow_run: ci({ head_branch: 'feature' }) }), 'workflow_run'],
  ['other workflow', event({ workflow_run: ci({ name: 'CodeQL' }) }), 'workflow_run'],
  [
    'other CI file',
    event({ workflow_run: ci({ path: '.github/workflows/other.yml' }) }),
    'workflow_run',
  ],
  [
    'fork CI',
    event({ workflow_run: ci({ repository: { full_name: 'fork/repo' } }) }),
    'workflow_run',
  ],
  ['pull request trigger', event(), 'pull_request'],
]) {
  test(`ignores ${name} before running commands`, () => {
    const f = fixture();
    assert.match(publish(e, f, eventName), /Skipped/);
    assert.deepEqual(f.calls, []);
  });
}

for (const [name, options] of [
  ['no deployment', { deployments: [] }],
  ['wrong environment', { deployments: [deployment({ environment: 'Preview' })] }],
  ['wrong creator', { deployments: [deployment({ creator: { login: 'someone' } })] }],
  ['wrong SHA', { deployments: [deployment({ sha: older })] }],
  ['different deployment id', { deployments: [deployment({ id: 3 })] }],
  ['failed status', { statuses: [status({ state: 'failure' })] }],
  ['old success followed by failure', { statuses: [status({ state: 'failure' }), status()] }],
  ['missing status', { statuses: [] }],
  ['untrusted status', { statuses: [status({ creator: { login: 'someone' } })] }],
  ['no CI', { ci: null }],
  ['pending CI', { ci: { status: 'in_progress', conclusion: null } }],
  ['failed CI', { ci: { conclusion: 'failure' } }],
  ['wrong CI SHA', { ci: { head_sha: older } }],
  ['PR CI', { ci: { event: 'pull_request' } }],
  ['wrong branch CI', { ci: { head_branch: 'feature' } }],
  ['wrong workflow name', { ci: { name: 'Other' } }],
  ['wrong workflow file', { ci: { path: 'other.yml' } }],
]) {
  test(`waits without writes: ${name}`, () => {
    const f = fixture(options);
    assert.match(publish(event(), f), /Waiting:/);
    assert.deepEqual(f.writes(), []);
  });
}

for (const [name, expected, options, e = event(), eventName = 'deployment_status'] of [
  [
    'manual recovery from a branch',
    /from main/,
    {},
    event({ ref: 'refs/heads/feature' }),
    'workflow_dispatch',
  ],
  ['short SHA', /full 40-character/, {}, event({ deployment: deployment({ sha: 'aaaaaaa' }) })],
  [
    'uppercase SHA',
    /full 40-character/,
    {},
    event({ deployment: deployment({ sha: 'A'.repeat(40) }) }),
  ],
  ['v-prefixed version', /stable MAJOR/, { versions: { [sha]: 'v5.2.5' } }],
  ['prerelease version', /stable MAJOR/, { versions: { [sha]: '5.2.5-rc.1' } }],
  ['legacy version', /stable MAJOR/, { versions: { [sha]: '5.20' } }],
  ['non-main first parent SHA', /first-parent/, { history: `${mainHead}\n${older}` }],
  [
    'wrong tag commit',
    /already exists at b{40}/,
    {
      tags: { 'v5.2.5': { commit: older, annotated: true } },
    },
  ],
  ['lightweight tag', /lightweight tag/, { tags: { 'v5.2.5': { commit: sha, annotated: false } } }],
  [
    'draft release',
    /draft, prerelease or tagless/,
    {
      tags: { 'v5.2.5': { commit: sha, annotated: true } },
      releases: [{ tag_name: 'v5.2.5', draft: true }],
    },
  ],
  [
    'prerelease',
    /draft, prerelease or tagless/,
    {
      tags: { 'v5.2.5': { commit: sha, annotated: true } },
      releases: [{ tag_name: 'v5.2.5', prerelease: true }],
    },
  ],
  ['tagless release', /draft, prerelease or tagless/, { releases: [{ tag_name: 'v5.2.5' }] }],
  [
    'version alias',
    /already published as v5.20/,
    {
      versions: { [sha]: '5.2.0', 'refs/tags/v5.20': '5.2.0' },
      releases: [{ tag_name: 'v5.20' }],
    },
  ],
  [
    'version reused after a version change',
    /already exists at b{40}/,
    {
      tags: { 'v5.2.5': { commit: older, annotated: true } },
      releases: [{ tag_name: 'v5.2.5' }],
      history: `${mainHead}\n${sha}\n${'e'.repeat(40)}\n${older}`,
      versions: { ['e'.repeat(40)]: '5.2.6' },
    },
  ],
  [
    'tag is ahead of deployed commit',
    /already exists at c{40}/,
    {
      tags: { 'v5.2.5': { commit: mainHead, annotated: true } },
      releases: [{ tag_name: 'v5.2.5' }],
    },
  ],
  [
    'tag is off main',
    /already exists at e{40}/,
    {
      tags: { 'v5.2.5': { commit: 'e'.repeat(40), annotated: true } },
      releases: [{ tag_name: 'v5.2.5' }],
    },
  ],
]) {
  test(`fails before any write: ${name}`, () => {
    const f = fixture(options);
    assert.throws(() => publish(e, f, eventName), expected);
    assert.deepEqual(f.writes(), []);
  });
}

for (const path of ['/deployments?', '/statuses?', '/actions/', '/releases?']) {
  test(`API error fails closed: ${path}`, () => {
    const f = fixture({ fail: (tool, args) => tool === 'gh' && args.at(-1).includes(path) });
    assert.throws(() => publish(event(), f), /gh api failed/);
    assert.deepEqual(f.writes(), []);
  });
}

test('deployment lookup follows all pages', () => {
  const f = fixture({ deploymentPages: [[], [deployment()]] });
  assert.match(publish(event(), f), /Released/);
});

test('a rejected tag push publishes no release', () => {
  const f = fixture({ fail: (tool, args) => tool === 'git' && args[0] === 'push' });
  assert.throws(() => publish(event(), f), /push failed/);
  assert.equal(f.writes().filter((call) => call[0] === 'gh').length, 0);
});

test('a pushed tag that resolves elsewhere publishes no release', () => {
  const f = fixture({ pushed: { commit: older, annotated: true } });
  assert.throws(() => publish(event(), f), /does not target/);
  assert.equal(f.writes().filter((call) => call[0] === 'gh').length, 0);
});

test('retry after release creation failed reuses the exact annotated tag', () => {
  let failRelease = true;
  const f = fixture({
    fail: (tool, args) => tool === 'gh' && args[0] === 'release' && failRelease,
  });
  assert.throws(() => publish(event(), f), /release failed/);
  failRelease = false;
  f.calls.length = 0;
  assert.match(publish(event(), f), /Released v5\.2\.5/);
  assert.deepEqual(f.writes(), [releaseCall()]);
});

test('repeated deployment and CI events for a completed release are no-ops', () => {
  const f = fixture();
  publish(event(), f);
  f.calls.length = 0;
  for (const name of ['deployment_status', 'workflow_run', 'deployment_status']) {
    assert.match(publish(event(), f, name), /Already released/);
  }
  assert.deepEqual(f.writes(), []);
});

test('documentation-only deployment of an already released version is a no-op', () => {
  const f = fixture({
    tags: { 'v5.2.5': { commit: older, annotated: true } },
    releases: [{ tag_name: 'v5.2.5' }],
  });
  assert.match(publish(event(), f), /Already released: v5.2.5 at b{40}/);
  assert.deepEqual(f.writes(), []);
});

test('an older version does not replace a newer release as Latest', () => {
  const f = fixture({
    releases: [{ tag_name: 'v5.10.0' }],
    versions: { 'refs/tags/v5.10.0': '5.10.0' },
  });
  publish(event(), f);
  assert.deepEqual(f.writes().at(-1), releaseCall(false));
});

test('workflow subscribes to both completions, queues publications, and checks out trusted main', () => {
  const workflow = readFileSync(`${__dirname}/../workflows/release.yml`, 'utf8');
  assert.match(workflow, /\n {2}deployment_status:/);
  assert.match(
    workflow,
    /workflow_run:\n {4}workflows: \[CI\]\n {4}branches: \[main\]\n {4}types: \[completed\]/,
  );
  assert.match(workflow, /group: release\n {6}cancel-in-progress: false\n[^\n]*\n {6}queue: max/);
  assert.match(workflow, /ref: main\n {10}fetch-depth: 0/);
  assert.match(workflow, /needs: test/);
  assert.doesNotMatch(workflow, /\n {6}(version|evidence|publish):/);
});

test('actual workflow job condition accepts completions and recovery, excluding PRs and failed/preview work', () => {
  const workflow = readFileSync(`${__dirname}/../workflows/release.yml`, 'utf8');
  const condition = workflow.match(/ {4}if: >-\n([\s\S]*?)\n {4}needs:/)[1].trim();
  for (const [name, e, expected] of [
    ['deployment_status', event(), true],
    ['workflow_run', event(), true],
    ['workflow_dispatch', event(), true],
    ['pull_request', event(), false],
    ['deployment_status', event({ deployment: deployment({ environment: 'Preview' }) }), false],
    ['deployment_status', event({ deployment_status: status({ state: 'failure' }) }), false],
    [
      'deployment_status',
      event({ deployment: deployment({ creator: { login: 'someone' } }) }),
      false,
    ],
    [
      'deployment_status',
      event({ deployment_status: status({ creator: { login: 'someone' } }) }),
      false,
    ],
    ['workflow_run', event({ workflow_run: ci({ conclusion: 'failure' }) }), false],
    ['workflow_run', event({ workflow_run: ci({ event: 'pull_request' }) }), false],
    ['workflow_run', event({ workflow_run: ci({ head_branch: 'feature' }) }), false],
  ]) {
    assert.equal(runInNewContext(condition, { github: { event_name: name, event: e } }), expected);
  }
});
