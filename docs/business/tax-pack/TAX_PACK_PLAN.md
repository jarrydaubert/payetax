# Tax Pack V1 Plan

Status: Planned
Owner: Product + Engineering
Primary route: `/tools/director-guide`

## Goal

Ship a paid, deterministic export bundle for Director Guide users who want accountant-ready records.

## Scope (V1)

In scope:
- Director Guide scenarios only (salary/dividend extraction outcomes)
- One-time purchase via Stripe Checkout
- Download bundle containing:
  - Tax summary PDF
  - Annual schedule CSV
  - Board minutes DOCX template
  - Dividend voucher DOCX template
- Secure re-download link (expiring token)
- Post-purchase email via Resend

Out of scope:
- CGT calculations
- Crypto tax calculations
- Self Assessment filing automation
- Accounting platform integrations
- Multi-company consolidation

## Product Rules

- All numeric outputs must come from deterministic calculator outputs only.
- No AI-authored tax figures.
- If export payload validation fails, do not issue bundle.
- Payment proof is mandatory before download access.

## User Flow

1. User completes Director Guide.
2. User clicks `Get Tax Pack`.
3. Server creates Stripe Checkout session.
4. Stripe webhook confirms payment.
5. Server stores paid export session + deterministic payload snapshot.
6. User receives success page + immediate download.
7. User receives email with expiring re-download link.

## Technical Design (V1)

Server routes:
- `POST /api/tax-pack/checkout`
- `POST /api/tax-pack/webhook`
- `GET /api/tax-pack/download/[token]`

Data model (minimum):
- `taxPackOrder`: id, stripeSessionId, email, status, createdAt
- `taxPackPayload`: orderId, payloadVersion, taxYear, payloadJson, checksum
- `taxPackDownloadToken`: orderId, tokenHash, expiresAt, usedAt

Security:
- Origin checks on write routes
- Strict Zod validation on request/response payloads
- Rate limiting on checkout/download creation
- Signed or hashed single-use/expiring download token
- Never trust client-side payment state

## Rollout Gates

Gate 0: Foundations
- Finalize schema + payload contract + template content
- Add feature flag and disabled-by-default UI

Gate 1: Payments
- Checkout route + webhook verification + order persistence

Gate 2: Bundle generation
- PDF/CSV/DOCX generation and ZIP delivery
- Deterministic payload snapshot + checksum

Gate 3: Recovery + email
- Re-download token flow + resend email delivery

Gate 4: Verification + release
- Route tests, E2E purchase flow, failure-path tests
- Enable feature flag for controlled rollout

## Acceptance Criteria

- Paid users can download a valid bundle within one minute of successful payment.
- Unpaid users cannot access downloads.
- Expired/invalid tokens are rejected.
- Exported numbers exactly match deterministic Director Guide outputs.
- All new Tax Pack routes have tests for success and abuse cases.

