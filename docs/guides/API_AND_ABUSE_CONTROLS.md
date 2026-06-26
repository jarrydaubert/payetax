# API And Abuse Controls

This guide is the evergreen source for public API hardening, bot mitigation, and rate-limit verification.

## Public Routes

| Route | Method | Controls |
| --- | --- | --- |
| `/api/send-results` | `POST` | Origin check, client identifier, distributed rate limit, body-size cap, bot honeypot, strict Zod schema, shared email-delivery boundary |
| `/api/send-director-results` | `POST` | Origin check, client identifier, distributed rate limit, body-size cap, strict Zod schema, shared email-delivery boundary |
| `/api/ops/rate-limit-health` | `GET` | Shared secret in production, Upstash REST health probe |

Email routes send through `src/lib/email/emailDelivery.ts`. Keep provider-specific handling behind that boundary.

## Bot And Request Controls

Public mutation routes are protected with:

- origin checks
- strict schema validation
- request-size limits
- client identifiers
- distributed rate limiting when Upstash is configured

The PAYE results route also checks honeypot-style fields via `detectLikelyBotRequest`.

Invalid payloads should be rejected at the route boundary. Do not make invalid input valid only to push it through the email provider.

## Rate-Limit Runtime Verification

Distributed rate limiting uses the Upstash Redis REST API when configured.

Vercel must have:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `RATE_LIMIT_HEALTH_SECRET`

PayeTax does not use the Redis TCP URL/password at runtime.

The health endpoint runs a safe runtime probe:

1. `PING`
2. write a temporary `payetax:ratelimit:v1:health:*` key with a short TTL
3. read the value back
4. delete the key

An empty Redis database is normal outside active rate-limit windows because limiter keys expire quickly.

Local verification:

```bash
bun run ops:verify-rate-limit
```

Production health checks require `RATE_LIMIT_HEALTH_SECRET`.

## Test And Evidence Hooks

Relevant automated coverage lives in:

- `src/lib/security/__tests__/`
- `src/lib/validation/__tests__/emailValidation.test.ts`
- `src/lib/__tests__/rateLimit.test.ts`
- `src/app/api/ops/rate-limit-health/route.test.ts`

When this boundary changes, expected evidence is:

- `bun run check:repo`
- the smallest targeted route, validation, or security test
- `bun run build:ci`
- `bun run ops:verify-rate-limit` when rate-limit env or Upstash wiring changed
- production health-check confirmation when rate limiting changed in production
