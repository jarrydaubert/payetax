# API Route Hardening

Current public mutation routes:

| Route | Method | Controls |
| --- | --- | --- |
| `/api/send-results` | `POST` | origin check, client identifier, distributed rate limit, body-size cap, bot honeypot, strict Zod schema |
| `/api/send-director-results` | `POST` | origin check, client identifier, distributed rate limit, body-size cap, strict Zod schema |
| `/api/sentry-webhook` | `POST` | HMAC signature, distributed rate limit, payload-size cap, JSON validation, Linear issue creation |
| `/api/ops/rate-limit-health` | `GET` | shared secret in production, Upstash health probe |

Email routes use the shared outbound email boundary in `src/lib/email/emailDelivery.ts`.
