# Director Calculator - Product Spec

> **Route:** `/tools/director-calculator`
> **Audience:** Accountants, experienced directors, finance-savvy founders
> **Tax Year:** 2025-26
> **Disclaimer:** Illustrative only. Not financial advice. Consult a qualified accountant.

---

## What It Does

A **salary vs dividend optimiser** that auto-recommends the most tax-efficient extraction strategy for UK limited company directors. Not just a calculator — a tax engine.

### Key Differentiators

| Feature | Why It Matters |
|---------|----------------|
| **Student loans on TOTAL income** | Only calculator that correctly applies SA rules to salary + dividends + BIK |
| **Scottish 6-band support** | 2.7m Scottish taxpayers underserved by competitors |
| **Marginal relief CT** | Proper 19%→25% taper (most use flat 25%) |
| **Strategy comparison** | Compares 3 scenarios and recommends highest take-home |
| **Interactive salary slider** | Live exploration of breakpoints |
| **Two Pots budgeting** | Shows monthly set-aside for company vs personal tax |

---

## Inputs

| Input | Type | Notes |
|-------|------|-------|
| Region | Select | rUK / Scotland (changes income tax bands) |
| Annual Revenue | Currency | What company invoiced |
| Includes VAT | Checkbox | If yes, divide by 1.2 |
| Business Expenses | Currency | Excluding director salary |
| Other Personal Income | Currency | Employment, rental, etc. (stacks in tax bands) |
| Employment Allowance | Checkbox | £10,500 offset (not for sole directors) |
| Student Loan Plans | Checkboxes | Plan 1 / 2 / 4 / Postgrad (Plan 5 from 2026-27) |
| Pension Contribution | Currency | Employer contribution (reduces CT profit) |
| Company Car BIK | Currency | Taxable benefit amount |
| Already Taken | Currency | YTD withdrawals |
| Company Year-End | Select | For key dates calculation |

---

## Outputs

### 3-Strategy Comparison Table

| Strategy | Description |
|----------|-------------|
| **All Salary** | Take everything as PAYE salary |
| **Recommended** | Optimal salary (£6,500 or £12,570) + dividends |
| **All Dividends** | £0 salary, all dividends |

Each row shows: Salary, Dividends, Employer NI, Corp Tax, Income Tax, Employee NI, Dividend Tax, Student Loan, **Take-Home**

### Recommended Strategy Logic

Compares two salary options, picks highest take-home:

| Option | Salary | When It Wins |
|--------|--------|--------------|
| LEL | £6,500 | Rare — only if EA unavailable and very low profit |
| PA | £12,570 | Usually — CT savings outweigh extra Employer NI |

### Additional Outputs

- **Effective tax rate** — Total tax / gross profit
- **Two Pots** — Monthly set-aside (Company: CT + Employer NI / Personal: Dividend Tax + SA)
- **Key dates** — CT payment, CT600 filing, SA deadline (with .ics downloads)
- **Salary Explorer** — Slider from £0 to £50,270 with live updates
- **Email results** — Send calculation to inbox

---

## Tax Calculations

### Income Tax

**rUK (England/Wales/NI):**
- £0-12,570: 0% (Personal Allowance)
- £12,571-50,270: 20%
- £50,271-125,140: 40%
- £125,140+: 45%

**Scotland (6 bands):**
- £0-12,570: 0% (Personal Allowance)
- £12,571-15,397: 19% (Starter)
- £15,398-27,491: 20% (Basic)
- £27,492-43,662: 21% (Intermediate)
- £43,663-75,000: 42% (Higher)
- £75,001-125,140: 45% (Advanced)
- £125,140+: 48% (Top)

**PA Taper:** Reduces £1 for every £2 over £100k (zero at £125,140)

### National Insurance

**Key Thresholds:**

| Threshold | Amount | Purpose |
|-----------|--------|---------|
| LEL | £6,500 | NI credits for State Pension |
| ST | £5,000 | Employer NI starts |
| PT | £12,570 | Employee NI starts |
| UEL | £50,270 | Employee NI drops to 2% |

**Rates:**

| Type | Threshold | Rate |
|------|-----------|------|
| Employee NI | £12,570-50,270 | 8% |
| Employee NI | £50,270+ | 2% |
| Employer NI | Above £5,000 | 15% |
| Employment Allowance | — | £10,500 offset |

### Corporation Tax

| Profit | Rate |
|--------|------|
| £0-50,000 | 19% |
| £50,001-250,000 | 25% minus marginal relief |
| £250,001+ | 25% |

**Marginal Relief:** `(250000 - profit) × 3/200`

### Dividend Tax

- Allowance: £500
- Basic rate: 8.75%
- Higher rate: 33.75%
- Additional rate: 39.35%

**Note:** Dividends use UK rates for ALL UK residents (including Scottish)

