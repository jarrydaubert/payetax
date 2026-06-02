# Vercel Migration

## Purpose

Move PayeTax deployment to the intended Vercel account/organisation used by `jarrydaubert` and `prosepal-web`, without accidentally deploying to a previous, incorrect, or ambiguous PayeTax project.

This migration is not complete yet. Until it is complete, production deployment from this repo is blocked.

## Current State

- Source control: GitHub repo `jarrydaubert/payetax`.
- CI: GitHub Actions `CI` plus CodeQL.
- Production deployment: pending correct Vercel project linkage.
- `bun run deploy`: intentionally blocked until this migration is complete.
- `vercel.json` ignored build step: intentionally skips automatic Vercel deployments until this migration is complete.

## Target State

- PayeTax is linked to a PayeTax Vercel project in the same Vercel account/organisation as `jarrydaubert` and `prosepal-web`.
- GitHub is the connected source repo for that Vercel project.
- Production and preview env vars live in the intended Vercel project.
- `payetax.co.uk` and `www.payetax.co.uk` are attached only to the intended project.
- GitHub `CI` and CodeQL pass before production deployment.
- Any previous or incorrect Vercel project is disconnected, archived, renamed, or otherwise made impossible to confuse with the live target.

## Non-Goals

- Do not deploy during setup discovery.
- Do not reuse unknown Vercel project ids.
- Do not copy stale env vars without checking whether each one is still required.
- Do not move domains until the target project has passed preview validation.

## Preflight

1. Confirm the intended Vercel account/organisation by comparing with the known-good `jarrydaubert` and `prosepal-web` projects.
2. Identify any existing PayeTax Vercel projects.
3. Record which project, if any, is previous or incorrect and must not receive new deployments.
4. Confirm the GitHub repo is clean and `main` has passing `CI` and CodeQL.
5. Confirm local validation passes:

```bash
bun install --frozen-lockfile
bun run check:repo
bun run audit:deps
bun run build
```

## Target Project Setup

1. Create or select the intended PayeTax Vercel project in the correct account/organisation.
2. Connect the GitHub repo `jarrydaubert/payetax`.
3. Confirm framework settings:
   - Framework preset: Next.js
   - Install command: `bun install --frozen-lockfile`
   - Build command: `bun run build`
   - Output handling: Vercel default for Next.js
4. Remove the temporary `ignoreCommand` from `vercel.json` only after the intended project is selected and this checklist is ready for preview validation.
5. Confirm the project is not linked to a previous or incorrect deployment target.
6. Pull or inspect local project linkage only after the intended project is selected:

```bash
vercel link
vercel project ls
```

## Env Migration

Use `.env.template` and `docs/guides/PRODUCTION_ENV_CONTRACT.md` as the contract.

1. List required runtime/build vars from `.env.template`.
2. For each variable, decide:
   - keep and migrate
   - remove because the feature is retired
   - leave blank because the feature is intentionally disabled
3. Add required values to the intended Vercel project for production and preview as appropriate.
4. Never commit real secret values.
5. Run production env contract only after the intended project is linked:

```bash
bun run check:production-env-contract
```

## Preview Validation

Before moving production domains:

1. Trigger a preview deployment from a pull request or non-production branch.
2. Confirm GitHub `CI` and CodeQL are green.
3. Verify key routes on the preview URL:
   - `/`
   - `/calculator`
   - `/calculator/50000-after-tax`
   - `/tools/director-guide`
   - `/privacy`
   - `/robots.txt`
   - `/sitemap.xml`
4. Verify API routes that are safe to test without sending real user data.
5. Check Vercel logs for build, runtime, and env errors.
6. Run targeted local checks for any issue found before continuing.

## Domain Cutover

Only start this after preview validation passes.

1. Confirm any previous or incorrect project will not continue receiving production traffic.
2. Attach `payetax.co.uk` to the intended Vercel project.
3. Attach `www.payetax.co.uk` to the intended Vercel project.
4. Update DNS only if Vercel requires a record change.
5. Confirm host normalisation:

```bash
curl -sS -I https://www.payetax.co.uk/
curl -sS -I https://www.payetax.co.uk/blog/scottish-vs-english-tax-rates-2026-comparison
curl -sS -I https://www.payetax.co.uk/calculator/50000-after-tax
```

Pass criteria:

- `www` redirects directly to the matching apex URL.
- Canonicals use `https://payetax.co.uk`.
- There is no unexpected extra redirect hop.

## Production Validation

After the first production deployment from the intended project:

1. Run `docs/guides/POST_RELEASE_VALIDATION.md`.
2. Run:

```bash
RATE_LIMIT_VERIFY_BASE_URL="https://payetax.co.uk" \
RATE_LIMIT_HEALTH_SECRET="..." \
bun run check:production-env-contract
```

3. Check Vercel logs for production runtime errors.
4. Confirm analytics and Sentry are receiving expected events without leaking sensitive data.
5. Confirm any previous or incorrect Vercel project is no longer receiving production traffic.

## Rollback

Rollback options must be decided before domain cutover.

Acceptable rollback paths:

- Revert DNS/domain attachment to the previous known-good production project.
- Roll back to the previous Vercel deployment inside the intended project if the domain already moved.
- Disable a feature in the checked-in production env contract if the issue is caused by a missing optional env var.

After rollback, re-run the relevant production validation checks and record the outcome in the release report.

## Completion Criteria

Migration is complete only when:

- The intended Vercel project is linked.
- Required production and preview env vars are present.
- GitHub `CI` and CodeQL are green.
- Preview validation passes.
- Production deployment passes post-release validation.
- `payetax.co.uk` and `www.payetax.co.uk` resolve through the intended project.
- Any previous or incorrect project is disconnected, archived, renamed, or clearly marked as retired.
- `bun run deploy` can be safely replaced or restored in a follow-up PR.
- The temporary `vercel.json` ignored build step has been removed in the same follow-up PR that enables intended Vercel previews/deployments.
