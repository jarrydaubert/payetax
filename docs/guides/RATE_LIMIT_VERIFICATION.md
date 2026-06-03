# Rate Limit Verification

Distributed rate limiting uses Upstash Redis when configured.

## Routes To Check

- `/api/send-results`
- `/api/send-director-results`
- `/api/sentry-webhook`
- `/api/ops/rate-limit-health`

## Local Command

```bash
bun run ops:verify-rate-limit
```

Production health checks require `RATE_LIMIT_HEALTH_SECRET`.
