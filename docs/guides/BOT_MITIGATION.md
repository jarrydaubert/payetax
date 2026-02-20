# Bot Mitigation (Mutation Endpoints)

Last updated: February 20, 2026

## Scope

Applied to:
- `POST /api/newsletter/subscribe`
- `POST /api/send-results`
- `POST /api/referral/lead`

Shared detector:
- `src/lib/security/botGuard.ts`

## What Is Enforced

1. Existing protections remain:
- Origin/CSRF checks (`isValidRequestOrigin`)
- Route-level rate limits (`checkRateLimit`)
- Strict request validation (Zod schemas)

2. Added low-risk bot guard:
- Rejects non-empty honeypot fields (`website`, `homepage`, `url`, `companyWebsite`, `botField`)
- Rejects obvious scripted user-agent markers (`curl`, `python-requests`, `postmanruntime`, etc.)

Blocked responses return:
- `400 { "error": "Invalid request" }`

## False-Positive Risk

Risk level: low.

Notes:
- Browser-like traffic is unaffected.
- Missing user-agent alone is not blocked.
- Only explicit scripted UA markers are blocked.

Potential false-positive scenarios:
- Legitimate API clients (non-browser) posting directly to these public routes.
- Privacy/security tooling that rewrites UA to known scripted signatures.

## Operations / Tuning

If false positives are observed:
1. Inspect warning logs for `blocked likely bot request`.
2. Confirm marker causing block (`honeypot:*` or `user-agent:*`).
3. Remove or narrow that marker in `src/lib/security/botGuard.ts`.
4. Add a regression test for the allowed client profile.

Recommended review cadence:
- Monthly with release checks (`docs/guides/POST_RELEASE_VALIDATION.md`).
