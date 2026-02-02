# Backlog

> **This is a TODO list only.** When done, delete it.
> If Stripe = £0, monetization items come first.

---

## Recurring / Floating Items

> Keep these as reminders - not one-time tasks

### Monthly: Review Marketing Skills Repo
- Check https://github.com/coreyhaines31/marketingskills for updates
- Compare VERSIONS.md against our local skills in `.claude/skills/`
- Pull in new versions if 2+ skills updated or major version bump
- Consider adding new skills that become relevant (e.g., ab-test-setup, email-sequence)

### After Each HMRC/Gov Budget Change
- Review ALL blog posts for outdated tax rates, thresholds, and allowances
- Update `publishedAt` / `updatedAt` dates on affected posts
- Check director-related posts especially (salary thresholds, dividend allowance, CT rates)
- Verify calculator constants in `src/constants/taxRates.ts` are updated first
- Key posts to check: director guides, £100k tax trap, Scottish rates comparison, student loans

---

## P0 - Revenue & Trust

### Testing & Coverage Reality Check (2026-02-02)
> Capture the current state so we don’t “feel” safe without evidence.
> Mantra: **"What bug will this test find?"** (see `docs/guides/TESTING.md`)

**Current (Jest coverage run on 2026-02-02):**
- Statements/Lines: **57.63%** (27,947 / 48,487)
- Branches: **76.90%** (1,848 / 2,403)
- Functions: **62.36%** (406 / 651)
- Note: Playwright E2E coverage is NOT counted in Jest coverage numbers.

**Known gaps / risks:**
- API routes have ~0 unit coverage (email endpoints, newsletter, referral, webhook, OG, IndexNow)
- Director Guide has no Playwright E2E flows (only unit-level coverage)
- Rounding trust: only a small number of payslip-style regression locks exist
- “Golden master” is a strong regression oracle, but HMRC source provenance isn’t stored in-repo

**Plan (test-first for every blocker):**
- [ ] For each go-live blocker, add 1 targeted test that would catch it, then implement the fix
- [ ] Decide PR gates (fast): `bun run test:no-coverage` + `bun run build` + `bun run test:e2e:critical`
- [ ] Bring `bun test` (coverage) back to a reliable gate:
  - Option A: add high-signal tests for the highest-risk 0%-covered code (API routes)
  - Option B: narrow coverage scope/thresholds so it reflects business-risk code instead of marketing pages

### Blog Numbers Audit (Calculator-Verified)
> Numbers only. Use `src/lib/taxCalculator.ts` + `src/constants/taxRates.ts` as source of truth.
> Update any factual sentence if it becomes incorrect after recalculation.

- [x] `content/blog/100k-company-profit-director-take-home-2025-26.mdx`
- [x] `content/blog/100k-tax-trap-avoid-60-percent-tax-2025.mdx`
- [x] `content/blog/autumn-budget-2025-uk-tax-changes-explained.mdx`
- [x] `content/blog/beginners-guide-to-uk-taxation.mdx`
- [x] `content/blog/director-salary-dividends-guide-2025-26.mdx`
- [x] `content/blog/director-salary-vs-dividends-comparison-2025-26.mdx`
- [x] `content/blog/director-tax-deadlines-2025-26.mdx`
- [x] `content/blog/frozen-tax-thresholds-stealth-tax-2026.mdx`
- [x] `content/blog/higher-rate-taxpayer-guide-uk-2025.mdx`
- [x] `content/blog/how-much-tax-will-i-pay-uk-2025.mdx`
- [x] `content/blog/how-national-insurance-works-uk-2025.mdx`
- [ ] `content/blog/marriage-allowance-uk-2025-guide.mdx`
- [ ] `content/blog/pension-tax-relief-uk-2025-guide.mdx`
- [ ] `content/blog/salary-sacrifice-explained-2025-26.mdx`
- [ ] `content/blog/scottish-vs-english-tax-rates-2026-comparison.mdx`
- [ ] `content/blog/self-assessment-deadline-january-2026-what-you-need-to-know.mdx`
- [ ] `content/blog/setting-up-limited-company-uk-2025-26.mdx`
- [ ] `content/blog/spring-statement-2026-uk-what-to-expect.mdx`
- [ ] `content/blog/student-loan-repayment-changes-2025-26.mdx`
- [ ] `content/blog/uk-tax-calculator-2025-complete-guide.mdx`
- [ ] `content/blog/uk-tax-changes-2025-complete-guide.mdx`
- [ ] `content/blog/understanding-the-uk-tax-system-2025.mdx`
- [ ] `content/blog/understanding-uk-tax-codes.mdx`
- [x] `content/blog/what-100k-salary-actually-looks-like-uk-2025.mdx`
- [x] `content/blog/what-40k-salary-actually-looks-like-uk-2025.mdx`
- [x] `content/blog/what-50k-salary-actually-looks-like-uk-2025.mdx`
- [x] `content/blog/what-60k-salary-actually-looks-like-uk-2025.mdx`
- [x] `content/blog/what-70k-salary-actually-looks-like-uk-2025.mdx`
- [x] `content/blog/what-80k-salary-actually-looks-like-uk-2025.mdx`
- [ ] `content/blog/year-end-tax-planning-2025-26-complete-checklist.mdx`

