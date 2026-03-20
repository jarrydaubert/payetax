# Production Env Contract

## Purpose

Define which shipped, release-sensitive features are expected to work in production and which environment variables those enabled features require.

Scope:

- Shipped flows only.
- Tax Pack is deferred and excluded by default.

Canonical sources:

- Contract definition: `src/lib/productionEnvContract.ts`
- Live verification command: `bun run check:production-env-contract`

## Current Contract

| Feature | Enabled In Production Contract | Verification Method | Required Env |
|---|---|---|---|
| Canonical site/origin configuration | Yes | Env snapshot | `NEXT_PUBLIC_SITE_URL` |
| Production analytics | Yes, unless `NEXT_PUBLIC_ENABLE_ANALYTICS=false` | Env snapshot | `NEXT_PUBLIC_GA_ID` |
| Newsletter subscribe flow | Yes | Env snapshot | `KIT_API_SECRET`, `KIT_FORM_ID` |
| Newsletter unsubscribe flow | Yes | Env snapshot | `KIT_API_SECRET`, `UNSUBSCRIBE_SECRET` |
| PAYE and director results email delivery | Yes | Env snapshot | `RESEND_API_KEY` |
| Referral lead confirmation and partner notification | No | Env snapshot | `RESEND_API_KEY`, `REFERRAL_PARTNER_EMAIL` |
| Distributed rate-limit verification path | Yes | Runtime verification | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `RATE_LIMIT_HEALTH_SECRET` |
| Sentry webhook to Linear integration | Yes | Env snapshot | `SENTRY_WEBHOOK_SECRET`, `LINEAR_API_KEY` |
| Authenticated IndexNow submission | No | Env snapshot | `INDEXNOW_SUBMIT_SECRET`, `INDEXNOW_KEY` |

Notes:

- `LINEAR_TEAM_KEY` is not required because the webhook route defaults to `PAYTAX`.
- Referral remains in the contract as a disabled feature until the CTA is actually rolled out on shipped surfaces.
- The distributed rate-limit path is verified at runtime because Vercel `env pull` may return blank values for sensitive vars even when production is configured correctly.
- IndexNow remains in the contract as a disabled feature so enabling it is explicit and reviewable, rather than hidden in ad hoc env changes.

## Release Use

Run this command against live Vercel Production before marking a release report complete:

```bash
RATE_LIMIT_VERIFY_BASE_URL="https://payetax.co.uk" \
RATE_LIMIT_HEALTH_SECRET="..." \
bun run check:production-env-contract
```

Alternative for captured env-snapshot evidence:

```bash
bun run check:production-env-contract -- --from-env-file /path/to/pulled-production.env
```

The command fails if:

- an env-snapshot-verified feature is missing one of its required production variables, or
- the runtime-verified distributed rate-limit check fails.
