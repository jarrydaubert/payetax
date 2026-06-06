# Testing Guide

PayeTax is a deterministic UK tax-calculator R&D project. The test strategy is built around one question:

> What bug will this test find?

The aim is not to look busy. The aim is to prove that the calculator, surrounding tools, public pages, and deployment controls keep working after AI-assisted or human changes.

## Current Audit Snapshot

Last audited: 2026-06-04.

Current automated evidence from a full local run:

- `bun run check:repo`: passed.
- Jest coverage suite: 202 suites, 3216 tests passed.
- Playwright full suite: 338 tests passed across Chromium, WebKit, Mobile Chrome, and Mobile Safari.
- Global coverage: 91.66% statements, 81.07% branches, 80.53% functions, 91.66% lines.
- Golden master E2E: 20 HMRC-sourced scenarios passed within the stated tolerances.
- `bun run build`: passed, 61 static pages generated.
- `bun audit`: no vulnerabilities found.

Known automated-coverage gaps from the same audit:

- `src/app/api/ops/rate-limit-health/route.ts` is not unit-covered.
- `src/lib/email/emailDelivery.ts` is not unit-covered.
- `src/lib/email/outboundResultsDelivery.ts` is not unit-covered.

These gaps are tracked as useful next work because email delivery and operational health are production boundaries. They should be tested with mocked provider/network behaviour, not real email sends.

## Philosophy

Good tests in this repo are:

- Bug-oriented: the title or surrounding context explains the failure mode.
- Layer-appropriate: unit, component, route, or E2E is chosen deliberately.
- Oracle-backed: expected results come from an explicit source, invariant, or user-visible outcome.
- Deterministic: no silent skips, optional assertions, or vague "renders" checks for important behaviour.
- Actionable: a failure should tell the maintainer what broke and where to look.

Low-signal tests should be rewritten or deleted:

- Click-through tests with no named regression target.
- Presence-only checks for behaviour that needs a stronger oracle.
- Tests that would pass while a real user outcome is broken.
- Coverage added only to raise a number.
- Mocks that only prove the mock works.

## What We Test

### Calculation Correctness

This is the highest-value testing surface. PayeTax handles deterministic tax logic where there is a right answer, so tests must protect the calculation engine first.

Covered areas include:

- PAYE income tax.
- Employee National Insurance.
- Scottish tax bands.
- Student loan plans and postgraduate loans.
- BR, D0, D1, NT, K-codes, and emergency tax codes.
- Personal allowance taper.
- Marriage allowance boundaries.
- Pension and salary sacrifice paths.
- Additional income handling.
- Period reconciliation and payroll rounding.
- Director salary/dividend strategy calculations.

Primary files:

- `src/lib/__tests__/taxCalculator.hmrcVerification.test.ts`
- `src/lib/__tests__/taxCalculator.*.test.ts`
- `src/lib/tax/__tests__/`
- `src/constants/__tests__/taxRates.test.ts`
- `e2e/golden-master-PERFECT.spec.ts`
- `e2e/payslip-regression.spec.ts`

### Browser And User Flow Behaviour

The browser suite proves that the engine, UI, routing, forms, and rendered results work together.

Covered areas include:

- Homepage calculator flow.
- Calculate button and result rendering.
- Period selector behaviour.
- Salary comparison tables.
- Tax-code input handling.
- Blog navigation back to the calculator.
- Director Intelligence scenario comparison and critical flows.
- Mobile menu handoff.
- PWA/offline route coverage.

Primary files:

- `e2e/smoke.spec.ts`
- `e2e/calculator-critical.spec.ts`
- `e2e/display-periods.spec.ts`
- `e2e/tax-code-validation.spec.ts`
- `e2e/director-guide-critical.spec.ts`
- `e2e/director-guide-recruiter-regression.spec.ts`
- `e2e/homepage-portal-stability.spec.ts`

### Accessibility

Accessibility is tested at both component and browser levels.

Covered areas include:

- WCAG 2.2 AA axe scans across core pages.
- Desktop and mobile viewports.
- Supported dark theme.
- Calculator tooltips and form controls.
- Mobile navigation.
- Keyboard focus and focus indicators.
- Touch target minimums.
- Blog article and filtered blog states.

