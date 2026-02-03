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
- Rounding trust: only a small number of payslip-style regression locks exist
- “Golden master” is a strong regression oracle, but HMRC source provenance isn’t stored in-repo

**Plan (test-first for every blocker):**
- [ ] For each go-live blocker, add 1 targeted test that would catch it, then implement the fix
- [ ] Decide PR gates (fast): `bun run test:no-coverage` + `bun run build` + `bun run test:e2e:critical`
- [ ] Bring `bun test` (coverage) back to a reliable gate:
  - Option A: add high-signal tests for the highest-risk 0%-covered code (API routes)
  - Option B: narrow coverage scope/thresholds so it reflects business-risk code instead of marketing pages

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

- [ ] Tighten golden example tolerances (currently ±30%, should be ±£100)

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
- [ ] Add navigation links to orphaned tools (marriage-allowance, NI calculator)
- [ ] Update MarriageAllowanceAlert to link to internal tool instead of gov.uk

### Analytics Events
- [ ] Add: `pro_calculator_started`, `pro_calculator_completed`, `pro_strategy_selected`, `pro_calendar_downloaded`

### Cache MDX Compilation with unstable_cache
> `compileMDXContent()` is expensive and runs on every cold regeneration

- [ ] Wrap `compileMDXContent` with `unstable_cache` keyed by `slug` + `updatedAt`
- [ ] Set `revalidate: 86400` to match ISR window
- [ ] Avoid recompiling MDX when post content hasn't changed

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

- [ ] Add missing `children-input` test ID for HICBC children count input
- [ ] Run `bun run test:e2e` to verify golden master passes

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

### Chrome Extension for Backlink (SEO)
> Chrome Web Store has DR 99+ and gives dofollow "developer website" link. Competition is very low - no dedicated UK PAYE calculator extensions as of 2026.

**Why this works for PayeTax:**
- High-authority dofollow backlink from DR 99+ domain (confirmed on live pages like Grammarly's in 2026)
- Referral traffic from store → trackable in GA
- Organic discovery (people search store for tax tools)
- Seasonal spikes around tax year end (January–April) and job changes
- User conversion funnel: free extension → upsell full web app

**Suggested extension (popup-based, Manifest V3):**
- Inputs: Salary (annual/monthly/weekly), tax code (default 1257L), pension %, student loan plan, Scottish toggle
- Outputs: Tax, NI, take-home, effective rate (2025/26 rates)
- Quick presets: "Minimum wage", "Average UK salary"
- Traffic boosters:
  - Button: "Use full version on our website"
  - Footer: "Powered by PayeTax – advanced features at payetax.co.uk"
  - Complex cases: "For dividends/self-employment, try our full calculator"

**Listing optimization:**
- Title: "UK PAYE Tax Calculator 2025/26 – Take Home Pay & NI"
- Description: Keyword-rich, mention accuracy, updates, link to full site
- Screenshots/video: Demo calculations
- Category: Productivity or Finance

**Launch steps:**
- [ ] Pay $5 one-time fee at Chrome Web Store Developer Dashboard
- [ ] Build basic HTML/JS/CSS popup (port logic from existing calculator)
- [ ] Optimize listing with keywords and screenshots
- [ ] Submit for review (days to weeks)
- [ ] After publish: verify link is dofollow via page source
- [ ] Promote on X, Reddit (r/UKPersonalFinance), LinkedIn
- [ ] Update yearly for new tax rates → renewed interest

**Resources:**
- Guide: https://developer.chrome.com/docs/extensions/get-started
- Dashboard: https://chrome.google.com/webstore/devdashboard

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
