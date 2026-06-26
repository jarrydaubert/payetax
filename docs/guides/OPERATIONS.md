# Operations Guide

PayeTax deploys from GitHub to the current Vercel project for `payetax.co.uk`.

Use this guide for deployment, environment, Vercel-link, and release-validation decisions. Put dated command output and manual evidence in pull requests or `docs/reports/*`, not in this evergreen guide.

## Normal Change Flow

1. Branch from `main`.
2. Make a focused change.
3. Run local validation:

```bash
bun install --frozen-lockfile
bun run check:repo
bun run build:ci
```

4. Run the smallest relevant Jest or Playwright check while developing.
5. Open a GitHub pull request.
6. Merge after required checks pass.
7. Let Vercel deploy from the connected project.

Use `bun run build:release` only for release validation that needs Sentry source maps. Vercel production should keep using `bun run build`; production source-map behaviour is controlled by env and `next.config.ts`.

## Vercel Project Shape

- Source control: GitHub repo `jarrydaubert/payetax`.
- CI: GitHub Actions `CI` plus CodeQL.
- Production host: `https://payetax.co.uk`.
- Deployment: Vercel project connected to this GitHub repo.
- Domains: `payetax.co.uk` and `www.payetax.co.uk` should resolve through the current Vercel project only.
- Framework preset: Next.js.
- Install command: `bun install --frozen-lockfile`.
- Build command: `bun run build`.
- Output handling: Vercel default for Next.js.
- Vercel Web Analytics enabled in the current `payetax` project.
- Vercel Speed Insights enabled in the current `payetax` project.

## Environment Contract

Use `.env.template` as the source of required names. Set production and preview values in Vercel Project Settings.

| Flow | Variables or setting |
| --- | --- |
| Public site URL and metadata | `NEXT_PUBLIC_SITE_URL` |
| Consent-based GA4 analytics | `NEXT_PUBLIC_GA_ID` |
| Vercel Web Analytics | Enable Web Analytics in the current Vercel `payetax` project. |
| Vercel Speed Insights | Enable Speed Insights in the current Vercel `payetax` project and keep `@vercel/speed-insights` rendered in the root layout. |
| PAYE and Director results email | `BREVO_API_KEY`, `BREVO_FROM_EMAIL` |
| Distributed API rate limiting | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `RATE_LIMIT_HEALTH_SECRET` |
| Sentry runtime monitoring | `NEXT_PUBLIC_SENTRY_DSN` |
| Sentry production source maps | `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`; optional `PAYETAX_ENABLE_SENTRY_SOURCEMAPS=true` for non-Vercel release builds |

Inbound support mail for `support@payetax.co.uk` should be routed in Cloudflare Email Routing. That is DNS/routing infrastructure, not a Vercel env var.

PayeTax uses the Upstash REST URL/token pair, not the Redis TCP URL/password. A Redis CLI `PING` proves the database exists, but the deployed app still needs the REST env vars in Vercel.

Run this after the intended Vercel project is linked or production env values change:

```bash
bun run check:production-env-contract
```

Local development should use `.env.local`. Never commit real credentials, and rotate any credential that was pasted into chat, committed, or pushed.

## Vercel Link Recovery

If Vercel CLI reports that it cannot retrieve project settings, `.vercel/project.json` may point at a stale project id.

Recovery flow:

```bash
vercel login
mv .vercel .vercel.stale
vercel link --project payetax
vercel project ls
```

Choose the current Vercel account used for Jarryd's public projects.

## Preview Checks

Before merging a risky deployment change:

1. Confirm GitHub `CI` and CodeQL are green.
2. Check the Vercel preview URL for:
   - `/`
   - `/tools`
   - `/tools/director-guide`
   - `/privacy`
   - `/robots.txt`
   - `/sitemap.xml`
3. Check Vercel logs for build, runtime, and env errors.
4. Test API routes only with safe synthetic payloads.

## Production Validation

After production deployment:

- Homepage loads.
- Main calculator returns expected values for a known salary.
- Director Intelligence loads and calculates.
- Tools hub links work.
- Blog index and a blog post load.
- PAYE results email sends through the Brevo API.
- Director results email sends through the Brevo API.
- Sentry reports no new release-blocking PAYE, tool, blog, email, or Director errors.
- Vercel Web Analytics receives traffic if analytics changed.
- Vercel Speed Insights receives real-user performance data after production traffic.
- GA4 receives a page view after accepting analytics cookies if GA4 changed.
- `/api/ops/rate-limit-health` passes with the configured secret when rate limiting changed.
- `robots.txt`, `sitemap.xml`, canonicals, and structured data are spot-checked when SEO or metadata changed.

Confirm host normalisation when deployment or domain settings changed:

```bash
curl -sS -I https://www.payetax.co.uk/
curl -sS -I https://www.payetax.co.uk/tools/director-guide
```

Pass criteria:

- `www` redirects directly to the matching apex URL.
- Canonicals use `https://payetax.co.uk`.
- There is no unexpected extra redirect hop.

## Retired Project Hygiene

Any previous Vercel project or account should stay disconnected, deleted, archived, renamed, or otherwise impossible to confuse with the live target.

Do not add docs, scripts, env names, or local folders that point back to old infrastructure.
