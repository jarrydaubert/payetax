# Director Tools - Build Spec v3.2

> **Purpose:** How to build the "How Much Can I Pay Myself?" guide
> **For tax calculations:** See `DIRECTOR_TOOLS_MATH.md`
> **For product strategy:** See `DIRECTOR_TOOLS.md`
> **Last Updated:** January 2026
> **Status:** ✅ ALL 4 REVIEWERS APPROVED - Ready to code

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
| Does she get a safe monthly target she can plan around? | **Yes** |

If a feature fails this test, cut it.

---

## Route

`/tools/director-guide`

---

## UX: Single Page, Progressive Disclosure

**Not separate pages. Not a scary form. A guided single page.**

- One page load (fast)
- All questions visible (no mystery)
- Current question active, upcoming questions blurred/disabled
- Completed questions collapse with ✓
- Pros can click through fast; beginners take their time

### Accessibility Requirements

```tsx
// Blurred/upcoming sections:
aria-hidden="true"
tabIndex={-1}  // Not focusable until active

// Active section:
aria-live="polite"  // Announce when becomes active
autoFocus           // Move focus to first input

// Completed sections:
aria-expanded="false"  // Collapsed state
// Edit button is focusable
```

### UI Mockup

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
│  [I split my time / not sure →] (links to: "Tax residency can   │
│   be complex. Talk to an accountant.")                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  2. WHAT'S YOUR ANNUAL REVENUE?                     ← DISABLED  │
│  (greyed out, not focusable)                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  3. WHAT ARE YOUR BUSINESS EXPENSES?                ← DISABLED  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  4. ALREADY PAID YOURSELF?                          ← DISABLED  │
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

### 5. Other Income Gate (Pre-Calculation)

**Purpose:** Force users to acknowledge the "only income" assumption before seeing results. This catches mid-year starters, people with rental income, etc.

**Appears:** After all 4 inputs are complete, before results are calculated.

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚠️ ONE MORE THING                                              │
│                                                                 │
│  This calculation assumes your company is your ONLY income      │
│  this tax year (April 2025 - April 2026).                       │
│                                                                 │
│  If you have ANY of these, these numbers won't be accurate:     │
│                                                                 │
│  • A job earlier this tax year (even if you've left)            │
│  • Rental income                                                │
│  • Another business or directorship                             │
│  • Part-time or freelance work                                  │
│  • Pension payments                                             │
│  • Redundancy over £30,000                                      │
│                                                                 │
│  ○ None of these apply — show my results                        │
│  ○ One of these applies — I'll talk to an accountant            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Behavior:**

| Selection | What Happens |
|-----------|--------------|
| "None of these apply" | Show full results with confident numbers |
| "One of these applies" | Show results WITH persistent warning banner |

**If "One of these applies" is selected, add banner to results:**

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚠️ YOU INDICATED OTHER INCOME                                  │
│                                                                 │
│  These numbers assume your company is your only income.         │
│  Because you have other income, your actual tax will be         │
│  HIGHER than shown. Use these as a rough baseline only.         │
│                                                                 │
│  For accurate figures, talk to an accountant.                   │
│                                                                 │
│  [Coming soon: Enter your other income for accurate numbers]    │
└─────────────────────────────────────────────────────────────────┘
```

**Analytics Events:**

| Event | Trigger |
|-------|---------|
| `guide_other_income_gate_shown` | Gate displayed |
| `guide_other_income_none` | User selected "None of these apply" |
| `guide_other_income_has_other` | User selected "One of these applies" |

**Why This Matters:**

| User Type | Without Gate | With Gate |
|-----------|--------------|-----------|
| Pure first-timer | Accurate ✅ | Accurate ✅ |
| Left £30k job mid-year | Under-saves £4,500+ ❌ | Warned, sees accountant ✅ |
| Has rental income | Under-saves £2,500+ ❌ | Warned, uses as baseline ✅ |

**v1.1 Enhancement:** Replace gate with actual "other income" input field that adjusts calculations.

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

---

## Survival Mode: Threshold Table

| Profit | What Shows |
|--------|------------|
| **≤ £0** | Full survival mode: "Your company hasn't made profit yet. Dividends aren't possible. If you take money, it's a loan you'll owe back." |
| **£1 - £12,570** | Modified survival: "You can take a smaller salary (up to your profit), but dividends aren't advisable yet." |
| **> £12,570** | Normal results with salary + dividend strategy |

**Implementation:** Short-circuit at step 2 of calculation. If `profit <= 12570`, trigger survival mode UI and STOP before calculating full scenario.

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
│  Set aside: £16,000            │  │  Target: ~£4,500/mo        │
│                                │  │                            │
│  This includes:                │  │  Salary (£1,047/mo) goes   │
│  • Corporation Tax             │  │  monthly via payroll.      │
│  • Employer NI (~£1,100/yr)    │  │  The rest comes as         │
│                                │  │  dividends occasionally.   │
│  Keep this in your business    │  │                            │
│  account. Don't touch it.      │  │  🐷 YOUR TAX SAVINGS       │
│                                │  │  Save: £750/mo             │
│  Due: ~9 months after your     │  │                            │
│  company year ends             │  │  Put this in a personal    │
│                                │  │  savings account for your  │
│                                │  │  tax bill (due 31 Jan).    │
└────────────────────────────────┘  └────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  📋 HOW TO ACTUALLY DO THIS                                     │
│                                                                 │
│  1. Set up payroll (FreeAgent, Xero, or an accountant can help) │
│  2. Pay yourself £1,047/month as salary via payroll             │
│     (We keep salary at £12,570/year to stay tax-efficient)      │
│  3. Take dividends occasionally when you have profit            │
│  4. Move £750/mo to a savings account for your tax bill         │
│                                                                 │
│  ▸ What's payroll? (inline accordion)                           │
│  ▸ What are dividends? (inline accordion)                       │
│  ▸ Why this salary amount? (inline accordion)                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ▸ Assumptions we made (collapsed by default)                   │
│                                                                 │
│  • Your company is your only income                             │
│  • Standard 12-month accounting year                            │
│  • Full-year trading (adjust for shorter periods)               │
│  • No student loan repayments                                   │
│  • Tax year 2025-26 (starting April 6)                          │
│  • Dividends taxed at UK rates (even for Scottish residents)    │
│  • Uses current tax-year rules for the full 12 months           │
│    (If your year crosses April 6, actual tax may differ)        │
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

## Employer NI: Show It

With the 2025-26 rates:
- Employer NI threshold: **£5,000**
- Employer NI rate: **15%**
- On £12,570 salary: Employer NI = (£12,570 - £5,000) × 15% = **~£1,135/year**

**This must be included in the Company Tax Pot** and shown to users so there's no "surprise payroll tax."

```typescript
const employerNI = Math.max(0, salary - 5000) * 0.15;
const companyTaxPot = corporationTax + employerNI;
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

| Condition | Trigger | Show |
|-----------|---------|------|
| **Scotland** | `region === 'scotland'` | Note in results: "Scottish resident: Your salary uses Scottish tax rates. Dividends use UK rates." |
| **Full survival** | `profit <= 0` | Full survival mode UI |
| **Modified survival** | `0 < profit <= 12570` | Modified survival mode UI |
| **High complexity** | `profit > 250000` | "This is getting complex. An accountant could save you serious money." |
| **VAT threshold** | `85000 < netRevenue < 95000` | "Heads up: VAT registration is required above £90k turnover. If you're not registered yet, you may need to be." |
| **Already taken too much** | `alreadyTaken > netTakeHome` | "⚠️ You may have taken more than is safe based on this estimate. Pause and speak to an accountant." |
| **DLA risk** | `alreadyTaken > 0 && !viaPayroll` | "Money taken without payroll may be a Director's Loan. This has tax implications. Talk to an accountant." |

**VAT threshold constant:** £90,000 (GOV.UK). The £85k-£95k band is an "early warning" range.

---

## Copy Format (Enhanced)

```
How Much Can I Pay Myself? - PayeTax.co.uk
Tax Year: 2025-26

YOUR INPUTS
Location: Scotland
Revenue: £100,000 (no VAT included)
Expenses: £20,000
Already taken: £0
Profit: ~£80,000

AVERAGE MONTHLY PAY (TARGET)
Around £4,800/month
(£1,047 salary via payroll + dividends occasionally)

SET ASIDE FOR TAX
Company tax pot: £17,500 (includes Corporation Tax + Employer NI)
Personal tax pot: £900/month (save for January)

HOW TO DO IT
1. Set up payroll
2. Pay yourself £1,047/month as salary
3. Take dividends occasionally when you have profit
4. Save £900/month for your tax bill

ASSUMPTIONS
• Your company is your only income
• Full-year trading
• No student loan repayments
• Scottish salary rates, UK dividend rates
• Uses 2025-26 tax rules

⚠️ This is a rough estimate, not advice.
For precision, talk to an accountant.

Generated: [date] | payetax.co.uk/tools/director-guide
```

**Note:** Show "(no VAT included)" or "(before VAT)" depending on whether checkbox was ticked.

---

## localStorage Persistence

Prevent data loss on page refresh.

| Setting | Value |
|---------|-------|
| **What's stored** | `formData` only (not results) |
| **Key** | `director-guide-draft` |
| **When cleared** | When results are shown, OR after 7 days, OR if tax year changes |
| **Tax year handling** | Store `taxYear` with data; clear if mismatched |

```typescript
interface StoredDraft {
  formData: DirectorInput;
  taxYear: string;
  savedAt: string; // ISO date
}

// On page load
const draft = localStorage.getItem('director-guide-draft');
if (draft) {
  const parsed = JSON.parse(draft);
  const isExpired = daysSince(parsed.savedAt) > 7;
  const wrongTaxYear = parsed.taxYear !== CURRENT_TAX_YEAR;
  if (isExpired || wrongTaxYear) {
    localStorage.removeItem('director-guide-draft');
  } else {
    setFormData(parsed.formData);
  }
}

// On results shown
localStorage.removeItem('director-guide-draft');
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
│       │   ├── AlreadyTakenStep.tsx      # Question 4
│       │   └── OtherIncomeGate.tsx       # Pre-calculation gate
│       ├── results/
│       │   ├── ResultsSection.tsx        # Assembles results
│       │   ├── CompanyBox.tsx            # Company position (includes Employer NI)
│       │   ├── PersonalBox.tsx           # Personal position
│       │   ├── HowToDoIt.tsx             # Action steps
│       │   ├── Assumptions.tsx           # Collapsible assumptions
│       │   └── CopyResults.tsx           # Copy button + format
│       ├── warnings/
│       │   ├── SurvivalMode.tsx          # Low/no profit
│       │   ├── DLAWarning.tsx            # Director's Loan
│       │   ├── VATWarning.tsx            # VAT threshold
│       │   ├── ComplexityWarning.tsx     # High profit
│       │   └── OtherIncomeWarning.tsx    # Persistent banner if other income
│       └── education/
│           ├── WhatIsPayroll.tsx         # Inline accordion
│           ├── WhatAreDividends.tsx      # Inline accordion
│           └── WhyThisSalary.tsx         # Inline accordion (explains £12,570)
│
├── lib/
│   └── tax/
│       ├── index.ts                      # Exports orchestrator
│       ├── directorCalculator.ts         # Orchestrator (<150 lines)
│       ├── incomeTax.ts                  # UK income tax calc (<150 lines)
│       ├── scottishIncomeTax.ts          # Scottish bands (<150 lines)
│       ├── nationalInsurance.ts          # Employee + Employer NI (<150 lines)
│       ├── corporationTax.ts             # CT calc (<100 lines)
│       ├── dividendTax.ts                # Dividend tax (<100 lines)
│       └── taxYearSelector.ts            # Date logic for tax years
│
├── constants/
│   └── taxRates.ts                       # EXISTING - already has correct 2025-26 rates
│
└── types/
    └── director.ts                       # DirectorInput, DirectorResult types
```

**Note:** Your existing `taxRates.ts` already has the correct 2025-26 rates including:
- Employer NI: 15% above £5,000 threshold ✅
- Scottish bands: Correct 2025-26 values ✅
- Employee NI: 8% ✅

---

## Tax Rates: Use Existing Source of Truth

Your `src/constants/taxRates.ts` already has correct 2025-26 rates. **Do not duplicate.**

For the director calculator, import from the existing file:

```typescript
import { TAX_RATES, SCOTTISH_TAX_RATES } from '@/constants/taxRates';

const rates = TAX_RATES['2025-2026'];
const scottishRates = SCOTTISH_TAX_RATES['2025-2026'];

// Employer NI (already correct in your file)
const employerNIThreshold = rates.nationalInsurance.employer.A.secondary.threshold; // 5000
const employerNIRate = rates.nationalInsurance.employer.A.secondary.rate / 100;     // 0.15
```

**Key 2025-26 values (verified in your taxRates.ts):**

| Item | Value |
|------|-------|
| Personal Allowance | £12,570 |
| Employer NI threshold | £5,000 |
| Employer NI rate | 15% |
| Employee NI rate | 8% |
| Scottish starter rate | 19% (£12,571-£15,397) |
| Scottish basic rate | 20% (£15,398-£27,491) |
| Scottish intermediate | 21% (£27,492-£43,662) |
| Scottish higher | 42% (£43,663-£75,000) |
| Scottish advanced | 45% (£75,001-£125,140) |
| Scottish top | 48% (above £125,140) |

---

## Key Implementation Notes

### Scotland: Salary Only

```typescript
// Scottish rates apply to NON-SAVINGS, NON-DIVIDEND income only
// Dividend tax bands use UK thresholds, not Scottish
function calculateIncomeTax(salary: number, region: 'scotland' | 'rUK'): number {
  if (region === 'scotland') {
    return calculateScottishIncomeTax(salary);
  }
  return calculateUKIncomeTax(salary);
}

// Dividends ALWAYS use UK rates AND UK band thresholds, regardless of region
function calculateDividendTax(dividends: number, taxableIncome: number): number {
  // Uses UK dividend rates, never Scottish
  // Band is based on total taxable income vs UK basic/higher limits
  return calculateUKDividendTax(dividends, taxableIncome);
}
```

### Calculation Order of Operations

```typescript
function calculateDirectorScenario(input: DirectorInput): DirectorResult {
  // 1. Adjust revenue for VAT if needed
  const netRevenue = input.includesVat ? input.revenue / 1.2 : input.revenue;
  
  // 2. Calculate gross profit
  const grossProfit = netRevenue - input.expenses;
  
  // 3. SHORT-CIRCUIT: Check for survival mode
  if (grossProfit <= 12570) {
    return { mode: 'survival', profit: grossProfit, ... };
  }
  
  // 4. Calculate employer NI on salary
  const salary = 12570;
  const employerNI = Math.max(0, salary - 5000) * 0.15;
  
  // 5. Calculate taxable profit (after salary + employer NI)
  const taxableProfit = grossProfit - salary - employerNI;
  
  // 6. Calculate corporation tax
  const corporationTax = calculateCorporationTax(taxableProfit);
  
  // 7. Calculate dividends available
  const dividends = taxableProfit - corporationTax;
  
  // 8. Calculate personal taxes
  const incomeTax = calculateIncomeTax(salary, input.region);
  const dividendTax = calculateDividendTax(dividends, salary);
  
  // 9. Calculate take-home
  const netTakeHome = salary + dividends - incomeTax - dividendTax;
  
  // 10. Calculate company tax pot (CT + Employer NI)
  const companyTaxPot = corporationTax + employerNI;
  
  // 11. Personal tax savings (with POA if applicable)
  const personalTax = dividendTax;
  const includesPOA = personalTax > 1000;
  const personalTaxAnnual = includesPOA ? personalTax * 1.5 : personalTax;
  
  return {
    mode: 'normal',
    profit: grossProfit,
    monthlyPay: (netTakeHome - input.alreadyTaken) / 12,
    companyTaxPot,
    personalTaxMonthly: personalTaxAnnual / 12,
    includesPOA,
    employerNI,
    ...
  };
}
```

### Progressive Disclosure State

```typescript
const [currentStep, setCurrentStep] = useState(1);
const [formData, setFormData] = useState<DirectorInput>({
  region: null,
  revenue: null,
  includesVat: false,
  expenses: null,
  alreadyTaken: 0,
  alreadyTakenViaPayroll: null,
});

// Step states:
// - "active": currentStep === stepNumber
// - "complete": stepNumber < currentStep && hasValue
// - "disabled": stepNumber > currentStep
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
- [ ] Verify `taxRates.ts` has all correct 2025-26 rates (✅ already verified)
- [ ] Create `lib/tax/directorCalculator.ts` orchestrator
- [ ] Create `lib/tax/corporationTax.ts`
- [ ] Create `lib/tax/dividendTax.ts`
- [ ] Create `types/director.ts`
- [ ] Write golden example tests

### Phase 2: Form Components
- [ ] `DirectorGuideForm.tsx` (progressive disclosure logic)
- [ ] `WhatYouNeed.tsx`
- [ ] `LocationStep.tsx` (Scotland / rUK)
- [ ] `RevenueStep.tsx` (with VAT checkbox)
- [ ] `ExpensesStep.tsx` (with VAT hint)
- [ ] `AlreadyTakenStep.tsx` (with guardrail)
- [ ] `OtherIncomeGate.tsx` (pre-calculation acknowledgment)

### Phase 3: Results Components
- [ ] `ResultsSection.tsx`
- [ ] `CompanyBox.tsx` (includes Employer NI breakdown)
- [ ] `PersonalBox.tsx`
- [ ] `HowToDoIt.tsx`
- [ ] `Assumptions.tsx` (collapsible)
- [ ] `CopyResults.tsx`

### Phase 4: Warnings
- [ ] `SurvivalMode.tsx` (profit ≤ £12,570)
- [ ] `DLAWarning.tsx`
- [ ] `VATWarning.tsx`
- [ ] `ComplexityWarning.tsx`
- [ ] `OtherIncomeWarning.tsx` (persistent banner if other income selected)

### Phase 5: Education (Inline Accordions)
- [ ] `WhatIsPayroll.tsx`
- [ ] `WhatAreDividends.tsx`
- [ ] `WhyThisSalary.tsx`

### Phase 6: Page Assembly
- [ ] `page.tsx` (metadata, schema)
- [ ] `DirectorGuideClient.tsx`

### Phase 7: Polish
- [ ] Mobile responsive
- [ ] Accessibility (aria-hidden, tabIndex, aria-live)
- [ ] Analytics events
- [ ] localStorage persistence

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `guide_started` | Page loaded |
| `guide_location_selected` | Step 1 completed |
| `guide_revenue_entered` | Step 2 completed |
| `guide_expenses_entered` | Step 3 completed |
| `guide_already_taken` | Step 4 completed |
| `guide_other_income_gate_shown` | Other income gate displayed |
| `guide_other_income_none` | User confirmed "None of these apply" |
| `guide_other_income_has_other` | User selected "One of these applies" |
| `guide_results_shown` | Results displayed |
| `guide_results_copied` | Copy button clicked |
| `guide_warning_shown` | Any warning displayed (with type) |
| `guide_education_expanded` | "What's payroll?" etc. clicked |

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
| Other income calculations | v1.1 | Gate acknowledges limitation; v1.1 adds actual input |
| Student loan calculator | v1.1 | Need Plan type |
| Employment Allowance toggle | v1.1 | Minority case |
| PDF export | v1.1 (Pro) | Nice-to-have |
| Save scenarios | v1.1 (Pro) | Nice-to-have |
| Email reminders | v1.1 (Pro) | Nice-to-have |
| Year-end specific dates | v1.1 | Optional enhancement |

---

## Reviewer Sign-Off

### v3.0 Approval (All 4)

| Reviewer | Status | Key Notes |
|----------|--------|-----------|
| Grok | ✅ | No blockers, proceed |
| Claude | ✅ | Verify NI rate (✅ verified: 15%) |
| ChatGPT | ✅ | Fix constants (✅ already correct in taxRates.ts), show employer NI |
| Gemini | ✅ | Short-circuit survival mode |

### Fixes Applied in v3.1

| Issue | Status |
|-------|--------|
| Employer NI rate 15% | ✅ Verified in taxRates.ts |
| Scottish bands 2025-26 | ✅ Verified in taxRates.ts |
| Employer NI shown in Company box | ✅ Added |
| Survival mode threshold table | ✅ Added |
| Accessibility (aria-hidden, tabIndex) | ✅ Added |
| "Year ahead" disclaimer | ✅ Added to assumptions |
| localStorage spec | ✅ Added |
| "Transfer today" → "safe monthly target" | ✅ Changed in Wife Test |

### Edge Case Review (v3.2)

| Reviewer | Recommendation |
|----------|----------------|
| Grok | Option A (gate) → Option B (v1.1) |
| Claude | Option A (pre-calculation gate) → Option B (v1.1) |
| ChatGPT | Option B now (or gate that softens output) |
| Gemini | Option A (prominent disclaimer mandatory) → Option B (v1.1) |

**Decision:** Ship with pre-calculation gate (Option A). Add other income input in v1.1.

| Issue | Status |
|-------|--------|
| Other income gate | ✅ Added (forced acknowledgment before results) |
| Persistent warning banner | ✅ Added (if user has other income) |
| Analytics for gate | ✅ Added (track sole income vs other income) |

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
- Gross profit: £80,000
- Salary: £12,570
- Employer NI: ~£1,135
- Taxable profit: ~£66,295
- Corporation Tax: ~£13,800 (with marginal relief)
- Company tax pot: ~£14,935 (CT + Employer NI)
- Dividends available: ~£52,495
- Dividend tax: ~£4,400
- Personal tax monthly (with POA): ~£550
- Average monthly pay: ~£5,200

**Run against MATH doc and verify.**

---

**This is BUILD v3.2. All blockers resolved. Other income gate added. Ship it.**
