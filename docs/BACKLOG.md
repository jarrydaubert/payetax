# Backlog

> **TODO list only.** Delete entries when done.
> Ordered by criticality from highest to lowest.
> If Stripe = £0, monetization items come first.

---

## P0 — Core Business Outcomes

### Tax Pack V1 (Monetization)
> See `docs/business/MONETIZATION.md`

- [ ] Tax Pack V1: add feature flag + CTA placement in Director Guide results flow
- [ ] Tax Pack V1: implement server-owned Stripe Checkout session route (price + automatic tax configured server-side)
- [ ] Tax Pack V1: implement signature-verified, idempotent webhook processing with event dedupe persistence
- [ ] Tax Pack V1: define/export validated snapshot schema (deterministic numbers, integer pence, checksum, version fields)
- [ ] Tax Pack V1: include distributable-profits check result in snapshot and generated documents
- [ ] Tax Pack V1: build async generation worker (PDF/CSV/DOCX/ZIP) with retries, dead-letter, and `failed` state handling
- [ ] Tax Pack V1: persist artifacts in private object storage with template version tracking
- [ ] Tax Pack V1: implement order status endpoint and success-page polling flow (`pending_payment`, `processing`, `ready`, `failed`)
- [ ] Tax Pack V1: implement download grant model (7-day expiry, max 5 downloads, revocation, invalid-attempt throttling)
- [ ] Tax Pack V1: issue fresh 5-minute object-storage signed URL on each valid download request
- [ ] Tax Pack V1: implement email delivery + resend flow where email is non-critical path
- [ ] Tax Pack V1: implement refund/dispute webhooks (full refund revoke, partial refund policy handling)
- [ ] Tax Pack V1: add draft-order cleanup job for abandoned checkouts older than 48 hours
- [ ] Tax Pack V1: add route/integration tests for checkout, webhook idempotency, generation failure, grants, replay, expiry, and revocation
- [ ] Tax Pack V1: add E2E purchase/download flow with provider mocks in Stripe test mode

### Release Gates
- [ ] Run: `bun run test:no-coverage`
- [ ] Run: `bun run build`
- [ ] Run: `bun run test:e2e:critical`
- [ ] Smoke: calculator, director guide, blog, OG previews
- [ ] Push feature branch, prep release notes

### Accuracy Guards
- [ ] Verify other income affects PA taper, dividend allowance, and student loan thresholds
- [ ] If not verified, hide or guard those inputs
- [ ] Director Guide: add explicit assumptions panel clarifying salary/dividend mix is scenario-dependent (not a fixed "salary to employer NI threshold" rule)
- [ ] Director Guide: add MTD for Income Tax scope/timeline note (starts 6 Apr 2026 for qualifying self-employment/property income over threshold; clarify PAYE/dividends treatment)

---

## P1 — Growth + Revenue Ops

### Referral Rollout
- [ ] Validate referrals: talk to 5 accountants
- [ ] Track "this is complex" clicks as a demand signal
- [ ] Secure a paying referral partner
- [ ] Enable referral CTA in `src/components/organisms/CalculatorContainer.tsx`

### Organic SEO + Blog Engine
- [ ] Ensure each new blog post has a primary CTA to calculator/director guide
- [ ] Ensure each new blog post has a secondary CTA to newsletter signup
- [ ] Keep blog-to-money-page internal links healthy (calculator, director guide, compliance)
- [ ] Run subscriber announcement flow for newly published posts
- [ ] Review funnel metrics: sessions -> `calculator_start` -> `calculator_completion` -> monetization click

### Compare My Setup
- [ ] Add explicit `Edit setup` flow with clear `Apply`, `Reset`, and `Clear` actions (no forced prefill from optimal)
- [ ] Director Guide: add objective toggle (`Maximize take-home` vs `Minimize NI`) and show tradeoff deltas across strategies

---

## P2 — Quality Hardening

### Testing & Coverage
> Mantra: **"What bug will this test find?"** (see `docs/guides/TESTING.md`)

- [ ] Add more payslip-style regression locks and tighten tolerances where safe
- [ ] Store HMRC source provenance alongside golden master data

### Calculator Store Cleanup

---

## P3 — Optional

### Idea Inbox (Lean)
- [ ] Validate demand for an embeddable calculator widget (HR/recruiters/finance blogs) before building
