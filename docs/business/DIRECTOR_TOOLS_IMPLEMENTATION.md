# SME Director Tools Pages - Implementation Plan

> **Version:** 1.7 (FINAL) | **Created:** 2026-01-25 | **Status:** ✅ APPROVED - Ready to build
>
> **Revision Notes:**
> - v1.1: Fixed input semantics, added Employment Allowance, made company profit required, removed Scotland for MVP
> - v1.2: Flagged math errors in golden example, added dividend tax stacking questions
> - v1.3: Simplified UX for first-time directors, friendlier input wording, added legal disclaimer
> - v1.4: Fixed cash vs profit flaw, corrected EA eligibility logic, fixed data errors (LEL, dividend allowance, marginal relief), added dynamic warnings
> - v1.5: **CRITICAL FIX** - Personal Allowance now correctly applied to dividend-only income. All Dividend take-home corrected from £60,772 → £64,889. Potential savings reduced from £5,896 → £1,654. Removed obsolete £100k EA limit.
> - v1.6: Added comprehensive UX/UI specs, accessibility requirements, SEO metadata, analytics events, testing strategy, operational procedures. Added mailto: solution for email-to-accountant, inputmode for mobile, PA taper calculation logic.
> - v1.7: Added income tax bands to taxRates.ts spec, EA partial consumption warning, feasibility guardrails for low profit, "illustrative only" dividend gating when using helper, savings interest assumption, tax year vs accounting period note, analytics bucketing for all values.

---

## Overview

Build the MVP pages for PayeTax's SME Director Tools suite, featuring a Director Salary vs Dividend Optimizer and associated pricing page. This is Phase 1 (MVP) - no auth or payments yet.

**Target Users:** 
- First-time directors (young professionals who just started a company)
- Experienced directors of limited companies
- Finance Directors at SMEs
- Accountants managing multiple clients

**Value Proposition:** "Get an instant estimate of your take-home pay—then confirm with your accountant."

> **Note:** Previous tagline "no accountant required" removed due to legal risk. We provide estimates, not advice.

---

## Legal Framework

### Disclaimer (Display on Every Page)

> **Important:** This calculator provides **estimates** based on current HMRC tax rates. It is for illustrative purposes only and does not constitute financial, tax, or legal advice. Your actual tax position may differ based on your specific circumstances. **Always consult a qualified accountant before making financial decisions.**

### Language Guidelines (Legally Defensive)

| ❌ Don't Say | ✅ Do Say |
|-------------|----------|
| "Here's how: Pay yourself £12,570" | "If you paid yourself £12,570, the result would be..." |
| "Optimal strategy" | "Lowest estimated tax among options tested" |
| "You should take..." | "One approach (based on assumptions below) is..." |
| "Save £1,654" | "Potential difference: ~£1,650" |
| "Exactly how much" | "Estimated take-home" |

### Dynamic "Speak to an Accountant" Triggers

Show specific warnings when user inputs indicate complexity:

| Trigger Condition | Warning Message |
|-------------------|-----------------|
| Other income > £0 | "You have other income—tax band stacking may affect results. Verify with your accountant." |
| Profit > £250,000 | "High profits may involve associated company rules. Consult an accountant." |
| Used profit helper | "This estimate is based on invoices minus expenses. **Dividend figures are illustrative only**—dividends require distributable reserves from your accounts." |
| Scotland selected | "Scottish income tax rates differ. This tool doesn't support Scotland yet." |
| Short accounting period | "First-year companies often have short accounting periods affecting CT thresholds." |
| EA = Yes | "Assumes EA is available. If you have other employees, EA may already be partially used." |

**Assumptions (always displayed):**
- "Savings interest is not included in this calculation"
- "Personal tax is calculated by tax year; corporation tax by accounting period. This tool assumes they broadly align."

---

## Critical Design Decision: Profit vs Cash

### The Problem (Identified in Reviews)

"Cash in bank" ≠ "Company profit" ≠ "Distributable reserves"

- **Cash:** What's in the bank account (includes VAT owed, CT due, unpaid bills)
- **Profit:** Accounting concept (income minus expenses, before CT)
- **Distributable reserves:** Legal requirement for dividends (accumulated post-tax profits)

A user with £100k in the bank might have:
- £20k VAT owed to HMRC
- £15k CT due from last year
- £10k in upcoming fixed costs
- Actual "extractable" amount: £55k

### The Solution

**Primary Input:** Ask for **profit**, not cash.

```
┌─────────────────────────────────────────────────────────────────┐
│  What's your company's estimated profit this year?              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ £ 100,000                                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  This is your business income minus business expenses,          │
│  before Corporation Tax and before paying yourself.             │
│                                                                 │
│  [ⓘ Where do I find this?]                                      │
└─────────────────────────────────────────────────────────────────┘
```

**"Where do I find this?" Helper:**

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 Finding your profit figure                                  │
│                                                                 │
│  BEST: Ask your accountant for "Profit before tax" from your    │
│        latest management accounts or P&L statement.             │
│                                                                 │
│  ALTERNATIVE: If you don't have accounts yet:                   │
│  • Total invoiced to clients this year:     £ _______           │
│  • Minus business expenses:                 - £ _______         │
│  • Estimated profit:                        = £ _______         │
│                                                                 │
│  ⚠️  IMPORTANT:                                                  │
│  • Do NOT include VAT you've collected (it's not yours)         │
│  • Do NOT include money set aside for taxes already due         │
│  • This is a rough estimate—actual profit may differ            │
│                                                                 │
│  [Use this estimate]                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Routes to Create

