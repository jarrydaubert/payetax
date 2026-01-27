# Director Calculator (Pro Tool) - Build Spec

> **Purpose:** Pro-grade salary vs dividend optimizer for accountants and experienced directors
> **Route:** `/tools/director-calculator`
> **For tax calculations:** See `DIRECTOR_TAX_MATH.md`
> **For consumer guide:** See `DIRECTOR_GUIDE_BUILD.md`
> **Status:** ✅ COMPLETE - Reviewed by Grok, Claude, ChatGPT

---

## Overview

The Pro Calculator is a **3-strategy comparison tool** for directors who understand the basics and want to optimize their extraction strategy. Unlike the Consumer Guide (education-first), this tool is numbers-first.

### Target Audience

| Who | Their Need |
|-----|------------|
| Accountants | Quick client scenario comparison |
| Experienced directors | Annual planning optimization |
| Finance-savvy founders | Self-service tax planning |

### Positioning vs Consumer Guide

| Aspect | Consumer Guide | Pro Calculator |
|--------|----------------|----------------|
| Route | `/tools/director-guide` | `/tools/director-calculator` |
| Audience | First-time directors | Accountants, experienced |
| Approach | Education-first | Numbers-first |
| Strategy | Single "safe" approach | 3-strategy comparison |
| Tone | "We've got you" | Professional, data-dense |
| Jargon | Tooltips everywhere | Assumes familiarity |

---

## Features

### 1. Three-Strategy Comparison

| Strategy | Description | When Best |
|----------|-------------|-----------|
| **All Salary** | Take everything as PAYE salary | Rarely optimal (high NI) |
| **Optimal Mix** | £12,570 salary + dividends | Usually best for single directors |
| **All Dividends** | £0 salary, all dividends | Loses NI credits, rarely best |

Each strategy shows:
- Gross extraction amount
- Employer NI (company cost)
- Corporation Tax
- Income Tax (marginal)
- Employee NI
- Dividend Tax
- **Total Personal Tax**
- **Company Cost**
- **Net Take-Home** ← Key comparison metric

### 2. Strategy Selection

User can select any strategy to see detailed breakdown:
- Two Pots (Company Account / Personal Savings)
- Bank transfer references
- Key dates with amounts

### 3. Two Pots Visualization

```
┌─────────────────────────────────────────────────────────────┐
│  COMPANY ACCOUNT                 │  PERSONAL SAVINGS        │
│  (Set aside for business tax)    │  (Set aside for your tax)│
├──────────────────────────────────┼──────────────────────────┤
│  Corporation Tax: £X             │  Dividend Tax: £Y        │
│  Employer NI: £Z                 │  Payments on Account: £W │
│                                  │                          │
│  Monthly: £A                     │  Monthly: £B             │
│  Total: £C                       │  Total: £D               │
└──────────────────────────────────┴──────────────────────────┘
```

### 4. Bank Transfer References

Suggested references for standing orders:
- `TAX-CT-[YYYY]` - Corporation Tax pot
- `TAX-SA-[YYYY]` - Self Assessment pot

### 5. Key Dates with .ics Downloads

| Date | What | Download |
|------|------|----------|
| 9 months after year-end | CT600 filing + payment | 📅 .ics |
| 31 January | Self Assessment deadline | 📅 .ics |
| 31 July | POA second payment (if applicable) | 📅 .ics |

### 6. Warnings

| Warning | Trigger | Message |
|---------|---------|---------|
| VAT Approaching | £85k-£90k revenue | "Monitor closely" |
| VAT Required | ≥£90k revenue | "Must register" |
| DLA Risk | Taken money not via payroll | "May be treated as loan" |
| High Complexity | >£250k profit | "Consider accountant" |
| Already Taken Too Much | Taken > take-home | "You've exceeded..." |
| Payments on Account | Dividend tax >£1k | "May require POA" |

### 7. Survival Mode

When profit ≤ £12,570:
- No strategy comparison (all strategies ≈ same)
- Show "Silver Linings" (loss carry-forward, VAT reclaim)
- Encourage focus on growing revenue

### 8. Assumptions Panel

