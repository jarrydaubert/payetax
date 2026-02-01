# Testing Guide

## Test Philosophy

> **"What bug will this test find?"**

Tests should catch real bugs, not test implementation details or TypeScript types.

---

## Running Tests

```bash
bun test                # Unit tests with coverage
bun test:no-coverage    # Unit tests (fast)
bun test:e2e            # E2E tests (all browsers)
bun test:dev            # E2E tests (Chrome only)
bun fix-all             # Lint + typecheck + format
```

---

## HMRC Verification

**golden-master-PERFECT.spec.ts** is the authoritative source for calculation accuracy.
- 20 scenarios against HMRC-verified values
- Penny-accurate assertions
- Fixture: `e2e/fixtures/golden-tax-cases-2025-26-COMPLETE.json`

---

## E2E Configuration

**Environment variables:**
- `PLAYWRIGHT_BASE_URL` - Override base URL for preview deploys/staging

**CI sharding:**
- Uses blob reporter for merged reports across shards
- Merge command: `npx playwright merge-reports --reporter html ./audit-outputs/blob-report`

**Network throttling:**
- Requires CDP, not browser args: `page.context().newCDPSession()` then `Network.emulateNetworkConditions`

---

## Quality Gates

```bash
bun run fix-all && bun run build && bun run test
```
