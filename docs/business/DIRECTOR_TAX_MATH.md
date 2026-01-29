# Director Tools - Tax Calculation Reference

> **Purpose:** Pure tax calculation logic, rates, and verified examples.
> **For build specs:** See `DIRECTOR_CALCULATOR_BUILD.md`

---

## Tax Rates 2025-26

### Income Tax (England/Wales/NI)

```typescript
incomeTax: {
  personalAllowance: 12570,
  personalAllowanceTaperThreshold: 100000,
  personalAllowanceTaperRate: 0.5,  // £1 reduction per £2 over threshold
  basicRateLimit: 37700,            // £12,571 to £50,270
  higherRateLimit: 125140,          // £50,271 to £125,140
  basicRate: 20,
  higherRate: 40,
  additionalRate: 45,
}
```

### Corporation Tax

```typescript
corporationTax: {
  smallProfitsRate: 19,              // Profits ≤ £50,000
  mainRate: 25,                      // Profits ≥ £250,000
  marginalReliefLowerLimit: 50000,
  marginalReliefUpperLimit: 250000,
  marginalReliefFraction: [3, 200],  // 3/200
}
```

### Dividend Tax

```typescript
dividendTax: {
  allowance: 500,
  basicRate: 8.75,
  higherRate: 33.75,
  additionalRate: 39.35,
}
```

### National Insurance

```typescript
employerNI: {
  secondaryThreshold: 5000,   // Annual
  rate: 15,
}

employeeNI: {
  primaryThreshold: 12570,
  lowerEarningsLimit: 6500,   // For NI credits
  upperEarningsLimit: 50270,
  rateBelowUEL: 8,
  rateAboveUEL: 2,
}

employmentAllowance: {
  amount: 10500,
  // Note: £100k NI liability limit REMOVED from April 2025
}
```

---

## Key Calculation Rules

### Personal Allowance Applies to Dividends

