# Ops Runbook (GitHub + Vercel Pending)

## Purpose

Lightweight DevOps and release operations for `PayeTax`.

Source of truth:

- Documentation policy: `docs/DOCS_POLICY.md`
- Open work only: `docs/BACKLOG.md`

## Prerequisites

Operational baseline:

1. Public repo host: GitHub.
2. CI platform: GitHub Actions.
3. Intended deploy platform: Vercel, pending linkage to the same Vercel account/organisation used by `jarrydaubert` and `prosepal-web`.
4. Pull requests require the `CI` status check.
5. Security baseline: CodeQL for JavaScript/TypeScript, Dependabot, secret scanning, and push protection.
6. Primary local release gate: `bun run release:verify`.

Required access:

- GitHub repo access
- Vercel project access after the PayeTax project is created or linked in the correct account/organisation
- local Bun toolchain installed

Required local env files:

- No real `.env` file should be committed.
- Use `.env.template` as the committed placeholder contract for local configuration.
- Production and preview secrets will live in the correct Vercel project and GitHub repository settings, not in git.

## Commands And Steps

### Daily Flow

1. Branch from `main`.
2. Start local development with the repo's webpack-backed dev server:

```bash
bun run dev
```

Use `bun run dev:turbo` only when explicitly checking the Turbopack dev path.

3. Run core local checks before opening or merging a pull request:

```bash
bun run check:repo
bun run test:quick
bun run build
```

For UI-heavy homepage, calculator, or Director Intelligence changes, also run:

```bash
bun run test:e2e:visual
```

For dependency or security-sensitive changes, also run:

```bash
bun run audit:deps
```

4. Open a pull request on GitHub and wait for `CI` and CodeQL to pass.

GitHub checks:

- `CI`: lockfile install, repo checks, dependency audit, production build.
- `CodeQL`: JavaScript/TypeScript code scanning.

GitHub repo controls:

- Main branch is protected by a branch ruleset requiring `CI`.
- Dependabot is configured in `.github/dependabot.yml`.
- Secret scanning and push protection should stay enabled in repository security settings.
- Do not add visual, Lighthouse, flake-audit, governance, or release workflows as default PR blockers.

### Deployment Flow

PayeTax is not ready for production deployment from this repo until the migration in `docs/guides/VERCEL_MIGRATION.md` is complete.

Do not deploy to a previous, incorrect, or ambiguous Vercel project. `bun run deploy` is intentionally blocked while migration is pending.

Before any production deploy, complete the migration preflight, target-project setup, env migration, domain cutover, and validation checklist in `docs/guides/VERCEL_MIGRATION.md`.

1. Confirm release gate passes locally:

```bash
bun run release:verify
```

For a broader local harness pass before risky refactors:

```bash
bun run harness:local
```

2. Complete production checklist after the correct Vercel project is linked:

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
2. Run `bun run check:production-env-contract` only after the repo is linked to the correct Vercel project.
3. If a feature is intentionally disabled in production, disable it in the checked-in contract instead of silently accepting missing env vars.

Strict release-report interpretation:

1. Sections `0` to `3` and `Final Decision` are blocking.
2. Sections `4` to `6` in the current report template are advisory and may be marked `- [~]` when intentionally deferred.
3. Deferred items must have a short justification in that section's `Notes`.

3. Run post-release production validation:

- `docs/guides/POST_RELEASE_VALIDATION.md`

### Vercel Status Recovery

Use this only after the correct Vercel project exists and is linked. If GitHub receives the push but Vercel does not create or report an automatic deployment, first confirm the repo is still linked to the intended Vercel project.

Detection:

```bash
gh run list --repo jarrydaubert/payetax --branch main --limit 5
vercel project ls
```

Recovery flow:

```bash
vercel deploy --prod --yes
vercel inspect <deployment-or-domain-url>
```

Use manual production deployment only after the local release gate has passed, the correct Vercel project linkage is verified, and the intended deployment URL is verified.

### Canonical Host Policy

Use `https://payetax.co.uk` as the only canonical public host.

