# Bot Mitigation

Current public mutation routes are protected with origin checks, strict schema validation, request-size limits, client identifiers, and rate limiting.

Routes:

- `POST /api/send-results`
- `POST /api/send-director-results`
- `POST /api/sentry-webhook`

The PAYE results route also checks honeypot-style fields via `detectLikelyBotRequest`.
