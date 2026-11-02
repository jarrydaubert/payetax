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

// Both completion events must resolve the same deployed commit, never the moving HEAD.
function candidate(event, eventName, run = command) {
  const { inputs = {}, repository } = event;
  const main = repository.default_branch;
  let sha;
  if (eventName === 'deployment_status') {
    const { deployment, deployment_status: status } = event;
    if (
      deployment?.environment !== 'Production' ||
      deployment.creator?.login !== vercel ||
      status?.state !== 'success' ||
      status.creator?.login !== vercel
    )
      return null;
    sha = deployment.sha;
  } else if (eventName === 'workflow_run') {
    const ci = event.workflow_run;
    if (
      ci?.name !== 'CI' ||
      ci.path !== '.github/workflows/ci.yml' ||
      ci.event !== 'push' ||
      ci.head_branch !== main ||
      ci.repository?.full_name !== repository.full_name ||
      ci.status !== 'completed' ||
      ci.conclusion !== 'success'
    )
      return null;
    sha = ci.head_sha;
  } else if (eventName === 'workflow_dispatch') {
    if (event.ref !== `refs/heads/${main}`) {
      throw new Error(`Run the Release workflow from ${main}.`);
    }
    sha = String(inputs.sha ?? '').trim();
  } else {
    return null;
  }

  run('git', ['fetch', 'origin', main, '--tags']);
  if (!sha && eventName === 'workflow_dispatch') {
    sha = run('git', ['rev-parse', `origin/${main}`]);
  }
  if (!/^[a-f0-9]{40}$/.test(sha)) throw new Error('sha must be a full 40-character commit SHA.');
  const history = run('git', ['rev-list', '--first-parent', `origin/${main}`]).split('\n');
  if (!history.includes(sha)) throw new Error(`${sha} is not on ${main}'s first-parent history.`);
  const version = JSON.parse(run('git', ['show', `${sha}:package.json`])).version;
  if (!stableVersion.test(version)) {
    throw new Error('version must be a stable MAJOR.MINOR.PATCH value without a v prefix.');
  }
  return { sha, version, history };
}

function release(event, run = command, eventName = process.env.GITHUB_EVENT_NAME) {
  const selected = candidate(event, eventName, run);
  if (!selected) return 'Skipped: not a successful Production deployment or main CI completion.';
  const { sha, version, history } = selected;
  const { repository, inputs = {} } = event;
  const main = repository.default_branch;
  const repo = `repos/${repository.full_name}`;
  const api = (path) => JSON.parse(run('gh', ['api', path]));
  const pages = (path) => JSON.parse(run('gh', ['api', '--paginate', '--slurp', path])).flat();
  const publish =
    eventName !== 'workflow_dispatch' || inputs.dry_run === false || inputs.dry_run === 'false';
  const versionAt = (commitish) =>
    JSON.parse(run('git', ['show', `${commitish}:package.json`])).version;
  const tag = `v${version}`;

  const deployed = pages(`${repo}/deployments?sha=${sha}&environment=Production&per_page=100`).find(
    (deployment) =>
      deployment.sha === sha &&
      deployment.environment === 'Production' &&
      deployment.creator?.login === vercel &&
      (eventName !== 'deployment_status' || deployment.id === event.deployment.id) &&
      // Statuses are newest first. An old success must not mask a later failure.
      ((status) => status?.state === 'success' && status.creator?.login === vercel)(
        api(`${repo}/deployments/${deployment.id}/statuses?per_page=1`)[0],
      ),
  );
  if (!deployed) return `Waiting: no successful Vercel Production deployment for ${sha}.`;

  const ci = api(
    `${repo}/actions/workflows/ci.yml/runs?event=push&branch=${main}&head_sha=${sha}&per_page=1`,
  ).workflow_runs[0];
  if (
    ci?.head_sha !== sha ||
    ci.name !== 'CI' ||
    ci.path !== '.github/workflows/ci.yml' ||
    ci.event !== 'push' ||
    ci.head_branch !== main ||
    ci.status !== 'completed' ||
    ci.conclusion !== 'success'
  ) {
    return `Waiting: CI has not succeeded for the ${main} push of ${sha}.`;
  }
  const evidenceLink = `https://github.com/${repository.full_name}/deployments/${deployed.id}`;
  const ciLink = `https://github.com/${repository.full_name}/actions/runs/${ci.id}`;

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
  const releases = pages(`${repo}/releases?per_page=100`);
  const existing = releases.find((item) => item.tag_name === tag);
  // Docs/CI-only deployments may retain a version released at an earlier main commit.
  // Require the entire first-parent interval to retain that version before skipping it.
  const sameVersionDeployment =
    existingTag?.annotated &&
    existing &&
    !existing.draft &&
    !existing.prerelease &&
    history.indexOf(existingTag.commit) >= history.indexOf(sha) &&
    history
      .slice(history.indexOf(sha), history.indexOf(existingTag.commit) + 1)
      .every((commit) => versionAt(commit) === version);
  if (sameVersionDeployment) return `Already released: ${tag} at ${existingTag.commit}.`;
  if (existingTag && (!existingTag.annotated || existingTag.commit !== sha)) {
    const kind = existingTag.annotated ? '' : ' as a lightweight tag';
    throw new Error(`${tag} already exists${kind} at ${existingTag.commit}; review it manually.`);
  }

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
      `PayeTax ${tag}\n\nProduction deployment: ${evidenceLink}\nCI: ${ciLink}`,
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
    `Production deployment: ${evidenceLink}\nCI: ${ciLink}\nSource commit: ${sha}\n\nBrowser/PWA verification is a separate manual follow-up.`,
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
    const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
    const message = release(event);
    process.stdout.write(`${message}\n`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