Primary files:

- `e2e/accessibility-wcag22.spec.ts`
- `src/components/atoms/__tests__/atoms.axe.test.tsx`
- UI component tests under `src/components/atoms/ui/__tests__/`

Notes:

- Axe can report "incomplete" checks that require manual review. These are not violations, but they are called out in the test output.
- Visual review still belongs in the developer/agent loop for UI changes. This repo does not maintain checked-in visual-regression baselines by default.

### Public Content, SEO, And Routing

The public repo still needs route and metadata confidence, even though the marketing-heavy page families have been removed.

Covered areas include:

- Sitemap generation.
- Robots output.
- `llms.txt` output.
- Open Graph route.
- Blog page and post rendering.
- Structured data smoke checks.
- Canonical navigation back to the calculator.
- Removed feature regressions, such as no feedback CTA on the About page.

Primary files:

- `src/app/__tests__/sitemap.test.ts`
- `src/app/__tests__/robots.test.ts`
- `src/app/llms.txt/__tests__/route.test.ts`
- `src/app/api/og/route.tsx` coverage through route tests.
- `e2e/seo-blog.spec.ts`
- `e2e/blog.spec.ts`

### API, Security, And Environment Contracts

These tests and checks protect production boundaries rather than tax maths.

Covered areas include:

- Origin checks.
- Bot guard logic.
- Rate-limit support code.
- Email input validation.
- Env schema and production env contract sync.
- Analytics event naming contract.
- Version sync between `package.json` and PWA/service-worker cache versions.
- Secret hygiene in CI through the tracked env guard.
- Dependency advisory checks.
- CodeQL JavaScript/TypeScript scanning.

Primary files and scripts:

- `src/lib/security/__tests__/`
- `src/lib/validation/__tests__/emailValidation.test.ts`
- `src/lib/__tests__/rateLimit.test.ts`
- `scripts/check-analytics-env-sync.ts`
- `scripts/check-analytics-events.ts`
- `scripts/check-version.ts`
- `scripts/audit-deps.ts`
- `.github/workflows/ci.yml`
- `.github/workflows/codeql.yml`

## Test Layers And Oracles

### Layer 1: Independent Calculation Oracles

Use this layer when the question is "is the tax answer correct?"

Examples:

- `src/lib/__tests__/taxCalculator.hmrcVerification.test.ts`
- `src/lib/__tests__/taxCalculator.hmrcPayrollFixtures.test.ts`
- `src/lib/tax/__tests__/incomeTax.test.ts`
- `src/lib/tax/__tests__/employeeNI.test.ts`
- `src/lib/tax/__tests__/directorCalculator.*.test.ts`

These tests should use hand-anchored expected values, HMRC examples, payslip-derived expectations, or explicit legal/rate-table assumptions. They should not derive the expected answer from the same production constants or implementation path they are trying to test.

### Layer 2: Component And Store Tests

Use this layer when the question is "does this component or state transition behave correctly?"

Examples:

- Calculator input and result components.
- Results-table comparison paths retained below the removed homepage What If UI.
- Director Guide dashboard and input panels.
- Zustand calculator and Director Guide stores.
- Analytics event calls from UI actions.
- Blog/search/filter components.

These tests are fast and good for state, rendering, validation, and contract assertions.

### Layer 3: Route, Config, And Contract Tests

Use this layer when the question is "does the app expose the right public or production-facing contract?"

Examples:

- Sitemap, robots, and `llms.txt`.
- Vercel config.
- Next config.
- Metadata builders.
- Env contract sync.
- Analytics event registry.
- Version sync.
- Skip/todo guardrails.

These tests catch drift that would otherwise hide until deployment.

### Layer 4: Browser E2E

Use this layer when the question is "does the user journey work in a real browser?"

The full E2E suite runs:

- Chromium.
- WebKit.
- Mobile Chrome.
- Mobile Safari.

Desktop projects run the broader suite. Mobile projects focus on critical paths to keep runtime reasonable while still covering the main user risk.

### Layer 5: Manual Release Evidence

