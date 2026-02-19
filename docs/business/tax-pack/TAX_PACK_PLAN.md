# Tax Pack V1 Plan

Status: Planned  
Owner: Product + Engineering  
Primary route: `/tools/director-guide`

## Goal

Ship a paid, deterministic export bundle for Director Intelligence users who want records they can review and share with an accountant.

## Scope (V1)

In scope:
- Director Intelligence scenarios only (single-company salary/dividend extraction outcomes).
- One-time purchase via Stripe Checkout.
- Bundle artifacts: tax summary PDF, annual schedule CSV, board minutes DOCX template, dividend voucher DOCX template.
- Secure re-download flow.
- Post-purchase email via Resend.

Out of scope:
- CGT calculations.
- Crypto tax calculations.
- Self Assessment filing automation.
- Accounting platform integrations.
- Multi-company consolidation.

## Product Rules

- All numeric outputs must come from deterministic calculator outputs only.
- No AI-authored tax figures.
- If export payload validation fails, do not issue bundle.
- Payment proof is mandatory before any download access.
- UK scope only for V1 (copy and legal text must state UK-only applicability).
- Tax Pack outputs must include a distributable-profits check result (`sufficient_reserves`: yes/no + amount used) before template generation.

## Legal And Trust Guardrails

- Mandatory disclaimer appears on checkout, success state, email, PDF, and DOCX templates: "This tool provides calculation outputs and templates, not legal or tax advice. Review with a qualified accountant. You are responsible for verifying sufficient distributable profits and company-law compliance before using these documents."
- Board minutes and dividend voucher templates require legal/accounting review sign-off before release.
- Templates remain editable by the user; we do not claim filing completeness.

## Fulfillment Architecture (V1)

Use async fulfillment. Do not block webhook processing on document generation.

1. `POST /api/tax-pack/checkout`
- Server creates draft order and Stripe Checkout Session.
- Price ID is server-owned (never accepted from client input).
- Stripe automatic tax setting is server-owned and explicit.

2. `POST /api/tax-pack/webhook`
- Verify signature (`stripe.webhooks.constructEvent`).
- Enforce idempotency by persisting processed Stripe event IDs and `stripeSessionId`.
- Mark order `paid` only once.
- Queue artifact generation job.
- Return `2xx` quickly.

3. Background generation worker/job
- Build PDF/CSV/DOCX from deterministic snapshot.
- Package ZIP.
- Store artifact in private object storage.
- Retry failures with exponential backoff (max 3 attempts), then move to dead-letter and mark order `failed`.
- Mark order `ready` with artifact metadata when successful.

4. `GET /api/tax-pack/status/[orderId]`
- Success page polls status (`pending_payment`, `processing`, `ready`, `failed`).

5. `POST /api/tax-pack/download-link`
- Creates short-lived signed download grant for a ready artifact.
- Optional email resend uses same grant model.

6. `GET /api/tax-pack/download/[token]`
- Validates grant and issues a fresh short-lived object storage signed URL (5-minute expiry) per request.

## Implementation Decisions (V1)

These decisions are fixed for V1 unless explicitly changed in this doc.

- Payments: Stripe Checkout with server-owned Price ID and Stripe automatic tax enabled.
- Webhook fulfillment: signature verification via `stripe.webhooks.constructEvent` + idempotency using persisted Stripe event IDs and unique `stripeSessionId`.
- Relational persistence: Postgres as system of record for orders, snapshots, artifacts, grants, webhook events, and audit logs.
- Async orchestration: Inngest worker flow with retries and dead-letter handling for bundle generation.
- Artifact storage: private object storage (S3-compatible) with signed URLs and lifecycle policies.
- PDF generation: HTML template rendered via Playwright.
- DOCX generation: `docxtemplater` with versioned `.docx` templates.
- ZIP packaging: `archiver`.
- CSV generation: server-side deterministic writer from snapshot data.
- Observability: Sentry for tracing/errors plus product metrics and alerting defined in this plan.

## Data Contracts

