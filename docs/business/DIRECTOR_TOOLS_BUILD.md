# Director Tools - Build Spec v2.0

> **Purpose:** How to build the "How Much Can I Pay Myself?" guide
> **For tax calculations:** See `DIRECTOR_TOOLS_MATH.md`
> **For product strategy:** See `DIRECTOR_TOOLS.md`
> **Last Updated:** January 2026
> **Status:** ✅ ALL 4 REVIEWERS APPROVED

---

## The Principle

**Ask what they KNOW. Calculate what they DON'T.**

Our user (a first-time director like your wife) knows:
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

## Onboarding UX: One Question Per Screen

**Not a form. A conversation.**

Mobile-first. Friendly. Slow. One thing at a time.

```
┌─────────────────────────────────────────────────────────────────┐
│  SCREEN 1: WELCOME                                              │
│                                                                 │
│  Let's figure out how much you can pay yourself.                │
│                                                                 │
│  No jargon. No stress. Just clear numbers.                      │
│                                                                 │
│                    [Let's go →]                                 │
│                                                                 │
│  ○ ○ ○ ○ ○ ○  (progress indicator)                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  SCREEN 2: LOCATION                                             │
│                                                                 │
│  First, where are you based?                                    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🏴󠁧󠁢󠁥󠁮󠁧󠁿  England, Wales, or Northern Ireland            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🏴󠁧󠁢󠁳󠁣󠁴󠁿  Scotland                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ● ○ ○ ○ ○ ○                                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  SCREEN 3: MONEY IN                                             │
│                                                                 │
│  How much has your company invoiced?                            │
│                                                                 │
│  £ [________________________]                                   │
│                                                                 │
│  Just a rough number for the next 12 months.                    │
│                                                                 │
│  ☐ This includes VAT (20%)                                      │
│                                                                 │
│  💡 If you charge VAT, tick the box and we'll work it out.      │
│                                                                 │
│  ● ● ○ ○ ○ ○                        [Continue →]                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  SCREEN 4: MONEY OUT                                            │
│                                                                 │
│  And what have you spent on the business?                       │
│                                                                 │
│  £ [________________________]                                   │
│                                                                 │
│  Software, equipment, travel - that kind of thing.              │
│  (Don't include money you've paid yourself)                     │
│                                                                 │
│  ● ● ● ○ ○ ○                        [Continue →]                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  SCREEN 5: ALREADY TAKEN?                                       │
│                                                                 │
│  Have you already paid yourself from the company?               │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  No, not yet                                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Yes, I've taken some money                              │   │
│  │  → How much? £ [__________]                              │   │
│  │  → Was this through payroll? ○ Yes ○ No ○ Not sure       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ● ● ● ● ○ ○                                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  SCREEN 6: CALCULATING                                          │
│                                                                 │
│  Got it. Let me work this out for you...                        │
│                                                                 │
│  ⏳ (Brief pause - builds trust, even if instant)               │
│                                                                 │
│  ● ● ● ● ● ○                                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  SCREEN 7: RESULTS                                              │
│  (See Results section below)                                    │
│                                                                 │
│  ● ● ● ● ● ●                                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Silent Assumptions (Hardcoded)

We don't ask. We assume the most common scenario for a single-director startup.

| Assumption | Value | Why |
|------------|-------|-----|
| Salary | £12,570 | Uses full Personal Allowance |
| Employment Allowance | No | Single director = not eligible |
| Other income | £0 | We treat this company in isolation |
| Pension contributions | £0 | Keep it simple |
| Student loan | None | Maximizes "happy number" |
| Accounting period | 12 months | Most common |
| Tax year | 2025-26 | Current |

**Show these in results:**
> "This assumes your company is your only income, and a standard 12-month year."

---

## Results: The "Two Boxes" Clarity

First-timers are confused about "the company" vs "me". Make it crystal clear.

```
┌─────────────────────────────────────────────────────────────────┐
│  HERE'S WHAT WE WORKED OUT                                      │
│  Based on ~£75,000 profit (money in minus money out)            │
└─────────────────────────────────────────────────────────────────┘