Collapsible panel listing all assumptions:
- NI Category A (standard employee)
- No other income (unless specified)
- Single director, no other employees
- Annual NI calculation method
- Standard Personal Allowance (no blind person's, marriage)
- State Pension Age not reached
- UK tax resident
- Not in IR35 contract
- Distributable reserves available

---

## Inputs

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Region | Select | Yes | Scotland / rUK (England, Wales, NI) |
| Annual Revenue | Currency | Yes | What company invoiced |
| Includes VAT | Checkbox | No | If checked, deduct 20% |
| Business Expenses | Currency | Yes | Deductible costs |
| Other Personal Income | Currency | No | For band stacking |
| Employment Allowance | Checkbox | No | £10,500 if eligible |
| Already Taken | Currency | No | YTD withdrawals |
| Taken Via Payroll | Select | Conditional | Yes/No/Unsure (if already taken >0) |
| Company Year-End | Select | Yes | Month (for deadline calculation) |

---

## Outputs

### Strategy Table

| Column | Description |
|--------|-------------|
| Strategy | Name + radio selector |
| Salary | Annual salary amount |
| Dividends | Annual dividend amount |
| Employer NI | Company's NI cost |
| Corp Tax | On remaining profit |
| Income Tax | Marginal (on salary) |
| Employee NI | Director's NI |
| Dividend Tax | Based on total income |
| Company Cost | Salary + Employer NI + CT |
| Take-Home | Net to director |
| vs Best | Difference from optimal |

### Selected Strategy Detail

- Monthly salary breakdown
- Monthly dividend breakdown
- Company tax pot (CT + Employer NI)
- Personal tax pot (Dividend Tax + POA if applicable)
- Key dates with .ics downloads

---

## Tax Engine

### Shared Modules

```
src/lib/tax/
├── strategyComparison.ts    # 3-strategy orchestrator
├── corporationTax.ts        # CT with marginal relief
├── dividendTax.ts           # Dividend tax with PA sheltering
├── employerNI.ts            # Employer NI (15% above £5k)
├── employeeNI.ts            # Employee NI (8%/2%)
├── incomeTax.ts             # Income tax (rUK + Scotland)
└── directorCalculator.ts    # Consumer guide orchestrator
```

### Key Calculation Details

#### Personal Allowance Shelters Dividends

When salary < PA, unused PA shelters dividends:

```typescript
const unusedPA = Math.max(0, personalAllowance - otherIncome);
const dividendsSheltered = Math.min(dividends, unusedPA);
```

#### Other Income Affects Bands

Other income (employment, rental, etc.) is passed through:

```typescript
const totalIncomeTax = getIncomeTax(salary + otherIncome, region);
const otherIncomeTax = getIncomeTax(otherIncome, region);
const marginalIncomeTax = totalIncomeTax - otherIncomeTax;
```

#### Corporation Tax Marginal Relief

For profits £50,001-£249,999:

```
Tax = profit × 25% - marginalRelief
MarginalRelief = (250000 - profit) × (3/200)
```

#### Employment Allowance

£10,500 offset against employer NI (2025-26). Only applies if:
- Not sole director with no other employees
- NI liability < £100k (removed from April 2025)

---

## What's NOT Included

| Feature | Why Excluded |
|---------|--------------|
| VAT return calculation | Separate domain, just warn on threshold |
| Multi-employee NI | Complexity, different tool |
| R&D tax credits | Specialist area |
| Capital Gains | Different tax entirely |
| Pension contributions | Adds complexity, v2 feature |
| Associated companies | Rare, accountant territory |
| Student loan repayments | Adds inputs, v2 feature |

---

## Test Coverage

### Unit Tests (90 tests)

| File | Tests | Coverage |
|------|-------|----------|
| `corporationTax.test.ts` | 21 | 19%/25%/marginal relief |
| `dividendTax.test.ts` | 21 | Bands, PA sheltering, allowance |
| `employerNI.test.ts` | 23 | 15% rate, EA offset |
| `directorCalculator.test.ts` | 25 | Integration, golden example |

### Missing Tests (P0)

| File | Needed |
|------|--------|
| `employeeNI.ts` | Boundary tests |
| `incomeTax.ts` | Scottish rates, PA taper |
| `strategyComparison.ts` | All 3 strategies, other income |

---

## UI Component

`DirectorCalculatorClient.tsx` (~1,200 lines)

### State

```typescript
const [region, setRegion] = useState<Region>('rUK');
const [revenue, setRevenue] = useState<string>('');
const [includesVat, setIncludesVat] = useState(false);
const [expenses, setExpenses] = useState<string>('');
const [otherIncome, setOtherIncome] = useState<string>('0');
const [hasEmploymentAllowance, setHasEmploymentAllowance] = useState(false);
const [alreadyTaken, setAlreadyTaken] = useState<string>('0');
const [takenViaPayroll, setTakenViaPayroll] = useState<TakenViaPayroll>('unsure');
const [yearEndMonth, setYearEndMonth] = useState<YearEndMonth>('03');
const [selectedStrategy, setSelectedStrategy] = useState<StrategyType>('optimalMix');
const [comparison, setComparison] = useState<StrategyComparison | null>(null);
```

### Refactoring Backlog

- Extract strategy table component
- Extract Two Pots component
- Extract Key Dates component
- Extract Warnings component
- Extract Assumptions component

---

## Analytics Events (TODO)

| Event | Trigger |
|-------|---------|
| `pro_calculator_started` | Page load |
| `pro_calculator_completed` | Calculate clicked |
| `pro_strategy_selected` | Strategy radio changed |
| `pro_calendar_downloaded` | .ics button clicked |

---

## Review History

| Reviewer | Status | Key Feedback |
|----------|--------|--------------|
| Grok | ✅ Approved | DLA trigger, VAT threshold |
| Claude | ✅ Approved | PA sheltering verified |
| ChatGPT | ✅ Approved | Other income handling |

---

## Related Documents

- `DIRECTOR_GUIDE_STRATEGY.md` - Consumer guide product strategy
- `DIRECTOR_GUIDE_BUILD.md` - Consumer guide build spec
- `DIRECTOR_TAX_MATH.md` - Tax rates and formulas
- `ACCOUNTINGWEB_ORIGINAL_PROPOSAL.md` - Original SME tools pitch
- `BACKLOG.md` - Outstanding items

