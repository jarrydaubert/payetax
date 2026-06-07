# Rate Limit Verification

Distributed rate limiting uses the Upstash Redis REST API when configured.

PayeTax does not use the Redis TCP URL/password at runtime. Vercel must have:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `RATE_LIMIT_HEALTH_SECRET`

The health endpoint runs a safe runtime probe:

1. `PING`
2. write a temporary `payetax:ratelimit:v1:health:*` key with a short TTL
3. read the value back
4. delete the key

An empty Redis database is normal outside active rate-limit windows because limiter keys expire quickly.

## Routes To Check

- `/api/send-results`
- `/api/send-director-results`
- `/api/ops/rate-limit-health`

## Local Command

```bash
bun run ops:verify-rate-limit
```

Production health checks require `RATE_LIMIT_HEALTH_SECRET`.
