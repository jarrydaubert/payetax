#!/usr/bin/env bun

import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const LOG_DIR = join(ROOT, 'docs', 'evidence');
const LOG_FILE = join(LOG_DIR, 'gitlab-policy-drift.md');

const API_BASE = (process.env.GITLAB_API_BASE ?? 'https://gitlab.com/api/v4').replace(/\/$/, '');
const PROJECT_ID = process.env.GITLAB_PROJECT_ID ?? '';
const ALLOW_OFFLINE = process.env.ALLOW_OFFLINE_GITLAB_AUDITS === '1';

const TOKEN =
  process.env.GITLAB_TOKEN ??
  process.env.GITLAB_PRIVATE_TOKEN ??
  process.env.GITLAB_PAT ??
  process.env.CI_JOB_TOKEN ??
  '';

const RETRY_ATTEMPTS = 4;
const RETRY_DELAY_MS = 1200;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function encodedProjectId(): string {
  return encodeURIComponent(PROJECT_ID);
}

function headers(): HeadersInit {
  if (process.env.CI_JOB_TOKEN && TOKEN === process.env.CI_JOB_TOKEN) {
    return { 'JOB-TOKEN': TOKEN };
  }

  return { 'PRIVATE-TOKEN': TOKEN };
}

function apiGetViaGlab<T>(path: string): T {
  const result = spawnSync('glab', ['api', path], {
    cwd: ROOT,
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (result.status !== 0) {
    const message = (result.stderr || result.stdout || '').trim();
    throw new Error(message || `glab api failed for ${path}`);
  }

  return JSON.parse(result.stdout) as T;
}

async function apiGet<T>(path: string): Promise<T> {
  if (!TOKEN) {
    return apiGetViaGlab<T>(path);
  }

  let lastError: string | null = null;

  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(`${API_BASE}${path}`, {
        headers: headers(),
      });

      if (response.ok) {
        return (await response.json()) as T;
      }

      // Retry transient errors only.
      if (response.status >= 500 || response.status === 429) {
        lastError = `${response.status} ${response.statusText}`;
      } else {
        const body = await response.text();
        throw new Error(`HTTP ${response.status}: ${body.slice(0, 300)}`);
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }

    if (attempt < RETRY_ATTEMPTS) {
      await sleep(RETRY_DELAY_MS);
    }
  }

  throw new Error(lastError ?? 'Unknown GitLab API error');
}

function writeLog(lines: string[]): void {
  mkdirSync(LOG_DIR, { recursive: true });
  const output = [
    '# GitLab Policy Drift Audit',
    '',
    `Date: ${new Date().toISOString()}`,
    `API: ${API_BASE}`,
    `Project: ${PROJECT_ID || '<unset>'}`,
    '',
    ...lines,
    '',
  ];
  writeFileSync(LOG_FILE, output.join('\n'), 'utf-8');
}

type GitLabProject = {
  path_with_namespace?: string;
  default_branch?: string;
  visibility?: string;
  merge_requests_enabled?: boolean;
  only_allow_merge_if_pipeline_succeeds?: boolean;
  only_allow_merge_if_all_discussions_are_resolved?: boolean;
};

type ProtectedBranch = {
  name?: string;
  push_access_levels?: Array<{ access_level_description?: string }>;
  merge_access_levels?: Array<{ access_level_description?: string }>;
};

async function main(): Promise<void> {
  if (!PROJECT_ID) {
    const reason = 'GITLAB_PROJECT_ID is missing';

    if (ALLOW_OFFLINE) {
      writeLog(['Status: SKIP', `- SKIP: ${reason}`]);
      console.warn(`GitLab policy audit skipped: ${reason}`);
      console.warn(`Evidence written: ${LOG_FILE}`);
      return;
    }

    writeLog(['Status: FAIL', `- FAIL: ${reason}`]);
    console.error(`GitLab policy audit failed: ${reason}`);
    process.exit(1);
  }

  let project: GitLabProject;
  let protectedMain: ProtectedBranch;

  try {
    project = await apiGet<GitLabProject>(`/projects/${encodedProjectId()}`);
    protectedMain = await apiGet<ProtectedBranch>(
      `/projects/${encodedProjectId()}/protected_branches/main`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (ALLOW_OFFLINE) {
      writeLog(['Status: SKIP', `- SKIP: GitLab API unavailable (${message})`]);
      console.warn('GitLab policy audit skipped (offline mode enabled).');
      console.warn(`Evidence written: ${LOG_FILE}`);
      return;
    }

    writeLog(['Status: FAIL', `- FAIL: GitLab API access (${message})`]);
    console.error(`GitLab policy audit failed: ${message}`);
    process.exit(1);
  }

  const checks: Array<{ ok: boolean; name: string; details: string }> = [
    {
      ok: project.visibility === 'private',
      name: 'Project visibility',
      details: `visibility=${project.visibility ?? 'unknown'}`,
    },
    {
      ok: project.default_branch === 'main',
      name: 'Default branch',
      details: `default_branch=${project.default_branch ?? 'unknown'}`,
    },
    {
      ok: project.merge_requests_enabled === true,
      name: 'Merge requests enabled',
      details: `merge_requests_enabled=${String(project.merge_requests_enabled)}`,
    },
    {
      ok: project.only_allow_merge_if_pipeline_succeeds === true,
      name: 'Pipeline-success merge gate',
      details: `only_allow_merge_if_pipeline_succeeds=${String(project.only_allow_merge_if_pipeline_succeeds)}`,
    },
    {
      ok: protectedMain.name === 'main',
      name: 'Main branch protection',
      details: `protected_branch=${protectedMain.name ?? 'missing'}`,
    },
  ];

  const hasFailures = checks.some((check) => !check.ok);
  const lines = [hasFailures ? 'Status: FAIL' : 'Status: PASS'];
  lines.push(`- Project path: ${project.path_with_namespace ?? 'unknown'}`);
  lines.push('');

  for (const check of checks) {
    lines.push(`- ${check.ok ? 'PASS' : 'FAIL'}: ${check.name} (${check.details})`);
  }

  if (protectedMain.push_access_levels?.length) {
    const pushLevels = protectedMain.push_access_levels
      .map((level) => level.access_level_description ?? 'unknown')
      .join(', ');
    lines.push(`- Info: main push access levels = ${pushLevels}`);
  }

  if (protectedMain.merge_access_levels?.length) {
    const mergeLevels = protectedMain.merge_access_levels
      .map((level) => level.access_level_description ?? 'unknown')
      .join(', ');
    lines.push(`- Info: main merge access levels = ${mergeLevels}`);
  }

  writeLog(lines);

  if (hasFailures) {
    console.error('GitLab policy drift audit failed.');
    console.error(`Evidence written: ${LOG_FILE}`);
    process.exit(1);
  }

  console.log('GitLab policy drift audit passed.');
  console.log(`Evidence written: ${LOG_FILE}`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  writeLog(['Status: FAIL', `- FAIL: unexpected error (${message})`]);
  console.error(`GitLab policy audit failed: ${message}`);
  process.exit(1);
});
