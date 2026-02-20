# API Route Hardening

This document defines the request-validation and body-size guardrails for all Next.js API routes under `src/app/api/**/route.ts`.

## Standard hardening flow

For routes that accept request bodies (`POST`):

1. Authenticate or validate origin (when relevant).
2. Apply per-route rate limits using `checkRateLimit`.
3. Read raw body first (`request.text()` or `request.arrayBuffer()`).
4. Enforce max payload size before parsing.
5. Parse JSON safely (or verify signature first for webhooks).
6. Validate payload shape (Zod schema where applicable).
7. Return bounded error responses (`400`, `401`, `403`, `413`, `429`, `500`).

## Route matrix

| Route | Method | Origin/Auth Guard | Rate Limit | Body Limit | Validation |
| --- | --- | --- | --- | --- | --- |
| `/api/send-results` | `POST` | `isValidRequestOrigin(request)` | `5/min` per client (`send-results:*`) | `50KB` (`MAX_BODY_SIZE`) | `SendResultsRequestSchema` (`safeParse`) |
| `/api/send-director-results` | `POST` | `isValidRequestOrigin(request)` | `5/min` per client (`send-director-results:*`) | `50KB` (`MAX_BODY_SIZE`) | `SendDirectorResultsRequestSchema` (`safeParse`) |
| `/api/newsletter/subscribe` | `POST` | `isValidRequestOrigin(request)` | `3/min` per client (`newsletter-subscribe:*`) | `1KB` (`MAX_BODY_SIZE`) | `NewsletterSubscribeRequestSchema` (`safeParse`) |
| `/api/referral/lead` | `POST` | `isValidRequestOrigin(request)` | `3/hour` per client (`referral-lead:*`) | `2KB` (`MAX_BODY_SIZE`) | `ReferralLeadSchema` (strict Zod schema, extends `ReferralLeadRequestSchema`) |
| `/api/indexnow` | `POST` | `x-indexnow-secret` via `isAuthenticated(request)` | default `checkRateLimit` config (`10/min`) per client (`indexnow:*`) | `50KB` (`MAX_BODY_SIZE`) | JSON structure + URL count (`MAX_URLS=100`) + HTTPS/domain/path allowlist checks |
| `/api/sentry-webhook` | `POST` | HMAC signature via `sentry-hook-signature` + `SENTRY_WEBHOOK_SECRET` | `30/min` per client (`sentry-webhook:*`) | `1MB` (`MAX_PAYLOAD_SIZE`) via header + raw bytes | signature verification, JSON parse, resource/action checks |
| `/api/newsletter/unsubscribe` | `GET` | signed token verification (`verifyUnsubscribeToken`) | `5/min` per client (`newsletter-unsubscribe:*`) | N/A (`GET`) | query token presence + signature validity |
| `/api/ops/rate-limit-health` | `GET` | `x-rate-limit-health-secret` (required in production) | none | N/A (`GET`) | protected diagnostics response from `getRateLimitDiagnostics()` |
| `/api/tax-rates` | `GET` | none (public, cacheable dataset) | none | N/A (`GET`) | no external input; response is server-constructed |

## Notes

- Prefer route-local `MAX_BODY_SIZE` constants for clarity and explicit intent.
- Use raw body size checks before JSON parse to prevent oversized payload parsing work.
- Keep security/ops warnings on server routes (misconfiguration, auth failures, signature failures).
- Keep non-essential UI warnings dev-only (`NODE_ENV !== 'production'`).
