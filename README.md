# PayeTax

PayeTax is a UK PAYE take-home pay calculator and tax-tool R&D project. It is built to test deterministic tax logic, edge cases, API hardening, and public deployment hygiene.

The repo is public. Real secrets must live in Vercel or local ignored env files only.

## Stack

- Next.js, React, TypeScript
- Bun package manager
- Jest and Playwright
- Vercel Web Analytics for cookieless traffic visibility
- Vercel Speed Insights for real-user performance signals
- GA4 for consent-based event analytics
- Sentry for calculator-focused error monitoring
- Brevo API for transactional results email

## Current Scope

Kept:

- Main PAYE calculator
- Director Intelligence calculator
- Tax tools
- Blog
- Email-results flows
- PWA support

Removed:

- Growth landing-page families
- Mailing-list setup
- Partner lead capture
- Competitor-style SEO pages
- Extra analytics vendors beyond Vercel Web Analytics, Vercel Speed Insights, and GA4

## Testing And Quality

The testing posture is deliberately evidence-led:

> AI-assisted code is allowed. Unverified AI-assisted code is not.

PayeTax tests the project at several layers:

- independent unit oracles for PAYE, NI, student loans, tax codes, thresholds, rounding, and Director calculations
- component and store tests for UI state, validation, analytics events, and rendering contracts
- route/config tests for sitemap, robots, `llms.txt`, metadata, env sync, version sync, and deployment config
- Playwright E2E for calculator flows, golden-master scenarios, accessibility, blog/navigation, mobile paths, and Director Intelligence
- CI hard gates for repo checks, dependency audit, production build, and CodeQL JavaScript/TypeScript scanning

The full testing approach is documented in [docs/guides/TESTING.md](docs/guides/TESTING.md), including what is tested, why each layer exists, current coverage gaps, and the difference between CI gates and local full-suite evidence.

## Common Commands

```bash
bun install --frozen-lockfile
bun run dev
bun run check:repo
bun run test:no-coverage
bun run test:full
bun run build
bun audit
```

Use `bun run dev:turbo` only when explicitly checking the Turbopack dev path.

## Environment Variables

Copy `.env.template` to `.env.local` for local development. Do not commit `.env.local`.

Required for production email flows:

- `BREVO_API_KEY`
- `BREVO_FROM_EMAIL`

Other production controls:

- `NEXT_PUBLIC_GA_ID`
- `NEXT_PUBLIC_SENTRY_DSN` for PAYE and Director calculator error capture
- `SENTRY_AUTH_TOKEN`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

## Docs

- Agent contract: [AGENTS.md](AGENTS.md)
- Product direction: [docs/business/PRODUCT_DIRECTION.md](docs/business/PRODUCT_DIRECTION.md)
- Testing: [docs/guides/TESTING.md](docs/guides/TESTING.md)
- Ops: [docs/guides/OPS_RUNBOOK.md](docs/guides/OPS_RUNBOOK.md)
- Vercel project: [docs/guides/VERCEL_PROJECT.md](docs/guides/VERCEL_PROJECT.md)
- Env contract: [docs/guides/PRODUCTION_ENV_CONTRACT.md](docs/guides/PRODUCTION_ENV_CONTRACT.md)
