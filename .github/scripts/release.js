const { execFileSync } = require('node:child_process');
const { readFileSync } = require('node:fs');

const stableVersion = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const vercel = 'vercel[bot]';
const command = (tool, args) => execFileSync(tool, args, { encoding: 'utf8' }).trim();
const newer = (a, b) => {
  const difference = a
    .split('.')
    .map((part, index) => Number(part) - Number(b.split('.')[index]))
    .find((part) => part !== 0);
  return difference > 0;
};

// Publishes one maintainer-approved release. Dry run unless `publish` is true.
function release(event, run = command) {
  const { inputs = {}, ref, repository } = event;
  const main = repository.default_branch;
  const repo = `repos/${repository.full_name}`;
  const api = (path) => JSON.parse(run('gh', ['api', path]));
  const sha = String(inputs.sha ?? '').trim();
  const version = String(inputs.version ?? '').trim();
  const evidence = String(inputs.evidence ?? '').trim();
  const publish = inputs.publish === true || inputs.publish === 'true';

  if (ref !== `refs/heads/${main}`) throw new Error(`Run the Release workflow from ${main}.`);
  if (!/^[a-f0-9]{40}$/.test(sha)) throw new Error('sha must be a full 40-character commit SHA.');
  if (!stableVersion.test(version)) {
    throw new Error('version must be a stable MAJOR.MINOR.PATCH value without a v prefix.');
  }

  run('git', ['fetch', 'origin', '--tags']);
  const history = run('git', ['rev-list', '--first-parent', `origin/${main}`]).split('\n');
  if (!history.includes(sha)) throw new Error(`${sha} is not on ${main}'s first-parent history.`);
  const versionAt = (commitish) =>
    JSON.parse(run('git', ['show', `${commitish}:package.json`])).version;
  const packageVersion = versionAt(sha);
  if (packageVersion !== version) {
    throw new Error(`package.json at ${sha} is ${packageVersion}, not ${version}.`);
  }
  const tag = `v${version}`;

  let evidenceLink;
  const evidenceUrl = `https://github.com/${repository.full_name}/`;
  if (/^docs\/reports\/[\w./-]+$/.test(evidence) && !evidence.includes('..')) {
    try {
      run('git', ['cat-file', '-e', `origin/${main}:${evidence}`]);
    } catch {
      throw new Error(`Evidence ${evidence} is not committed on ${main}.`);
    }
    evidenceLink = `${evidenceUrl}blob/${run('git', ['rev-parse', `origin/${main}`])}/${evidence}`;
  } else if (
    evidence.startsWith(evidenceUrl) &&
    /^(pull|issues)\/\d+(#[\w-]+)?$/.test(evidence.slice(evidenceUrl.length))
  ) {
    evidenceLink = evidence;
  } else {
    throw new Error('evidence must be a docs/reports/ path on main or a PR/issue link here.');
  }

  const deployed = api(`${repo}/deployments?sha=${sha}&environment=Production&per_page=100`).some(
    (deployment) =>
      deployment.sha === sha &&
      deployment.creator?.login === vercel &&
      api(`${repo}/deployments/${deployment.id}/statuses?per_page=100`).some(
        (status) => status.state === 'success' && status.creator?.login === vercel,
      ),
  );
  if (!deployed) throw new Error(`No successful Vercel Production deployment for ${sha}.`);

  const ci = api(
    `${repo}/actions/workflows/ci.yml/runs?event=push&branch=${main}&head_sha=${sha}&per_page=1`,
  ).workflow_runs[0];
  if (
    ci?.head_sha !== sha ||
    ci.event !== 'push' ||
    ci.head_branch !== main ||
    ci.status !== 'completed' ||
    ci.conclusion !== 'success'
  ) {
    throw new Error(`CI has not succeeded for the ${main} push of ${sha}.`);
  }

  // The remote is authoritative: a local or stale tag cannot satisfy these checks.
  const remoteTag = () => {
    const refs = new Map(
      run('git', ['ls-remote', '--tags', 'origin', `refs/tags/${tag}`, `refs/tags/${tag}^{}`])
        .split('\n')
        .filter(Boolean)
        .map((line) => line.split('\t').reverse()),
    );
    if (!refs.has(`refs/tags/${tag}`)) return null;
    const peeled = refs.get(`refs/tags/${tag}^{}`);
    return { annotated: Boolean(peeled), commit: peeled ?? refs.get(`refs/tags/${tag}`) };
  };
  const existingTag = remoteTag();
  if (existingTag && (!existingTag.annotated || existingTag.commit !== sha)) {
    const kind = existingTag.annotated ? '' : ' as a lightweight tag';
    throw new Error(`${tag} already exists${kind} at ${existingTag.commit}; review it manually.`);
  }

  const releases = JSON.parse(
    run('gh', ['api', '--paginate', '--slurp', `${repo}/releases?per_page=100`]),
  ).flat();
  const existing = releases.find((item) => item.tag_name === tag);
  if (existing) {
    if (existingTag && !existing.draft && !existing.prerelease) {
      return `Already released: ${tag} at ${sha}.`;
    }
    throw new Error(`${tag} has a draft, prerelease or tagless release; review it manually.`);
  }

  const published = releases
    .filter((item) => !(item.draft || item.prerelease))
    .map((item) => ({ tag: item.tag_name, version: versionAt(`refs/tags/${item.tag_name}`) }));
  const alias = published.find((item) => item.version === version);
  if (alias)
    throw new Error(`${version} is already published as ${alias.tag}; review it manually.`);
  const latest = !published.some((item) => newer(item.version, version));
  const previous = run('git', [
    'describe',
    '--tags',
    '--abbrev=0',
    '--match',
    'v[0-9]*',
    `${sha}^`,
  ]);
  const plan = `${tag} at ${sha}, notes since ${previous}, latest=${latest}`;
  if (!publish) {
    // Previews the generated notes without creating a tag or release.
    const preview = run('gh', [
      'api',
      '--method',
      'POST',
      `${repo}/releases/generate-notes`,
      '-f',
      `tag_name=${tag}`,
      '-f',
      `target_commitish=${sha}`,
      '-f',
      `previous_tag_name=${previous}`,
      '--jq',
      '.body',
    ]);
    return `Dry run passed: ${plan}. Nothing was published.\n\nRelease notes preview:\n${preview}`;
  }

  if (!existingTag) {
    run('git', [
      '-c',
      'user.name=github-actions[bot]',
      '-c',
      'user.email=41898282+github-actions[bot]@users.noreply.github.com',
      'tag',
      '-a',
      tag,
      sha,
      '-m',
      `PayeTax ${tag}\n\nProduction verification: ${evidenceLink}`,
    ]);
    // A non-forced, single-ref push fails if someone publishes a conflicting tag.
    run('git', ['push', 'origin', `refs/tags/${tag}`]);
    const pushed = remoteTag();
    if (!pushed?.annotated || pushed.commit !== sha) {
      throw new Error(`${tag} does not target ${sha} after push; review it manually.`);
    }
  }
  run('gh', [
    'release',
    'create',
    tag,
    '--repo',
    repository.full_name,
    '--verify-tag',
    '--title',
    `PayeTax ${tag}`,
    '--notes',
    `Production verification: ${evidenceLink}\nSource commit: ${sha}`,
    '--generate-notes',
    '--notes-start-tag',
    previous,
    `--latest=${latest}`,
  ]);
  return `Released ${plan}.`;
}

module.exports = { release };

if (require.main === module) {
  try {
    const message = release(JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')));
    process.stdout.write(`${message}\n`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
