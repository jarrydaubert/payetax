#!/usr/bin/env bun

import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildGitLabDeployRecoveryPayload,
  parseGitLabDeployRecoveryState,
  resolveGitLabRecoverySha,
} from '../src/lib/gitlabDeployRecovery';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

type Command =
  | 'help'
  | 'project'
  | 'mr-status'
  | 'pipeline-latest'
  | 'release-latest'
  | 'deploy-status'
  | 'deploy-reconcile'
  | 'status';

type GitLabProject = {
  id: number | string;
  path_with_namespace?: string;
  web_url?: string;
  visibility?: string;
  default_branch?: string;
};

type MergeRequest = {
  iid: number;
  title?: string;
  state?: string;
  draft?: boolean;
  source_branch?: string;
  target_branch?: string;
  web_url?: string;
  updated_at?: string;
};

type Pipeline = {
  id: number;
  status?: string;
  ref?: string;
  source?: string;
  web_url?: string;
  sha?: string;
  updated_at?: string;
};

type Commit = {
  id: string;
  short_id?: string;
  title?: string;
  status?: string | null;
  last_pipeline?: Pipeline | null;
};

type CommitStatus = {
  id: number;
  status?: string;
  name?: string;
  target_url?: string;
  created_at?: string;
};

type Release = {
  tag_name?: string;
  name?: string;
  released_at?: string;
  upcoming_release?: boolean;
  _links?: {
    self?: string;
  };
};

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function run(command: string, args: string[]): string {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (result.status !== 0) {
    const errorOutput = (result.stderr || result.stdout || '').trim();
    fail(errorOutput || `${command} ${args.join(' ')} failed`);
  }

  return result.stdout.trim();
}

function tryRun(command: string, args: string[]): string | null {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (result.status !== 0) {
    return null;
  }

  return result.stdout.trim();
}