Rules:

1. `https://www.payetax.co.uk/:path*` must redirect directly to `https://payetax.co.uk/:path*`.
2. The host-normalization redirect should be permanent (`308` preferred).
3. Canonical metadata, sitemap URLs, and internal absolute URLs should continue to use the apex host.
4. Once the correct Vercel project exists, `www.payetax.co.uk` must be attached as a custom domain; if it is left unattached, Vercel can serve a platform-level `307` before the app redirect runs.

Operational note:

```bash
vercel domains add www.payetax.co.uk
```

Use the command above only against the correct PayeTax Vercel project after fresh project/domain setup, so host normalization is handled by the app redirect instead of Vercel's fallback domain behavior.

Verification commands:

```bash
curl -sS -I https://www.payetax.co.uk/
curl -sS -I https://www.payetax.co.uk/blog/scottish-vs-english-tax-rates-2026-comparison
curl -sS -I https://www.payetax.co.uk/calculator/50000-after-tax
```

Pass criteria:

1. Each response returns a permanent redirect to the matching apex URL.
2. There is no extra redirect hop after the host normalization step.

### Monthly Review

1. Review open Dependabot alerts and pull requests.
2. Confirm CodeQL, secret scanning, push protection, and the main branch ruleset are still enabled.
3. Confirm release-report discipline is being followed (`release:report:check`).
4. Once Vercel is linked, confirm project/env linkage still matches this repo and has not drifted to an old project.
5. Confirm the local marketing-skills pin/profile is still intentional when upstream updates land; use `bun run skills:review` to inspect the latest upstream tag, new skills, changed installed skills, and upstream changelog entries before syncing. Use `bun run skills:check` after local profile or sync changes to validate the installed setup.
6. Review team-level Sentry issues in Linear and link actionable production issues to backlog rows.

```bash
bun run linear list --team-only
```

### Harness Command Surface

Use these as the default repo harness entry points:

```bash
bun run fix-all         # Mutating hygiene pass: format/write + validation
bun run check:repo      # Repo verification gate
bun run audit:deps      # Dependency advisory audit with allowlist policy
bun run harness:local   # Local harness: repo checks + quick tests + build
bun run harness:release # Release harness: repo checks + deps + release verify path
```

Rule of thumb:

1. Use `fix-all` when you want the repo auto-corrected.
2. Use `check:repo` or the `harness:*` commands when you want deterministic verification rather than auto-fixing.
3. Use `audit:deps` after dependency changes and before release.

## Pass Criteria

- Daily PR flow:
  - `bun run check:repo`, `bun run test:quick`, and `bun run build` pass locally.
  - `bun run audit:deps` passes for dependency or security-sensitive changes.
  - GitHub `CI` passes on the pull request.
  - CodeQL passes on the pull request.
- Release flow after correct Vercel linkage:
  - `bun run release:verify` passes.
  - `bun run check:production-env-contract` passes against the intended Vercel Production project.
  - `docs/reports/releases/v<version>.md` is initialized, completed, and accepted by `bun run release:report:check`.
  - Post-release checks in `docs/guides/POST_RELEASE_VALIDATION.md` are completed or any incomplete checks are explicitly recorded.
- Harness usage:
  - Chosen harness command completes without mutating files unless `fix-all` was intentionally used.

## Failure Handling And Escalation Path

- If a local gate fails:
  - fix the issue before merge, or document the blocker and keep the related backlog item open.
- If GitHub `CI` fails:
  - read the failing step log, reproduce the same command locally when practical, and push a fix before merge.
- If CodeQL fails:
  - inspect the alert, fix the issue or document why the alert is not applicable before merge.
- If Vercel project/env linkage is broken:
  - re-auth or relink to the intended Vercel project before treating deployment checks as complete.
- If release-report validation fails:
  - fix the report before release completion.
- If the production env contract check fails:
  - fix the missing Vercel Production env vars or explicitly disable the feature in the checked-in contract before release completion.
- If a workflow change alters how these steps work:
  - update this runbook in the same change set.
