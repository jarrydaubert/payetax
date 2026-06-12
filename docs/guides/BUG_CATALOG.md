# Bug Catalog (Testing Targets)

This file exists to enforce the mantra from `docs/guides/TESTING.md`:

> "What bug will this test find?"

When you add or modify a test, it must map to at least one bug class below.

## Bug Classes

### CALC-DRIFT (Financial correctness drift)

Symptoms:
- Outputs change after refactors (tax/NI/SL/net) without intentional spec/rate updates.

Primary detectors:
- Playwright: `e2e/golden-master-PERFECT.spec.ts` (regression values & extraction)
- Jest: `src/lib/__tests__/taxCalculator.*.test.ts`

### ROUNDING (Penny-level / payroll rounding)

Symptoms:
- Differences vs payslips that appear only on certain periods (monthly vs weekly, etc.).
- Off-by-0.01/0.04 issues that erode trust.

Primary detectors:
- Jest: rounding-focused unit tests (extend with real payroll examples where possible)
- Playwright: scenario-level checks on table values across periods

### TAX-CODE-OVERRIDES (BR/D0/D1/NT, K-codes, emergency codes)

Symptoms:
- Wrong allowance or wrong “all at one rate” behavior.

Primary detectors:
- Playwright: golden master scenarios for BR/K/emergency
- Jest: tax code parsing + tax calculator tests

### MULTI-INCOME (PAYE vs non-employment income separation)

Symptoms:
- NI or PAYE student loans incorrectly applied to non-employment income.
- Gross totals missing/duplicated.

Primary detectors:
- Jest: income source unit tests
- Playwright: `e2e/calculator-critical.spec.ts` (rental income row + gross)

### UX-CORE (Core flow broken)

Symptoms:
- User can’t complete the primary flow: enter inputs -> calculate -> see results.
- Navigation / key CTA breaks.

Primary detectors:
- Playwright: `e2e/smoke.spec.ts`, `e2e/calculator-critical.spec.ts`

### A11Y-REGRESSION (Accessibility or keyboard/touch regression)

Symptoms:
- Axe violations on core pages or interactive states.
- Focus indicators disappear.
- Mobile tap targets become too small.
- Tooltips, forms, or mobile menus become inaccessible.

Primary detectors:
- Playwright: `e2e/accessibility-wcag22.spec.ts`
- Jest/axe: `src/components/atoms/__tests__/atoms.axe.test.tsx`
- Component tests for UI primitives under `src/components/atoms/ui/__tests__/`

### PUBLIC-CONTRACT-DRIFT (Routes, metadata, or public artifacts drift)

Symptoms:
- Sitemap, robots, `llms.txt`, or Open Graph output changes unexpectedly.
- Blog navigation or structured data breaks.
- Removed public features reappear as stale links or test fixtures.

Primary detectors:
- Jest: route/config tests under `src/app/__tests__/`
- Playwright: `e2e/seo-blog.spec.ts`, `e2e/blog.spec.ts`
- Grep/doc review for removed feature names when stripping scope

### SECURITY-ABUSE (Abuse paths, unwanted side effects)

Symptoms:
- Untrusted input reaches templates or external services unsafely.
- Cross-origin email sends, missing rate limits, etc.

Primary detectors:
- Jest: API route unit tests (where possible) + validation tests
- Playwright: targeted API/abuse E2E tests (to be expanded)

### EMAIL-DELIVERY (Transactional email boundary failure)

Symptoms:
- PAYE or Director result email silently fails.
- Missing provider configuration is not reported clearly.
- Provider errors leak unsafe details or are logged without useful context.

Primary detectors:
- Jest: `src/lib/email/__tests__/`

### OBSERVABILITY-CONTRACT (Monitoring or operational health drift)

Symptoms:
- Calculator-focused Sentry, env validation, or rate-limit health checks stop matching production expectations.
- Required env names drift between code, docs, and `.env.template`.
- Operational health route returns the wrong status for missing/invalid secrets.

Primary detectors:
- Jest: Sentry scope, env, rate-limit, and rate-limit health route tests under `src/lib/__tests__/`, `src/lib/security/__tests__/`, and `src/app/api/ops/rate-limit-health/route.test.ts`
- Scripts: `bun run check:env-contract`, `bun run check-version`

## Adding A New Test

Answer these in the PR description:
- Bug class(es):
- What production bug would have been caught?
- Why unit vs E2E?
- What’s the smallest reliable assertion?
