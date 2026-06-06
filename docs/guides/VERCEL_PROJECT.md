# Vercel Project And Deployment

PayeTax is deployed from GitHub to the current Vercel project for `payetax.co.uk`.

This document records the project-link and environment hygiene that matters after the account move.

## Current State

- Source control: GitHub repo `jarrydaubert/payetax`.
- CI: GitHub Actions `CI` plus CodeQL.
- Production host: `https://payetax.co.uk`.
- Deployment: Vercel project connected to this GitHub repo.
- Domains: `payetax.co.uk` and `www.payetax.co.uk` should resolve through the current Vercel project only.

## Required Project Shape

- Framework preset: Next.js.
- Install command: `bun install --frozen-lockfile`.
- Build command: `bun run build`.
- Output handling: Vercel default for Next.js.
- Vercel Web Analytics enabled in the current `payetax` project.
- Production and preview env vars set from `.env.template` and `docs/guides/PRODUCTION_ENV_CONTRACT.md`.

## Local Link Recovery

If Vercel CLI reports that it cannot retrieve project settings, the local `.vercel/project.json` may point at a stale project id.

Do not keep old account backup directories in the repo.

Recovery flow:

```bash
vercel login
mv .vercel .vercel.stale
vercel link --project payetax
vercel project ls
```

Choose the current Vercel account used for Jarryd's public projects.

## Environment Checks

Use `.env.template` as the source of required names.

Core production values:

- Brevo API values for PAYE and Director email-results flows.
- Upstash Redis values for distributed rate limiting.
- Sentry values for calculator-focused monitoring and source maps.
- GA4 measurement id for consent-based analytics.
- Vercel Web Analytics enabled in the Vercel dashboard, not through an env var.

Never copy stale env vars from an old account without confirming the feature still exists.

Run after the intended project is linked:

```bash
bun run check:production-env-contract
```

## Preview Validation

Before merging a risky deployment change:

1. Confirm GitHub `CI` and CodeQL are green.
2. Check the Vercel preview URL for:
   - `/`
   - `/tools`
   - `/tools/director-guide`
   - `/privacy`
   - `/robots.txt`
   - `/sitemap.xml`
3. Check Vercel logs for build, runtime, and env errors.
4. Test API routes only with safe synthetic payloads.

## Production Validation

After production deployment:

1. Run `docs/guides/POST_RELEASE_VALIDATION.md`.
2. Confirm host normalisation:

```bash
curl -sS -I https://www.payetax.co.uk/
curl -sS -I https://www.payetax.co.uk/tools/director-guide
```

Pass criteria:

- `www` redirects directly to the matching apex URL.
- Canonicals use `https://payetax.co.uk`.
- There is no unexpected extra redirect hop.

3. Check Vercel Web Analytics for live traffic if analytics changed.
4. Check GA4 realtime only after accepting analytics cookies.
5. Check calculator-focused Sentry for PAYE or Director calculator errors.
6. Check `/api/ops/rate-limit-health` with the configured secret when rate limiting changed.

## Retired Project Hygiene

Any previous Vercel project or account should stay disconnected, deleted, archived, renamed, or otherwise impossible to confuse with the live target.

Do not add docs, scripts, env names, or local folders that point back to old infrastructure.
