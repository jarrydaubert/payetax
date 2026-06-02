# Ops Runbook (GitHub + GitLab + Vercel)

## Purpose

Lightweight DevOps and release operations for `PayeTax`.

Source of truth:

- Documentation policy: `docs/DOCS_POLICY.md`
- Open work only: `docs/BACKLOG.md`

## Prerequisites

Operational baseline:

1. Public repo host: GitHub.
2. Legacy/internal CI platform: GitLab CI (`.gitlab-ci.yml`).
3. Deploy platform: Vercel.
4. Public GitHub merge validation model: pull requests require the `CI` status check.
5. GitHub security baseline: CodeQL for JavaScript/TypeScript, Dependabot, secret scanning, and push protection.
6. Primary local release gate: `bun run release:verify`.

Required access:

- GitHub repo access
- GitLab repo access
- Vercel project access
- local Bun toolchain installed

Required local env files:

- No real `.env` file should be committed.
- Use `.env.template` as the committed placeholder contract for local configuration.
- Production and preview secrets live in the deployment provider, not in git.

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
2. Start local development with the repo's webpack-backed dev server:

```bash
bun run dev
```

Use `bun run dev:turbo` only when explicitly checking the Turbopack dev path.

3. Run core local checks before opening or merging an MR:

```bash
bun run check:repo
bun run test:quick
bun run build
```

For UI-heavy homepage, calculator, or Director Intelligence changes, also run:

```bash
bun run test:e2e:visual
```

4. Open a pull request on GitHub and wait for the `CI` and CodeQL checks to pass. If the same work is mirrored through GitLab, wait for the GitLab MR pipeline jobs as well.

GitHub checks:

- `CI`: lockfile install, repo checks, production build.
- `CodeQL`: JavaScript/TypeScript code scanning.

GitHub repo controls:

- Main branch is protected by a branch ruleset requiring `CI`.
- Dependabot is configured in `.github/dependabot.yml`.
- Secret scanning and push protection should stay enabled in repository security settings.
- Do not add visual, Lighthouse, flake-audit, governance, or release workflows as default PR blockers.

Useful GitLab shortcuts:

```bash
bun run gitlab:status
bun run gitlab:deploy:status
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

### GitLab To Vercel Status Recovery

Use this when GitLab receives the push but Vercel does not create or report an automatic deployment.

Detection:

```bash
bun run gitlab:status
bun run gitlab:deploy:status
vercel ls payetax
```

Recovery flow for a successful manual deployment:

```bash
vercel deploy --prod --yes
vercel inspect <deployment-or-domain-url>
bun run gitlab:deploy:reconcile success <verified-deployment-url>
```

Recovery flow for a failed manual deployment:

```bash
vercel deploy --prod --yes
# capture the Vercel inspect/build URL that shows the failure
bun run gitlab:deploy:reconcile failed <vercel-inspect-or-build-url>
```

Notes:

1. `gitlab:deploy:status` reports the pushed branch SHA's GitLab status, any external statuses, and the latest GitLab pipeline linked to that commit by default.
2. `gitlab:deploy:status` and `gitlab:deploy:reconcile` default to the branch's pushed upstream SHA when one exists, so a locally-ahead branch still inspects or reconciles the deployable GitLab commit rather than an unpushed local commit.
3. `gitlab:deploy:reconcile` posts a manual external GitLab status named `vercel-production-manual` for the pushed branch SHA by default.
4. Pass an explicit SHA as the third argument if you need to reconcile a non-default commit.
5. Use `success` only after the deployment URL is verified as the production outcome you intend to trust.
6. Use `failed` when the manual recovery attempt itself fails and you want GitLab to reflect that outcome instead of staying status-less.

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

Outputs:

- Governance audit results print to the terminal.
- Fix drift immediately, or add a concrete `docs/BACKLOG.md` row when follow-up work is needed.

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
bun run gitlab:deploy:status
bun run gitlab:deploy:reconcile success <verified-deployment-url>
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

1. Run governance audits and fix drift or add a concrete backlog item.
2. Confirm `.gitlab-ci.yml` runtime/cost assumptions are still valid.
3. Confirm release-report discipline is being followed (`release:report:check`).
4. Confirm Vercel project/env linkage still matches this repo.
5. Confirm the local marketing-skills pin/profile is still intentional when upstream updates land; use `bun run skills:review` to inspect the latest upstream tag, new skills, changed installed skills, and upstream changelog entries before syncing. Use `bun run skills:check` after local profile or sync changes to validate the installed setup.
6. Review team-level Sentry issues in Linear and link actionable production issues to backlog rows.

```bash
bun run linear list --team-only
```

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
  - Any drift is fixed immediately or captured as a concrete backlog item.
- Harness usage:
  - Chosen harness command completes without mutating files unless `fix-all` was intentionally used.

## Failure Handling And Escalation Path

- If a local gate fails:
  - fix the issue before merge, or document the blocker and keep the related backlog item open.
- If GitLab audit commands cannot reach the API:
  - use `ALLOW_OFFLINE_GITLAB_AUDITS=1` only when the temporary skip is acceptable, and record the gap in Linear or backlog if follow-up is needed.
- If Vercel project/env linkage is broken:
  - re-auth or relink before treating deployment checks as complete.
- If release-report validation fails:
  - fix the report before release completion.
- If the production env contract check fails:
  - fix the missing Vercel Production env vars or explicitly disable the feature in the checked-in contract before release completion.
- If a workflow change alters how these steps work:
  - update this runbook in the same change set.
