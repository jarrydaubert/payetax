#!/usr/bin/env bun

import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const LOG_DIR = join(ROOT, 'docs', 'evidence');
const LOG_FILE = join(LOG_DIR, 'gitlab-ci-usage.md');

const API_BASE = (process.env.GITLAB_API_BASE ?? 'https://gitlab.com/api/v4').replace(/\/$/, '');
const PROJECT_ID = process.env.GITLAB_PROJECT_ID ?? '';
const ALLOW_OFFLINE = process.env.ALLOW_OFFLINE_GITLAB_AUDITS === '1';

const TOKEN =
  process.env.GITLAB_TOKEN ??
  process.env.GITLAB_PRIVATE_TOKEN ??
  process.env.GITLAB_PAT ??
  process.env.CI_JOB_TOKEN ??
  '';

const WINDOW_DAYS = Number(process.env.GITLAB_CI_WINDOW_DAYS ?? '30');
const MONTHLY_MINUTES_MAX = Number(process.env.GITLAB_CI_MONTHLY_MINUTES_MAX ?? '100');
const PIPELINE_FETCH_LIMIT = Number(process.env.GITLAB_PIPELINE_FETCH_LIMIT ?? '100');

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
    '# GitLab CI Usage Budget Audit',
    '',
    `Date: ${new Date().toISOString()}`,
    `API: ${API_BASE}`,
    `Project: ${PROJECT_ID || '<unset>'}`,
    `Window: last ${WINDOW_DAYS} days`,
    '',
    ...lines,
    '',
  ];
  writeFileSync(LOG_FILE, output.join('\n'), 'utf-8');
}

type Pipeline = {
  id: number;
  status?: string;
  ref?: string;
  source?: string;
  updated_at?: string;
  duration?: number | null;
};

type Job = {
  id: number;
  name?: string;
  status?: string;
  duration?: number | null;
  started_at?: string | null;
  finished_at?: string | null;
};

function formatMinutes(value: number): string {
  return `${value.toFixed(2)}m`;
}

function getDurationSecondsFromTimestamps(job: Job): number | null {
  if (!(job.started_at && job.finished_at)) {
    return null;
  }

  const startedAt = Date.parse(job.started_at);
  const finishedAt = Date.parse(job.finished_at);

  if (Number.isNaN(startedAt) || Number.isNaN(finishedAt) || finishedAt < startedAt) {
    return null;
  }

  return Math.max(0, Math.round((finishedAt - startedAt) / 1000));
}

async function getPipelineJobs(pipelineId: number): Promise<Job[]> {
  return apiGet<Job[]>(`/projects/${encodedProjectId()}/pipelines/${pipelineId}/jobs?per_page=100`);
}

type PipelineUsage = {
  pipeline: Pipeline;
  measuredDurationSeconds: number;
  measurement: 'pipeline' | 'jobs' | 'unmeasured';
  jobCount: number;
};

