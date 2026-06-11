# System Overview

PayeTax is a Next.js and TypeScript public R&D project for UK tax calculation.

## User Surface

- Main PAYE calculator
- Director Intelligence
- Tax tools
- Blog
- About, privacy, compliance, install
- Email-results flows

## Integrations

- Vercel hosting
- Vercel Web Analytics for cookieless traffic visibility
- Vercel Speed Insights for real-user performance signals
- GA4 for consent-based event analytics
- Sentry calculator error monitoring and source maps
- Brevo API for transactional results email
- Upstash Redis for distributed rate limiting

## Key Files

- Tax rates: `src/constants/taxRates.ts`
- PAYE calculation: `src/lib/taxCalculator.ts`
- Director calculations: `src/lib/tax/`
- Email boundary: `src/lib/email/emailDelivery.ts`
- Env validation: `src/lib/env.ts`
- Production env contract: `src/lib/productionEnvContract.ts`
- Sitemap: `src/app/sitemap.ts`
- CI: `.github/workflows/ci.yml`
