# Backlog

> **TODO list only.** Delete entries when done.
> If Stripe = £0, monetization items come first.
> Ordered by the Director Guide go-live plan (Phase 1 → Phase 3), then post-go-live priorities.

---

## Phase 1 — Go-live blockers (P0)
---

## Phase 2 — Product polish (pre-ship)

### Performance + token cleanup
- [ ] Wrap `compileMDXContent` with `unstable_cache` keyed by `slug` + `updatedAt`
- [ ] Match ISR window for revalidation
- [ ] Add `shadow-accent-glow` to Tailwind config and update token usage

### Security docs + audit hygiene
- [ ] Document per-route validation approach
- [ ] Document per-route body size limits
- [ ] Document that `bun audit` requires network access
- [ ] Fix `src/lib/__tests__/taxCalculator.hmrcVerification.test.ts` header comment for Plan 4 threshold
- [ ] Add a repeatable bundle-size verification step

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