async function main(): Promise<void> {
  if (!PROJECT_ID) {
    const reason = 'GITLAB_PROJECT_ID is missing';

    if (ALLOW_OFFLINE) {
      writeLog(['Status: SKIP', `- SKIP: ${reason}`]);
      console.warn(`GitLab CI usage audit skipped: ${reason}`);
      console.warn(`Evidence written: ${LOG_FILE}`);
      return;
    }

    writeLog(['Status: FAIL', `- FAIL: ${reason}`]);
    console.error(`GitLab CI usage audit failed: ${reason}`);
    process.exit(1);
  }

  const updatedAfter = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const query = new URLSearchParams({
    per_page: String(PIPELINE_FETCH_LIMIT),
    updated_after: updatedAfter,
    order_by: 'updated_at',
    sort: 'desc',
  });

  let pipelines: Pipeline[];

  try {
    pipelines = await apiGet<Pipeline[]>(`/projects/${encodedProjectId()}/pipelines?${query}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (ALLOW_OFFLINE) {
      writeLog(['Status: SKIP', `- SKIP: GitLab API unavailable (${message})`]);
      console.warn('GitLab CI usage audit skipped (offline mode enabled).');
      console.warn(`Evidence written: ${LOG_FILE}`);
      return;
    }

    writeLog(['Status: FAIL', `- FAIL: unable to query pipelines (${message})`]);
    console.error(`GitLab CI usage audit failed: ${message}`);
    process.exit(1);
  }

  if (pipelines.length === 0) {
    writeLog(['Status: FAIL', '- FAIL: no pipelines returned in lookback window']);
    console.error('GitLab CI usage audit failed: no pipelines in lookback window.');
    process.exit(1);
  }

  const usageByPipeline: PipelineUsage[] = [];

  for (const pipeline of pipelines) {
    if (typeof pipeline.duration === 'number' && pipeline.duration > 0) {
      usageByPipeline.push({
        pipeline,
        measuredDurationSeconds: pipeline.duration,
        measurement: 'pipeline',
        jobCount: 0,
      });
      continue;
    }

    if (pipeline.source === 'external') {
      usageByPipeline.push({
        pipeline,
        measuredDurationSeconds: 0,
        measurement: 'unmeasured',
        jobCount: 0,
      });
      continue;
    }

    let jobs: Job[] = [];
    try {
      jobs = await getPipelineJobs(pipeline.id);
    } catch {
      usageByPipeline.push({
        pipeline,
        measuredDurationSeconds: 0,
        measurement: 'unmeasured',
        jobCount: 0,
      });
      continue;
    }

    const jobDurationSeconds = jobs.reduce((total, job) => {
      if (typeof job.duration === 'number' && job.duration > 0) {
        return total + job.duration;
      }

      const fallbackDuration = getDurationSecondsFromTimestamps(job);
      return total + (fallbackDuration ?? 0);
    }, 0);

    usageByPipeline.push({
      pipeline,
      measuredDurationSeconds: jobDurationSeconds,
      measurement: jobDurationSeconds > 0 ? 'jobs' : 'unmeasured',
      jobCount: jobs.length,
    });
  }

  const totalDurationMinutes = usageByPipeline.reduce(
    (total, entry) => total + entry.measuredDurationSeconds / 60,
    0,
  );

  const measuredPipelines = usageByPipeline.filter((entry) => entry.measurement !== 'unmeasured');
  const averageMinutes =
    measuredPipelines.length > 0 ? totalDurationMinutes / measuredPipelines.length : 0;
  const unmeasuredPipelines = usageByPipeline.filter((entry) => entry.measurement === 'unmeasured');

  const byRef = new Map<string, number>();
  for (const pipeline of pipelines) {
    const ref = pipeline.ref ?? 'unknown';
    byRef.set(ref, (byRef.get(ref) ?? 0) + 1);
  }

  const checks = [
    {
      name: 'Monthly runtime budget',
      ok: totalDurationMinutes <= MONTHLY_MINUTES_MAX,
      details: `${formatMinutes(totalDurationMinutes)} <= ${formatMinutes(MONTHLY_MINUTES_MAX)}`,
    },
    {
      name: 'Pipelines observed in window',
      ok: pipelines.length > 0,
      details: `count=${pipelines.length}`,
    },
  ];

  const hasFailures = checks.some((check) => !check.ok);
  const lines: string[] = [hasFailures ? 'Status: FAIL' : 'Status: PASS'];
  lines.push(`- Pipelines fetched: ${pipelines.length}`);
  lines.push(`- Pipelines with measured runtime: ${measuredPipelines.length}`);
  lines.push(`- Pipelines without measurable runtime: ${unmeasuredPipelines.length}`);
  lines.push(`- Total measured runtime: ${formatMinutes(totalDurationMinutes)}`);
  lines.push(`- Average runtime (where measurable): ${formatMinutes(averageMinutes)}`);
  lines.push('- Pipeline refs:');

  for (const [ref, count] of [...byRef.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    lines.push(`  - ${ref}: ${count}`);
  }

  lines.push('');
  lines.push('- Measurement notes:');
  lines.push('  - Prefer pipeline.duration when GitLab provides it.');
  lines.push(
    '  - Fallback to summing job durations (or started_at/finished_at deltas) for non-external pipelines.',
  );
  lines.push(
    '  - External pipelines (for example Vercel-managed runs) are counted but not treated as GitLab CI minutes.',
  );
  if (unmeasuredPipelines.length > 0) {
    lines.push('  - Unmeasured pipelines:');
    for (const entry of unmeasuredPipelines.slice(0, 10)) {
      lines.push(
        `    - #${entry.pipeline.id} ref=${entry.pipeline.ref ?? 'unknown'} source=${entry.pipeline.source ?? 'unknown'} status=${entry.pipeline.status ?? 'unknown'} jobs=${entry.jobCount}`,
      );
    }
    if (unmeasuredPipelines.length > 10) {
      lines.push(`    - ... ${unmeasuredPipelines.length - 10} more`);
    }
  }

  lines.push('');
  lines.push('- Budgets:');
  lines.push(`  - monthly total <= ${formatMinutes(MONTHLY_MINUTES_MAX)}`);
  lines.push('');

  for (const check of checks) {
    lines.push(`- ${check.ok ? 'PASS' : 'FAIL'}: ${check.name} (${check.details})`);
  }

  writeLog(lines);

  if (hasFailures) {
    console.error('GitLab CI usage budget audit failed.');
    console.error(`Evidence written: ${LOG_FILE}`);
    process.exit(1);
  }

  console.log('GitLab CI usage budget audit passed.');
  console.log(`Evidence written: ${LOG_FILE}`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  writeLog(['Status: FAIL', `- FAIL: unexpected error (${message})`]);
  console.error(`GitLab CI usage audit failed: ${message}`);
  process.exit(1);
});
