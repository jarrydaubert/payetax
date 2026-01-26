# Director Tools - Build Spec v3.0

> **Purpose:** How to build the "How Much Can I Pay Myself?" guide
> **For tax calculations:** See `DIRECTOR_TOOLS_MATH.md`
> **For product strategy:** See `DIRECTOR_TOOLS.md`
> **Last Updated:** January 2026
> **Status:** ✅ ALL 4 REVIEWERS APPROVED (v2.0 + Additions)

---

## The Principle

**Ask what they KNOW. Calculate what they DON'T.**

Our user (a first-time director) knows:
- Where they live
- What they've invoiced
- What they've spent

They don't know:
- Tax rates, optimal salary, what to set aside, when things are due
- What IR35, Employment Allowance, or accounting periods mean
- The difference between "them" and "their company"

**We don't ask about complexity. We detect it and surface it gently.**

---

## The "Wife Test"

Before any feature, ask:

| Question | Required Answer |
|----------|-----------------|
| Does she need to know what a "fiscal year" is? | No |
| Does she need to know what "Employment Allowance" is? | No |
| Does she need to know what "IR35" means? | No |
| Does she get a number she can transfer today? | **Yes** |

If a feature fails this test, cut it.

---

## Route

`/tools/director-guide`

---

## UX: Single Page, Progressive Disclosure

**Not separate pages. Not a scary form. A guided single page.**

- One page load (fast)
- All questions visible (no mystery)
- Current question active, upcoming questions blurred
- Completed questions collapse with ✓
- Pros can click through fast; beginners take their time

```
┌─────────────────────────────────────────────────────────────────┐
│  HOW MUCH CAN I PAY MYSELF?                                     │
│                                                                 │
│  Let's work it out together. No jargon. No stress.              │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  📋 WHAT YOU'LL NEED                                      │ │
│  │                                                           │ │
│  │  • Where you live (Scotland or rest of UK)                │ │
│  │  • Rough annual revenue                                   │ │
│  │  • Business expenses                                      │ │
│  │  • Any money you've already taken                         │ │
│  │                                                           │ │
│  │  Takes about 2 minutes.                                   │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  1. WHERE IS YOUR MAIN HOME?                        ← ACTIVE    │
│                                                                 │
│  This determines which tax rates apply to your salary.          │
│                                                                 │
│  ○ Scotland                                                     │
│  ○ England, Wales, or Northern Ireland                          │
│                                                                 │
│  [I split my time / not sure →] (links to: "Talk to an          │
│   accountant - tax residency can be complex")                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  2. WHAT'S YOUR ANNUAL REVENUE?                     ← BLURRED   │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  3. WHAT ARE YOUR BUSINESS EXPENSES?                ← BLURRED   │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  4. ALREADY PAID YOURSELF?                          ← BLURRED   │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
└─────────────────────────────────────────────────────────────────┘
```

**As user progresses:**

```
┌─────────────────────────────────────────────────────────────────┐
│  1. WHERE IS YOUR MAIN HOME?                        ✓ COMPLETE  │
│     Scotland                                        [Edit]      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  2. WHAT'S YOUR ANNUAL REVENUE?                     ← ACTIVE    │
│                                                                 │
│  How much has your company invoiced (or expect to invoice)      │
│  for the year ahead? A rough number is fine.                    │
│                                                                 │
│  £ [________________________]                                   │
│                                                                 │
│  ☐ This includes VAT (we'll deduct 20%)                        │
│                                                                 │
│  💡 Tip: Check your accounting software or bank statements.     │
│                                                                 │
│                                            [Continue →]         │
└─────────────────────────────────────────────────────────────────┘
```

---

## The Four Inputs

### 1. Location (One Question Only)

**Question:** "Where is your main home?"

**Options:**
- Scotland
- England, Wales, or Northern Ireland

**Escape hatch:** "I split my time / not sure" → "Tax residency can be complex. Talk to an accountant."