### Director Guide Go-Live (Spec-First)
> Go-live blockers and acceptance criteria are tracked in `docs/business/DIRECTOR_GUIDE_GO_LIVE_PLAN.md`.

- [ ] Execute the spec-first go-live plan (VAT warning-only, Survival Mode panel, VAT warnings ungated, Plan 5 gating, analytics wiring, email de-drift, `/tools` breadcrumb fix)

### Environment Variables Needed
> New security features require env vars

- [ ] Add `UNSUBSCRIBE_SECRET` to Vercel production/preview env vars (random 32+ char string)
- Without this, unsubscribe tokens use a default secret (less secure)

### Monetization
> Stripe = £0. Fix that first. See `docs/business/MONETIZATION.md`.

**Distribution (daily):**
- [ ] 1 LinkedIn post per day (value-first, show calculator in action)
- [ ] Engage with SME director communities

**Validation:**
- [ ] Talk to 5 accountants - would they pay for referrals?
- [ ] Track "this is complex" clicks - demand signal

**Enable (after validation):**
- [ ] Find accountant partner willing to pay per lead
- [ ] Enable referral CTA - uncomment in `CalculatorContainer.tsx` line ~238

**Dormant code (built, not used):**
- `src/components/molecules/AccountantReferralCTA.tsx` - referral CTA component
- `src/app/api/referral/lead/route.ts` - captures leads, emails to partner

### Other Income Input
> "Assumes this is your only income" footnote is NOT sufficient - can be wrong by thousands

- [ ] Add "Is this your only income?" Yes/No toggle
- [ ] Add optional "Roughly how much? £____" field
- [ ] If "No/Not sure", show warning: "Personal tax numbers may be too low"
- [ ] Add helper text: "Redundancy: only amount over £30,000 counts"

### Missing Tests
> New pro tool files have NO test coverage - high risk

- [ ] Implement tests in `src/lib/tax/__tests__/directorCalculator.spec.ts`
- [ ] Tighten golden example tolerances (currently ±30%, should be ±£100)
- [ ] Test other income scenarios (band consumption, PA taper)

### Tax Code Validation - Welsh & Scottish Prefixes
> Current validation rejects valid Welsh and Scottish tax codes

- [ ] Add Welsh `C` prefix support (e.g., `C1257L`)
- [ ] Add prefixed special codes: `SBR`, `SD0`, `SD1`, `SNT`, `CBR`, etc.
- [ ] Consider delegating to `decodeTaxCode()` if already robust
- [ ] Test: `C1257L`, `SBR`, `SD0W1`, `CK100`

### Marriage Allowance Net-Saving Calculation
> Current calculation oversimplified - can show wrong savings

- [ ] Transferor near PA (£11,310-£12,570) loses partial benefit - net saving < £252
- [ ] Scottish recipient has different higher-rate threshold
- [ ] Compute actual net saving: `recipientSaving - transferorAdditionalTax`
- [ ] Show "estimated saving: £X" instead of fixed "£252"

---

## P1 - Approved Features

### Compare My Setup (APPROVED)
> Option B (Always-On Custom Row) unanimously selected by 4 reviewers.
> Full spec: `docs/business/DIRECTOR_CALCULATOR_BUILD.md` → "Feature: Compare My Setup Mode"

---

## P2 - Lower Priority

### Missing OG Images
> Several pages reference OG images that may not exist

- [ ] Create `/public/images/og/compliance.jpg` for compliance page
- [ ] Create `/public/images/og/privacy.jpg` for privacy page
- [ ] Audit other pages for missing OG images
- [ ] Consider using Next.js `opengraph-image.tsx` file convention for dynamic generation

### Tools Directory Audit
- [ ] Create `/tools/page.tsx` index page
- [ ] Add navigation links to orphaned tools (marriage-allowance, NI calculator)
- [ ] Update MarriageAllowanceAlert to link to internal tool instead of gov.uk

### Analytics Events
- [ ] Add: `pro_calculator_started`, `pro_calculator_completed`, `pro_strategy_selected`, `pro_calendar_downloaded`

### Cache MDX Compilation with unstable_cache
> `compileMDXContent()` is expensive and runs on every cold regeneration

