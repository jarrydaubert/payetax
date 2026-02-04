# Backlog

> **TODO list only.** Delete entries when done.
> If Stripe = £0, monetization items come first.

---

## P0 - Revenue & Trust

### Testing & Coverage
> Mantra: **"What bug will this test find?"** (see `docs/guides/TESTING.md`)

- [ ] For each go-live blocker, add a targeted test, then implement the fix
- [ ] Establish CI gates: `bun run test:no-coverage` + `bun run build` + `bun run test:e2e:critical`
- [ ] Add unit coverage for remaining API routes (email, newsletter, referral, IndexNow)
- [ ] Add more payslip-style regression locks and tighten tolerances where safe
- [ ] Store HMRC source provenance alongside golden master data

### Environment Variables
- [ ] Add `UNSUBSCRIBE_SECRET` to Vercel prod/preview env vars

### Monetization
> See `docs/business/MONETIZATION.md`

- [ ] Validate referrals: talk to 5 accountants
- [ ] Track "this is complex" clicks as a demand signal
- [ ] Secure a paying referral partner
- [ ] Enable referral CTA in `src/components/organisms/CalculatorContainer.tsx`

---

## P1 - Approved Features

### Compare My Setup
- [ ] Implement Always-On Custom Row (spec in `docs/business/DIRECTOR_CALCULATOR_BUILD.md`)

---

## P2 - Product & UX

### Missing OG Images
- [ ] Create `public/images/og/compliance.jpg`
- [ ] Create `public/images/og/privacy.jpg`
- [ ] Audit other pages for missing OG images
- [ ] Consider Next.js `opengraph-image.tsx` for dynamic generation

### Tools Directory Audit
- [ ] Add nav links to marriage-allowance and NI calculators
- [ ] Update MarriageAllowanceAlert to link to internal tool

### Analytics Events
- [ ] Add: `pro_calculator_started`, `pro_calculator_completed`, `pro_strategy_selected`, `pro_calendar_downloaded`

### Cache MDX Compilation
- [ ] Wrap `compileMDXContent` with `unstable_cache` keyed by `slug` + `updatedAt`
- [ ] Match ISR window for revalidation

### Email Endpoints - Trust Boundary
- [ ] Recompute results server-side from minimal inputs
- [ ] Update email forms to submit inputs instead of results
- [ ] Add tests for both email routes

### Security Docs
- [ ] Document per-route validation approach
- [ ] Document per-route body size limits
- [ ] Document that `bun audit` requires network access

### Audit Hygiene
- [ ] Fix `src/lib/__tests__/taxCalculator.hmrcVerification.test.ts` header comment for Plan 4 threshold
- [ ] Add a repeatable bundle-size verification step

### Design Tokens - Shadow Accent Glow
- [ ] Add `shadow-accent-glow` to Tailwind config and update token usage

### StructuredData - Tax Rates API
- [ ] Create `/api/tax-rates` endpoint and use it in structured data

### Golden Master Test IDs
- [ ] Verify E2E test IDs exist; add missing ones as needed (e.g., HICBC children input)

### PWA Install Documentation
- [ ] Add `/install` page with platform instructions and screenshots
- [ ] Add FAQ entry: "Can I use PayeTax offline?"
- [ ] Consider install prompt/banner

### Calculator Store Cleanup
- [ ] Extract Zod schemas to module scope to reduce churn
- [ ] Review remaining prod `console.warn` paths (dev-only)
- [ ] Add tests for persistence/expiry edge cases

### Income Sources Accuracy
- [ ] Verify other income affects PA taper, dividend allowance, and student loan thresholds
- [ ] If not verified, hide or guard those inputs

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
