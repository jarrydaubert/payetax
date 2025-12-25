# Testing Guide

**Last Updated:** December 25, 2025

---

## HMRC Official Test Data

HMRC publishes official payroll test data for software developers to verify calculations:

**Source:** [gov.uk/government/publications/software-developers-payroll-test-data-2025-to-2026](https://www.gov.uk/government/publications/software-developers-payroll-test-data-2025-to-2026)

### Available Resources

| Resource | Format | Purpose |
|----------|--------|---------|
| PAYE Tax test data | ZIP | Tax calculation scenarios from April 2025 |
| National Insurance test data | ZIP | NI calculation scenarios |
| Student Loan thresholds | ODS | SL repayment thresholds |

### Integration Approach

1. **Download** the test packs from HMRC
2. **Extract** scenarios (salaries, tax codes, pay periods)
3. **Run** through PayeTax calculator
4. **Assert** results match HMRC expected outcomes

### Implementation Options

**Unit Tests:**
```typescript
// Use HMRC scenarios as test fixtures
describe('HMRC PAYE Test Data 2025-26', () => {
  test.each(hmrcTestCases)('$description', ({ input, expected }) => {
    const result = calculatePAYE(input);
    expect(result.tax).toBeCloseTo(expected.tax, 2);
  });
});
```

**E2E Tests:**
```typescript
// Playwright test using HMRC data
test('HMRC Scenario 1: Basic Rate Taxpayer', async ({ page }) => {
  await page.goto('/');
  await page.fill('[data-testid="salary"]', '35000');
  // Assert against HMRC expected values
});
```

---

## Current Test Coverage

| Type | Count | Command |
|------|-------|---------|
| Unit Tests | 3,349+ | `bun test` |
| E2E Tests | 157 | `bun test:e2e` |
| Browsers | 5 | Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari |

---

## Running Tests

```bash
# Unit tests
bun test

# Unit tests with coverage
bun test --coverage

# E2E tests (all browsers)
bun test:e2e

# E2E tests (Chrome only, faster)
bun test:dev

# Type checking
bun typecheck

# Linting
bun lint
```

---

## Quality Gates

Before merging:
- All tests passing
- No TypeScript errors
- No linting errors
- Build succeeds

---

*This represents the gold standard for verification in payroll software.*
