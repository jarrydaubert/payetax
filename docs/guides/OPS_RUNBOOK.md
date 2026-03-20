# Ops Runbook (GitLab + Vercel)

## Purpose

Lightweight DevOps and release operations for `PayeTax`.

Source of truth:

- Documentation policy: `docs/DOCS_POLICY.md`
- Open work only: `docs/BACKLOG.md`

## Prerequisites

Operational baseline:

1. Repo host: GitLab (private project).
2. CI platform: GitLab CI (`.gitlab-ci.yml`).
3. Deploy platform: Vercel.
4. Merge validation model: merge-request pipelines only.
5. Primary local gate: `bun run release:verify`.

Required access:

- GitLab repo access
- Vercel project access
- local Bun toolchain installed

Required env vars for GitLab audits:

- `GITLAB_PROJECT_ID`
- `GITLAB_TOKEN` (or `CI_JOB_TOKEN` in CI)

Optional env vars:

- `GITLAB_API_BASE` (default `https://gitlab.com/api/v4`)
- `GITLAB_CI_MONTHLY_MINUTES_MAX` (default `100`)
- `GITLAB_CI_WINDOW_DAYS` (default `30`)
- `ALLOW_OFFLINE_GITLAB_AUDITS=1` (allow SKIP instead of FAIL when API unavailable)

## Commands And Steps

### Daily Flow

1. Branch from the default branch.
2. Run core local checks before opening or merging an MR:

```bash
bun run check:repo
bun run test:quick
bun run build
```

3. Open a merge request and wait for GitLab MR pipeline jobs to pass.

Useful GitLab shortcuts:

```bash
bun run gitlab:status
bun run gitlab:mr:status
bun run gitlab:pipeline:latest
bun run gitlab:release:latest
```

### Deployment Flow

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
RATE_LIMIT_VERIFY_BASE_URL="https://payetax.co.uk" \
RATE_LIMIT_HEALTH_SECRET="..." \
bun run check:production-env-contract
# complete docs/reports/releases/v<version>.md
bun run release:report:check
```

Production env contract policy:

1. Treat `docs/guides/PRODUCTION_ENV_CONTRACT.md` and `src/lib/productionEnvContract.ts` as the release-sensitive env contract for shipped features.
2. Run `bun run check:production-env-contract` against live Vercel Production before marking the release report complete.
3. If a feature is intentionally disabled in production, disable it in the checked-in contract instead of silently accepting missing env vars.

Strict release-report interpretation:

1. Sections `0` to `3` and `Final Decision` are blocking.
2. Sections `4` to `6` in the current report template are advisory and may be marked `- [~]` when intentionally deferred.
3. Deferred items must have a short justification in that section's `Notes`.

3. Run post-release production validation:

- `docs/guides/POST_RELEASE_VALIDATION.md`

### Canonical Host Policy

Use `https://payetax.co.uk` as the only canonical public host.

Rules:

1. `https://www.payetax.co.uk/:path*` must redirect directly to `https://payetax.co.uk/:path*`.
2. The host-normalization redirect should be permanent (`308` preferred).
3. Canonical metadata, sitemap URLs, and internal absolute URLs should continue to use the apex host.
4. `www.payetax.co.uk` must be attached to the Vercel project as a custom domain; if it is left unattached, Vercel can serve a platform-level `307` before the app redirect runs.

Operational note:

```bash
vercel domains add www.payetax.co.uk
```

Use the command above after a fresh project/domain setup to ensure host normalization is handled by the app redirect instead of Vercel's fallback domain behavior.

Verification commands:

```bash
curl -sS -I https://www.payetax.co.uk/
curl -sS -I https://www.payetax.co.uk/blog/scottish-vs-english-tax-rates-2026-comparison
curl -sS -I https://www.payetax.co.uk/calculator/50000-after-tax
```

Pass criteria:

1. Each response returns a permanent redirect to the matching apex URL.
2. There is no extra redirect hop after the host normalization step.

### GitLab Governance Audits

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

### GitLab CLI Shortcuts

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

### GitLab API Alternatives to `gh`

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

### Monthly Review

1. Run governance audits and commit refreshed evidence files.
2. Confirm `.gitlab-ci.yml` runtime/cost assumptions are still valid.
3. Confirm release-report discipline is being followed (`release:report:check`).
4. Confirm Vercel project/env linkage still matches this repo.
5. Confirm the local marketing-skills pin/profile is still intentional when upstream updates land; use `bun run skills:check` and `docs/guides/MARKETING_SKILLS_RUNBOOK.md`.

### Harness Command Surface

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

## Pass Criteria

- Daily MR flow:
  - `bun run check:repo`, `bun run test:quick`, and `bun run build` pass locally.
  - The MR pipeline passes in GitLab.
- Release flow:
  - `bun run release:verify` passes.
  - `bun run check:production-env-contract` passes against live Vercel Production.
  - `docs/reports/releases/v<version>.md` is initialized, completed, and accepted by `bun run release:report:check`.
  - Post-release checks in `docs/guides/POST_RELEASE_VALIDATION.md` are completed or any incomplete checks are explicitly recorded.
- Governance audits:
  - `bun run audit:gitlab:governance` completes without unexpected failures.
  - Evidence files in `docs/evidence/` reflect the latest audit run.
- Harness usage:
  - Chosen harness command completes without mutating files unless `fix-all` was intentionally used.

## Failure Handling And Escalation Path

- If a local gate fails:
  - fix the issue before merge, or document the blocker and keep the related backlog item open.
- If GitLab audit commands cannot reach the API:
  - use `ALLOW_OFFLINE_GITLAB_AUDITS=1` only when the temporary skip is acceptable, and record the gap in evidence or backlog.
- If Vercel project/env linkage is broken:
  - re-auth or relink before treating deployment checks as complete.
- If release-report validation fails:
  - fix the report or missing evidence before release completion.
- If the production env contract check fails:
  - fix the missing Vercel Production env vars or explicitly disable the feature in the checked-in contract before release completion.
- If a workflow change alters how these steps work:
  - update this runbook in the same change set.
