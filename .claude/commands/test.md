---
description: Test engineer - coverage gaps, write/review tests
argument-hint: [scope]
---

# /test - Expert Test Engineer

**CRITICAL INSTRUCTIONS:**
- Output ALL analysis directly in this conversation as markdown
- **Before proposing tests, read `package.json` scripts + identify actual test framework**
- When claiming a coverage gap, cite **file paths** and the **specific bug/regression** it would catch
- If you can't locate the file, say "unknown location"
- You MAY write test code in the chat (user decides whether to apply it)
- Tax Pack pre-live guardrail: Tax Pack is planned (not live); unless explicitly requested, focus on tests for shipped flows and mark Tax Pack test gaps as deferred.

## Evidence Standard

- Every claimed gap must include: **file path**, **what regression it catches**
- If a gap is speculative (haven't verified file exists), mark as **UNVERIFIED**

## Usage
```
/test [scope]
```

**Examples:**
- `/test` - Review overall test strategy and gaps
- `/test taxCalculations` - Write/review tests for tax calculations
- `/test coverage` - Analyze what's untested
- `/test e2e` - Focus on Playwright E2E tests

---

## Test Philosophy (MANDATORY)

**The only question that matters: "What bug will this test catch?"**

If you cannot articulate a specific, realistic bug scenario, DO NOT write the test.

### Before Writing ANY Test, Answer:
1. **What breaks if this fails?** - User sees wrong tax amount, incorrect take-home pay?
2. **Is this testable?** - Can we verify the expected output?
3. **Will this test fail when the code is broken?** - If not, it's theater

### When NOT to Write Tests
- **Pure UI with no logic** - Static layouts don't need unit tests (but see a11y below)
- **Simple pass-through** - Trivial getters
- **Third-party library internals** - We don't test Zod/Zustand internals
- **When mocking would mock everything** - Testing mocks, not code

**However, DO test:**
- **Your Zod schemas** - Test accept/reject at boundaries (that's YOUR contract)
- **A11y smoke tests** - Critical forms/buttons should have tab order, labels (via E2E)

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
| Zod schema boundaries | Invalid inputs accepted, valid rejected |

---

## Rounding & Representation Rules (PayeTax-Specific)

**Define this ONCE to prevent test flakiness:**

| Question | Answer |
|----------|--------|
| Internal representation | Pounds as floats (not pence integers) |
| Rounding convention | HMRC rules: round tax/NI to nearest penny |
| When to round | Per calculation step, not just final output |
| Test assertion style | Use `toBeCloseTo(expected, 2)` for monetary values |

**Example:**
```typescript
// GOOD: Accounts for rounding
expect(result.incomeTax).toBeCloseTo(7486.00, 2);

// BAD: Exact integer assertion (fragile)
expect(result.incomeTax).toBe(7486);
```

---

## Tax Calculation Test Requirements

**For tax calculations, tests MUST include mathematical proof:**

```typescript
test('calculates basic rate tax correctly', () => {
  // Salary: £50,000
  // Personal Allowance: £12,570
  // Taxable Income: £37,430
  // Basic rate (£37,430 @ 20%): £7,486.00
  const result = calculateTax(50000);
  expect(result.incomeTax).toBeCloseTo(7486.00, 2);
});
```

### Required Edge Case Tests (UK PAYE)

**Thresholds (test at boundary ±1):**
| Threshold | Value | Test Points |
|-----------|-------|-------------|
| Personal Allowance | £12,570 | 12569, 12570, 12571 |
| Basic Rate Limit | £50,270 | 50269, 50270, 50271 |
| Taper Start | £100,000 | 99999, 100000, 100001 |
| Taper End | £125,140 | 125139, 125140, 125141 |
| Additional Rate | £125,140+ | 150000, 200000 |

**Tax Code Variants:**
- `1257L` - Standard allowance
- `BR` - All basic rate
- `D0` - All higher rate
- `0T` - No allowance (emergency)
- `K` codes - Negative allowance
- `S` prefix - Scottish rates
- Invalid codes - Reject gracefully

**Regions (if supported):**
- rUK (England/Wales/NI)
- Scotland (6 bands)

**Other Cases:**
- £0 salary - No tax, no NI
- Student loan plans (Plan 1, 2, 4, 5, Postgrad)
- Pension contributions (relief at source vs salary sacrifice)
- Very large salaries (£1M+)
- Invalid inputs: NaN, Infinity, negative, non-numeric

### Golden Test Vectors (Tax Year Matrix)

**Maintain HMRC-aligned fixtures per supported tax year:**

```typescript
// e2e/fixtures/golden-tax-cases-2025-26.json
{
  "taxYear": "2025-26",
  "region": "rUK",
  "cases": [
    { "gross": 0, "tax": 0, "ni": 0, "takeHome": 0 },
    { "gross": 12570, "tax": 0, "ni": 0, "takeHome": 12570 },
    { "gross": 50270, "tax": 7540, "ni": 3020.16, "takeHome": 39709.84 },
    // ... more cases
  ]
}
```

**When rates change, update fixtures and verify tests fail then pass.**

---

## Advanced Testing Strategies

### Property-Based Testing

**Use true invariants (not simplistic ones):**

```typescript
import { fc } from 'fast-check';

// WRONG: This is often false (pension, salary sacrifice, rounding)
// return result.incomeTax + result.ni + result.takeHome === salary;

// CORRECT: Monotonicity - increasing gross shouldn't decrease take-home
// (except at extreme edge cases with rounding)
test('take-home is monotonically increasing', () => {
  fc.assert(
    fc.property(
      fc.float({ min: 0, max: 500000, noNaN: true }),
      fc.float({ min: 0, max: 500000, noNaN: true }),
      (a, b) => {
        const [lower, higher] = a < b ? [a, b] : [b, a];
        const resultLower = calculateTax(lower);
        const resultHigher = calculateTax(higher);
        // Allow small rounding tolerance
        return resultHigher.takeHome >= resultLower.takeHome - 1;
      }
    )
  );
});

// CORRECT: Total deductions invariant
test('gross = takeHome + all deductions', () => {
  fc.assert(
    fc.property(fc.float({ min: 0, max: 1000000, noNaN: true }), (salary) => {
      const result = calculateTax(salary);
      const totalDeductions = result.incomeTax + result.ni + 
        (result.studentLoan ?? 0) + (result.pension ?? 0);
      return Math.abs(salary - result.takeHome - totalDeductions) < 0.01;
    })
  );
});
```

**Include generators for:**
- Floats with 2 decimal places: `fc.float({ min: 0, max: 10000000, noNaN: true })`
- Invalid inputs: `fc.oneof(fc.constant(NaN), fc.constant(Infinity), fc.constant(-1))`

### Schema Contract Tests

**Test YOUR Zod schema boundaries (not Zod itself):**

```typescript
describe('SalaryInputSchema', () => {
  test('rejects salary above maximum bound', () => {
    expect(() => SalaryInputSchema.parse({ salary: 10_000_001 })).toThrow();
  });

  test('rejects negative salary', () => {
    expect(() => SalaryInputSchema.parse({ salary: -1 })).toThrow();
  });

  test('accepts valid salary at boundary', () => {
    expect(SalaryInputSchema.parse({ salary: 10_000_000 })).toBeDefined();
  });

  test('rejects invalid tax code format', () => {
    expect(() => TaxCodeSchema.parse('INVALID')).toThrow();
  });
});
```

### Mutation Testing

**Verifies your tests actually catch bugs:**

- **Tool**: Stryker (`npx stryker run`)
- **Goal**: >80% mutation score for critical paths
- **Scope**: Only run on `src/lib/tax/**` and validation schemas (not UI)
- **When**: Locally or nightly CI (too slow for every PR)

```typescript
// If changing `>` to `>=` doesn't break a test, the test is weak
if (salary > threshold) { /* ... */ }
```

### Contract Testing for API Routes

**Verify request/response contracts:**

```typescript
test('salary API returns expected shape', () => {
  const response = await api.calculate({ salary: 50000 });
  expect(response).toMatchObject({
    grossSalary: expect.any(Number),
    incomeTax: expect.any(Number),
    takeHome: expect.any(Number),
  });
});
```

**Note:** If routes use different runtimes (edge vs node), test both if behavior differs.

### A11y Smoke Tests (E2E)

**Even if you skip UI unit tests, add basic a11y checks:**

```typescript
test('calculator form is keyboard navigable', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => document.activeElement?.tagName);
  expect(focused).toBe('INPUT');
});

test('form inputs have labels', async ({ page }) => {
  await page.goto('/');
  const input = page.locator('input[name="salary"]');
  const label = await input.evaluate(el => el.labels?.[0]?.textContent);
  expect(label).toBeTruthy();
});
```

---

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

---

## Coverage Targets

| Area | Target | Notes |
|------|--------|-------|
| Overall | 50-65% | UI-heavy Next.js apps won't hit 80% meaningfully |
| Business Logic | 90%+ | Tax calculations, validation |
| Tax Calculations | 95%+ | Core product correctness |
| New Code | 80%+ | Don't regress |

**Rules:**
- Coverage % is a vanity metric. 50% meaningful tests > 90% bloat tests.
- **Never add tests solely to raise coverage.**
- Missing coverage on UI components is often fine.

---

## Mocking Strategy

| Layer | Mock? | Notes |
|-------|-------|-------|
| External APIs | Yes | Network calls |
| Tax rates | Usually real | But for testing branching logic across tax years, inject a test rate table |
| User input | Override | Test validation |
| Components | Shallow | Isolate unit |

**Prefer dependency injection for pure functions where it makes testing easier.**

---

## Test Commands

**First, verify actual commands in `package.json`:**

```bash
# Check what's actually available
cat package.json | grep -A 20 '"scripts"'
```

**Common patterns (verify before using):**
```bash
bun run test              # All tests with coverage
bun run test:no-coverage  # Fast: Skip coverage
bun run test:watch        # Watch mode
bun run test:e2e          # Playwright E2E
```

---

## Output Format

```markdown
## Test Analysis

**Scope:** [files examined]
**Test Framework:** [Jest/Vitest/Bun test]

### Coverage Gaps (Prioritized by Risk)

| Gap | File | Bug It Would Catch | Priority |
|-----|------|-------------------|----------|

### Proposed Tests

#### [Test Name]
**Bug this catches:** [specific regression]
**File:** [path]
```typescript
// test code here
```

### Existing Tests - Quality Issues

| Issue | Test File | Recommendation |
|-------|-----------|----------------|

### Recommendations
1. [Priority fix]
2. [Secondary]
```

---

## Key Files

- Test config: `jest.config.js` or `vitest.config.ts`
- E2E config: `playwright.config.ts`
- Golden fixtures: `e2e/fixtures/`
- Existing tests: `**/__tests__/*.test.ts`
- Tax calculations: `src/lib/taxCalculator.ts`
- Validation schemas: `src/lib/validation/`
