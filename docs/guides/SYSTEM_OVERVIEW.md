# PayeTax System Overview

Last updated: March 6, 2026

Purpose: a single technical brief for external reviewers covering architecture, stack choices, quality controls, and operational tradeoffs.

---

## 1) Product + Engineering Context

PayeTax is a UK PAYE tax calculator and Director Intelligence tool focused on:
- Calculation correctness against HMRC rules
- Privacy-first analytics and data handling
- Fast, accessible UX with no account requirement

This is not a multi-tenant SaaS app with user auth and billing in core flows. Most value is delivered through deterministic calculations and trust signals.

---

## 2) Core Tech Stack

- Framework: Next.js 16 (App Router)
- UI: React 19 + TypeScript (strict)
- Styling: Tailwind CSS 4 + design tokens
- State: Zustand
- Validation: Zod
- Error monitoring: Sentry
- Analytics: Vercel Analytics, Vercel Speed Insights, direct GA4 (`gtag.js`), Ahrefs Analytics, Microsoft Clarity
- Email: Kit (newsletter) + Resend (transactional)
- Testing: Jest + React Testing Library + Playwright
- Tooling: Bun, Biome

Key entry files:
- `src/app/layout.tsx`
- `src/lib/taxCalculator.ts`
- `src/lib/tax/`
- `src/store/calculatorStore.ts`
- `src/store/directorGuideStore.ts`

---

## 3) Architecture Approach

### 3.1 UI Composition

PayeTax follows an atomic component model:
- `src/components/atoms/`
- `src/components/molecules/`
- `src/components/organisms/`
- `src/components/templates/`
- `src/components/pages/`

This keeps presentational primitives separate from workflow logic and helps with targeted testing.

### 3.2 Server/Client Boundaries

- App Router server components are used where possible for static/SEO-friendly output.
- Client components are used for interactive calculators, stores, and analytics hooks.
- Sensitive operations (email routes, token validation, webhook handling) remain server-side in API routes.

---

## 4) Domain Logic + Single Source of Truth

### 4.1 Tax Rate Governance

Single source of truth for tax constants:
- `src/constants/taxRates.ts`

Rules:
- Rates/thresholds should be derived from constants, not hardcoded in UI logic.
- Tax year support is explicit and versioned.

### 4.2 PAYE Engine

Core PAYE engine:
- `src/lib/taxCalculator.ts`

Responsibilities include income tax, NI, student loans, pension effects, tax-code behavior, and period conversions.

### 4.3 Director Intelligence Engine

Director-specific logic modules:
- `src/lib/tax/`

Includes income tax, dividend tax, corporation tax, strategy comparison, warnings, and supporting calculations.

### 4.4 Competitor Comparison Contract

Canonical competitor comparison pattern:
- Data source: `src/data/competitors.ts`
- Required fields: `features`, `strengths`, `weaknesses`, `bestFor`, `payeTaxAdvantages`, `verification`
- Rendering contract: `TwoColumnComparison` + detailed strengths/weaknesses columns + explicit verdict section in `src/app/alternatives/[competitor]/AlternativePageContent.tsx`

Current decision:
- Do not add a separate `detailedComparison` data field right now.
- When additional depth is needed, extend existing competitor fields and/or the `AlternativePageContent` narrative sections so one pattern remains authoritative.

---

## 5) Validation + Data Safety

Validation is done with Zod schemas at boundaries:
- `src/lib/validation/`
- `src/lib/env.ts` for environment validation

Pattern:
- Validate on ingress (API payloads, config/env, persisted state)
- Keep internal calculation code strongly typed

This reduces silent failure modes and provides structured, fail-fast errors.

---

## 6) State Management (Zustand)

Primary stores:
- `src/store/calculatorStore.ts`
- `src/store/directorGuideStore.ts`

Approach:
- Store actions encapsulate mutation logic
- Selective subscriptions reduce re-render noise
- Persistence is schema-validated with expiry controls where needed

---

## 7) Design System + Tokens

Design consistency is controlled through:
- `src/constants/designTokens.ts`
- Tailwind/theme variables in `src/app/globals.css`

Rules:
- Reuse tokenized spacing/type/icon scales
- Avoid ad hoc style values unless intentionally design-driven
- Keep components accessible by default (`focus-visible`, ARIA where needed)

---

## 8) Analytics + Privacy Model

### 8.1 Stack

- Vercel Analytics + Speed Insights: loaded in `src/app/layout.tsx` when analytics are enabled
- Direct GA4 (no GTM): `src/components/organisms/Analytics.tsx`
- Ahrefs Analytics: `src/components/organisms/AhrefsAnalytics.tsx`
- Microsoft Clarity: `src/components/organisms/ClarityAnalytics.tsx`

### 8.2 Consent + Governance

- Consent state managed via cookie/localStorage utilities and banner
- Custom events routed through `src/lib/analytics.ts`
- Analytics docs/source-of-truth:
  - `docs/guides/ANALYTICS_TRACKING.md`
  - `src/lib/directorGuideAnalytics.ts`