- [ ] Wrap `compileMDXContent` with `unstable_cache` keyed by `slug` + `updatedAt`
- [ ] Set `revalidate: 86400` to match ISR window
- [ ] Avoid recompiling MDX when post content hasn't changed

### Director Email Template - Use taxRates.ts
> `send-director-results/route.ts` has hardcoded `TAX_THRESHOLDS` that can drift from source of truth

- [ ] Import thresholds from `src/constants/taxRates.ts` instead of hardcoding
- [ ] Ensure email template updates automatically when rates change
- [ ] Apply escapeHtml to all string interpolations (strategy.name, taxYear, generatedDate) (treat as real HTML injection risk, not just defense-in-depth)
- [ ] Compute Self Assessment deadline dynamically from taxYear (currently hardcoded "31 Jan 2027")

### Email Endpoints - Trust Boundary
> Both `/api/send-results` and `/api/send-director-results` accept client-computed results

- [ ] Consider implementing signed payload pattern for email endpoints
- [ ] Alternative: Recompute results server-side from minimal inputs (grossSalary, taxCode, etc.)
- [ ] This prevents users from forging "official" looking tax reports with fabricated numbers

### Rate Limiting Coverage Gaps
> Some endpoints are not rate-limited (by design today). Confirm that's acceptable.

- [ ] Decide whether to add rate limiting to `/api/og` (currently none) to prevent abuse (expensive image generation)
- [ ] Decide whether to add rate limiting to `/api/sentry-webhook` (currently signature-only; no per-IP throttle)

### Security Audit Claim Fixups (Documentation)
> Keep internal security docs accurate: not all routes are Zod-validated, and body limits vary by route.

- [ ] Document per-route validation approach (Zod vs manual vs token verification) to avoid future audit overclaims
- [ ] Document per-route body size limits (e.g., sentry-webhook 1MB vs others 1-50KB; GET endpoints N/A)
- [ ] Document that `bun audit` requires network access; avoid claiming "no vulnerabilities" without a live run

### Audit / Verification Hygiene
> Keep internal docs and tests consistent so third-party audits don't drift.

- [ ] Fix `src/lib/__tests__/taxCalculator.hmrcVerification.test.ts` header comment mismatch for Student Loan Plan 4 threshold (comment says £31,395 but `taxRates.ts` uses £32,745 for 2025-26)
- [ ] Replace `as any` casts in `src/components/organisms/CalculatorInputs/BasicInputs.tsx` with proper typing (remove biome-ignore if possible)
- [ ] Add a repeatable bundle-size verification step (e.g., build + analyzer report) so claims like “-571KB” are evidence-backed

### Design Tokens - Shadow Accent Glow
> TODO in `src/constants/designTokens.ts:506`

- [ ] Consider adding shadow-accent-glow to tailwind.config.ts for consistent usage

### StructuredData - Tax Rates API
> TODO in `src/components/organisms/StructuredData.tsx:515`

- [ ] Create `/api/tax-rates` endpoint before enabling distribution field in structured data

### Golden Master Test IDs
> E2E tests updated to use testids but some may not exist in UI components

- [ ] Verify these test IDs exist in calculator components:
  - `region-select` - region dropdown
  - `tax-code-input` - tax code field
  - `married-checkbox` - marriage allowance toggle
  - `partner-salary-input` - partner salary field
  - `children-input` - children count for HICBC
- [ ] Add missing test IDs to respective components
- [ ] Run `bun run test:e2e` to verify golden master passes

### Blog Post Calculator Verification
> Scottish vs English tax blog updated with manual calculations - should verify against live calculator

- [ ] Run calculator for £25k, £35k, £50k, £75k, £100k, £150k (both Scotland and England)
- [ ] Compare outputs against blog post figures
- [ ] Update blog if any discrepancies found
- [ ] Consider adding "Verified with PayeTax Calculator" badge/note



### PWA Install Documentation
> Users may not know they can install PayeTax as an app for offline use

- [ ] Add "/install" or "/app" page with install instructions
- [ ] Cover: iOS Safari (Add to Home Screen), Android Chrome, Desktop Chrome/Edge/Firefox
- [ ] Include screenshots for each platform
- [ ] Mention offline capabilities and benefits
- [ ] Consider adding install prompt/banner on homepage for eligible browsers
- [ ] Add FAQ entry: "Can I use PayeTax offline?"

### Calculator Store Cleanup
> `src/store/calculatorStore.ts` has accumulated tech debt

- [ ] Extract Zod schemas to module scope (reduces bundle churn from recreating schemas in every setter)
- [ ] Normalize tax year to single internal format (currently accepts both `YYYY-YY` and `YYYY-YYYY`)
- [ ] Consider `setInput(partial: Partial<CalculatorInput>)` action for atomic multi-field updates
- [ ] Gate remaining `console.warn` calls for dev-only (some still log in prod)

