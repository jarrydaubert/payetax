# Director Calculator - Product Spec

> **Route:** `/tools/director-guide`
> **Audience:** Accountants, experienced directors, finance-savvy founders
> **Tax Year:** 2025-26 (constants from `src/constants/taxRates.ts`)
> **Disclaimer:** Illustrative only. Not financial advice. Consult a qualified accountant.

---

## File Inventory

### Page & Orchestration
| File | Purpose |
|------|---------|
| `src/app/tools/director-guide/page.tsx` | Route page with SEO metadata |
| `src/components/organisms/DirectorGuide/DirectorDashboard.tsx` | Main orchestrator, 4-panel layout |

### Dashboard Components
| File | Purpose |
|------|---------|
| `src/components/molecules/DirectorGuide/dashboard/DashboardLayout.tsx` | 4-panel responsive layout |
| `src/components/molecules/DirectorGuide/dashboard/SidebarNav.tsx` | Icon sidebar (collapsed by default) |
| `src/components/molecules/DirectorGuide/dashboard/InputsPanel.tsx` | All user inputs |
| `src/components/molecules/DirectorGuide/dashboard/EducationPanel.tsx` | Learn cards + warnings |
| `src/components/molecules/DirectorGuide/dashboard/SummaryCards.tsx` | Top metrics row |
| `src/components/molecules/DirectorGuide/dashboard/DetailCards.tsx` | 4 breakdown cards |
| `src/components/molecules/DirectorGuide/dashboard/MoneyFlowChart.tsx` | Horizontal bar chart |

### Calculator Components
| File | Purpose |
|------|---------|
| `src/components/molecules/DirectorGuide/calculator/SalarySlider.tsx` | Interactive salary explorer |
| `src/components/molecules/DirectorGuide/calculator/StrategyComparisonTable.tsx` | 3 strategy cards |
| `src/components/molecules/DirectorGuide/calculator/TaxPots.tsx` | Company + Personal tax pots |
| `src/components/molecules/DirectorGuide/calculator/PensionGapWarning.tsx` | State pension status |
| `src/components/molecules/DirectorGuide/calculator/KeyDates.tsx` | Tax deadline display |
| `src/components/molecules/DirectorGuide/calculator/TaxBreakdownTable.tsx` | Full breakdown (unused) |

### State & Logic
| File | Purpose |
|------|---------|
| `src/store/directorGuideStore.ts` | Zustand store for form + results |
| `src/lib/tax/strategyComparison.ts` | 3-strategy calculation engine |
| `src/lib/tax/directorCalculator.ts` | Single scenario calculator |
| `src/lib/validation/directorValidation.ts` | Zod schemas for inputs |
| `src/lib/directorGuideAnalytics.ts` | Analytics tracking |

### Tax Calculation Modules
| File | Purpose |
|------|---------|
| `src/lib/tax/incomeTax.ts` | Income tax (rUK + Scotland) |
| `src/lib/tax/employeeNI.ts` | Employee National Insurance |
| `src/lib/tax/employerNI.ts` | Employer National Insurance |
| `src/lib/tax/corporationTax.ts` | Corporation Tax + marginal relief |
| `src/lib/tax/dividendTax.ts` | Dividend tax calculation |
| `src/lib/tax/studentLoan.ts` | Student loan repayments |

### Legacy/Unused Input Components
| File | Purpose |
|------|---------|
| `src/components/molecules/DirectorGuide/inputs/CoreInputs.tsx` | Old inputs (has Year-End) |
| `src/components/molecules/DirectorGuide/inputs/*.tsx` | Individual input components |

---

## What It Does

A **salary vs dividend optimiser** that auto-recommends the most tax-efficient extraction strategy for UK limited company directors.

### Key Differentiators