┌────────────────────────────────┐  ┌────────────────────────────┐
│  🏢 YOUR COMPANY               │  │  👤 YOU                    │
│                                │  │                            │
│  The company is separate from  │  │  You work for your company │
│  you - it has its own tax.     │  │  and it pays you.          │
│                                │  │                            │
│  🏦 COMPANY TAX POT            │  │  💰 YOUR MONTHLY PAY       │
│  Set aside: £16,000            │  │  Around: £4,500/mo         │
│                                │  │                            │
│  Keep this in your business    │  │  This is yours to spend.   │
│  account. Don't touch it.      │  │  Transfer it to your       │
│                                │  │  personal account.         │
│  Due: ~9 months after your     │  │                            │
│  company year ends             │  │  🐷 YOUR TAX SAVINGS       │
│                                │  │  Save: £750/mo             │
│  Label transfers: "TAX SAVE"   │  │                            │
│                                │  │  Put this in a personal    │
│                                │  │  savings account for your  │
│                                │  │  tax bill (due 31 Jan).    │
└────────────────────────────────┘  └────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  📋 HOW TO ACTUALLY DO THIS                                     │
│                                                                 │
│  1. Set up payroll (or use software like FreeAgent)             │
│  2. Pay yourself £1,047/month as salary                         │
│  3. Transfer the rest as dividends when you have profit         │
│  4. Move £750/mo to a savings account for your tax bill         │
│                                                                 │
│  [What's payroll? →]  [What are dividends? →]                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ⚠️ IMPORTANT                                                   │
│                                                                 │
│  • Dividends can only be paid if your company has made profit   │
│  • This is a rough estimate - for precision, see an accountant  │
│  • Assumes this is your only income and a 12-month year         │
│                                                                 │
│  [Copy results]  [When's my year end? Get exact dates →]        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Payments on Account: The January Surprise Safety Net

If personal tax > £1,000, HMRC wants 1.5x in January (bill + advance).

**In calculation:**
```typescript
const personalTax = calculatePersonalTax(...);
const monthlyTaxSaving = personalTax > 1000 
  ? (personalTax * 1.5) / 12  // Include POA
  : personalTax / 12;
```

**In UI (if POA applies):**
```
🐷 YOUR TAX SAVINGS
Save: £750/mo

This includes extra for your "payment on account" - 
HMRC asks for an advance payment so you're not caught 
out next year.
```

---

## Conditional Warnings (Only When Relevant)

| Condition | Show |
|-----------|------|
| **Scotland selected** | Use Scottish tax bands (different rates apply) |
| **Profit ≤ 0** | Survival mode: "Your company hasn't made profit yet. Dividends aren't possible. If you take money, it's a loan you'll owe back." |
| **Profit > £250k** | "This is getting complex. An accountant could save you serious money." |
| **Revenue near £90k** | "Heads up: VAT registration may apply above £90k. This could affect your numbers." |
| **Already taken (not via payroll)** | DLA warning: "Money taken without payroll may be a Director's Loan. This has tax implications. Talk to an accountant." |

---

## Key Dates (Generic → Optional Specific)

```
┌─────────────────────────────────────────────────────────────────┐
│  📅 WHEN'S IT DUE?                                              │
│                                                                 │
│  Company tax: ~9 months after your company year ends            │
│  Your personal tax: 31 January each year                        │
│                                                                 │
│  [When does your company year end? →]                           │
│                                                                 │
│  ○ 31 March (most common)                                       │
│  ○ 31 December                                                  │
│  ○ Other: [date]                                                │
│  ○ I don't know → "Check Companies House or your accountant"    │
│                                                                 │
│  → If answered: Show exact dates + [Add to calendar]            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Copy Format (When User Clicks "Copy Results")

```
How Much Can I Pay Myself? - PayeTax.co.uk
Based on ~£75,000 profit (next 12 months)

YOUR MONTHLY PAY
Around £4,500/month

SET ASIDE FOR TAX
Company tax pot: £16,000 (keep in business account)
Personal tax pot: £750/month (save for January)

HOW TO DO IT
1. Pay yourself £1,047/month salary
2. Transfer the rest as dividends
3. Save £750/month for your tax bill

⚠️ This is a rough estimate. Assumes this is your only 
income and a 12-month year. For precision, see an accountant.

Generated: [date] | payetax.co.uk/tools/director-guide
```

---

## Pricing: "For the Price of a Coffee"

Pro features (save scenarios, PDF, reminders) cost the same as a flat white.

**Literally pegged to real data:**

| Source | How |
|--------|-----|
| ONS CPI data | Average price of coffee out |
| Or | Published price from Costa/Pret |

**Update:** Quarterly

**Display:**
> "Pro costs £3.85/month - the price of a flat white. 
> (Based on UK average, ONS data. When coffee prices change, we change.)"

**Why:**
- Radical transparency
- Relatable ("it's just a coffee")
- Memorable marketing angle
- Shows we're not making up prices

---

## File Structure

```
src/
├── app/tools/
│   └── director-guide/
│       ├── page.tsx                    # Server (metadata, schema)
│       └── DirectorGuideClient.tsx     # Client (wizard state)
├── components/
│   └── organisms/DirectorGuide/
│       ├── WelcomeStep.tsx             # Screen 1
│       ├── LocationStep.tsx            # Screen 2
│       ├── RevenueStep.tsx             # Screen 3
│       ├── ExpensesStep.tsx            # Screen 4
│       ├── AlreadyTakenStep.tsx        # Screen 5
│       ├── CalculatingStep.tsx         # Screen 6
│       ├── ResultsStep.tsx             # Screen 7
│       ├── CompanyBox.tsx              # Company position
│       ├── PersonalBox.tsx             # Personal position
│       ├── KeyDates.tsx                # Optional year-end
│       └── Warnings/
│           ├── SurvivalMode.tsx
│           ├── DLAWarning.tsx
│           ├── VATWarning.tsx
│           └── ComplexityWarning.tsx
├── lib/
│   ├── directorCalculator.ts           # Core math (from MATH doc)
│   ├── simplifiedCalculator.ts         # NEW: Wrapper with hardcoded assumptions
│   └── calendarGenerator.ts            # .ics generation
└── constants/
    └── taxRates.ts                     # Tax rates (from MATH doc)
```

---

## New Function: Simplified Calculator

```typescript
// src/lib/simplifiedCalculator.ts

interface SimplifiedInput {
  revenue: number;
  includesVat: boolean;
  expenses: number;
  alreadyTaken: number;
  alreadyTakenViaPayroll: boolean | null;
}

interface SimplifiedResult {
  profit: number;
  monthlyPay: number;
  companyTaxPot: number;
  personalTaxMonthly: number;
  includesPOA: boolean;
  warnings: Warning[];
}

export function calculateSimplified(input: SimplifiedInput): SimplifiedResult {
  // 1. Adjust revenue for VAT if needed
  const netRevenue = input.includesVat ? input.revenue / 1.2 : input.revenue;
  
  // 2. Calculate profit
  const profit = netRevenue - input.expenses;
  
  // 3. Use existing calculator with hardcoded assumptions
  const scenario = calculateDirectorScenario({
    profit,
    salary: 12570,  // Hardcoded
    employmentAllowance: false,  // Hardcoded
    otherIncome: 0,  // Hardcoded
    taxYear: '2025-2026',
  });
  
  // 4. Calculate outputs
  const annualTakeHome = scenario.netTakeHome - input.alreadyTaken;
  const monthlyPay = Math.max(0, annualTakeHome / 12);
  
  // 5. Personal tax with POA if > £1k
  const personalTax = scenario.dividendTax;
  const includesPOA = personalTax > 1000;
  const personalTaxMonthly = includesPOA 
    ? (personalTax * 1.5) / 12 
    : personalTax / 12;
  
  // 6. Collect warnings
  const warnings = [];
  if (profit <= 0) warnings.push({ type: 'SURVIVAL_MODE' });
  if (profit > 250000) warnings.push({ type: 'HIGH_COMPLEXITY' });
  if (netRevenue > 85000) warnings.push({ type: 'VAT_THRESHOLD' });
  if (input.alreadyTaken > 0 && !input.alreadyTakenViaPayroll) {
    warnings.push({ type: 'DLA_RISK' });
  }
  
  return {
    profit,
    monthlyPay,
    companyTaxPot: scenario.corporationTax,
    personalTaxMonthly,
    includesPOA,
    warnings,
  };
}
```

---

## Build Order

### Step 1: Foundation
- [ ] Ensure `taxRates.ts` has all 2025-26 rates
- [ ] Create `simplifiedCalculator.ts` wrapper
- [ ] Test with golden example

### Step 2: Wizard Steps
- [ ] WelcomeStep.tsx
- [ ] LocationStep.tsx (Scotland supported)
- [ ] RevenueStep.tsx (with VAT checkbox)
- [ ] ExpensesStep.tsx
- [ ] AlreadyTakenStep.tsx
- [ ] CalculatingStep.tsx (artificial pause)
- [ ] DirectorGuideClient.tsx (wizard state management)

### Step 3: Results
- [ ] CompanyBox.tsx
- [ ] PersonalBox.tsx
- [ ] ResultsStep.tsx (assembles boxes)
- [ ] Copy functionality

### Step 4: Warnings
- [ ] SurvivalMode.tsx
- [ ] DLAWarning.tsx
- [ ] VATWarning.tsx
- [ ] ComplexityWarning.tsx

### Step 5: Optional Enhancements
- [ ] KeyDates.tsx (year-end input → exact dates)
- [ ] calendarGenerator.ts (.ics files)
- [ ] Progress indicator component

### Step 6: Polish
- [ ] Mobile responsive (test each step)
- [ ] Accessibility
- [ ] Analytics events
- [ ] Legal disclaimer

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `guide_started` | Welcome screen "Let's go" clicked |
| `guide_location_selected` | Location step completed |
| `guide_revenue_entered` | Revenue step completed |
| `guide_expenses_entered` | Expenses step completed |
| `guide_already_taken` | Already taken step completed |
| `guide_results_shown` | Results displayed |
| `guide_results_copied` | Copy button clicked |
| `guide_year_end_entered` | Optional year-end provided |
| `guide_calendar_downloaded` | .ics downloaded |
| `guide_warning_shown` | Any warning displayed (with type) |
| `guide_accountant_cta_clicked` | "Talk to accountant" clicked |

---

## Success Criteria

| Metric | Target |
|--------|--------|
| Wizard completion rate | > 70% |
| Time to results | < 60 seconds |
| "This helped" feedback | Positive |
| Zero "calculation is wrong" complaints | ✅ |

**The real test:** Someone with no tax knowledge gets a clear, actionable number.

---

## What's NOT in v1.0.0

| Feature | Status | Why |
|---------|--------|-----|
| Other income input | v1.1 | Complexity |
| Employment Allowance toggle | v1.1 | Minority case |
| PDF export | v1.1 (Pro) | Nice-to-have |
| Save scenarios | v1.1 (Pro) | Nice-to-have |
| Email reminders | v1.1 (Pro) | Nice-to-have |
| Detailed comparison table | v1.1 | Not needed for core answer |
| Education sections | v1.1 | Link to them, don't block flow |

---

## Reviewer Consensus (All 4 Approved)

| Reviewer | Status | Key Contribution |
|----------|--------|------------------|
| Grok | ✅ | Assumption transparency, optional complexity detection |
| Claude | ✅ | VAT help text, "already taken" upfront, year-end optional |
| ChatGPT | ✅ | Define "this year", guardrails, plain English copy |
| Gemini | ✅ | Silent assumptions, VAT checkbox, POA safety net |

---

**This is the build. Ship it.**