### DirectorGuideStore Expiry Fires Analytics
> `onRehydrateStorage` calls `reset()` which tracks analytics - expiry shouldn't count as user intent

- [ ] Add internal `clearStaleState()` that doesn't track
- [ ] Or add `reset({ silent: true })` option
- [ ] Use silent reset on expiry, track only on explicit user reset

### StructuredData Key Collision Risk
> Multiple schemas of same `@type` will have colliding React keys

- [ ] Change key to always include index: `key={\`structured-data-${schema['@type']}-${index}\`}`
- [ ] File: `src/components/organisms/StructuredData.tsx`

### Calculator Store Tax Year Expiry
> Users can return months later still on old tax year silently

- [ ] Add `_savedAt` timestamp to persisted state
- [ ] Auto-bump tax year if current year changed since saved
- [ ] Or expire after N days
- [ ] Reuse pattern from `directorGuideStore`

### Income Sources Correctness Warning
> `incomeSources` in store but `calculateTax` may not handle correctly for PA taper/NI/student loans

- [ ] Show warning banner when `incomeSources.length > 0` until engine verified
- [ ] Or hide income source inputs until core calculation is correct
- [ ] Verify: other income affects PA taper, dividend allowance consumption, student loan threshold

### formatBlogTitle Regex Issues
> Word boundary issues in title formatting

- [ ] `.replace(/2026/g, '2026')` is a no-op - remove or fix
- [ ] `.replace(/Uk/g, 'UK')` can mangle words like "Dukes" → "DUKes"
- [ ] Use word boundaries: `/\bUk\b/g`
- [ ] File: `src/lib/blog/utils.ts` or similar

### Tax Rates Data Model Improvements
> Reduce drift and prevent silent math bugs

- [ ] Standardize rate units: all decimals (0.2) or all integers (20) - currently mixed
- [ ] Replace `Number.POSITIVE_INFINITY` with `null` or `MAX_SAFE_INTEGER` for JSON safety
- [ ] Derive `TaxYear` type from `TAX_RATES` keys using `keyof typeof`
- [ ] Add Zod schema validation in tests (bands increasing, rates in range, etc.)
- [ ] Make NI threshold units explicit (`annualThreshold` naming or store all periods)

### Design Tokens Architecture
> Reduce drift and improve maintainability

- [ ] Compose duplicate tokens from primitives to avoid drift:
  - `LAYOUT.SECTION` should reference `SPACING.PY_SECTION`
  - `SURFACES.CARD_*` should compose from `BORDER_STANDARD` + spacing + shape tokens
- [ ] Add `cxTokens()` helper for safe token composition (prevents double spaces)
- [ ] Move glow shadows to tailwind.config.ts (`shadow-accent-glow`) instead of arbitrary values
- [ ] Replace hardcoded rgba in `SHADOWS.GLOW_ACCENT` with CSS variable (`rgb(var(--accent-rgb)/0.4)`)
- [ ] Add compile-time guard in audit script to catch invalid Tailwind classes (like z-35 before fix)
- [ ] Create semantic tokens layer (`TEXT_BODY`, `TEXT_LABEL`, `CARD`, `PANEL`) composed from primitives

### FAQ/AEO Architecture - Server-Rendered Schema & Single Source of Truth
> CalculatorContent.tsx FAQ section has structural issues for SEO/AEO

**Problems:**
- `'use client'` component means FAQ schema may not appear in initial HTML for crawlers
- FAQItem component is just `<details>` - no JSON-LD schema output
- Hard-coded tax figures can drift from `taxRates.ts` source of truth
- Worked examples (e.g., £30k salary) computed manually, can become stale

**Recommended Architecture:**
- [ ] Create `src/data/faqs.ts` data module with FAQ question/answer pairs
- [ ] Pull numeric constants from `taxRates.ts` into FAQ templates
- [ ] Generate worked examples using actual calculator functions (e.g., `calculateTax()`)
- [ ] Create server component `FAQSection` that renders:
  - Plain HTML FAQ content (SSR'd)
  - Single `<script type="application/ld+json">` for FAQPage schema
- [ ] Keep motion/animations in thin client wrapper around already-rendered content
- [ ] Add "Last verified: {taxYear}" timestamp sourced from constants

**Files affected:**
- `src/components/organisms/CalculatorContent.tsx` - refactor FAQ section
- `src/components/molecules/FAQItem.tsx` - keep as presentation only
- `src/data/faqs.ts` (new) - FAQ data with templates
- `src/components/organisms/FAQSchema.tsx` (new) - server component for JSON-LD