**Why ONE question:**
- Corporation Tax is UK-wide (no regional variation)
- National Insurance is UK-wide
- Only Income Tax varies (Scotland has different rates)
- Company registration location is irrelevant for this calculation

**Scotland note:** Scottish rates apply to SALARY only. Dividends use UK-wide rates.

---

### 2. Revenue

**Question:** "What's your annual revenue?"

**Subtext:** "How much has your company invoiced (or expect to invoice) for the year ahead? A rough number is fine."

**Input:** Currency field with `inputMode="decimal"`

**Checkbox:** "This includes VAT (we'll deduct 20%)"

**Tip:** "Check your accounting software or bank statements."

---

### 3. Expenses

**Question:** "What are your business expenses?"

**Subtext:** "Software, equipment, travel, contractors - that kind of thing. Don't include money you've paid yourself."

**Input:** Currency field with `inputMode="decimal"`

**VAT note (shown if VAT checkbox was ticked):**
> "💡 If you're VAT registered and reclaim VAT on expenses, try to enter expenses excluding VAT for a more accurate estimate."

---

### 4. Already Taken

**Question:** "Have you already paid yourself this year?"

**Options:**
- No, not yet
- Yes → How much? £ [____] → Was this through payroll? Yes / No / Not sure

**Guardrail:** If `alreadyTaken > estimatedTakeHome`:
> "⚠️ You may have taken more than your company can support based on this estimate. Pause and speak to an accountant."

**Timeframe note:** All inputs are for "the year ahead" (next 12 months). If they've already taken money, we're calculating what's LEFT to take.

---

## Silent Assumptions (Hardcoded)

We don't ask. We assume the most common scenario.

| Assumption | Value | Why |
|------------|-------|-----|
| Salary | £12,570 | Uses full Personal Allowance |
| Employment Allowance | No | Single director = not eligible |
| Other income | £0 | Treat this company in isolation |
| Pension contributions | £0 | Keep it simple |
| Student loan | None | See disclaimer |
| Accounting period | 12 months | Most common |
| Tax year | 2025-26 | Current |

**Show in results (collapsible):**
> **Assumptions we made:**
> - Your company is your only income
> - Standard 12-month accounting year
> - No student loan repayments
> - Tax year 2025-26 (starting April 6)

---

## Results: The "Two Boxes" Clarity

First-timers are confused about "the company" vs "me". Make it crystal clear.

