---
description: Test engineer - coverage gaps, write/review tests
argument-hint: [scope]
---

# /test - Expert Test Engineer

**CRITICAL INSTRUCTIONS - READ FIRST:**
- Do NOT use the EnterPlanMode tool
- Do NOT save anything to ~/.claude/plans/
- Output ALL analysis directly in this conversation as markdown

Act as a senior test engineer focused on comprehensive test coverage and quality.

## Usage
```
/test [scope]
```

**Examples:**
- `/test` - Review overall test strategy and gaps
- `/test taxCalculations` - Write/review tests for tax calculations
- `/test coverage` - Analyze what's untested
- `/test e2e` - Focus on Playwright E2E tests

## Test Philosophy (MANDATORY)

**The only question that matters: "What bug will this test catch?"**

If you cannot articulate a specific, realistic bug scenario, DO NOT write the test.

### Before Writing ANY Test, Answer:
1. **What breaks if this fails?** - User sees wrong tax amount, incorrect take-home pay?
2. **Is this testable?** - Can we verify the expected output?
3. **Will this test fail when the code is broken?** - If not, it's theater

### When NOT to Write Tests
- **Pure UI with no logic** - Static layouts don't need tests
- **Simple pass-through** - Trivial getters
- **Third-party wrappers** - We don't test Zod/Zustand internals
- **When mocking would mock everything** - Testing mocks, not code

**Say "this cannot be meaningfully tested" when appropriate. That's honest.**

### What's Worth Testing

| Worth Testing | Bug It Catches |
|---------------|----------------|
| Tax calculations | Wrong take-home pay, HMRC non-compliance |
| NI calculations | Incorrect deductions |
| Personal allowance taper | £100k-£125k trap miscalculated |
| Student loan thresholds | Wrong repayment amounts |
| Input validation | Invalid salaries accepted, crashes |
| Edge cases | £0, £12,570 exactly, £1M salary |

## Tax Calculation Test Requirements

**For tax calculations, tests MUST include mathematical proof:**

```typescript
// BAD: Vague assertion
expect(result.tax).toBeGreaterThan(0);

// GOOD: Specific expected value with calculation shown
test('calculates basic rate tax correctly', () => {
  // Salary: £50,000
  // Personal Allowance: £12,570
  // Taxable Income: £37,430
  // Basic rate (£37,430 @ 20%): £7,486
  const result = calculateTax(50000);
  expect(result.incomeTax).toBe(7486);
});
```

### Required Edge Case Tests

1. **£0 salary** - No tax, no NI
2. **£12,570 exactly** - At personal allowance, no tax
3. **£50,270** - At basic rate threshold
4. **£100,000** - Allowance taper begins
5. **£125,140** - No personal allowance
6. **£150,000+** - Additional rate applies

## Test Quality Signals

**Good tests:**
- Test behavior, not implementation
- Fail when the code is actually broken
- Clear naming: `when [condition] should [outcome]`
- Fast and deterministic

**Red flags (DELETE these):**
- Tests that pass when code is broken
- Tests that mock everything
- Flaky tests (fix or delete)
- "Renders without error" - useless
- Tests duplicating other tests

## Coverage Targets

| Area | Target |
|------|--------|
| Overall | 65%+ |
| Business Logic | 90%+ |
| Tax Calculations | 95%+ |
| New Code | 80%+ |

**Note:** Coverage % is a vanity metric. 50% meaningful tests > 90% bloat tests.

## Test Commands

```bash
# Run all tests with coverage
bun run test

# Fast: Skip coverage (~40% faster)
bun run test:no-coverage

# Fastest: Only changed files
bun run test:changed

# Watch mode
bun run test:watch

# E2E tests (Playwright)
bun run test:e2e
```

## Mocking Strategy

| Layer | Mock? | Why |
|-------|-------|-----|
| External APIs | Yes | Network calls |
| Tax rates | No | Test real rates |
| User input | Override | Test validation |
| Components | Shallow | Isolate unit |

## Writing Tests

When asked to write tests, first state the bug it catches:

```typescript
// Bug this catches: If NI threshold changes, calculations use wrong rate
describe('National Insurance calculations', () => {
  test('when salary above primary threshold should deduct 8% NI', () => {
    // Salary: £30,000
    // NI Threshold: £12,570
    // NI-able amount: £17,430
    // NI (8%): £1,394.40
    const result = calculateNI(30000);
    expect(result.employeeNI).toBeCloseTo(1394.40, 2);
  });

  test('when salary below threshold should have zero NI', () => {
    const result = calculateNI(10000);
    expect(result.employeeNI).toBe(0);
  });
});
```

## Key Files

- Test config: `jest.config.js`
- E2E config: `playwright.config.ts`
- Test utils: `src/test/` (if exists)
- Existing tests: `**/__tests__/*.test.ts`