| Feature | Status | Notes |
|---------|--------|-------|
| Student loans on TOTAL income | ✅ | Correctly applies SA rules to salary + dividends + BIK |
| Scottish 6-band support | ✅ | Full 2025-26 Scottish rates |
| Marginal relief CT | ✅ | Proper 19%→25% taper |
| Strategy comparison | ✅ | 3 clickable strategy cards |
| Interactive salary slider | ✅ | Live updates all figures |
| Two Pots budgeting | ✅ | Company + Personal monthly set-aside |

---

## Inputs

| Input | Type | Status | Location |
|-------|------|--------|----------|
| Region | Select (England/Wales/NI/Scotland) | ✅ | InputsPanel |
| Annual Revenue | Currency | ✅ | InputsPanel |
| Includes VAT | Checkbox | ✅ | InputsPanel |
| Business Expenses | Currency | ✅ | InputsPanel |
| Already Taken | Currency | ✅ | InputsPanel |
| Other Personal Income | Currency | ✅ | InputsPanel |
| Employment Allowance | Toggle | ✅ | InputsPanel (Advanced) |
| Student Loan Plans | Checkboxes (1/2/4/Postgrad) | ✅ | InputsPanel (Advanced) |
| Pension Contribution | Currency | ✅ | InputsPanel (Advanced) |
| Company Car BIK | Currency | ✅ | InputsPanel (Advanced) |
| Company Year-End | Select (March/Dec/Other/Unknown) | ✅ | InputsPanel |

---

## Outputs

### Summary Cards (Top Row) ✅
| Metric | Status |
|--------|--------|
| Monthly Take-Home | ✅ |
| Annual Salary | ✅ |
| Annual Dividends | ✅ |
| Corporation Tax | ✅ |

### 3-Strategy Comparison Cards ✅

| Strategy | Description | Status |
|----------|-------------|--------|
| All Salary | Take everything as PAYE salary | ✅ |
| Recommended | Optimal salary + dividends | ✅ (cyan glow + "Recommended" badge) |
| All Dividends | £0 salary, all dividends | ✅ |

Each card shows: Salary, Dividends, Total Tax, Effective Rate

**Dynamic Message Below Cards:**
- At optimal: "Optimal tax efficiency — this is your best option" (green)
- Not optimal: "X% more tax than optimal (£Y extra)" (red)

### Salary Slider ✅
| Feature | Status | Notes |
|---------|--------|-------|
| Range £0 to UEL (or profit) | ✅ | Uses `TAX_RATES[TAX_YEAR].nationalInsurance.employee.A.upper.threshold` |
| Live figure updates | ✅ | All components react to slider |
| Initializes to optimal | ✅ | Starts at £12,570 |

### Detail Cards (2x2 Grid) ✅
| Card | Status |
|------|--------|
| Salary Breakdown | ✅ (Gross, Income Tax, Employee NI, Employer NI, Net) |
| Dividend Breakdown | ✅ (Gross, Allowance, Taxable, Tax, Net) |
| Corporation Tax | ✅ (Revenue, Expenses, Salary+NI, Taxable Profit, CT Due) |
| Tax Summary | ✅ (All taxes totaled) |

### Tax Pots (Two Pots) ✅
| Pot | Status | Contents |
|-----|--------|----------|
| Company Tax Pot | ✅ | Corporation Tax (monthly) |
| Personal Tax Pot | ✅ | Income Tax + Dividend Tax + Student Loan (monthly) |

### State Pension Status ✅
| Salary Range | Status | Display |
|--------------|--------|---------|
| £6,500+ | ✅ | Green: "Qualifying Year" |
| £5,000-£6,499 | ✅ | Amber: "Inefficient Salary Zone" warning |
| Below £5,000 | ✅ | Gray: "No Credits This Year" |

Uses constants: `SECONDARY_THRESHOLD`, `LEL` from taxRates.ts

### Money Flow Chart ✅
Simple horizontal bar chart showing:
- Gross Profit (100%)
- Take-Home (% of profit)
- Total Tax (% of profit)

### Key Dates ✅
| Date | Status | Notes |
|------|--------|-------|
| Year End | ✅ | Based on yearEndMonth input |
| CT Payment | ✅ | Year-end + 9 months + 1 day |
| CT Return | ✅ | Year-end + 12 months |
| Self Assessment | ✅ | 31 January following tax year |