```
┌─────────────────────────────────────────────────────────────────┐
│  HERE'S WHAT WE WORKED OUT                                      │
│  Based on ~£75,000 profit for the year ahead                    │
│  [Scottish resident: Your salary uses Scottish tax rates]       │
└─────────────────────────────────────────────────────────────────┘

┌────────────────────────────────┐  ┌────────────────────────────┐
│  🏢 YOUR COMPANY               │  │  👤 YOU                    │
│                                │  │                            │
│  The company is separate from  │  │  You work for your company │
│  you - it has its own tax.     │  │  and it pays you.          │
│                                │  │                            │
│  🏦 COMPANY TAX POT            │  │  💰 AVERAGE MONTHLY PAY    │
│  Set aside: £16,000            │  │  Around: £4,500/mo         │
│                                │  │                            │
│  Keep this in your business    │  │  Salary (£1,047/mo) goes   │
│  account. Don't touch it.      │  │  monthly via payroll.      │
│                                │  │  The rest comes as         │
│  Due: ~9 months after your     │  │  dividends occasionally.   │
│  company year ends             │  │                            │
│                                │  │  🐷 YOUR TAX SAVINGS       │
│                                │  │  Save: £750/mo             │
│                                │  │                            │
│                                │  │  Put this in a personal    │
│                                │  │  savings account for your  │
│                                │  │  tax bill (due 31 Jan).    │
└────────────────────────────────┘  └────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  📋 HOW TO ACTUALLY DO THIS                                     │
│                                                                 │
│  1. Set up payroll (FreeAgent, Xero, or an accountant can help) │
│  2. Pay yourself £1,047/month as salary via payroll             │
│  3. Take dividends occasionally when you have profit            │
│  4. Move £750/mo to a savings account for your tax bill         │
│                                                                 │
│  ▸ What's payroll? (inline accordion)                           │
│  ▸ What are dividends? (inline accordion)                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ▸ Assumptions we made (collapsed by default)                   │
│                                                                 │
│  • Your company is your only income                             │
│  • Standard 12-month accounting year                            │
│  • No student loan repayments                                   │
│  • Tax year 2025-26 (starting April 6)                          │
│  • Dividends taxed at UK rates (even for Scottish residents)    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ⚠️ IMPORTANT                                                   │
│                                                                 │
│  This is a rough estimate, not advice. For precision and to     │
│  make sure you're doing it right, talk to an accountant.        │
│                                                                 │
│  [Copy results]  [When's my year end? Get exact dates →]        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Survival Mode (Profit ≤ £12,570)

If profit is zero, negative, or below the Personal Allowance, HIDE the normal salary/dividend instructions.

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚠️ YOUR COMPANY HASN'T MADE ENOUGH PROFIT YET                  │
│                                                                 │
│  Based on your numbers, profit is ~£8,000.                      │
│                                                                 │
│  This isn't enough to pay yourself a full salary + dividends    │
│  in the most tax-efficient way.                                 │
│                                                                 │
│  YOUR OPTIONS:                                                  │
│  1. Take a smaller salary (up to your profit)                   │
│  2. Wait until you have more profit before taking dividends     │
│  3. If you need money now, talk to an accountant about          │
│     Director's Loans (there are tax implications)               │
│                                                                 │
│  This is normal in year 1. Focus on growing the business.       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Payments on Account (POA) Safety Net

If personal tax > £1,000, HMRC asks for 1.5x in January (bill + 50% advance).

**Calculation:**
```typescript
const personalTax = calculateDividendTax(...);
const includesPOA = personalTax > 1000;
const personalTaxMonthly = includesPOA 
  ? (personalTax * 1.5) / 12  // Include POA buffer
  : personalTax / 12;
```

**UI (if POA applies):**
```
🐷 YOUR TAX SAVINGS
Save: £750/mo

This includes extra for "payments on account" - in your second
year, HMRC asks for an advance so you're not caught out.

💡 If most of your tax is already collected through PAYE (e.g.,
from another job), payments on account may not apply to you.
```

---

## Conditional Warnings

| Condition | Show |
|-----------|------|
| **Scotland** | Note in results: "Scottish resident: Your salary uses Scottish tax rates. Dividends use UK rates." |
| **Profit ≤ 0** | Survival mode (see above) |
| **0 < Profit < £12,570** | Modified survival mode: "You can take a smaller salary, but dividends aren't advisable yet." |
| **Profit > £250k** | "This is getting complex. An accountant could save you serious money." |
| **Revenue £85k-£95k** | "Heads up: VAT registration is required above £90k turnover. If you're not registered yet, you may need to be." |
| **Already taken > take-home** | "⚠️ You may have taken more than is safe based on this estimate. Pause and speak to an accountant." |
| **Already taken (not via payroll)** | "Money taken without payroll may be a Director's Loan. This has tax implications. Talk to an accountant." |

---

## Copy Format (Enhanced)

```
How Much Can I Pay Myself? - PayeTax.co.uk
Tax Year: 2025-26

YOUR INPUTS
Location: Scotland
Revenue: £100,000 (before VAT)
Expenses: £20,000
Already taken: £0
Profit: ~£80,000

AVERAGE MONTHLY PAY
Around £4,800/month
(£1,047 salary + dividends)

SET ASIDE FOR TAX
Company tax pot: £17,500 (keep in business account)
Personal tax pot: £900/month (save for January)

HOW TO DO IT
1. Set up payroll
2. Pay yourself £1,047/month as salary
3. Take dividends occasionally when you have profit
4. Save £900/month for your tax bill

ASSUMPTIONS
• Your company is your only income
• No student loan repayments
• Scottish salary rates, UK dividend rates

⚠️ This is a rough estimate, not advice.
For precision, talk to an accountant.

