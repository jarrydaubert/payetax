# PayeTax

PayeTax is a UK PAYE take-home pay calculator and tax-tool R&D project. It is built to test deterministic tax logic, edge cases, API hardening, and public deployment hygiene.

The repo is public. Real secrets must live in Vercel or local ignored env files only.

## Stack

- Next.js, React, TypeScript
- Bun package manager
- Jest and Playwright
- GA4 for basic analytics
- Sentry for error monitoring
- Linear issue creation from Sentry webhooks
- Brevo SMTP for transactional email flows

## Current Scope

Kept:

- Main PAYE calculator
- Director Intelligence calculator
- Tax tools
- Blog
- Feedback and email-results flows
- PWA support

Removed:

- Growth landing-page families
- Mailing-list setup
- Partner lead capture
- Competitor-style SEO pages
- Extra analytics vendors beyond GA4

## Common Commands

```bash
bun install --frozen-lockfile
bun run dev
bun run check:repo
bun run test:no-coverage
bun run build
bun audit
```

Use `bun run dev:turbo` only when explicitly checking the Turbopack dev path.

## Environment Variables

Copy `.env.template` to `.env.local` for local development. Do not commit `.env.local`.

Required for production email flows:

- `BREVO_SMTP_HOST`
- `BREVO_SMTP_PORT`
- `BREVO_SMTP_LOGIN`
- `BREVO_SMTP_PASSWORD`
- `BREVO_FROM_EMAIL`
- `FEEDBACK_TO_EMAIL`

Other production controls:

- `NEXT_PUBLIC_GA_ID`
- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_AUTH_TOKEN`
- `SENTRY_WEBHOOK_SECRET`
- `LINEAR_API_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

## Docs

- Agent contract: [AGENTS.md](AGENTS.md)
- Product direction: [docs/business/PRODUCT_DIRECTION.md](docs/business/PRODUCT_DIRECTION.md)
- Testing: [docs/guides/TESTING.md](docs/guides/TESTING.md)
- Ops: [docs/guides/OPS_RUNBOOK.md](docs/guides/OPS_RUNBOOK.md)
- Env contract: [docs/guides/PRODUCTION_ENV_CONTRACT.md](docs/guides/PRODUCTION_ENV_CONTRACT.md)