### Student Loans (on TOTAL income via Self Assessment)

| Plan | Threshold | Rate | Notes |
|------|-----------|------|-------|
| Plan 1 | £26,065 | 9% | Pre-2012 England/Wales |
| Plan 2 | £28,470 | 9% | Post-2012 England/Wales |
| Plan 4 | £32,745 | 9% | Scotland |
| Postgrad | £21,000 | 6% | Masters/PhD loans |

**Plan 5** (£25,000 threshold) applies from 2026-27 onwards — not included in 2025-26 calculator.

**Critical:** Calculated on salary + dividends + BIK + other income (not just salary)

**Note:** If unearned income (dividends + savings + rental) < £2,000, it's ignored for SL purposes. If ≥ £2,000, full amount included. (Currently not implemented - edge case for future.)

---

## Warnings & Edge Cases

| Condition | Warning |
|-----------|---------|
| Revenue £85k-90k | VAT threshold approaching (£90k) |
| Revenue ≥£90k | VAT registration likely required |
| Total income >£100k | PA taper zone (60% effective rate) |
| Total income >£125,140 | PA fully lost |
| Profit ≤£12,570 | "Survival mode" — limited strategy options |
| Taken > take-home | Overdrawn warning |
| Sole director + EA claimed | Employment Allowance not available (tooltip) |

---

## Key Dates Logic

Based on company year-end month:

| Date | Calculation |
|------|-------------|
| CT Payment Due | Year-end + 9 months + 1 day |
| CT600 Filing | Year-end + 12 months |
| Self Assessment | 31 January following tax year |

---

## Known Limitations

| Item | Status | Notes |
|------|--------|-------|
| £2k unearned income rule | Not implemented | SL should ignore dividends < £2k |
| Class 1A NI on BIK | Calculated, not applied | 15% employer NI on BIK not in company cost |
| Associated companies | Not implemented | Would divide CT thresholds |
| Short accounting periods | Not implemented | Would pro-rate CT thresholds |

**Director NIC:** Calculated on annual earnings basis (standard for directors).

**Tax Year:** 2025-26 only. Rates change from 6 April 2026.

## What's NOT Included

- VAT return calculation
- Multi-employee payroll
- R&D tax credits
- Capital Gains
- IR35 comparison

---

## Future Features

### Phase 3: Spouse Modelling
- Spouse shareholder toggle (Solo / With Spouse)
- Spouse other income input
- Spouse student loan selection
- Shareholding split (50/50, 70/30, 80/20, Custom)
- Household total comparison
- Settlements legislation warning (unmarried partners)
- Arctic Systems case note for salary payments

### Phase 4: Polish
- Tax year selector (2024/25 vs 2025/26 vs 2026/27)
- Visual charts (pie, bar, waterfall)
- PDF export
- 2026/27 rates: Plan 5 student loan, dividend tax increase (10.75%/35.75%)
- HICBC warning (£60k-£80k)
- £5,000 salary breakpoint on slider
- Blind Person's Allowance input (adds £3,130)
- Associated Companies input (divides CT thresholds)
- £2k unearned income rule for student loans

---

## Test Checklist

### Tax Calculations
- [ ] Income tax correct for rUK bands
- [ ] Income tax correct for Scottish 6 bands
- [ ] PA taper kicks in at exactly £100,000
- [ ] PA = £0 at exactly £125,140
- [ ] Employee NI 8%/2% split at £50,270
- [ ] Employer NI 15% from £5,000
- [ ] Employment Allowance £10,500 offset
- [ ] CT 19% under £50k
- [ ] CT marginal relief at exactly £50,000
- [ ] CT marginal relief at exactly £250,000
- [ ] CT 25% over £250k
- [ ] Dividend allowance £500
- [ ] Dividend tax rates 8.75/33.75/39.35%

### Student Loans
- [ ] Plan 1 threshold £26,065
- [ ] Plan 2 threshold £28,470
- [ ] Plan 4 threshold £32,745
- [ ] Postgrad threshold £21,000 @ 6%
- [ ] Multiple plans stack correctly (Plan + Postgrad)
- [ ] Applied to TOTAL income (salary + dividends + BIK + other)

### Strategy Comparison
- [ ] All Salary calculates correctly
- [ ] Recommended picks higher take-home (LEL vs PA)
- [ ] All Dividends calculates correctly
- [ ] £12,570 salary usually wins over £6,500

### Edge Cases
- [ ] Zero profit shows appropriate message
- [ ] Negative profit (loss) handled gracefully
- [ ] Profit < salary warns appropriately
- [ ] Dividends > retained profit warning

### UI/UX
- [ ] Slider updates all figures live
- [ ] Email sends with correct data
- [ ] .ics downloads work
- [ ] Two Pots shows correct monthly amounts
- [ ] Warnings appear at correct thresholds
