# Backlog

> **TODO list only.** Delete entries when done.
> Ordered by criticality from highest to lowest.
> If Stripe = £0, monetization items come first.

---

## P0 — Core Business Outcomes

### Tax Pack V1 (Monetization)
> See `docs/business/MONETIZATION.md`

- [ ] Tax Pack V1: add feature flag + CTA placement in Director Guide results flow
- [ ] Tax Pack V1: create Stripe Checkout session API route
- [ ] Tax Pack V1: add webhook verification + paid session persistence
- [ ] Tax Pack V1: define validated export payload schema (deterministic numbers only)
- [ ] Tax Pack V1: generate bundle artifacts (PDF summary, CSV schedule, board minutes DOCX, dividend voucher DOCX)
- [ ] Tax Pack V1: package/download ZIP and add expiring re-download token flow
- [ ] Tax Pack V1: send post-purchase email with secure re-download link
- [ ] Tax Pack V1: add route-level tests (checkout, webhook, download auth, replay/expiry)
- [ ] Tax Pack V1: add E2E happy-path purchase/download flow with provider mocks

### Release Gates
- [ ] Run: `bun run test:no-coverage`
- [ ] Run: `bun run build`
- [ ] Run: `bun run test:e2e:critical`
- [ ] Smoke: calculator, director guide, blog, OG previews
- [ ] Push feature branch, prep release notes

### Accuracy Guards
- [ ] Verify other income affects PA taper, dividend allowance, and student loan thresholds
- [ ] If not verified, hide or guard those inputs

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
- [ ] Track and review funnel metrics: sessions -> calculator start -> completion -> monetization click

### Security Docs + Audit Hygiene
- [ ] Document per-route validation approach
- [ ] Document per-route body size limits
- [ ] Document that `bun audit` requires network access
- [ ] Fix `src/lib/__tests__/taxCalculator.hmrcVerification.test.ts` header comment for Plan 4 threshold
- [ ] Add a repeatable bundle-size verification step

### Compare My Setup
- [ ] Add explicit `Edit setup` flow with clear `Apply`, `Reset`, and `Clear` actions (no forced prefill from optimal)

---

## P2 — Quality Hardening

### Testing & Coverage
> Mantra: **"What bug will this test find?"** (see `docs/guides/TESTING.md`)

- [ ] Add more payslip-style regression locks and tighten tolerances where safe
- [ ] Store HMRC source provenance alongside golden master data

### Calculator Store Cleanup
- [ ] Extract Zod schemas to module scope to reduce churn
- [ ] Review remaining prod `console.warn` paths (dev-only)

---

## P3 — Optional

### Idea Inbox (Lean)
- [ ] Validate demand for an embeddable calculator widget (HR/recruiters/finance blogs) before building
