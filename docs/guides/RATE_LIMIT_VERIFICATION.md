# Distributed Rate-Limit Verification

Purpose: prove production is using Upstash-backed distributed limits (not in-memory fallback).

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