function currentBranch(): string {
  return run('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
}

function currentSha(): string {
  return run('git', ['rev-parse', 'HEAD']);
}

function upstreamSha(): string | null {
  return tryRun('git', ['rev-parse', '--verify', '@{u}']);
}

function defaultGitLabSha(): string {
  return resolveGitLabRecoverySha({
    currentSha: currentSha(),
    upstreamSha: upstreamSha(),
  });
}

function projectRef(): string {
  const configured = process.env.GITLAB_PROJECT_ID?.trim();
  if (!configured) {
    return ':fullpath';
  }

  return encodeURIComponent(configured);
}

function apiGet<T>(endpoint: string): T {
  const result = run('glab', ['api', endpoint, '--output', 'json']);
  return JSON.parse(result) as T;
}

function apiPost<T>(endpoint: string, data: URLSearchParams): T {
  const separator = endpoint.includes('?') ? '&' : '?';
  const result = run('glab', [
    'api',
    `${endpoint}${separator}${data.toString()}`,
    '--method',
    'POST',
    '--output',
    'json',
  ]);
  return JSON.parse(result) as T;
}

function formatDate(value?: string): string {
  if (!value) return 'unknown';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function printProject(project: GitLabProject): void {
  console.log(`Project: ${project.path_with_namespace ?? 'unknown'}`);
  console.log(`Visibility: ${project.visibility ?? 'unknown'}`);
  console.log(`Default branch: ${project.default_branch ?? 'unknown'}`);
  console.log(`Web: ${project.web_url ?? 'unknown'}`);
}

function printMr(mr: MergeRequest | null, branch: string): void {
  if (!mr) {
    console.log(`MR (${branch}): none open`);
    return;
  }

  const draft = mr.draft ? 'draft' : 'ready';
  console.log(
    `MR (${branch}): !${mr.iid} [${mr.state ?? 'unknown'} | ${draft}] ${mr.title ?? 'Untitled'}`,
  );
  console.log(`MR target: ${mr.source_branch ?? branch} -> ${mr.target_branch ?? 'unknown'}`);
  console.log(`MR updated: ${formatDate(mr.updated_at)}`);
  console.log(`MR web: ${mr.web_url ?? 'unknown'}`);
}

function printPipeline(pipeline: Pipeline | null, ref: string): void {
  if (!pipeline) {
    console.log(`Pipeline (${ref}): none found`);
    return;
  }

  const sha = pipeline.sha ? pipeline.sha.slice(0, 8) : 'unknown';
  console.log(
    `Pipeline (${ref}): #${pipeline.id} [${pipeline.status ?? 'unknown'} | ${pipeline.source ?? 'unknown'}] ${sha}`,
  );
  console.log(`Pipeline updated: ${formatDate(pipeline.updated_at)}`);
  console.log(`Pipeline web: ${pipeline.web_url ?? 'unknown'}`);
}

function printRelease(release: Release | null): void {
  if (!release) {
    console.log('Latest release: none found');
    return;
  }

  const label =
    release.name && release.name !== release.tag_name
      ? `${release.name} (${release.tag_name})`
      : (release.tag_name ?? release.name ?? 'unknown');
  const releaseKind = release.upcoming_release ? 'upcoming' : 'published';
  console.log(`Latest release: ${label} [${releaseKind}]`);
  console.log(`Release date: ${formatDate(release.released_at)}`);
  console.log(`Release web: ${release._links?.self ?? 'unknown'}`);
}

function printCommitStatusSummary(commit: Commit, statuses: CommitStatus[]): void {
  console.log(`Commit: ${commit.short_id ?? commit.id.slice(0, 8)} ${commit.title ?? ''}`.trim());
  console.log(`Commit status: ${commit.status ?? 'none'}`);
  printPipeline(commit.last_pipeline ?? null, commit.short_id ?? commit.id.slice(0, 8));

  if (statuses.length === 0) {
    console.log('External statuses: none');
    return;
  }

  console.log('External statuses:');
  for (const status of statuses) {
    console.log(
      `  - ${status.name ?? 'unnamed'} [${status.status ?? 'unknown'}] ${formatDate(status.created_at)}`,
    );
    if (status.target_url) {
      console.log(`    ${status.target_url}`);
    }
  }
}

function printHelp(): void {
  console.log('Usage: bun scripts/gitlab.ts <command> [args]');
  console.log('');
  console.log('Commands:');
  console.log('  project          Show current GitLab project metadata');
  console.log('  mr-status        Show the open MR for the current branch');
  console.log(
    '  pipeline-latest  Show the latest pipeline for the current branch or a provided ref',
  );
  console.log(
    '  deploy-status    Show GitLab commit status + latest pipeline for the pushed branch SHA (or a provided SHA)',
  );
  console.log(
    '  deploy-reconcile Post a manual Vercel recovery status: <success|failed> <target-url> [sha] [ref]',
  );
  console.log('  release-latest   Show the latest project release');
  console.log('  status           Show project, branch MR, latest pipeline, and latest release');
}

function getProject(): GitLabProject {
  return apiGet<GitLabProject>(`projects/${projectRef()}`);
}

function getMrForBranch(branch: string): MergeRequest | null {
  const query = new URLSearchParams({
    state: 'opened',
    source_branch: branch,
    per_page: '1',
    order_by: 'updated_at',
    sort: 'desc',
  });

  const mrs = apiGet<MergeRequest[]>(`projects/${projectRef()}/merge_requests?${query.toString()}`);
  return mrs[0] ?? null;
}

function getLatestPipeline(ref: string): Pipeline | null {
  const query = new URLSearchParams({
    ref,
    per_page: '1',
    order_by: 'updated_at',
    sort: 'desc',
  });

  const pipelines = apiGet<Pipeline[]>(`projects/${projectRef()}/pipelines?${query.toString()}`);
  return pipelines[0] ?? null;
}

function getLatestRelease(): Release | null {
  const query = new URLSearchParams({
    per_page: '1',
    order_by: 'released_at',
    sort: 'desc',
  });

  const releases = apiGet<Release[]>(`projects/${projectRef()}/releases?${query.toString()}`);
  return releases[0] ?? null;
}

function getCommit(sha: string): Commit {
  return apiGet<Commit>(`projects/${projectRef()}/repository/commits/${encodeURIComponent(sha)}`);
}

function getCommitStatuses(sha: string): CommitStatus[] {
  return apiGet<CommitStatus[]>(
    `projects/${projectRef()}/repository/commits/${encodeURIComponent(sha)}/statuses`,
  );
}

function reconcileDeployStatus({
  sha,
  ref,
  stateArg,
  targetUrl,
}: {
  sha: string;
  ref?: string;
  stateArg: string | undefined;
  targetUrl: string | undefined;
}): void {
  const state = parseGitLabDeployRecoveryState(stateArg);

  if (!targetUrl) {
    fail('deploy-reconcile requires a target URL.');
  }

  const payload = buildGitLabDeployRecoveryPayload({
    state,
    targetUrl,
    ref,
  });

  const status = apiPost<CommitStatus>(
    `projects/${projectRef()}/statuses/${encodeURIComponent(sha)}`,
    payload,
  );

  console.log(
    `Posted ${status.name ?? 'external'} status [${status.status ?? state}] for ${sha.slice(0, 8)}`,
  );
  if (status.target_url) {
    console.log(`Target: ${status.target_url}`);
  }
}

function main(): void {
  const args = process.argv.slice(2);
  const command = (args[0] as Command | undefined) ?? 'status';
  const branch = currentBranch();
  const ref = args[1] ?? branch;

  switch (command) {
    case 'help':
      printHelp();
      return;
    case 'project':
      printProject(getProject());
      return;
    case 'mr-status':
      printMr(getMrForBranch(branch), branch);
      return;
    case 'pipeline-latest':
      printPipeline(getLatestPipeline(ref), ref);
      return;
    case 'deploy-status': {
      const sha = args[1] ?? defaultGitLabSha();
      printCommitStatusSummary(getCommit(sha), getCommitStatuses(sha));
      return;
    }
    case 'deploy-reconcile': {
      const stateArg = args[1];
      const targetUrl = args[2];
      const sha = args[3] ?? defaultGitLabSha();
      const statusRef = args[4] ?? branch;
      reconcileDeployStatus({ sha, ref: statusRef, stateArg, targetUrl });
      return;
    }
    case 'release-latest':
      printRelease(getLatestRelease());
      return;
    case 'status': {
      const project = getProject();
      console.log('GitLab status');
      console.log(`Current branch: ${branch}`);
      printProject(project);
      console.log('');
      printMr(getMrForBranch(branch), branch);
      console.log('');
      printPipeline(getLatestPipeline(branch), branch);
      console.log('');
      printRelease(getLatestRelease());
      return;
    }
    default:
      fail(`Unknown command: ${command}`);
  }
}

main();