Manual validation is allowed only when automation is the wrong layer.

Examples:

- Final production visual inspection.
- Lighthouse runs on the live deployment.
- Email deliverability checks against the configured provider.
- Calculator-focused Sentry and Vercel environment confirmation.

Manual checks belong in the PR, release notes, or post-release checklist. They should not become permanent heavyweight CI workflows unless the risk justifies the maintenance.

## HMRC Verification

Calculation correctness is guarded by distinct oracle layers. They are not interchangeable.

### Independent Correctness Oracle

`src/lib/__tests__/taxCalculator.hmrcVerification.test.ts` and sibling `taxCalculator.*` / `tax/*` unit suites are the source of truth for engine correctness.

- Expected values are hand-anchored.
- The tests import `calculateTax`, not `TAX_RATES` as the answer generator.
- This layer can catch engine bugs and rate/threshold typos when the expected value is independent.

Every calculation fix should add or update a failing-then-passing assertion in this layer.

### Drift And UI Regression Oracle

`e2e/golden-master-PERFECT.spec.ts` proves that the rendered browser flow and extraction path stay aligned with the current engine.

- Fixture: `e2e/fixtures/golden-tax-cases-2025-26-COMPLETE.json`
- Generator: `e2e/scripts/generate-golden-master.ts`

Important limitation: the fixture is generated from `taxRates.ts` and `calculateTax()`. It cannot catch an engine that is wrong but self-consistent. Its job is to catch UI, form, rendering, browser, extraction, and regression drift.

## Rounding And Threshold Policy

The engine applies annual band thresholds through monthly payroll behaviour. That means some annual threshold changes are invisible to ordinary magnitude assertions.

Rules:

- Use `toBeCloseTo(expected, 2)` for currency/tax amounts.
- Avoid integer precision assertions for tax-critical values.
- Assert engine behaviour when published annual examples differ by a few pence from monthly-annualised output, and explain the rounding reason in the test.
- When changing thresholds, add or update direct boundary tests such as marriage allowance and HICBC threshold pairs.

The golden master is the browser regression baseline for rounding-sensitive scenarios, not the legal source of truth.

## Commands

### Install

```bash
bun install --frozen-lockfile
```

### Fast Local Checks

```bash
bun run check:repo          # Lint, typecheck, version sync, env contract, analytics contract, skip guard
bun run test:no-coverage    # Jest without coverage thresholds
bun run test:e2e:critical   # Chromium smoke + critical + golden paths
bun run test:quick          # Unit fast + critical E2E
```

### Full Confidence Checks

```bash
bun run test:ci             # Jest with coverage thresholds
bun run test:e2e            # Full multi-browser Playwright suite
bun run test:full           # Coverage Jest + full Playwright
bun run build               # Production build
bun audit                   # Bun advisory check
```

### Release-Oriented Checks

```bash
bun run harness:local       # Repo gate + quick tests + build
bun run harness:release     # Repo gate + dependency audit + unit tests + build + release status
bun run release:verify      # Alias for release harness
bun run bundle:monitor      # Build + bundle threshold analysis
```

### Test Hygiene

```bash
bun run check:test-skips    # Block unapproved skip/todo debt
bun run test:metrics        # Print test inventory, skip/todo counts, last E2E status, coverage summary
bun run clean:test          # Clear unit and E2E artifacts
bun run test:e2e:clear      # Clear Playwright artifacts and storage state
```

## CI And Repo Quality

This repo follows a lean AI-assisted quality standard:

> AI-assisted code is allowed. Unverified AI-assisted code is not.

Current GitHub hard gates:

- `CI`
- `CodeQL`

`CI` does:

- checkout
- Bun setup
- disallowed-lockfile guard
- tracked-env guard
- frozen-lockfile install
- `bun run check:repo`
- `bun run audit:deps`
- `bun run build`

`CodeQL` does:

- JavaScript/TypeScript CodeQL analysis on push, pull request, and weekly schedule.

Why the full Playwright suite is not a default PR blocker:

- It is valuable but slower.
- It can produce browser timing flakes if run as a noisy permanent gate.
- The repo standard is small hard gates plus clear evidence, not CI sprawl.