### Education Panel ✅
| Section | Status |
|---------|--------|
| Learn Cards | ✅ (Why £12,570, Dividends, Corp Tax, Pension) |
| Warnings | ✅ (Context-sensitive) |
| Assumptions | ✅ (Tax year, region, period) |

### Additional Features
| Feature | Status | Notes |
|---------|--------|-------|
| Effective tax rate | ✅ | Shown on strategy cards |
| Email results | ❌ | Not implemented |
| PDF export | ❌ | Disabled, marked "Pro" |
| .ics downloads | ❌ | Not implemented |

---

## Warnings System ✅

All warnings in EducationPanel use constants where available:

| Condition | Warning | Status |
|-----------|---------|--------|
| Revenue £85k-90k | VAT threshold approaching | ✅ |
| Revenue ≥£90k | VAT registration required | ✅ |
| Income >£100k | PA taper zone (60% rate) | ✅ (uses `PA_TAPER_THRESHOLD`) |
| Profit >£250k | High complexity | ✅ |
| Taken > available | Overdrawn warning | ✅ |
| Sole director + EA | Employment Allowance not available | ✅ (tooltip) |
| Salary £5k-£6.5k | Pension Gap warning | ✅ (uses `SECONDARY_THRESHOLD`, `LEL`) |
| Income £60k-£80k | HICBC clawback | ✅ |
| Pension >£60k | Annual Allowance warning | ✅ |
| Dividends declared | Self Assessment required | ✅ |
| Student loans selected | SA repayment warning | ✅ |
| Any salary | Payroll admin required | ✅ |
| SA tax >£1k | Payments on Account warning | ✅ |
| No profit | Survival mode warning | ✅ |

---

## Tax Calculations

All rates from `src/constants/taxRates.ts` — NO hardcoded values in components.

### Income Tax (rUK) ✅
- £0-12,570: 0% (Personal Allowance)
- £12,571-50,270: 20%
- £50,271-125,140: 40%
- £125,140+: 45%
- PA Taper: Reduces £1 for every £2 over £100k

### Income Tax (Scotland) ✅
- £0-12,570: 0%
- £12,571-15,397: 19% (Starter)
- £15,398-27,491: 20% (Basic)
- £27,492-43,662: 21% (Intermediate)
- £43,663-75,000: 42% (Higher)
- £75,001-125,140: 45% (Advanced)
- £125,140+: 48% (Top)

### National Insurance ✅
| Type | Threshold | Rate |
|------|-----------|------|
| Employee NI | £12,570-50,270 | 8% |
| Employee NI | £50,270+ | 2% |
| Employer NI | Above £5,000 | 15% |
| Employment Allowance | — | £10,500 offset |
| LEL (pension credits) | £6,500 | — |

### Corporation Tax ✅
| Profit | Rate |
|--------|------|
| £0-50,000 | 19% |
| £50,001-250,000 | Marginal relief |
| £250,001+ | 25% |

Marginal relief formula: `(250000 - profit) × 3/200`

### Dividend Tax ✅
- Allowance: £500 (from `dividendAllowance` constant)
- Basic rate: 8.75%
- Higher rate: 33.75%
- Additional rate: 39.35%

### Student Loans ✅
| Plan | Threshold | Rate |
|------|-----------|------|
| Plan 1 | £26,065 | 9% |
| Plan 2 | £28,470 | 9% |
| Plan 4 | £32,745 | 9% |
| Postgrad | £21,000 | 6% |

Applied to TOTAL income (salary + dividends + BIK + other)

---

## UI Layout

```
┌──────────┬───────────┬─────────────────────┬──────────────┐
│ Sidebar  │  Inputs   │    Main Content     │  Education   │
│   48px   │   280px   │      (flex)         │    320px     │
│  icons   │   forms   │                     │    learn     │
│collapsed │ expanded  │                     │   expanded   │
└──────────┴───────────┴─────────────────────┴──────────────┘
```