> "You do not pay tax on any dividend income that falls within your Personal Allowance."
> — [GOV.UK](https://www.gov.uk/tax-on-dividends)

When calculating dividend tax for someone with NO salary:
1. Personal Allowance (£12,570) applies to dividend income FIRST
2. Then Dividend Allowance (£500) applies at 0%
3. Remaining dividends taxed at 8.75%/33.75%/39.35%

### Personal Allowance Taper (£100k+)

If total income exceeds £100,000, PA reduces by £1 for every £2 over.

```typescript
function getPersonalAllowance(adjustedNetIncome: number): number {
  const basePA = 12570;
  const taperThreshold = 100000;
  
  if (adjustedNetIncome <= taperThreshold) {
    return basePA;
  }
  
  const reduction = Math.floor((adjustedNetIncome - taperThreshold) / 2);
  return Math.max(0, basePA - reduction);
}
// PA fully eliminated at £125,140
// Effective marginal rate between £100k-£125k is ~60%
```

### Corporation Tax Marginal Relief

For profits between £50k and £250k:

```typescript
function calculateCorporationTax(profit: number): number {
  if (profit <= 50000) {
    return profit * 0.19;
  }
  if (profit >= 250000) {
    return profit * 0.25;
  }
  // Marginal relief
  const taxAt25 = profit * 0.25;
  const relief = ((250000 - profit) * 3) / 200;
  return taxAt25 - relief;
}
```

### Employment Allowance

**Single-director exclusion (STILL IN PLACE):**
> "Limited companies cannot claim Employment Allowance if they have just one director and that director is the only employee liable for secondary Class 1 National Insurance."

**£100k NI limit REMOVED from April 2025:**
> "From April 2025, Employers paying more than £100,000 in Class 1 National Insurance liabilities can apply for Employment Allowance."

**Implementation:** Don't infer eligibility. Ask the user directly.

---

## Golden Example: £100k Profit (2025-26)

### Strategy 1: All Dividend

```
Company profit:                 £100,000
Corporation tax:                £22,750    (marginal relief, 22.75%)
───────────────────────────────────────────
Profit after CT:                £77,250    (available for dividend)

Dividend income:                £77,250

Tax calculation (PA applies to dividends when no other income):
  £0 - £12,570 (PA):            £0 tax
  £12,571 - £13,070 (DA):       £0 tax
  £13,071 - £50,270 (Basic):    £37,200 @ 8.75% = £3,255
  £50,271 - £77,250 (Higher):   £26,980 @ 33.75% = £9,106

Total dividend tax:             £12,361
───────────────────────────────────────────
Director take-home:             £64,889
Effective rate:                 35.1%
```

### Strategy 2: Lowest Tax (£12,570 Salary + Dividends)

```
Salary:                         £12,570
Employer NI:                    £1,136     (£12,570 - £5,000) × 15%
Total salary cost:              £13,706
───────────────────────────────────────────
Remaining profit:               £86,294

Corporation tax:                £19,118    (with marginal relief)
───────────────────────────────────────────
Profit after CT:                £67,176

Personal tax on salary:         £0
Employee NI:                    £0

Dividend:                       £67,176

Tax calculation (PA used by salary):
  £12,571 - £13,070 (DA):       £0 tax
  £13,071 - £50,270 (Basic):    £37,200 @ 8.75% = £3,255
  £50,271 - £79,746 (Higher):   £29,476 @ 33.75% = £9,948

Total dividend tax:             £13,203
───────────────────────────────────────────
Director take-home:             £66,543
Effective rate:                 33.5%
```

### Comparison

| Strategy | Salary | Dividend | Corp Tax | Personal Tax | Take-Home |
|----------|--------|----------|----------|--------------|-----------|
| All Dividend | £0 | £77,250 | £22,750 | £12,361 | £64,889 |
| **Lowest Tax** | £12,570 | £67,176 | £19,118 | £13,203 | **£66,543** |

**Difference: £1,654**

---

## Test Fixture

```typescript
const GOLDEN_EXAMPLE_2025_26 = {
  input: {
    estimatedProfit: 100000,
    taxYear: '2025-2026',
    claimsEmploymentAllowance: false,
    otherNonSavingsIncome: 0,
  },
  expected: {
    lowestTax: {
      salary: 12570,
      employerNI: 1136,
      corporationTax: 19118,
      dividend: 67176,
      dividendTax: 13203,
      netTakeHome: 66543,
      effectiveRate: 0.335,
    },
    allDividend: {
      salary: 0,
      employerNI: 0,
      corporationTax: 22750,
      dividend: 77250,
      dividendTax: 12361,
      netTakeHome: 64889,
      effectiveRate: 0.351,
    },
    potentialSavings: 1654,
  },
};
```

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Profit = £0 | Show "No profit to extract" message |
| Profit < £5,000 | All Dividend only feasible, minimal tax difference |
| Profit = £12,570 | All as salary (tax-free) or all as dividend (same result) |
| Profit = £50,000 | CT boundary - test small profits rate |
| Profit = £250,000 | CT boundary - test main rate |
| Other income > £100k | PA taper warning |
| Scotland selected | Block with message |

---

## HMRC Sources

| Topic | Source |
|-------|--------|
| PA applies to dividends | [GOV.UK](https://www.gov.uk/tax-on-dividends) |
| Corporation Tax Marginal Relief | [GOV.UK](https://www.gov.uk/guidance/corporation-tax-marginal-relief) |
| EA £100k limit removed | [GOV.UK](https://www.gov.uk/claim-employment-allowance/eligibility) |
| Single-Director EA Exclusion | [GOV.UK](https://www.gov.uk/government/publications/employment-allowance-more-detailed-guidance) |
| Employer NI Rates 2025-26 | [GOV.UK](https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2025-to-2026) |

---

## Integer Arithmetic Note

To avoid floating-point errors:

```typescript
// Store all amounts in pence internally
const profitPence = profit * 100;

// Rounding rules (per HMRC practice):
// - Intermediate calculations: truncate to pence
// - Final tax amounts: round to nearest pound
// - NI contributions: round to nearest penny
// - Corporation Tax: round down to nearest pound
```

---

## Tax Year Transition

**Before April 6, 2026:**
1. Add 2026-27 rates to taxRates.ts
2. Update dividend rates (8.75% → 10.75%, 33.75% → 35.75%)
3. Add tax year selector
4. Test all calculations
5. Deploy with feature flag

**April 6, 2026:**
1. Switch default to 2026-27
2. Keep 2025-26 available
3. Update copy
