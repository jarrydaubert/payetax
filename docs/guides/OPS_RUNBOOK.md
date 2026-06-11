# Ops Runbook

PayeTax is hosted on Vercel from the public GitHub repository.

## Normal Flow

1. Branch from `main`.
2. Make a focused change.
3. Run local validation:

```bash
bun install --frozen-lockfile
bun run check:repo
bun run build
```

4. Open a GitHub pull request.
5. Merge after required checks pass.
6. Let Vercel deploy from the connected project.

## Vercel Link Recovery

If Vercel CLI reports that it cannot retrieve project settings, the local `.vercel` directory may point at an old project id.

```bash
vercel login
mv .vercel .vercel.stale
vercel link --project payetax
vercel project ls
```

Choose the current Vercel account used for Jarryd's public projects.

## Environment Variables

Set production and preview values in Vercel Project Settings.

Email:

- `BREVO_API_KEY`
- `BREVO_FROM_EMAIL`

Analytics and monitoring:

- Vercel Web Analytics must be enabled in the Vercel `payetax` project dashboard.
- Vercel Speed Insights must be enabled in the Vercel `payetax` project dashboard.
- `NEXT_PUBLIC_GA_ID`
- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_AUTH_TOKEN`

Rate limiting:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `RATE_LIMIT_HEALTH_SECRET`

PayeTax uses the Upstash REST URL/token pair, not the Redis TCP URL/password. A Redis CLI `PING` proves the database exists, but the deployed app still needs the REST env vars in Vercel.

## Secret Handling

- Never commit real credentials.
- Rotate any credential that was pasted into chat, committed, or pushed.
- Keep `.env.local` ignored.

## Production Checks

After deploy:

- Open the homepage and main tools.
- Send PAYE results email.
- Send Director Intelligence results email.
- Check Sentry for new PAYE or Director calculator errors.
- Check Vercel Web Analytics for live traffic if analytics changed.
- Check Vercel Speed Insights for real-user performance data after a production deploy.
- Check GA4 realtime after accepting analytics cookies.
- Check `/api/ops/rate-limit-health` with the configured secret when rate limiting changed. The check verifies Upstash REST `PING` plus a temporary write/read/delete probe.
