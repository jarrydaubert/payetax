# Production Environment Contract

This document lists production environment variables for the public R&D version of PayeTax.

## Required For Core Production

| Flow | Variables |
| --- | --- |
| Public site URL and metadata | `NEXT_PUBLIC_SITE_URL` |
| Consent-based GA4 analytics | `NEXT_PUBLIC_GA_ID` |
| Vercel Web Analytics | No env variable. Enable Web Analytics on the current Vercel `payetax` project. |
| Vercel Speed Insights | No env variable. Enable Speed Insights on the current Vercel `payetax` project and keep `@vercel/speed-insights` rendered in the root layout. |
| PAYE and director results email | `BREVO_API_KEY`, `BREVO_FROM_EMAIL` |
| Distributed API rate limiting | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `RATE_LIMIT_HEALTH_SECRET` |
| Sentry calculator, tool, blog, and email error monitoring | `NEXT_PUBLIC_SENTRY_DSN` |
| Sentry source maps | `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` |

## Local Development

Use `.env.template` for names and `.env.local` for local values.

Do not create placeholder secrets in committed files. Leave unknown values blank in templates.
