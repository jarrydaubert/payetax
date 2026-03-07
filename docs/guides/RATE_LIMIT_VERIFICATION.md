# Distributed Rate-Limit Verification

Purpose: prove production is using Upstash-backed distributed limits (not in-memory fallback).

## Route Policy

Fail closed in production when distributed protection is unavailable:

- `/api/indexnow`
- `/api/sentry-webhook`
- `/api/send-results`
- `/api/send-director-results`
- `/api/referral/lead`
- `submitFeedback` server action

Allow in-memory fallback when distributed protection is unavailable:

- `/api/newsletter/subscribe`
- `/api/newsletter/unsubscribe`
- `/api/og`

Rationale:

- Fail-closed routes can trigger outbound email, partner notifications, webhooks, or third-party writes and should not silently downgrade protection.
- Allow-fallback routes are lower-risk user-facing surfaces where temporary in-memory throttling is preferable to a hard outage.

## One-Time Setup

Add a secret in production env:

- `RATE_LIMIT_HEALTH_SECRET`

This protects `GET /api/ops/rate-limit-health`.

## Runtime Verification

Run from local terminal (with production URL + secret):

```bash
RATE_LIMIT_VERIFY_BASE_URL="https://payetax.co.uk" \
RATE_LIMIT_HEALTH_SECRET="..." \
bun run ops:verify-rate-limit
```

Expected result:

- Health endpoint reports `configured=true`, `backend=distributed`, `upstashPing=ok`
- Throttle probe returns at least one `429`

## Evidence

Record output in the release report:

- `docs/reports/releases/v<version>.md`
- Section: `Security + Abuse Controls`

Include timestamp and who ran it.
