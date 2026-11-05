# API And Abuse Controls

This guide is the evergreen source for public API hardening, bot mitigation, and rate-limit verification.

## Public Routes

| Route | Method | Controls |
| --- | --- | --- |
| `/api/send-results` | `POST` | Origin check, client identifier, rate limit, byte-bounded body read, bot guard, strict Zod schema, shared email-delivery boundary |
| `/api/send-director-results` | `POST` | Origin check, client identifier, rate limit, byte-bounded body read, bot guard, strict Zod schema, shared email-delivery boundary |
| `/api/ops/rate-limit-health` | `GET` | Shared secret in production mode, Upstash REST health probe |

Email routes send through `src/lib/email/emailDelivery.ts`. Keep provider-specific handling behind that boundary.

## Bot And Request Controls

Public mutation routes are protected with:

- origin checks
- strict schema validation
- byte-bounded body reads
- client identifiers
- distributed rate limiting, required in production mode

Both results-email routes check honeypot-style fields and automated user agents via `detectLikelyBotRequest`.

Invalid payloads should be rejected at the route boundary. Do not make invalid input valid only to push it through the email provider.

### Results-email operating contract

- **Origin:** `isValidRequestOrigin()` prefers `Origin`, falling back to `Referer`. Missing both
  headers or a disallowed host returns `403`; neither email route opts into missing-origin access.
  `localhost:3000` is automatically allowed only outside production mode; production-mode local
  requests need an explicitly configured allowed host, such as `NEXT_PUBLIC_SITE_URL`.
- **Identity:** with `TRUST_CF_CONNECTING_IP=true`, `getClientIdentifier()` checks
  `cf-connecting-ip` first. Enable that only behind a controlled Cloudflare proxy that supplies
  the header. Otherwise, or when that header is absent, it uses the first `x-forwarded-for` IP,
  then `x-real-ip`, then a truncated base64 user-agent fallback. This fallback is not a
  cryptographic hash.
- **Quota:** each endpoint allows five requests per client identifier per 60-second window,
  with separate `send-results:` and `send-director-results:` key prefixes. Origin-approved
  attempts reach the limiter before body parsing or validation. Exceeding the quota returns
  `429` with `Retry-After: 60`, the configured window rather than the exact remaining TTL.
- **Distributed failure:** both routes use `require_distributed_in_production`. When
  `NODE_ENV=production`, missing Upstash configuration or a failed counter operation returns
  `503` without sending email; it does not fall back to process-local counters. This also applies
  to production builds run locally or as Vercel previews. Development mode permits the in-memory
  fallback, which is not a distributed production safeguard.
- **Body size:** after origin and quota checks, each route reads at most `50 * 1024` bytes
  (50 KiB) into an application buffer. The reader rejects a chunk that would cross the limit
  before copying or decoding it, cancels further reading, and returns `413` with
  `{ error: 'Request body too large' }`. It counts actual stream bytes independently of
  `Content-Length`, including when the header is absent or understated. UTF-8 decoding and
  JSON parsing happen after the bounded read; read failures retain the existing `400` response.
  This replaces the former UTF-16 length check, so multibyte bodies over 50 KiB are also rejected.
  Vercel's [Functions limits](https://vercel.com/docs/functions/limitations#request-body-size),
  checked 5 November 2026, specify a 4.5 MB request/response payload cap and platform `413`
  (`FUNCTION_PAYLOAD_TOO_LARGE`) above it. These routes use the default Node.js runtime.
  The platform cap is much larger than this application limit; the reader bounds application
  retention and decoding, not buffering or individual chunk allocation inside the platform.

The route constants in `src/app/api/send-results/route.ts` and
`src/app/api/send-director-results/route.ts`, together with `src/lib/rateLimit.ts` and
`src/lib/security/`, own these contracts.

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

For an authorised target, provide `RATE_LIMIT_VERIFY_BASE_URL` and `RATE_LIMIT_HEALTH_SECRET`
through the local environment, then run:

```bash
bun run ops:verify-rate-limit
```

Production health checks require `RATE_LIMIT_HEALTH_SECRET`.
The verifier checks the diagnostics for a configured distributed backend and successful PING
and read/write/delete probes; an HTTP `200` alone does not establish limiter health.

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