- Global analytics kill switch: `NEXT_PUBLIC_ENABLE_ANALYTICS=false`

Privacy constraints:
- No raw PII in analytics payloads
- Use bucketed values for salary/revenue/profit contexts

---

## 9) API, Security, and Abuse Controls

Public and integration routes live under:
- `src/app/api/`

Controls in use:
- Input validation with Zod schemas
- CSRF/origin protections: `src/lib/security/origin.ts`
- Rate limiting: `src/lib/rateLimit.ts` (distributed when Upstash configured)
- Bot mitigation for mutation routes: `src/lib/security/botGuard.ts`
- HMAC token flows for unsubscribe links: `src/lib/newsletter/unsubscribeToken.ts`
- Security headers and platform-level controls in framework config

---

## 10) Email Infrastructure

Split-provider model:
- Kit: newsletter subscribe/unsubscribe lifecycle
- Resend: transactional emails (results/referrals/feedback)

Reference:
- `docs/guides/RESEND.md`

This separation keeps lifecycle marketing and transactional deliverability concerns independent.

---

## 11) Testing + Release Controls

### 11.1 Automated

- Unit/integration: Jest (`bun run test:no-coverage`, `bun run test`)
- E2E critical: Playwright (`bun run test:e2e:critical`)
- Full E2E default script runs: Chromium, WebKit, Mobile Chrome, Mobile Safari
- Quality gate script: `bun run release:verify`

### 11.2 Manual/Production Confidence

- Post-release runbook:
  - `docs/guides/POST_RELEASE_VALIDATION.md`

Covers production-only checks for security controls, external integrations, observability, SEO/indexing, and analytics sanity.

Release evidence artifact:
- `docs/reports/releases/v<version>.md` (generated via `release:report:init`, validated via `release:report:check`)

---

## 12) Performance + Accessibility Posture

### Performance

- Route-level code splitting and dynamic imports for heavy modules
- Bundle analysis tooling and trend monitoring
- Avoid blocking analytics script strategies

### Accessibility

- Accessible form controls and focus management patterns
- WCAG-oriented testing and manual review loops
- Production/manual checks are part of release validation, not only local linting

---

## 13) Known Tradeoffs + Open Work

Key active hardening themes are tracked in:
- `docs/BACKLOG.md`

Notable areas under active governance:
- Analytics alias deprecation lifecycle
- Additional CI guardrails for analytics/document drift
- Ongoing accessibility and production validation cadence

---

## 14) External Review Scope Suggestion

For external reviewers, evaluate in this order:
1. Calculation correctness and tax-rate governance (`taxRates.ts` -> engines)
2. Security/abuse controls on public routes
3. Analytics/privacy implementation against stated policy
4. Testing depth + release control rigor
5. Architecture maintainability (component boundaries, store patterns, validation boundaries)

---

## 15) External Feedback - Accepted Actions

This section keeps only proposals we are actually adopting. Rejected/deferred suggestions are intentionally excluded to keep execution focused.

| Proposed in Reviews | What We Will Do | Backlog |
|---|---|---|
| Expand property-based and invariant-style tax testing | Completed on February 19, 2026 in `taxCalculator.hmrcVerification.test.ts` and `taxCalculator.invariants.test.ts` (Scottish fixtures, Welsh `C`-prefix regressions, and sampled property/invariant checks). | Implemented |
| Add legislative traceability for tax rules | Completed on February 19, 2026 in `src/constants/taxRates.ts` via `TAX_YEAR_SOURCES` (per-year references for income tax, NI, dividends, and student loans). | Implemented |
| Strengthen confidence in currency arithmetic | Completed on February 20, 2026 via formal decision record in `docs/guides/CURRENCY_ARITHMETIC_DECISION.md` (retain number + explicit pence-rounding model for calculators). | Implemented |
| Add visual regression safety net | Pilot visual regression checks for high-risk surfaces (homepage hero, calculator results, Director Intelligence dashboard). | `docs/BACKLOG.md` (`P1-1`) |
| Harden abuse controls on public mutation routes | Evaluate and implement bot-mitigation hardening for `/api/newsletter/*`, `/api/send-results`, and `/api/referral/lead`. | `docs/BACKLOG.md` (`P1-3`) |
| Improve anomaly detection in production | Completed on February 20, 2026 via calculator anomaly monitoring (`calculator_error` with `error_type=calculation_anomaly`) and Sentry breadcrumbs/exceptions for impossible outputs. | Implemented |
| Strengthen operational email trust posture | Completed on February 20, 2026 via monthly SPF/DKIM/DMARC SOP and first report artifact under `docs/reports/email-auth/`. | Implemented |
| Validate newer React/Next performance features safely | Run controlled experiments for React Compiler and Cache Components on selected routes before any default enablement. | `docs/BACKLOG.md` (`P2-1`, `P2-2`) |
| Improve external trust visibility | Evaluate adding an integrity transparency section on `/compliance` with engine/rules version + last verification date. | `docs/BACKLOG.md` (`P2-3`) |