- `taxPackOrder`: id, email, stripeSessionId, stripePaymentIntentId, status, createdAt, paidAt, readyAt.
- `taxPackSnapshot`: orderId, payloadVersion, calculatorVersion, taxRulesVersion, taxYear, payloadJson, checksumSha256.
- `taxPackArtifact`: orderId, templateVersion, storageKey, fileSizeBytes, checksumSha256, generatedAt, generatorVersion.
- `taxPackDownloadGrant`: orderId, tokenHash, expiresAt, maxDownloads, downloadCount, lastUsedAt, revokedAt.
- `taxPackWebhookEvent`: stripeEventId, eventType, receivedAt, processedAt, processingResult.
- `taxPackAuditLog`: orderId, action, ipHash, userAgent, metadataJson, createdAt.

Snapshot requirements:
- Store money values in integer pence in persisted snapshot fields where possible.
- Persist checksum over canonicalized payload to prevent tampering.

## Security Requirements

- Strict Zod validation on all request and response boundaries.
- Origin checks and CSRF-safe write route behavior.
- Rate limits: checkout creation 5 per email per hour and 20 per IP per hour; download grant creation 10 per order per hour and 50 per IP per hour; invalid token attempts trigger temporary IP block.
- Download grant defaults: expiry 7 days, max downloads 5, revocable on refund/dispute or abuse.
- `ipHash` uses SHA-256 with an app secret for stable abuse-correlation without storing raw IPs.
- Never trust client-side payment state.

## Privacy, Tax Data, And Retention

- Data minimization: only persist fields required for paid fulfillment, support, and audit.
- Encrypt sensitive stored payloads/artifacts at rest using platform-managed encryption keys.
- Retention policy: paid order records and associated artifacts retained for 6 years by default (review with legal/accounting before launch); operational logs retain minimum necessary fields and rotate on schedule.
- GDPR operations: support subject access requests and deletion requests for erasable data; if legal retention applies, restrict processing and document the exemption rationale.

## Refund And Dispute Handling

- Handle Stripe refund/dispute webhook events.
- Full refund revokes active download grants.
- Partial refunds do not auto-revoke grants unless explicitly flagged by support policy.
- Audit log records all revocations and manual overrides.
- Support tooling includes order timeline and current entitlement state.

## Operational Policies (V1)

- Failure UX: if generation reaches `failed`, user sees clear failure state with order ID and support path; support can requeue generation or issue refund.
- Email delivery is convenience, not critical path: success page remains the primary delivery surface and supports resend.
- Draft-order cleanup: scheduled job removes abandoned `draft` checkout orders older than 48 hours.
- Version policy: bundle uses template version pinned at generation time and records it in `taxPackArtifact`.
- Regeneration policy: no automatic recalculation drift; re-generation keeps original snapshot unless support triggers a documented override.

## Observability

- Metrics: checkout started, checkout completed, paid, ready, downloaded, webhook failure rate, generation failure rate, retry count.
- Alerts: webhook verification failures, generation job dead-letter queue entries, abnormal refund/dispute rates.
- Tracing and errors instrumented via Sentry.

## Testing Requirements

- Route tests for checkout, webhook verification, idempotency, token abuse, replay, expiry, and revoked grants.
- Integration tests for async generation lifecycle (`paid -> processing -> ready -> download`).
- E2E happy path and failure paths with provider mocks.
- Automated payment tests must use Stripe test mode and environment-specific webhook signing secrets.
- Regression tests must answer: "what bug will this test catch?"

## Rollout Gates

Gate 0: Foundations
- Finalize schema, snapshot contract, legal disclaimer copy, and template sign-off.
- Add feature flag and disabled-by-default UI.

Gate 1: Payments
- Checkout route, signature-verified webhook, idempotent persistence.

Gate 2: Async fulfillment
- Generation worker, object storage upload, status API.

Gate 3: Delivery + recovery
- Download grant flow, resend flow, refund/dispute revocation behavior.

Gate 4: Verification + release
- Full test suite for success and abuse cases.
- Controlled rollout behind feature flag.

## Acceptance Criteria

- Paid users receive a ready bundle within SLA (P95 <= 60s, P99 <= 180s after payment webhook receipt).
- Unpaid users cannot obtain download grants.
- Expired, over-limit, revoked, or invalid tokens are rejected.
- Exported numbers exactly match deterministic Director Intelligence outputs from stored snapshot.
- Webhook retries and duplicate events do not create duplicate paid orders or duplicate fulfillment.
