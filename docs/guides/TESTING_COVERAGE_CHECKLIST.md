# Testing Coverage Checklist (Bug-Class Map)

Purpose: keep the “what bug will this test find?” mantra visible by mapping coverage to bug classes.

Last updated: 2026-02-03

## Coverage Map (High-Signal)

| Area | Bug Class | Primary Tests | What Bug This Catches | Status |
| --- | --- | --- | --- | --- |
| PAYE Tax Calculator | CALC-DRIFT | `e2e/golden-master-PERFECT.spec.ts`, `src/lib/__tests__/taxCalculator*.test.ts` | Regression in tax/NI/SL/net when refactoring | ✅ |
| PAYE Tax Calculator | ROUNDING | `e2e/payslip-regression.spec.ts`, `src/lib/__tests__/taxCalculator.invariants.test.ts` | Penny mismatches and net reconciliation drift | ✅ |
| Tax Code Overrides | TAX-CODE-OVERRIDES | `src/lib/__tests__/taxCodeDecoder.test.ts`, `src/lib/__tests__/taxCalculator.invariants.test.ts`, `e2e/tax-code-validation.spec.ts` | BR/D0/D1/K/NT parsing errors affecting tax | ✅ |
| Multi-Income | MULTI-INCOME | `src/lib/__tests__/taxCalculator.invariants.test.ts`, `src/store/__tests__/calculatorStore.incomeSources.test.ts` | NI/SL applied to the wrong income | ✅ |
| Core UX Flow | UX-CORE | `e2e/smoke.spec.ts`, `e2e/calculator-critical.spec.ts`, `e2e/director-guide-critical.spec.ts` | Broken calculator flow / missing results | ✅ |
| Director Guide | CALC-DRIFT | `src/lib/tax/__tests__/directorCalculator.spec.ts` | Strategy comparison/regression errors | ✅ |
| API Security | SECURITY-ABUSE | `src/lib/security/origin.test.ts`, `src/lib/__tests__/rateLimit.test.ts`, `src/app/api/indexnow/route.test.ts`, `src/app/api/send-results/route.test.ts`, `src/app/api/send-director-results/route.test.ts`, `src/app/api/newsletter/subscribe/route.test.ts`, `src/app/api/newsletter/unsubscribe/route.test.ts`, `src/app/api/sentry-webhook/route.test.ts`, `src/app/api/og/route.test.tsx`, `src/app/api/referral/lead/route.test.ts` | Origin bypass, rate-limit regressions, email abuse, webhook auth, OG constraints | ✅ |
| Blog UX | UX-CORE | `e2e/blog.spec.ts`, `e2e/seo-blog.spec.ts` | Broken blog listing / CTA regressions | ✅ |

## Coverage Gaps (Next Additions)

- API routes still untested: none (core API routes now covered).
- HMRC provenance snapshots are not stored in-repo (only implicit in tests).
- More payslip-anchored rounding tests (monthly, weekly, 4-weekly) would strengthen confidence.

## Next Test Adds (Planned)

1. Expand API route tests with additional edge cases if regressions appear.
