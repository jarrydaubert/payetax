# Ops Runbook (GitLab + Vercel)

Scope: lightweight DevOps and release operations for `PayeTax`.

## 1) Operational Baseline

1. Repo host: GitLab (private project).
2. CI platform: GitLab CI (`.gitlab-ci.yml`).
3. Deploy platform: Vercel.
4. Merge validation model: merge-request pipelines only.
5. Primary local gate: `bun run release:verify`.

## 2) Daily Flow

1. Branch from the default branch.
2. Run core local checks before opening/merging MR:

```bash
bun run fix-all
bun run test:no-coverage
bun run build
```

3. Open merge request and wait for GitLab MR pipeline jobs to pass.

## 3) Deployment Flow

1. Confirm release gate passes locally:

```bash
bun run release:verify
```

2. Complete production checklist:

```bash
bun run release:report:init
# complete docs/reports/releases/v<version>.md
bun run release:report:check
```

3. Run post-release production validation:

- `docs/guides/POST_RELEASE_VALIDATION.md`

## 4) GitLab Governance Audits

Required env vars (local or CI):

- `GITLAB_PROJECT_ID`
- `GITLAB_TOKEN` (or `CI_JOB_TOKEN` in CI)

Optional:

- `GITLAB_API_BASE` (default `https://gitlab.com/api/v4`)
- `GITLAB_CI_MONTHLY_MINUTES_MAX` (default `100`)
- `GITLAB_CI_WINDOW_DAYS` (default `30`)
- `ALLOW_OFFLINE_GITLAB_AUDITS=1` (allow SKIP instead of FAIL when API unavailable)

Commands:

```bash
bun run audit:gitlab:policy
bun run audit:gitlab:ci-usage
bun run audit:gitlab:governance
```

Evidence outputs:

- `docs/evidence/gitlab-policy-drift.md`
- `docs/evidence/gitlab-ci-usage.md`

## 5) GitLab API Alternatives to `gh`

Use either:

1. GitLab API via `curl` + `PRIVATE-TOKEN`
2. `glab` CLI (optional; not required)

Examples:

```bash
curl -sS --header "PRIVATE-TOKEN: $GITLAB_TOKEN" \
  "https://gitlab.com/api/v4/projects/$GITLAB_PROJECT_ID/pipelines?ref=main&per_page=1"

curl -sS --header "PRIVATE-TOKEN: $GITLAB_TOKEN" \
  "https://gitlab.com/api/v4/projects/$GITLAB_PROJECT_ID/releases?per_page=1"
```

## 6) Monthly Review

1. Run governance audits and commit refreshed evidence files.
2. Confirm `.gitlab-ci.yml` runtime/cost assumptions are still valid.
3. Confirm release-report discipline is being followed (`release:report:check`).
4. Confirm Vercel project/env linkage still matches this repo.