Generated: [date] | payetax.co.uk/tools/director-guide
```

---

## Pricing: "For the Price of a Coffee"

Pro features (save scenarios, PDF, reminders) are priced like a flat white.

**Implementation:** Fixed price + marketing comparison (NOT mechanical changes).

| Setting | Value |
|---------|-------|
| Pro price | £3.99/month |
| Marketing copy | "About the price of a flat white" |
| Update frequency | Quarterly review of copy, NOT price |

**Why NOT mechanical:**
- Billing plan changes are operationally complex
- Customer notice requirements
- Churn from price confusion

**Display:**
> "Pro costs £3.99/month - about the price of a flat white."

---

## File Structure (Atomic Design)

**Principle:** No file > 200 lines. Easy to maintain when tax rates change.

```
src/
├── app/tools/
│   └── director-guide/
│       ├── page.tsx                      # Server (metadata, schema)
│       └── DirectorGuideClient.tsx       # Client (single page form)
│
├── components/
│   └── organisms/DirectorGuide/
│       ├── DirectorGuideForm.tsx         # Main form with progressive disclosure
│       ├── WhatYouNeed.tsx               # "What you'll need" header
│       ├── steps/
│       │   ├── LocationStep.tsx          # Question 1
│       │   ├── RevenueStep.tsx           # Question 2
│       │   ├── ExpensesStep.tsx          # Question 3
│       │   └── AlreadyTakenStep.tsx      # Question 4
│       ├── results/
│       │   ├── ResultsSection.tsx        # Assembles results
│       │   ├── CompanyBox.tsx            # Company position
│       │   ├── PersonalBox.tsx           # Personal position
│       │   ├── HowToDoIt.tsx             # Action steps
│       │   ├── Assumptions.tsx           # Collapsible assumptions
│       │   └── CopyResults.tsx           # Copy button + format
│       ├── warnings/
│       │   ├── SurvivalMode.tsx          # Low/no profit
│       │   ├── DLAWarning.tsx            # Director's Loan
│       │   ├── VATWarning.tsx            # VAT threshold
│       │   └── ComplexityWarning.tsx     # High profit
│       └── education/
│           ├── WhatIsPayroll.tsx         # Inline accordion
│           └── WhatAreDividends.tsx      # Inline accordion
│
├── lib/
│   └── tax/
│       ├── index.ts                      # Exports orchestrator
│       ├── directorCalculator.ts         # Orchestrator (<150 lines)
│       ├── incomeTax.ts                  # Income tax calc (<150 lines)
│       ├── scottishIncomeTax.ts          # Scottish bands (<150 lines)
│       ├── nationalInsurance.ts          # NI calc (<150 lines)
│       ├── corporationTax.ts             # CT calc (<100 lines)
│       ├── dividendTax.ts                # Dividend tax (<100 lines)
│       └── taxYearSelector.ts            # Date logic for tax years
│
├── constants/
│   └── taxRates/
│       ├── index.ts                      # Exports current year
│       ├── 2024-2025.ts                  # Previous year
│       ├── 2025-2026.ts                  # Current year
│       └── types.ts                      # TaxRates type definition
│
└── types/
    └── director.ts                       # DirectorInput, DirectorResult types
```

---

## Tax Rates Structure (With Effective Dates)

```typescript
// src/constants/taxRates/types.ts
export interface TaxYearRates {
  taxYear: string;
  effectiveFrom: string;  // ISO date, e.g., '2025-04-06'
  
  personalAllowance: number;
  
  incomeTax: {
    basicRate: number;
    basicLimit: number;
    higherRate: number;
    higherLimit: number;
    additionalRate: number;
  };
  
  scottishIncomeTax: {
    starterRate: number;
    starterLimit: number;
    basicRate: number;
    basicLimit: number;
    intermediateRate: number;
    intermediateLimit: number;
    higherRate: number;
    higherLimit: number;
    advancedRate: number;
    advancedLimit: number;
    topRate: number;
  };
  