Expected PR evidence for meaningful code changes:

- `bun run check:repo`
- the smallest relevant unit or E2E check while developing
- `bun run build`
- `bun run test:full` for broad calculation, browser, route, or refactor changes

## Coverage Policy

Coverage is a signal, not the goal.

Current global thresholds:

- statements: 65%
- branches: 55%
- functions: 65%
- lines: 65%

Business-logic files carry stricter thresholds where it matters, especially:

- `src/lib/taxCalculator.ts`
- `src/lib/periodCalculator.ts`

UI components have more lenient thresholds because behaviour and accessibility often need component tests plus browser checks rather than pure line coverage.

Do not add low-value tests only to raise coverage. Add tests that catch a named bug class.

## Skip And Todo Policy

- No new `test.skip`, `it.skip`, `describe.skip`, or `it.todo` without explicit approval.
- E2E skips must include a reason.
- Skip/todo debt must include an issue tag such as `PAYTAX-###` or `P#-#`.
- Commented-out assertions are not allowed in executable test files.

Guardrail files:

- `scripts/check-test-skips.ts`
- `scripts/test-debt-allowlist.ts`

The current expected state is zero skip/todo debt.

## Choosing The Right Test

Use this rule of thumb:

- Pure tax or calculation bug: unit test with independent expected values.
- Parser or validation bug: unit test around the parser/validator.
- Component rendering or state bug: component/store test.
- Cross-page flow, browser API, focus, mobile menu, or production rendering bug: Playwright.
- Sitemap, robots, metadata, env, analytics, or config drift: route/config/contract test.
- Provider delivery behaviour: unit/integration test with mocked provider responses, plus manual production confirmation when needed.

## Current Gaps And Next Tests To Add

These are the most useful next automated tests:

1. Email delivery boundary.
   - Files: `src/lib/email/emailDelivery.ts`, `src/lib/email/outboundResultsDelivery.ts`.
   - Why: production email depends on Brevo API configuration and provider responses.
   - Test with: mocked `fetch`, configured/unconfigured env, success, provider failure, timeout/error path, and sanitised logging.

2. Rate-limit health route.
   - File: `src/app/api/ops/rate-limit-health/route.ts`.
   - Why: this is an operational API boundary.
   - Test with: missing secret, wrong secret, correct secret, Upstash unavailable, and healthy Upstash response.

3. Production email smoke.
   - Why: mocks prove code paths, but not deliverability.
   - Test with: manual post-release send to a controlled address, then document result in release evidence.

4. Live monitoring confirmation.
   - Why: calculator-focused Sentry and Vercel env wiring are production configuration, not fully provable in local unit tests.
   - Test with: post-release Sentry event confirmation on PAYE or Director calculator flows and production env review.

## Manual Visual And Lighthouse Checks

Visual and Lighthouse checks are useful, but they are not default CI blockers.

For frontend changes:

- Run the app locally when practical.
- Inspect the affected route or component.
- Check desktop and mobile states when relevant.
- Check the browser console.
- Check the main interaction path.
- Add or update behavioural tests when the behaviour should stay protected.

For Lighthouse, use a clean browser context to avoid extension noise:

```bash
bunx lighthouse https://payetax.co.uk \
  --preset=desktop \
  --chrome-flags="--headless=new --incognito --disable-extensions" \
  --output=json --output-path=./lighthouse-desktop.json

bunx lighthouse https://payetax.co.uk \
  --preset=perf \
  --form-factor=mobile \
  --screenEmulation.mobile=true \
  --chrome-flags="--headless=new --incognito --disable-extensions" \
  --output=json --output-path=./lighthouse-mobile.json
```

Run at least two passes per strategy and compare medians. Treat extension-influenced runs as non-comparable.

## Related Docs

- `docs/guides/BUG_CATALOG.md`
- `docs/guides/POST_RELEASE_VALIDATION.md`
- `docs/guides/PRODUCTION_ENV_CONTRACT.md`
- `docs/guides/API_ROUTE_HARDENING.md`
- `docs/guides/RATE_LIMIT_VERIFICATION.md`
- `docs/business/PRODUCT_DIRECTION.md`
