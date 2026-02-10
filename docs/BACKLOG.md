# Backlog

> **TODO list only.** Delete entries when done.
> If Stripe = £0, monetization items come first.
> Ordered by the Director Guide go-live plan (Phase 1 → Phase 3), then post-go-live priorities.

---

## Phase 1 — Go-live blockers (P0)
---

## Phase 2 — Product polish (pre-ship)

### Security docs + audit hygiene
- [ ] Document per-route validation approach
- [ ] Document per-route body size limits
- [ ] Document that `bun audit` requires network access
- [ ] Fix `src/lib/__tests__/taxCalculator.hmrcVerification.test.ts` header comment for Plan 4 threshold
- [ ] Add a repeatable bundle-size verification step

### Styling consistency sweep
- [ ] Replace remaining hardcoded `slate-*`/`#...` page palette usage with semantic theme tokens where possible
- [ ] Audit remaining raw interactive controls (`<button>`, styled links) and migrate to shadcn `Button`/primitives or document exceptions

---

## Phase 3 — QA & ship

- [ ] Run: `bun run test:no-coverage`
- [ ] Run: `bun run build`
- [ ] Run: `bun run test:e2e:critical`
- [ ] Smoke: calculator, director guide, blog, OG previews
- [ ] Push feature branch, prep release notes

---

## Post-go-live (Revenue & Trust follow-ups)

### Monetization
> See `docs/business/MONETIZATION.md`

- [ ] Validate referrals: talk to 5 accountants
- [ ] Track "this is complex" clicks as a demand signal
- [ ] Secure a paying referral partner
- [ ] Enable referral CTA in `src/components/organisms/CalculatorContainer.tsx`

### Testing & Coverage
> Mantra: **"What bug will this test find?"** (see `docs/guides/TESTING.md`)

- [ ] Add unit coverage for remaining API routes (newsletter, referral, IndexNow)
- [ ] Add more payslip-style regression locks and tighten tolerances where safe
- [ ] Store HMRC source provenance alongside golden master data

### Calculator Store Cleanup
- [ ] Extract Zod schemas to module scope to reduce churn
- [ ] Review remaining prod `console.warn` paths (dev-only)
- [ ] Add tests for persistence/expiry edge cases

### Income Sources Accuracy
- [ ] Verify other income affects PA taper, dividend allowance, and student loan thresholds
- [ ] If not verified, hide or guard those inputs

---

## P1 - Approved Features

### Compare My Setup
- [ ] Implement Always-On Custom Row (spec in `docs/business/DIRECTOR_CALCULATOR_BUILD.md`)

### Director Guide - 90% Coverage
- [ ] Add dual What-If controls: `Salary` (change extraction at current company performance) and `Company Revenue/Profit` (see how higher/lower company performance changes outputs)
- [ ] Define a clear UX for the dual What-If flow so users always know which scenario they are editing (current vs simulated)
- [ ] Ensure What-If revenue/profit updates all downstream outputs consistently (strategy cards, summary cards, detail cards, tax pots, warnings, key dates)
- [ ] Unify slider/scenario math with baseline strategy math so advanced inputs are applied identically (`hasOtherPAYEEmployment`, `lossesBroughtForward`, `minimumSalaryRequirement`, etc.)
- [ ] Add regression tests that compare baseline vs slider/What-If paths for the same inputs and fail on mismatches
- [ ] Add a lightweight "Quick Start" path for first-time directors (minimum required inputs first, advanced fields progressive)
- [ ] Update Welcome dialog copy to remove stale "Coming soon" items that are already live
- [ ] Prioritize implementation of high-impact known limitations called out in Learn panel (start with Class 1A NI on BIK and associated-company CT threshold adjustments)

---

## P3 - Long-term

### Tax Rates Data Model Improvements
- [ ] Standardize rate units
- [ ] Replace `Infinity` with JSON-safe bounds
- [ ] Derive `TaxYear` type from rates
- [ ] Add schema validation tests for band ordering/rate ranges
- [ ] Make NI threshold units explicit

### Design Tokens Architecture
- [ ] Compose duplicate tokens from primitives
- [ ] Add `cxTokens()` helper
- [ ] Add semantic token layer
- [ ] Add Tailwind audit guard for invalid classes

### Chrome Extension Backlink
- [ ] Build minimal extension and listing
- [ ] Validate dofollow link after publish

### FAQ/AEO Architecture
- [ ] Server-render FAQ + schema
- [ ] Derive numbers from `taxRates.ts` and calculations

### Idea Inbox (Uncommitted)
- [ ] Validate demand for an embeddable calculator widget (HR/recruiters/finance blogs) before building
- [ ] Evaluate a lead magnet newsletter (checklist/guide) with explicit consent and unsubscribe compliance
- [ ] Explore Marriage Allowance toggle with strict eligibility and regional handling
- [ ] Explore PDF export with workings and a clear informational-use disclaimer