  dividendTax: {
    allowance: number;
    basicRate: number;
    higherRate: number;
    additionalRate: number;
  };
  
  nationalInsurance: {
    primaryThreshold: number;
    upperEarningsLimit: number;
    employeeRate: number;
    employeeRateAboveUEL: number;
    employerRate: number;
    employerThreshold: number;
  };
  
  corporationTax: {
    smallProfitsRate: number;
    smallProfitsLimit: number;
    mainRate: number;
    mainRateLimit: number;
  };
}
```

```typescript
// src/constants/taxRates/2025-2026.ts
export const TAX_RATES_2025_26: TaxYearRates = {
  taxYear: '2025-2026',
  effectiveFrom: '2025-04-06',
  
  personalAllowance: 12570,
  
  incomeTax: {
    basicRate: 0.20,
    basicLimit: 37700,
    higherRate: 0.40,
    higherLimit: 125140,
    additionalRate: 0.45,
  },
  
  scottishIncomeTax: {
    starterRate: 0.19,
    starterLimit: 14876,
    basicRate: 0.20,
    basicLimit: 26561,
    intermediateRate: 0.21,
    intermediateLimit: 43662,
    higherRate: 0.42,
    higherLimit: 75000,
    advancedRate: 0.45,
    advancedLimit: 125140,
    topRate: 0.48,
  },
  
  dividendTax: {
    allowance: 500,
    basicRate: 0.0875,
    higherRate: 0.3375,
    additionalRate: 0.3935,
  },
  
  nationalInsurance: {
    primaryThreshold: 12570,
    upperEarningsLimit: 50270,
    employeeRate: 0.08,
    employeeRateAboveUEL: 0.02,
    employerRate: 0.138,
    employerThreshold: 5000,
  },
  
  corporationTax: {
    smallProfitsRate: 0.19,
    smallProfitsLimit: 50000,
    mainRate: 0.25,
    mainRateLimit: 250000,
  },
};
```

---

## Key Implementation Notes

### Scotland: Salary Only

```typescript
// Scottish rates apply to NON-SAVINGS, NON-DIVIDEND income only
function calculateIncomeTax(salary: number, region: 'scotland' | 'rUK'): number {
  if (region === 'scotland') {
    return calculateScottishIncomeTax(salary);
  }
  return calculateUKIncomeTax(salary);
}

// Dividends ALWAYS use UK rates, regardless of region
function calculateDividendTax(dividends: number, taxableIncome: number): number {
  // Uses UK dividend rates, never Scottish
  return calculateUKDividendTax(dividends, taxableIncome);
}
```

### Progressive Disclosure State

```typescript
// In DirectorGuideForm.tsx
const [currentStep, setCurrentStep] = useState(1);
const [formData, setFormData] = useState<DirectorInput>({
  region: null,
  revenue: null,
  includesVat: false,
  expenses: null,
  alreadyTaken: 0,
  alreadyTakenViaPayroll: null,
});

// Step is "active" if it's the current step
// Step is "complete" if all previous steps are done and this one has a value
// Step is "blurred" if it's after the current step
```

### Mobile Keyboard

```tsx
<input
  type="text"
  inputMode="decimal"  // Shows numeric keyboard on mobile
  pattern="[0-9]*"     // iOS numeric keyboard
  placeholder="0"
