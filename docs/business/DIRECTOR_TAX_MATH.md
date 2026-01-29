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
| **Director NI (CA44)** | [CA44 HMRC 04/25](https://www.gov.uk/government/publications/cwg2-further-guide-to-paye-and-national-insurance-contributions) |

---

## HMRC CA44 Official Test Cases (2025-26)

> **Source:** CA44 HMRC 04/25 - "National Insurance for company directors"
> **Critical:** Our calculator MUST match these examples exactly for NI calculations.

### CA44 Annual Thresholds

| Threshold | Annual | Monthly | Weekly |
|-----------|--------|---------|--------|
| ST (Secondary) | £5,000 | £417 | £96 |
| LEL (Lower Earnings) | £6,500 | £542 | £125 |
| PT (Primary) | £12,570 | £1,048 | £242 |
| UEL (Upper Earnings) | £50,270 | £4,189 | £967 |
| UST (Under 21) | £50,270 | £4,189 | £967 |
| AUST (Apprentice <25) | £50,270 | £4,189 | £967 |
| VUST (Veterans) | £50,270 | £4,189 | £967 |
| FUST (Freeports) | £25,000 | £2,083 | £481 |
| IZUST (Investment Zones) | £25,000 | £2,083 | £481 |

### CA44 NI Rates

| Type | Rate | Band |
|------|------|------|
| Employee (standard) | 8% | PT to UEL |
| Employee (above UEL) | 2% | Above UEL |
| Employer | 15% | Above ST |
| Reduced (Cat B) | 1.85% | PT to UEL |
| Employment Allowance | £10,500 | (£100k limit removed Apr 2025) |

### Worked Examples (OFFICIAL HMRC)

#### Example 1: Mr Armstrong (Category A, over 21)

**Scenario:** Director over 21, monthly salary £1,615, 12 months

```
Annual Earnings: £19,380 (12 × £1,615)

Employee NI:
  (£19,380 - £12,570) × 8% = £6,810 × 0.08 = £544.80 ✓

Employer NI:
  (£19,380 - £5,000) × 15% = £14,380 × 0.15 = £2,157.00 ✓
```

#### Example 2: Mr Taylor (Category M, under 21)

**Scenario:** Director under 21, monthly salary £1,615, 12 months

```
Annual Earnings: £19,380

Employee NI: £544.80 (same as Cat A - under-21 doesn't affect employee NI)

Employer NI: £0.00 (0% rate up to UST £50,270)
```

> **Key Insight:** Category M only affects employer NI (0% up to UST), not employee NI.

#### Example 3: Mr Morris (Category A, with bonus)

**Scenario:** Director over 21, £1,160/month + £10,000 bonus in June

```
Annual Earnings: £23,920 ((12 × £1,160) + £10,000)

Employee NI:
  (£23,920 - £12,570) × 8% = £11,350 × 0.08 = £908.00 ✓

Employer NI:
  (£23,920 - £5,000) × 15% = £18,920 × 0.15 = £2,838.00 ✓
```

> **Key Insight:** Bonus is included in annual earnings for cumulative director calculation.

#### Example 4: Mr Johnson (Category F, Freeport)

**Scenario:** Freeport director age 26, £2,000/month + £10,000 bonus

```
Annual Earnings: £34,000 ((12 × £2,000) + £10,000)

Employee NI:
  (£34,000 - £12,570) × 8% = £21,430 × 0.08 = £1,714.40 ✓

Employer NI (FUST = £25,000):
  (£34,000 - £25,000) × 15% = £9,000 × 0.15 = £1,350.00 ✓
```

> **Key Insight:** Freeport uses FUST (£25,000) not UST (£50,270) for employer NI threshold.

#### Example 5: Mr Williams (Category M→A, turns 21 mid-year)

**Scenario:** Director turns 21 mid-year, £21,700 total earnings

```
Earnings before 21: £12,000 (Category M)
Earnings after 21:  £9,700  (Category A)
Total:              £21,700

Employee NI (priority: Cat M first, then Cat A):
  Cat M: £12,000 fills ST→LEL→PT (no employee NI on Cat M portion)
  Cat A: £9,130 above PT × 8% = £730.40 ✓

Employer NI:
  Cat M: £0 (0% up to UST)
  Cat A: (£9,700) × 15% = £1,455.00 ✓
```

#### Example 6: Mr Roberts (Category A→C, reaches State Pension age)

**Scenario:** Director reaches State Pension age mid-year, £30,000 total

```
Earnings before SPA: £12,000 (Category A)
Earnings after SPA:  £18,000 (Category C)
Total:               £30,000

Employee NI:
  Cat A: £12,000 below PT = £0
  Cat C: 0% (over State Pension age)
  Total: £0.00 ✓

Employer NI (continues post-SPA):
  Cat A: (£12,000 - £5,000) × 15% = £1,050.00
  Cat C: £18,000 × 15% = £2,700.00
  Total: £3,750.00 ✓
```

> **Key Insight:** Employee NI stops at State Pension age, employer NI continues at 15%.

#### Example 7: Mrs Brown (Category B→A, reduced rate revoked)

**Scenario:** Married woman revokes reduced rate election mid-year

```
Earnings before revoke: £50,270 (Category B - reduced rate)
Earnings after revoke:  £8,000  (Category A)
Total:                  £58,270

Employee NI:
  Cat B: (£50,270 - £12,570) × 1.85% = £37,700 × 0.0185 = £697.45
  Cat A: £8,000 above UEL × 2% = £160.00
  Total: £857.45 ✓

Employer NI:
  Cat B: (£50,270 - £5,000) × 15% = £6,790.50
  Cat A: £8,000 × 15% = £1,200.00
  Total: £7,990.50 ✓
```

#### Example 8: Mrs Cross (Category B→A, divorce)

**Scenario:** Marriage ends in divorce, reduced rate lost

```
Earnings before divorce: £10,000 (Category B)
Earnings after divorce:  £20,000 (Category A)
Total:                   £30,000

Employee NI (priority: Cat B first):
  Cat B: £10,000 below PT = £0
  Cat A: £17,430 above PT × 8% = £1,394.40 ✓

Employer NI:
  Cat B: (£10,000 - £5,000) × 15% = £750.00
  Cat A: £20,000 × 15% = £3,000.00
  Total: £3,750.00 ✓
```

### CA44 NI Category Letters

| Category | Description | Employee Rate | Employer Threshold |
|----------|-------------|---------------|-------------------|
| A | Standard (over 21) | 8% / 2% | ST (£5,000) |
| B | Reduced (married women/widows) | 1.85% / 2% | ST (£5,000) |
| C | Over State Pension age | 0% | ST (£5,000) |
| M | Under 21 | 8% / 2% | UST (£50,270) |
| H | Apprentice under 25 | 8% / 2% | AUST (£50,270) |
| F | Freeports | 8% / 2% | FUST (£25,000) |
| V | Armed Forces Veterans | 8% / 2% | VUST (£50,270) |
| I/N | Investment Zones | 8% / 2% | IZUST (£25,000) |

### CA44 Director Calculation Rules

1. **Annual Earnings Period:** Directors use annual (or pro-rata annual) period, NOT per-pay-period
2. **Pro-Rata for Mid-Year:** Directors appointed during tax year use pro-rata annual period
3. **Threshold Rounding:** Pro-rata thresholds round UP to the next whole pound
4. **Exact Percentage Method:** Multiply earnings × rate, round to nearest penny
5. **Adapted Tables Method:** Divide by 12 (monthly) or 52 (weekly), multiply result by same
6. **Category Priority:** When categories change mid-year, reduced-rate categories (B/E/I) get priority

### Test Fixture

```typescript
const HMRC_CA44_TEST_CASES = {
  armstrong: {
    category: 'A',
    annualEarnings: 19380,
    expectedEmployeeNI: 544.80,
    expectedEmployerNI: 2157.00,
  },
  taylor: {
    category: 'M',
    annualEarnings: 19380,
    expectedEmployeeNI: 544.80,
    expectedEmployerNI: 0.00,
  },
  morris: {
    category: 'A',
    annualEarnings: 23920,
    expectedEmployeeNI: 908.00,
    expectedEmployerNI: 2838.00,
  },
  johnson: {
    category: 'F',
    annualEarnings: 34000,
    expectedEmployeeNI: 1714.40,
    expectedEmployerNI: 1350.00,
  },
  williams: {
    categories: ['M', 'A'],
    earnings: [12000, 9700],
    expectedEmployeeNI: 730.40,
    expectedEmployerNI: 1455.00,
  },
  roberts: {
    categories: ['A', 'C'],
    earnings: [12000, 18000],
    expectedEmployeeNI: 0.00,
    expectedEmployerNI: 3750.00,
  },
  brown: {
    categories: ['B', 'A'],
    earnings: [50270, 8000],
    expectedEmployeeNI: 857.45,
    expectedEmployerNI: 7990.50,
  },
  cross: {
    categories: ['B', 'A'],
    earnings: [10000, 20000],
    expectedEmployeeNI: 1394.40,
    expectedEmployerNI: 3750.00,
  },
};
```

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