| Route | Purpose |
|-------|---------|
| `/tools` | NEW - Tools landing page (doesn't exist yet) |
| `/tools/director-optimizer` | Main calculator - salary vs dividend optimization |
| `/tools/pricing` | Pro/Firm tier comparison (Free/£19/£49) |

---

## File Structure

```
src/
├── app/tools/
│   ├── page.tsx                            # Tools landing page
│   ├── director-optimizer/
│   │   ├── page.tsx                        # Server component (metadata, schema.org)
│   │   └── DirectorOptimizerClient.tsx     # Client component (UI + state)
│   └── pricing/
│       └── page.tsx                        # Pricing with waitlist
├── components/
│   ├── molecules/
│   │   ├── ScenarioComparisonCard.tsx      # Single scenario display
│   │   ├── DirectorInsightCard.tsx         # Recommendations/warnings
│   │   └── AccountantTriggerWarning.tsx    # Dynamic "speak to accountant" alerts
│   └── organisms/DirectorOptimizer/
│       ├── DirectorOptimizerForm.tsx       # Input form
│       ├── DirectorResultsComparison.tsx   # 2-column results
│       └── DirectorInsightsPanel.tsx       # Insights/recommendations
├── lib/
│   ├── directorCalculator.ts               # Core calculation logic
│   └── __tests__/
│       └── directorCalculator.test.ts      # Comprehensive tests
└── constants/
    └── taxRates.ts                         # ADD: Corporation & dividend rates
```

---

## Tax Rates Additions (src/constants/taxRates.ts)

### Structure Note

Separate personal tax years from corporation tax financial years for future flexibility:

```typescript
// Personal tax (keyed by tax year: "2025-2026")
export const PERSONAL_TAX_RATES = { ... }

// Corporation tax (keyed by financial year, but typically aligned)
export const CORP_TAX_RATES = { ... }
```

### 2025-26 Rates to Add

```typescript
// Income Tax Bands (England/Wales/NI)
incomeTax: {
  personalAllowance: 12570,
  personalAllowanceTaperThreshold: 100000,  // PA reduces above this
  personalAllowanceTaperRate: 0.5,          // £1 reduction per £2 over threshold
  basicRateLimit: 37700,                    // £12,571 to £50,270
  higherRateLimit: 125140,                  // £50,271 to £125,140
  basicRate: 20,
  higherRate: 40,
  additionalRate: 45,
},

corporationTax: {
  smallProfitsRate: 19,              // Profits ≤ £50,000
  mainRate: 25,                      // Profits ≥ £250,000
  marginalReliefLowerLimit: 50000,
  marginalReliefUpperLimit: 250000,
  marginalReliefFraction: [3, 200],  // Store as fraction to avoid float errors
},

dividendTax: {
  allowance: 500,                    // 2025-26
  basicRate: 8.75,
  higherRate: 33.75,
  additionalRate: 39.35,
  // April 2026 changes (store for future):
  // basicRate_2026: 10.75,
  // higherRate_2026: 35.75,
},

// Historical reference (for content accuracy)
dividendAllowanceHistory: {
  '2023-2024': 1000,
  '2024-2025': 500,   // Was £500, not £1,000
  '2025-2026': 500,
},

employerNI: {
  secondaryThreshold: 5000,          // Annual
  rate: 15,                          // Percent (was 13.8% before April 2025)
},

employeeNI: {
  primaryThreshold: 12570,           // Annual (aligned with PA)
  lowerEarningsLimit: 6500,          // For NI credits
  upperEarningsLimit: 50270,
  rateBelowUEL: 8,                   // Percent
  rateAboveUEL: 2,                   // Percent
},

employmentAllowance: {
  amount: 10500,                     // 2025-26
  // Note: £100k NI liability limit REMOVED from April 2025
  // Eligibility now based on single-director rule only
},
```

**Sources:**
- [HMRC Employer Rates 2025-26](https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2025-to-2026)
- [Dividend Tax Rates](https://www.gov.uk/tax-on-dividends)
- [Corporation Tax Marginal Relief](https://www.gov.uk/guidance/corporation-tax-marginal-relief)
- [Employment Allowance Eligibility](https://www.gov.uk/claim-employment-allowance/eligibility)

---

## Employment Allowance: Correct Implementation

### The Rules (From HMRC)

**Single-director exclusion (STILL IN PLACE):**
> "Limited companies cannot claim Employment Allowance if they have just one director and that director is the only employee liable for secondary Class 1 National Insurance."
> — [HMRC: Single-director companies and Employment Allowance](https://www.gov.uk/government/publications/employment-allowance-more-detailed-guidance/single-director-companies-and-employment-allowance-further-employer-guidance)

**£100k NI limit REMOVED from April 2025:**
> "From April 2025, Employers paying more than £100,000 in Class 1 National Insurance liabilities can apply for Employment Allowance."
> — [HMRC: Employment Allowance Eligibility](https://www.gov.uk/claim-employment-allowance/eligibility)

### The Solution

**Don't infer eligibility. Ask directly.**

```
┌─────────────────────────────────────────────────────────────────┐
│  Does your company claim Employment Allowance?                  │
│                                                                 │
│  ○ Yes, we claim it                                             │
│  ○ No, we don't claim it                                        │
│  ○ I'm not sure                                                 │
│                                                                 │
│  [ⓘ What is Employment Allowance?]                              │
└─────────────────────────────────────────────────────────────────┘
```

**"What is Employment Allowance?" Popover:**

```
Employment Allowance lets eligible companies reduce their 
Employer National Insurance bill by up to £10,500/year.

⚠️ Most single-director companies are NOT eligible.

You CAN claim if:
• You have at least one non-director employee paid above the 
  Secondary Threshold (£5,000/year)

You CANNOT claim if:
• The director is the only person paid above the Secondary Threshold
• You're a public body or doing more than 50% public sector work

→ Check HMRC's eligibility rules or ask your accountant.
```

**Logic:**
- "Yes" → Apply £10,500 offset to Employer NI
- "No" → No offset
- "Not sure" → Default to NO (conservative), show potential uplift in insights

**Additional Assumption (when EA = Yes):**
> "Assumes Employment Allowance is available to offset employer NIC on your pay. If you have other employees, EA may already be partially or fully used by their payroll."

---

## Calculation Logic (src/lib/directorCalculator.ts)

### CRITICAL: Personal Allowance Applies to Dividends

**From HMRC:**
> "You do not pay tax on any dividend income that falls within your Personal Allowance."
> — [GOV.UK: Tax on dividends](https://www.gov.uk/tax-on-dividends)

When calculating dividend tax for someone with NO salary (All Dividend scenario):
1. Personal Allowance (£12,570) applies to dividend income FIRST
2. Then Dividend Allowance (£500) applies at 0%
3. Remaining dividends taxed at 8.75%/33.75%/39.35%

**This significantly reduces tax in the All Dividend scenario.**

### Technical Note: Use Integer Arithmetic

To avoid floating-point errors:

```typescript
// Store all amounts in pence internally
const profitPence = profit * 100;

// For marginal relief, use fraction components
const relief = ((250000 - profit) * 3) / 200;

// Rounding rules (per HMRC practice):
// - Intermediate calculations: truncate to pence
// - Final tax amounts: round to nearest pound
// - NI contributions: round to nearest penny
// - Corporation Tax: round down to nearest pound
```

### Core Interface

```typescript
interface DirectorOptimizerInput {
  estimatedProfit: number;
  taxYear: TaxYear;
  claimsEmploymentAllowance: boolean | null;  // null = "not sure"
  otherNonSavingsIncome: number;              // Default: 0
}

interface ExtractionScenario {
  salary: number;
  dividend: number;
  employerNI: number;
  employerNIAfterEA: number;
  corporationTax: number;
  incomeTax: number;
  employeeNI: number;
  dividendTax: number;
  totalPersonalTax: number;
  netTakeHome: number;
  effectiveRate: number;
}

interface OptimizerResult {
  scenarios: {
    allDividend: ExtractionScenario;
    lowestTax: ExtractionScenario;
    maxSalary: ExtractionScenario | null;
  };
  potentialSavings: number;
  warnings: string[];
}
```

### Functions to Implement

1. **calculateCorporationTax(profit, taxYear)**
   - Small profits rate (19%) for profits ≤ £50,000
   - Main rate (25%) for profits ≥ £250,000
   - Marginal relief formula: `(3/200) × (£250,000 - profit)`

2. **calculateEmployerNI(salary, claimsEA, taxYear)**
   - 15% on salary above £5,000 threshold
   - If claimsEA: offset up to £10,500 (cap at actual liability)

3. **calculateDividendTax(dividend, salary, otherIncome, taxYear)**
   - **CRITICAL:** Apply PA to dividend income when salary + otherIncome < PA
   - **CRITICAL:** Handle PA taper for high earners (see below)
   - Income stacking order: Non-savings → Savings → Dividends
   - Apply £500 dividend allowance at 0% within appropriate band
   - Apply 8.75% / 33.75% / 39.35% by remaining band

### Personal Allowance Taper (£100k+ Income)

**The Tax Trap:** If total income (salary + other + dividends) exceeds £100,000, PA reduces by £1 for every £2 over.

```typescript
function getPersonalAllowance(adjustedNetIncome: number, taxYear: TaxYear): number {
  const basePA = 12570; // 2025-26
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

**Implementation:** The calculator MUST model this, not just warn about it. Users extracting £150k+ need accurate numbers showing their reduced PA.

4. **calculateScenario(salary, profit, input)**
   - Full extraction calculation for a given salary amount

5. **findLowestTaxExtraction(input)**
   - Test salary points: £0, £5,000, £6,500, £9,100, £12,570, £50,270
   - **Feasibility check:** If salary + employerNI > profit, mark scenario as "Not feasible"
   - Never select an infeasible scenario as "lowest tax"
   - Return scenarios + warnings

### Feasibility Guardrails

```typescript
function isScenarioFeasible(salary: number, profit: number): boolean {
  const employerNI = Math.max(0, (salary - 5000) * 0.15);
  const totalSalaryCost = salary + employerNI;
  return totalSalaryCost <= profit;
}

// For each salary point:
// - If not feasible, exclude from "lowest tax" consideration
// - Low profit (< £5,000): Only "All Dividend" will be feasible
// - Prevent negative dividends or negative CT scenarios
```

---

## UI Structure

### Input Section

**Field 1: Region (GATING QUESTION - Ask First)**

```
Where do you live?
○ England, Wales, or Northern Ireland
○ Scotland
```

**If Scotland selected → Block immediately:**
```
┌─────────────────────────────────────────────────────────────────┐
│  🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scottish Tax Rates Coming Soon                           │
│                                                                 │
│  Scottish income tax rates are different from the rest of the   │
│  UK. We're working on adding support.                           │
│                                                                 │
│  For now, please consult an accountant for accurate figures.    │
│                                                                 │
│  [Notify me when Scotland is available]                         │
└─────────────────────────────────────────────────────────────────┘
```

**If England/Wales/NI selected → Continue to Step 2:**

**Field 2: Estimated Profit (Required)**

```
What's your company's estimated profit this year?
£ [________]

This is income minus expenses, before Corporation Tax and your pay.
[ⓘ Where do I find this?]
```

**Field 3: Employment Allowance**

```
Does your company claim Employment Allowance?
○ Yes  ○ No  ○ Not sure
[ⓘ What is this?]
```

**Field 4: Other Income (Optional, Collapsed)**

```
▼ I have other personal income

Other income from employment or property: £ [________]
(Salary from another job, rental income, etc. Not savings interest.)
```

### Assumptions Panel (Always Visible)

```
📋 What we're assuming:
• 12-month accounting period (not a short first year)
• You're the only director
• No associated companies (full CT thresholds apply)
• No employer pension contributions
• No student loan
• Standard NI category A
• England/Wales/NI tax rates
• Your company has sufficient distributable reserves for dividends

💡 Employer pension contributions can be more tax-efficient than 
   dividends for higher earners. Ask your accountant about this.

If your situation differs, results may vary.
```

### Results Display

**Hero Result (Plain English):**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  💰 Estimated take-home: £66,543                                │
│                                                                 │
│  That's potentially £1,654 more than taking it all as dividends.│
│                                                                 │
│  If you paid yourself:                                          │
│  • £12,570 salary (covered by Personal Allowance)               │
│  • £67,176 in dividends                                         │
│  • Total tax paid: £13,203                                      │
│                                                                 │
│  [See comparison ▼]   [Copy results]   [Email to accountant]    │
│                                                                 │
│  ⚠️ Dividends can only be paid from distributable profits       │
│     (retained earnings), not just cash in the bank.             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Comparison Table (Expandable):**

| | All Dividend | Lowest Tax Option |
|--|--------------|-------------------|
| Salary | £0 | £12,570 |
| Dividend | £77,250 | £67,176 |
| Corp Tax | £22,750 | £19,118 |
| Personal Tax | £12,361 | £13,203 |
| **Take-Home** | £64,889 | **£66,543** |

**Why this works:**
> Taking £12,570 as salary uses your tax-free Personal Allowance on income that 
> also reduces Corporation Tax (salary is a deductible expense). While personal 
> tax is slightly higher, the overall tax bill is lower.

### NI Credits Warning

If salary < £6,500 (Lower Earnings Limit):

```
⚠️ State Pension Warning
A salary below £6,500/year won't count towards your State Pension 
qualifying years. Consider paying at least £6,500 if you want NI credits.
```

---

## Golden Example: CORRECTED (£100k Profit, 2025-26)

**Input:**
- Estimated profit: £100,000
- Employment Allowance: No
- Other income: £0
- Region: England

### Strategy 1: All Dividend (PA APPLIES TO DIVIDENDS)

```
Company profit:                 £100,000
Corporation tax:                £22,750    (marginal relief band, 22.75%)
───────────────────────────────────────────
Profit after CT:                £77,250    (available for dividend)

Dividend income:                £77,250

Tax calculation (PA applies to dividends when no other income):
  £0 - £12,570 (PA):            £0 tax
  £12,571 - £13,070 (DA):       £0 tax (first £500 of taxable at 0%)
  £13,071 - £50,270 (Basic):    £37,200 @ 8.75% = £3,255
  £50,271 - £77,250 (Higher):   £26,980 @ 33.75% = £9,106

Total dividend tax:             £12,361
───────────────────────────────────────────
Director take-home:             £64,889
Effective rate:                 35.1%
```

### Strategy 2: Lowest Tax (£12,570 Salary + Dividends)

```
Salary:                         £12,570    (= Personal Allowance)
Employer NI:                    £1,136     (£12,570 - £5,000) × 15%
Total salary cost to company:   £13,706
───────────────────────────────────────────
Remaining profit:               £86,294    (£100k - £13,706)

Corporation tax calculation:
  Tax at 25%:                   £21,573.50
  Marginal relief:              (£2,455.59) = (£250,000 - £86,294) × 3/200
  Corporation tax:              £19,118 (rounded)
───────────────────────────────────────────
Profit after CT:                £67,176    (£86,294 - £19,118)

Personal tax on salary:         £0         (within Personal Allowance)
Employee NI:                    £0         (below Primary Threshold)

Dividend:                       £67,176

Tax calculation (PA used by salary, dividends start at £12,571):
  £12,571 - £13,070 (DA):       £0 tax (first £500 at 0%)
  £13,071 - £50,270 (Basic):    £37,200 @ 8.75% = £3,255
  £50,271 - £79,746 (Higher):   £29,476 @ 33.75% = £9,948

Total dividend tax:             £13,203
───────────────────────────────────────────
Director take-home:             £66,543    (£12,570 + £67,176 - £13,203)
Effective rate:                 33.5%
```

### CORRECTED Comparison Table

| Strategy | Salary | Dividend | Corp Tax | Personal Tax | Take-Home |
|----------|--------|----------|----------|--------------|-----------|
| All Dividend | £0 | £77,250 | £22,750 | £12,361 | £64,889 |
| **Lowest Tax** | £12,570 | £67,176 | £19,118 | £13,203 | **£66,543** |

**Potential savings: £1,654** (2.5% improvement)

> **Note:** Previous versions incorrectly showed £5,896 savings because PA was not applied to the All Dividend scenario. The actual benefit of the salary + dividend mix is smaller but still meaningful.

### Test Fixture (Use in Jest)

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

## Scotland Handling

**Do not calculate with wrong rates. Block explicitly.**

```typescript
if (region === 'scotland') {
  return {
    error: 'SCOTLAND_NOT_SUPPORTED',
    message: 'Scottish income tax rates differ from the rest of the UK. ' +
             'This tool doesn\'t support Scottish calculations yet. ' +
             'Please consult an accountant for accurate Scottish figures.',
  };
}
```

---

## Additional Warnings

### Director's Loan Account (DLA) Warning

```
⚠️ Director's Loan Account
If you've withdrawn money outside of payroll or declared dividends, 
you may have a Director's Loan Account. This has different tax rules 
and isn't covered by this tool. Speak to your accountant.
```

### Short Accounting Period Warning

```
📅 First-Year Companies
If your company's first accounting period is shorter than 12 months, 
Corporation Tax thresholds are pro-rated. This tool assumes a full 
12-month period.
```

### VAT Warning

```
⚠️ VAT Reminder
If you're VAT registered, make sure your profit figure excludes VAT 
you've collected. That money belongs to HMRC, not your company.
```

---

## MVP Scope Limitations

### Out of Scope (Phase 1)

| Feature | Reason | Phase |
|---------|--------|-------|
| Scotland tax rates | Different bands | Phase 2 |
| Pension contributions | Major impact | Phase 2 |
| Student loan repayments | Common for young directors | Phase 2 |
| Associated companies | Affects CT thresholds | Phase 2 |
| Short accounting periods | Pro-rata CT | Phase 2 |
| Multiple directors | Complex splits | Phase 2 |

### Assumptions (Display Prominently)

1. 12-month accounting period
2. Single director, no other employees above Secondary Threshold
3. No associated companies (full £50k/£250k CT thresholds)
4. No employer pension contributions
5. No student loan
6. Standard NI category A
7. England/Wales/NI tax rates
8. Dividends paid from sufficient distributable reserves

---

## Implementation Order

### Step 0: Verification (BLOCKER)

- [ ] Build spreadsheet oracle matching corrected golden example
- [ ] Verify All Dividend: £77,250 dividend → £12,361 tax → £64,889 take-home
- [ ] Verify Lowest Tax: £12,570 salary + £67,176 dividend → £66,543 take-home
- [ ] Verify savings: £1,654 (not £5,896)
- [ ] Get accountant sign-off

### Step 1: Tax Rates

- [ ] Add `corporationTax` to taxRates.ts
- [ ] Add `dividendTax` to taxRates.ts  
- [ ] Add `employmentAllowance` to taxRates.ts (remove £100k limit reference)
- [ ] Add TypeScript types

### Step 2: Calculation Engine

- [ ] Create directorCalculator.ts with integer pence arithmetic
- [ ] Implement calculateCorporationTax() with marginal relief
- [ ] Implement calculateEmployerNI() with EA offset
- [ ] **CRITICAL:** Implement calculateDividendTax() with PA applied to dividends
- [ ] Implement findLowestTaxExtraction()
- [ ] Write tests using corrected GOLDEN_EXAMPLE fixture
- [ ] All tests must pass before proceeding

### Step 3: Components

- [ ] ScenarioComparisonCard.tsx
- [ ] DirectorInsightCard.tsx
- [ ] AccountantTriggerWarning.tsx
- [ ] DirectorOptimizerForm.tsx
- [ ] DirectorResultsComparison.tsx
- [ ] DirectorInsightsPanel.tsx

### Step 4: Pages

- [ ] /tools/page.tsx (landing)
- [ ] /tools/director-optimizer/page.tsx (server + metadata)
- [ ] /tools/director-optimizer/DirectorOptimizerClient.tsx
- [ ] /tools/pricing/page.tsx

### Step 5: Testing & Polish

- [ ] E2E tests with Playwright
- [ ] Mobile responsive testing
- [ ] Accessibility audit (WCAG 2.2 AA)
- [ ] Scotland blocking works correctly
- [ ] `bun run fix-all` passes
- [ ] Bundle size < 3MB

---

## HMRC Sources (Verified 2026-01-25)

| Topic | Source |
|-------|--------|
| **PA applies to dividends** | [GOV.UK](https://www.gov.uk/tax-on-dividends) - "You do not pay tax on any dividend income that falls within your Personal Allowance" |
| Corporation Tax Marginal Relief | [GOV.UK](https://www.gov.uk/guidance/corporation-tax-marginal-relief) |
| EA £100k limit removed | [GOV.UK](https://www.gov.uk/claim-employment-allowance/eligibility) - "From April 2025, Employers paying more than £100,000... can apply" |
| Single-Director EA Exclusion | [GOV.UK](https://www.gov.uk/government/publications/employment-allowance-more-detailed-guidance/single-director-companies-and-employment-allowance-further-employer-guidance) |
| Employer NI Rates 2025-26 | [GOV.UK](https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2025-to-2026) |
| Dividend Tax Rates | [GOV.UK](https://www.gov.uk/tax-on-dividends) |

---

## Go-Live Checklist

### Pre-Launch (Calculation Verification)

- [ ] All Dividend: £64,889 take-home (not £60,772)
- [ ] Lowest Tax: £66,543 take-home
- [ ] Savings: £1,654 (not £5,896)
- [ ] Marginal relief test cases pass
- [ ] Dividend tax with PA correctly applied
- [ ] NI credits warning triggers at £6,500

### Pre-Launch (Quality)

- [ ] Scotland blocks correctly
- [ ] Mobile responsive
- [ ] WCAG 2.2 AA compliant
- [ ] `bun run fix-all` passes
- [ ] E2E tests pass

### Launch Day

- [ ] Deploy to production
- [ ] Verify live calculations match oracle
- [ ] Submit sitemap

---

## Marketing Implications

**Previous messaging (INCORRECT):**
> "Save nearly £6,000 with the optimal salary/dividend mix"

**Correct messaging:**
> "Save ~£1,650 with the lowest-tax extraction strategy"

The value proposition shifts from "dramatic savings" to "accuracy and peace of mind." Still valuable (£1,654 is meaningful), but marketing should emphasize:
- Correct calculations (competitors may have the same PA error)
- Understanding your options before talking to your accountant
- Time saved vs manual spreadsheet calculations

---

## Open Questions

| Question | Status |
|----------|--------|
| Exact optimal salary with EA claimed? | Needs spreadsheet modeling |
| Should we show "Max Salary" as third column? | UX decision |
| ~~Email-to-accountant feature for MVP?~~ | **RESOLVED: Use mailto: link (see below)** |

### Resolved: Email to Accountant (MVP)

**Decision:** No backend email service for MVP. Use `mailto:` link.

```tsx
<a 
  href={`mailto:?subject=Tax%20Estimate%20from%20PayeTax&body=${encodeURIComponent(copyText)}`}
  target="_blank"
>
  Email to accountant
</a>
```

**Benefits:**
- Zero backend complexity
- Works immediately
- Feels personal (comes from director's email)
- No SendGrid/Resend costs

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Calculation errors | Spreadsheet oracle + unit tests with HMRC-verified figures |
| Users confuse cash with profit | Clear labeling + VAT warning |
| EA eligibility confusion | Direct question + HMRC link |
| Legal claims of "advice" | Defensive language + disclaimer |
| April 2026 rate changes | Rates in config, plan March update |

---

## Success Metrics

### Phase 1 (Soft Launch)
- 50+ calculations completed
- < 5% input stage drop-off
- Zero "calculation is wrong" complaints

### Phase 2 (Public Launch)
- 500+ MAU (free tier)
- 20+ Pro subscribers (3 months)

---

---

## UX/UI Specifications

### Term Glossary (Tooltips)

Add info tooltips (ⓘ) for these terms. First-time directors won't know them:

| Term | Tooltip Text |
|------|-------------|
| Corporation Tax | Tax your company pays on its profits. Currently 19-25% depending on profit level. |
| Personal Allowance | The amount you can earn tax-free each year (£12,570 for 2025-26). |
| Dividend | Money paid to shareholders from company profits, after Corporation Tax. |
| Dividend Allowance | First £500 of dividends are tax-free (2025-26). |
| Marginal Relief | A formula that gradually increases Corporation Tax rate between £50k-£250k profit. |
| Employment Allowance | Up to £10,500 off your Employer National Insurance bill (if eligible). |
| Secondary Threshold | The salary level (£5,000/year) above which employers pay National Insurance. |
| Distributable Reserves | Accumulated profits available to pay as dividends. Not the same as cash in bank. |
| Lower Earnings Limit | Minimum salary (£6,500/year) to qualify for State Pension National Insurance credits. |

### Input Validation Rules

| Field | Type | Min | Max | Format | Error Message |
|-------|------|-----|-----|--------|---------------|
| Estimated Profit | Currency | £1 | £10,000,000 | Whole pounds | "Enter an amount between £1 and £10 million" |
| Other Income | Currency | £0 | £10,000,000 | Whole pounds | "Enter a valid amount" |

**Input HTML (Mobile-Optimized):**
```tsx
// Use inputmode="decimal" NOT type="number" (avoids spinner/scroll issues)
<input
  type="text"
  inputMode="decimal"
  pattern="[0-9]*"
  placeholder="100,000"
  aria-label="Estimated company profit in pounds"
/>
```

**Validation Behavior:**
- Strip currency symbols and commas on input
- Allow decimals but round to nearest pound
- Show inline validation on blur, not on every keystroke
- Disable Calculate button until profit field is valid

### Error States

**Invalid Input:**
```
┌─────────────────────────────────────────────────────────────────┐
│  What's your company's estimated profit this year?              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ £ -5,000                                          [!]    │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ❌ Enter a positive amount                                     │
└─────────────────────────────────────────────────────────────────┘
```

**Scotland Selected:**
```
┌─────────────────────────────────────────────────────────────────┐
│  ⚠️ Scottish Tax Rates Not Supported                            │
│                                                                 │
│  Scottish income tax rates are different from the rest of the   │
│  UK. We're working on adding support for Scotland.              │
│                                                                 │
│  For now, please consult an accountant for accurate figures.    │
│                                                                 │
│  [Notify me when Scotland is available]                         │
└─────────────────────────────────────────────────────────────────┘
```

### Loading/Calculating State

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ⏳ Calculating your options...                                  │
│                                                                 │
│  [████████░░░░░░░░░░░░]                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

Note: Calculations are instant (<100ms), so this may flash briefly or not show at all. Include for perceived responsiveness.

### Edge Case States

**Profit = £0:**
```
┌─────────────────────────────────────────────────────────────────┐
│  💡 No profit to extract                                        │
│                                                                 │
│  With £0 profit, there's nothing available to pay yourself.     │
│  Come back when your company has made some profit!              │
└─────────────────────────────────────────────────────────────────┘
```

**Very Low Profit (< £5,000):**
```
┌─────────────────────────────────────────────────────────────────┐
│  💰 Estimated take-home: £4,250                                 │
│                                                                 │
│  With profit this low, taking it all as dividends is simplest.  │
│  The tax difference between strategies is minimal.              │
│                                                                 │
│  💡 Tip: Consider keeping profits in the company to grow        │
│     your business, rather than extracting everything.           │
└─────────────────────────────────────────────────────────────────┘
```

**Very High Profit (> £500,000):**
```
⚠️ High Profit Warning
Profits above £250,000 attract the full 25% Corporation Tax rate.
At this level, you should also consider:
• Associated company rules (do you own other companies?)
• Pension contributions (often very tax-efficient)
• Year-end tax planning with your accountant
```

### Mobile Layout

**Breakpoints:**
- Desktop: 1024px+ (2-column comparison)
- Tablet: 768px-1023px (2-column, compressed)
- Mobile: <768px (stacked single column)

**Mobile Results Display:**
```
┌─────────────────────────────────┐
│  💰 Take-home: £66,543          │
│  Potential extra: +£1,654       │
│                                 │
│  ┌───────────────────────────┐  │
│  │ LOWEST TAX OPTION         │  │
│  │ Salary: £12,570           │  │
│  │ Dividends: £67,176        │  │
│  │ Tax (company + you): £32,321│ │
│  └───────────────────────────┘  │
│                                 │
│  [Compare with All Dividend ▼]  │
│                                 │
│  [Copy]  [Email to accountant]  │
└─────────────────────────────────┘
```

On mobile:
- Comparison table becomes swipeable cards or accordion
- "Copy" and "Email" buttons stack vertically
- Info popovers become bottom sheets

### Animations & Transitions

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Results appear | Fade in + slide up | 300ms | ease-out |
| Numbers counting | Count up animation | 500ms | ease-out |
| Accordion expand | Height + fade | 200ms | ease-in-out |
| Warning appear | Fade in | 200ms | ease-out |
| Tooltip show | Fade in | 150ms | ease-out |

**Reduced Motion:** Respect `prefers-reduced-motion` - disable count-up animation and reduce transitions to opacity only.

### Try Example Button

Add to input section:

```
┌─────────────────────────────────────────────────────────────────┐
│  🎯 Try an example                                              │
│                                                                 │
│  "I have £100,000 company profit. What's the best way to        │
│   pay myself?"                                                  │
│                                                                 │
│  [Show me →]                                                    │
└─────────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Pre-fills: Profit = £100,000, EA = No, Other Income = £0, Region = England
- Auto-scrolls to results
- Shows comparison with explanation

### Copy Results Format

When user clicks "Copy results":

```
Director Salary vs Dividend Estimate
Generated by PayeTax.co.uk

INPUT
-----
Company Profit: £100,000
Employment Allowance: No
Other Income: £0
Tax Year: 2025-26

LOWEST TAX OPTION
-----------------
Salary: £12,570
Dividends: £67,176
Corporation Tax: £19,118
Personal Tax: £13,203
Take-Home: £66,543

COMPARED TO ALL DIVIDENDS
-------------------------
Take-Home: £64,889
Difference: £1,654 less

⚠️ This is an estimate only. Confirm with your accountant.
```

### Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Move between form fields |
| Enter | Submit form / Activate button |
| Escape | Close popover/modal |
| Arrow keys | Navigate radio options |
| Space | Toggle checkbox / Select radio |

**Focus Order:**
1. Profit input
2. "Where do I find this?" link
3. Employment Allowance radios
4. "What is this?" link
5. Other Income toggle
6. (If expanded) Other Income input
7. Region radios
8. Calculate button

---

## Accessibility Requirements

### WCAG 2.2 AA Compliance

| Requirement | Implementation |
|-------------|----------------|
| Color contrast | All text meets 4.5:1 ratio minimum |
| Focus indicators | Visible 2px outline on all interactive elements |
| Error identification | Errors announced, not just color-coded |
| Labels | All inputs have visible labels + aria-label |
| Touch targets | Minimum 44x44px for all buttons |
| Zoom | Page usable at 200% zoom |

### ARIA Labels

```tsx
// Profit input
<input
  type="text"
  id="profit"
  aria-label="Estimated company profit in pounds"
  aria-describedby="profit-help profit-error"
  aria-invalid={hasError}
/>

// Results section
<section
  aria-label="Calculation results"
  aria-live="polite"
  aria-atomic="true"
>

// Warning
<div role="alert" aria-live="assertive">
  ⚠️ State Pension Warning...
</div>
```

### Screen Reader Considerations

- Results announced when calculated: "Results ready. Estimated take-home: sixty-six thousand, five hundred and forty-three pounds."
- Currency values read as words, not digits
- Comparison table has proper `<th>` headers with `scope`
- Expandable sections announce state: "Comparison table, collapsed. Press Enter to expand."

---

## SEO & Metadata

### Page Titles

| Page | Title |
|------|-------|
| /tools | Free UK Tax Tools for Directors | PayeTax |
| /tools/director-optimizer | Director Salary vs Dividend Calculator 2025-26 | PayeTax |
| /tools/pricing | Director Tools Pricing | PayeTax |

### Meta Descriptions

| Page | Description (max 155 chars) |
|------|----------------------------|
| /tools | Free tax calculators for UK company directors. Salary vs dividend optimizer, take-home pay estimator, and more. |
| /tools/director-optimizer | Calculate the most tax-efficient way to pay yourself as a UK director. Compare salary vs dividends for 2025-26. Free, instant results. |
| /tools/pricing | Compare PayeTax Director Tools pricing. Free calculator, Pro features, and Firm accounts for accountants. |

### Open Graph

```tsx
// /tools/director-optimizer
<meta property="og:title" content="Director Salary vs Dividend Calculator" />
<meta property="og:description" content="Find the most tax-efficient way to pay yourself from your limited company." />
<meta property="og:image" content="/og/director-optimizer.png" />
<meta property="og:type" content="website" />
```

**OG Image (1200x630):**
- Clean design showing: "£100k profit → £66,543 take-home"
- PayeTax branding
- "Free Calculator" badge

### Schema.org Markup

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Director Salary vs Dividend Calculator",
  "description": "Calculate the most tax-efficient way to pay yourself as a UK limited company director",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "GBP"
  },
  "author": {
    "@type": "Organization",
    "name": "PayeTax",
    "url": "https://payetax.co.uk"
  }
}
```

---

## Analytics & Tracking

### PostHog Events

| Event | Properties | Trigger |
|-------|------------|---------|
| `director_calculator_viewed` | `source` | Page load |
| `director_calculator_started` | `profit_entered` | First input |
| `director_calculator_completed` | `profit`, `result_take_home`, `result_savings`, `ea_status` | Results shown |
| `director_calculator_example_used` | - | "Try example" clicked |
| `director_calculator_copied` | - | "Copy results" clicked |
| `director_calculator_email_clicked` | - | "Email to accountant" clicked |
| `director_calculator_error` | `error_type`, `input_value` | Validation/calculation error |
| `director_calculator_scotland_blocked` | - | Scotland selected |
| `director_calculator_warning_shown` | `warning_type` | Dynamic warning displayed |

### Conversion Funnel

1. Page view → 2. Input started → 3. Calculation completed → 4. Results copied/shared

**Target conversion rates:**
- View → Input: 60%+
- Input → Complete: 80%+
- Complete → Copy/Share: 20%+

---

## Performance Requirements

### Core Web Vitals Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| LCP (Largest Contentful Paint) | < 2.5s | Input form visible |
| FID (First Input Delay) | < 100ms | Time to respond to first input |
| CLS (Cumulative Layout Shift) | < 0.1 | No layout jumps |
| INP (Interaction to Next Paint) | < 200ms | Calculate button response |

### Bundle Budget

| Asset | Max Size |
|-------|----------|
| Page JS | < 150KB gzipped |
| Page CSS | < 30KB gzipped |
| Total page | < 500KB initial load |
| Calculator logic | < 10KB |

### Optimization

- Calculation logic in separate chunk (lazy loaded after initial paint)
- Results section lazy rendered (only after calculation)
- No external API calls (all client-side)
- Preload critical fonts

---

## Content & Copy

### All UI Text

**Page Header:**
```
Director Salary vs Dividend Calculator
Find the most tax-efficient way to pay yourself from your limited company.
Tax Year: 2025-26
```

**Calculate Button:**
- Default: "Calculate my options"
- Loading: "Calculating..."
- Disabled: "Enter your profit to calculate"

**Results Header:**
- "Here's what we found" (not "Here's what you should do")

**Disclaimer (footer of results):**
```
This is an estimate based on the assumptions shown. Your actual tax 
position may differ. Always confirm with a qualified accountant before 
making financial decisions.
```

### Error Messages

| Error | Message |
|-------|---------|
| Empty profit | "Enter your estimated company profit" |
| Negative profit | "Enter a positive amount" |
| Too high | "Enter an amount under £10 million. For larger amounts, consult an accountant." |
| Invalid format | "Enter a valid number (e.g., 100000)" |
| Calculation failed | "Something went wrong. Please try again or contact support." |

---

## Testing Strategy

### Unit Tests (Jest)

**Calculator Tests:**
```typescript
describe('calculateDividendTax', () => {
  it('applies PA to dividends when no salary', () => {
    // £77,250 dividend, no salary → £12,361 tax
  });
  
  it('does not double-apply PA when salary uses it', () => {
    // £12,570 salary + £67,176 dividend → £13,203 dividend tax
  });
  
  it('handles PA taper above £100k', () => {
    // Test £100k-£125k trap
  });
});

describe('calculateCorporationTax', () => {
  it('applies small profits rate at £50k', () => {});
  it('applies marginal relief at £100k', () => {});
  it('applies main rate at £250k+', () => {});
});
```

**Edge Case Tests:**
- Profit = £0
- Profit = £1
- Profit = £12,570 (equals PA)
- Profit = £50,000 (CT boundary)
- Profit = £250,000 (CT boundary)
- Other income = £100,000 (PA taper)

**PA Taper Test (£100k-£125k trap):**
```typescript
const PA_TAPER_TEST = {
  input: {
    estimatedProfit: 150000,
    otherNonSavingsIncome: 0,
  },
  expected: {
    // PA reduced: 12570 - ((total_income - 100000) / 2)
    // Should trigger PA taper warning
    // Optimal salary likely differs from £12,570
  },
};
```

### E2E Tests (Playwright)

```typescript
test('golden example produces correct results', async ({ page }) => {
  await page.goto('/tools/director-optimizer');
  await page.fill('[data-testid="profit-input"]', '100000');
  await page.click('[data-testid="ea-no"]');
  await page.click('[data-testid="calculate-button"]');
  
  await expect(page.locator('[data-testid="result-take-home"]'))
    .toContainText('£66,543');
  await expect(page.locator('[data-testid="result-savings"]'))
    .toContainText('£1,654');
});

test('Scotland shows blocked message', async ({ page }) => {
  await page.goto('/tools/director-optimizer');
  await page.click('[data-testid="region-scotland"]');
  
  await expect(page.locator('[data-testid="scotland-blocked"]'))
    .toBeVisible();
});

test('copy results works', async ({ page }) => {
  // ... complete calculation
  await page.click('[data-testid="copy-button"]');
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toContain('PayeTax.co.uk');
});
```

### Accessibility Tests

- axe-core automated scan
- Manual keyboard-only navigation test
- Screen reader test (VoiceOver + NVDA)
- Color contrast verification

### Cross-Browser Testing

| Browser | Version | Priority |
|---------|---------|----------|
| Chrome | Latest | P0 |
| Safari | Latest | P0 |
| Firefox | Latest | P1 |
| Edge | Latest | P1 |
| Safari iOS | Latest | P0 |
| Chrome Android | Latest | P0 |

---

## Operational

### Tax Year Transition Plan

**March 2026 (before April 6):**
1. Add 2026-27 rates to taxRates.ts
2. Update dividend rates (8.75% → 10.75%, 33.75% → 35.75%)
3. Add tax year selector defaulting to 2025-26
4. Test all calculations with new rates
5. Deploy with feature flag

**April 6, 2026:**
1. Switch default to 2026-27
2. Keep 2025-26 available for comparison
3. Update marketing copy
4. Monitor for issues

### Rate Update Process

When HMRC announces rate changes:
1. Create PR with new rates in taxRates.ts
2. Update golden example if thresholds change
3. Run full test suite
4. Get accountant sign-off
5. Deploy

### Monitoring & Alerting

**Sentry:**
- Track JS errors
- Alert on >1% error rate
- Custom event for calculation mismatches

**Uptime:**
- /tools/director-optimizer health check
- Alert if down >5 minutes

**Analytics:**
- Weekly review of completion rate
- Alert if completion drops >20%

### Support FAQ

**Q: Why is my take-home different from what my accountant said?**
A: This calculator makes several assumptions (listed on screen). Your actual situation may include pension contributions, student loans, other income, or a different accounting period.

**Q: Can I use this for my actual tax return?**
A: No. This is for illustration only. Use the figures from your actual payroll and accounts for tax returns.

**Q: Why can't I select Scotland?**
A: Scottish income tax rates are different, and we're still building support for them. Coming soon!

**Q: The numbers don't match last year - why?**
A: Tax rates and thresholds change each April. Make sure you're looking at the correct tax year.

---

## Privacy & Data

### Data Handling

**No personal data stored:**
- All calculations happen client-side
- No inputs saved to server
- No user accounts required for free tier
- No cookies except analytics (with consent)

### Analytics Privacy

- PostHog configured with privacy mode
- IP addresses anonymized
- No PII in event properties
- **All monetary values bucketed** (not exact amounts):
  - Profit: £0-25k, £25k-50k, £50k-100k, £100k-250k, £250k+
  - Take-home: Same buckets
  - Savings: £0-500, £500-1k, £1k-2k, £2k-5k, £5k+

---

## Launch Checklist (Detailed)

### T-7 Days (One Week Before)

- [ ] All unit tests passing
- [ ] All E2E tests passing
- [ ] Accessibility audit complete
- [ ] Accountant has signed off golden example
- [ ] Legal has reviewed disclaimer language
- [ ] OG images created and tested
- [ ] Analytics events firing correctly

### T-1 Day (Day Before)

- [ ] Final QA on staging
- [ ] Load testing (handle 100 concurrent users)
- [ ] Rollback procedure documented
- [ ] Support team briefed on FAQ
- [ ] Social posts drafted

### Launch Day

- [ ] Deploy to production
- [ ] Smoke test all critical paths
- [ ] Verify analytics
- [ ] Submit sitemap to Google Search Console
- [ ] Post on LinkedIn/Twitter
- [ ] Monitor error rates for 2 hours

### T+1 Day (Day After)

- [ ] Review analytics funnel
- [ ] Check for support tickets
- [ ] Fix any critical issues
- [ ] Thank early users for feedback

### Post-Launch Differentiation

- [ ] Test against competitors (Alto Accounting, UK Tax Calculators) with £100k input
- [ ] If they show ~£60,772 for all-dividends (not £64,889), they have the PA error
- [ ] Potential marketing angle: "Other calculators get this wrong"

---

## Rollback Plan

**If critical bug found post-launch:**

1. **Immediate:** Add banner "Calculator temporarily unavailable for maintenance"
2. **Within 15 min:** Revert to previous deployment via Vercel
3. **Within 1 hour:** Investigate root cause
4. **Within 24 hours:** Fix, test, redeploy

**If calculation error found:**
1. Add warning banner: "We're verifying a calculation issue. Results may be inaccurate."
2. Disable "Copy" and "Email" features
3. Fix and redeploy within 24 hours
4. Post correction notice

---

**Document Status:** v1.7 (FINAL) - ✅ **APPROVED BY ALL 4 REVIEWERS**

| Reviewer | Status |
|----------|--------|
| Gemini | ✅ Approved |
| Grok | ✅ Approved |
| Claude | ✅ Approved (math verified) |
| ChatGPT | ✅ Approved (with tightening, now added) |

Comprehensive implementation plan including:
- Verified tax calculations (PA applied to dividends, marginal relief, PA taper)
- Complete UX/UI specifications with wireframes
- Accessibility (WCAG 2.2 AA), SEO, analytics
- Testing strategy, operational procedures, rollback plan
- Feasibility guardrails, income tax bands, all edge cases

**Next Step:** Proceed to Step 1 - Create `src/constants/taxRates.ts`
