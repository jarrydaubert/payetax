# Ops Runbook (GitLab + Vercel)

Scope: lightweight DevOps and release operations for `PayeTax`.

Documentation policy: `docs/DOCS_POLICY.md`
Backlog/source of truth for open work: `docs/BACKLOG.md`

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
bun run check:repo
bun run test:quick
bun run build
```

3. Open merge request and wait for GitLab MR pipeline jobs to pass.

Useful GitLab shortcuts:

```bash
bun run gitlab:status
bun run gitlab:mr:status
bun run gitlab:pipeline:latest
bun run gitlab:release:latest
```

## 3) Deployment Flow

1. Confirm release gate passes locally:

```bash
bun run release:verify
```

For a broader local harness pass before risky refactors:

```bash
bun run harness:local
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

Interpretation notes:

1. `gitlab-ci-usage.md` now distinguishes measured GitLab runtime from unmeasured pipelines.
2. `source=external` pipelines are counted for visibility, but they do not consume GitLab CI minutes and are not treated as runtime budget.
3. For GitLab-managed pipelines, the audit prefers pipeline duration and falls back to job-level timing data where available.

## 5) GitLab CLI Shortcuts

Common repo-native wrappers:

```bash
bun run gitlab:project
bun run gitlab:mr:status
bun run gitlab:pipeline:latest
bun run gitlab:release:latest
bun run gitlab:status
```

Notes:

1. These commands use the current repo's GitLab remote via `glab api`.
2. `GITLAB_PROJECT_ID` remains available as an override for CI or cross-project audits.
3. `gitlab:pipeline:latest` defaults to the current branch.

## 6) GitLab API Alternatives to `gh`

Use either:

1. GitLab API via `curl` + `PRIVATE-TOKEN`
2. `glab` CLI (recommended for local use)

Examples:

```bash
curl -sS --header "PRIVATE-TOKEN: $GITLAB_TOKEN" \
  "https://gitlab.com/api/v4/projects/$GITLAB_PROJECT_ID/pipelines?ref=main&per_page=1"

curl -sS --header "PRIVATE-TOKEN: $GITLAB_TOKEN" \
  "https://gitlab.com/api/v4/projects/$GITLAB_PROJECT_ID/releases?per_page=1"
```

## 7) Monthly Review

1. Run governance audits and commit refreshed evidence files.
2. Confirm `.gitlab-ci.yml` runtime/cost assumptions are still valid.
3. Confirm release-report discipline is being followed (`release:report:check`).
4. Confirm Vercel project/env linkage still matches this repo.

## 8) Harness Command Surface

Use these as the default repo harness entry points:

```bash
bun run fix-all         # Mutating hygiene pass: format/write + validation
bun run check:repo      # Read-only repo verification gate
bun run harness:local   # Read-only local harness: repo checks + quick tests + build
bun run harness:release # Read-only release harness: repo checks + deps + release verify path
```

Rule of thumb:

1. Use `fix-all` when you want the repo auto-corrected.
2. Use `check:repo` or the `harness:*` commands when you want trustworthy verification with no file edits.
