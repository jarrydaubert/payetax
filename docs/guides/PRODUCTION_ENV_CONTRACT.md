# Production Environment Contract

This document lists production environment variables for the public R&D version of PayeTax.

## Required For Core Production

| Flow | Variables |
| --- | --- |
| Public site URL and metadata | `NEXT_PUBLIC_SITE_URL` |
| Basic analytics | `NEXT_PUBLIC_GA_ID` |
| PAYE and director results email | `BREVO_SMTP_HOST`, `BREVO_SMTP_PORT`, `BREVO_SMTP_LOGIN`, `BREVO_SMTP_PASSWORD`, `BREVO_FROM_EMAIL` |
| Feedback email | `BREVO_SMTP_HOST`, `BREVO_SMTP_PORT`, `BREVO_SMTP_LOGIN`, `BREVO_SMTP_PASSWORD`, `BREVO_FROM_EMAIL`, `FEEDBACK_TO_EMAIL` |
| Distributed API rate limiting | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` |
| Sentry browser monitoring | `NEXT_PUBLIC_SENTRY_DSN` |
| Sentry source maps | `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` |
| Sentry to Linear webhook | `SENTRY_WEBHOOK_SECRET`, `LINEAR_API_KEY`, optional `LINEAR_TEAM_KEY` |

## Local Development

Use `.env.template` for names and `.env.local` for local values.

Do not create placeholder secrets in committed files. Leave unknown values blank in templates.