### Main Content Flow (top to bottom):
1. Header: "Director Pay Dashboard"
2. SummaryCards (4 metrics)
3. SalarySlider
4. StrategyComparisonTable (3 cards + message)
5. DetailCards (2x2 grid)
6. TaxPots (Company + Personal)
7. PensionGapWarning
8. MoneyFlowChart + KeyDates (side by side)

### Styling
- Dark theme: `bg-[#0f172a]`, `bg-[#1e293b]`
- Cards: `rounded-xl border border-white/[0.04] p-4`
- Accent: Cyan (`cyan-500`) + Emerald (`emerald-500`)
- Fonts: `font-mono` for currency values

---

## Known Limitations

| Item | Status |
|------|--------|
| £2k unearned income rule for SL | ❌ Not implemented |
| Class 1A NI on BIK | ❌ Not applied to company cost |
| Associated companies CT thresholds | ❌ Not implemented |
| Short accounting periods | ❌ Not implemented |

---

## Not Implemented (Backlog)

### Phase 2 - Common Scenarios

| Feature | Impact | Notes |
|---------|--------|-------|
| Multiple directors | High | Husband/wife setups common - split profit extraction |
| Retained profits option | High | "How much to leave in company?" - not everyone extracts 100% |
| Director's loan S455 calc | Medium | DLA warning exists, but no S455 tax calculation (32.5% on overdrawn balance) |
| IR35 status question | Medium | "Are you a contractor?" - affects entire strategy validity |

### Phase 2 - Quick Wins

| Feature | Impact | Notes |
|---------|--------|-------|
| Trivial benefits | Low | £300/year tax-free (gift cards, small perks) - easy to add |
| Home office allowance | Low | £6/week (£312/year) or actual costs - common director expense |

### Phase 3 - Advanced

| Feature | Notes |
|---------|-------|
| Spouse modelling | Paying spouse up to £12,570 for legitimate work |
| Variable income mode | "My profit varies year to year" |

### Phase 4 - Polish

| Feature | Notes |
|---------|-------|
| Tax year selector | Support multiple tax years |
| Visual charts (pie/waterfall) | Better visualization of money flow |

### Infrastructure

| Feature | Notes |
|---------|-------|
| Tests for new calculators | Unit tests for strategyComparison, directorCalculator |
| Email results | API exists at `/api/send-director-results` |
| PDF export | Marked as "Pro" feature |
| .ics calendar downloads | For key dates |

---

## Test Checklist

### Income Tax
- [ ] rUK: All bands correct
- [ ] Scotland: All 6 bands correct
- [ ] PA taper: Starts at £100k
- [ ] PA taper: Zero at £125,140

### National Insurance
- [ ] Employee NI: 8% from £12,570
- [ ] Employee NI: 2% above £50,270
- [ ] Employer NI: 15% from £5,000
- [ ] Employment Allowance: £10,500 offset

### Corporation Tax
- [ ] 19% up to £50,000
- [ ] Marginal relief £50,001-£250,000
- [ ] 25% above £250,000

### Dividend Tax
- [ ] Allowance: Uses constant (£500)
- [ ] Rates: 8.75% / 33.75% / 39.35%

### Student Loans
- [ ] All plan thresholds from constants
- [ ] Applied to total income
- [ ] Multiple plans stack

### Strategy Comparison
- [ ] All Salary calculates correctly
- [ ] Recommended shows highest take-home
- [ ] All Dividends calculates correctly
- [ ] Clicking card updates slider

### State Pension Warning
- [ ] £5,000-£6,499: Warning shown
- [ ] £6,500+: Qualifying message
- [ ] Below £5,000: No credits message
- [ ] Updates live with slider

### UI/UX
- [ ] Slider updates all figures live
- [ ] Strategy cards highlight on selection
- [ ] Two Pots show correct monthly amounts
- [ ] All warnings appear at correct thresholds
