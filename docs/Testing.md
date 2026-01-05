# Testing Guide

---

## Test Philosophy

> **"What bug will this test find?"**

Every test should:
- Catch real bugs in production code
- Not test implementation details
- Not test TypeScript types at runtime
- Not test configuration values

---

## Test Structure

```
src/
├── **/__tests__/           # Unit tests (Jest)
│   └── *.test.ts(x)

e2e/
├── smoke.spec.ts           # Page loads, navigation
├── golden-master-PERFECT.spec.ts  # HMRC calculation accuracy
├── tax-code-validation.spec.ts    # Input validation
├── what-if-comparison.spec.ts     # What-if feature
├── hicbc-comprehensive.spec.ts    # Child benefit
├── pension-limits.spec.ts         # Annual allowance
├── accessibility-wcag22.spec.ts   # WCAG compliance
├── seo-blog.spec.ts               # Meta tags
├── blog.spec.ts                   # Blog functionality
├── display-periods.spec.ts        # Period toggles
└── scroll-indicators.spec.ts      # Mobile scroll
```

---

## Running Tests

```bash
# Unit tests
bun test

# Unit tests (no coverage report)
bun test:no-coverage

# E2E tests (all browsers)
bun test:e2e

# E2E tests (Chrome only, faster)
bun test:dev

# Type checking
bun typecheck

# Linting
bun lint

# All checks
bun fix-all
```

---

## HMRC Verification

The **golden-master-PERFECT.spec.ts** is the authoritative source for calculation accuracy.

- Tests 20 scenarios against HMRC-verified values
- Penny-accurate assertions
- Data-driven from JSON fixture

**Fixture:** `e2e/fixtures/golden-tax-cases-2025-26-COMPLETE.json`

---

## Quality Gates

Before merging:
- All tests passing
- No TypeScript errors
- No linting errors
- Build succeeds

```bash
bun run fix-all && bun run build && bun run test
```