/>
```

---

## Build Order

### Phase 1: Foundation
- [ ] Create `taxRates/2025-2026.ts` with all rates including Scotland
- [ ] Create `taxRates/types.ts` with TypeScript interface
- [ ] Create atomic tax calculators (`incomeTax.ts`, `scottishIncomeTax.ts`, etc.)
- [ ] Create `directorCalculator.ts` orchestrator
- [ ] Write golden example tests

### Phase 2: Form Components
- [ ] `DirectorGuideForm.tsx` (progressive disclosure logic)
- [ ] `WhatYouNeed.tsx`
- [ ] `LocationStep.tsx` (Scotland / rUK)
- [ ] `RevenueStep.tsx` (with VAT checkbox)
- [ ] `ExpensesStep.tsx` (with VAT hint)
- [ ] `AlreadyTakenStep.tsx` (with guardrail)

### Phase 3: Results Components
- [ ] `ResultsSection.tsx`
- [ ] `CompanyBox.tsx`
- [ ] `PersonalBox.tsx`
- [ ] `HowToDoIt.tsx`
- [ ] `Assumptions.tsx` (collapsible)
- [ ] `CopyResults.tsx`

### Phase 4: Warnings
- [ ] `SurvivalMode.tsx` (profit ≤ £12,570)
- [ ] `DLAWarning.tsx`
- [ ] `VATWarning.tsx`
- [ ] `ComplexityWarning.tsx`

### Phase 5: Education (Inline Accordions)
- [ ] `WhatIsPayroll.tsx`
- [ ] `WhatAreDividends.tsx`

### Phase 6: Page Assembly
- [ ] `page.tsx` (metadata, schema)
- [ ] `DirectorGuideClient.tsx`

### Phase 7: Polish
- [ ] Mobile responsive
- [ ] Accessibility (keyboard nav, screen readers)
- [ ] Analytics events
- [ ] localStorage persistence (prevent data loss on refresh)

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `guide_started` | Page loaded |
| `guide_location_selected` | Step 1 completed |
| `guide_revenue_entered` | Step 2 completed |
| `guide_expenses_entered` | Step 3 completed |
| `guide_already_taken` | Step 4 completed |
| `guide_results_shown` | Results displayed |
| `guide_results_copied` | Copy button clicked |
| `guide_warning_shown` | Any warning displayed (with type) |
| `guide_education_expanded` | "What's payroll?" etc. clicked |
| `guide_year_end_entered` | Optional year-end provided |

**Privacy:** Bucket revenue/expenses/profit ranges. Do NOT log raw amounts.

---

## Success Criteria

| Metric | Target |
|--------|--------|
| Form completion rate | > 70% |
| Time to results | < 90 seconds |
| "This helped" feedback | Positive |
| Zero "calculation is wrong" complaints | ✅ |

**The real test:** Someone with no tax knowledge gets a clear, actionable number.

---

## What's NOT in v1.0.0

| Feature | When | Why |
|---------|------|-----|
| Other income input | v1.1 | Complexity |
| Student loan calculator | v1.1 | Need Plan type |
| Employment Allowance toggle | v1.1 | Minority case |
| PDF export | v1.1 (Pro) | Nice-to-have |
| Save scenarios | v1.1 (Pro) | Nice-to-have |
| Email reminders | v1.1 (Pro) | Nice-to-have |
| Year-end specific dates | v1.1 | Optional enhancement |

---

## Reviewer Sign-Off

### v2.0 Core Approval

| Reviewer | Status | Key Contribution |
|----------|--------|------------------|
| Grok | ✅ | Assumption transparency, thresholds |
| Claude | ✅ | VAT help, guardrails, year-end optional |
| ChatGPT | ✅ | Timeframe clarity, plain English copy |
| Gemini | ✅ | Silent assumptions, POA safety net |

### v3.0 Additions Approval

| Reviewer | Scotland | Single Page | Atomic Design |
|----------|----------|-------------|---------------|
| Grok | ✅ | ✅ | ✅ |
| Claude | ❌ (ship first) | N/A | ❌ (do later) |
| ChatGPT | ✅ (salary only) | ✅ | ✅ |
| Gemini | ✅ | ✅ | ✅ |

**Final decision:** Scotland supported (salary-only), single page progressive, atomic design.

---

## The Golden Test

Before shipping, verify this scenario:

**Input:**
- Location: Scotland
- Revenue: £120,000 (includes VAT)
- Expenses: £20,000
- Already taken: £0

**Expected:**
- Net revenue: £100,000 (VAT removed)
- Profit: £80,000
- Average monthly pay: ~£4,800
- Company tax pot: ~£17,500
- Personal tax monthly: ~£900

**Match against MATH doc calculations.**

---

**This is BUILD v3.0. Ship it.**
