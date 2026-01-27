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

**Employer NI by Salary Level:**

| Salary | Employer NI (no EA) | With EA |
|--------|---------------------|---------|
| £5,000 | £0 | £0 |
| £6,500 | £225 | £0 |
| £12,570 | £1,135 | £0 |
| £50,270 | £6,790 | £0 |

**EA Eligibility:** Not available if ONLY employee is a director. Need 2+ directors both paid >£5k, OR director + other employee(s) paid >£5k.

### Corporation Tax

| Profit | Rate |
|--------|------|
| £0-50,000 | 19% |
| £50,001-250,000 | 25% minus marginal relief |
| £250,001+ | 25% |

**Marginal Relief:** `(250000 - profit) × 3/200`

**Effective Rates in Marginal Zone:**

| Profit | Effective Rate |
|--------|----------------|
| £50,000 | 19.00% |
| £100,000 | 22.00% |
| £150,000 | 23.50% |
| £250,000 | 25.00% |

**Associated Companies:** If you have associated companies, thresholds are divided:
- 2 companies: £25k / £125k thresholds
- 3 companies: £16.7k / £83.3k thresholds

### Dividend Tax

- Allowance: £500
- Basic rate: 8.75%
- Higher rate: 33.75%
- Additional rate: 39.35%

**Note:** Dividends use UK rates for ALL UK residents (including Scottish)

### VAT

| Threshold | Amount |
|-----------|--------|
| Registration | £90,000 (rolling 12 months) |
| Deregistration | £88,000 |

### State Pension

| Threshold | Amount |
|-----------|--------|
| Qualifying salary (LEL) | £6,500/year |
| Full pension (35 years) | £230.25/week (£11,973/year) |
| Minimum years | 10 years for any pension |

### High Income Child Benefit Charge (HICBC)

| Threshold | Effect |
|-----------|--------|
| £60,000 | Charge starts (1% per £200 over) |
| £80,000 | Full clawback (100%) |

**Note:** Income = salary + dividends + other. Pension contributions reduce this.

### Pension Annual Allowance

| Threshold | Amount |
|-----------|--------|
| Standard AA | £60,000 |
| Threshold income | £200,000 (check adjusted income if exceeded) |
| Adjusted income | £260,000 (taper starts) |
| Minimum AA | £10,000 (at £360,000+) |
| Money Purchase AA | £10,000 (if flexibly accessed pension) |
| Carry forward | 3 years unused AA |

### Personal Savings Allowance

| Tax Band | PSA |
|----------|-----|
| Basic rate | £1,000 |
| Higher rate | £500 |
| Additional rate | £0 |

### Capital Gains Tax

| Item | Rate/Amount |
|------|-------------|
| Annual Exempt Amount | £3,000 |
| Basic rate | 18% |
| Higher rate | 24% |
| BADR (Business Asset Disposal Relief) | 14% (up to £1m lifetime) |
| BADR from April 2026 | 18% |

### Other Allowances

| Allowance | Amount |
|-----------|--------|
| ISA | £20,000/year |
| Trivial benefits (directors) | £50 per benefit, £300/year cap |
| Beneficial loan threshold | £10,000 (no BIK below) |
| Mileage allowance | 45p/mile (first 10k), 25p after |
| Marriage allowance | £1,260 transfer |
| Blind Person's Allowance | £3,130 |
| Annual Investment Allowance | £1,000,000 |

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

### Payments on Account (POA)

| Threshold | Effect |
|-----------|--------|
| SA liability > £1,000 | POA required |
| ≥80% collected via PAYE | POA exemption |

**Warning:** First SA bill can be 150% of normal (100% current year + 50% advance).

### Key Salary Decision Points

| Salary | Pros | Cons |
|--------|------|------|
| £0 | No payroll hassle | No State Pension credits |
| £5,000 | Zero Employer NI | Just below pension credit |
| £6,500 | State Pension credits, £225 ErNI | Still some Employer NI |
| £12,570 | Full PA used, max CT deduction | £1,135 Employer NI |
| £50,270 | All basic rate band used | £3,016 EeNI, £6,790 ErNI |

---

## Warnings & Edge Cases

| Condition | Warning | Status |
|-----------|---------|--------|
| Revenue £85k-90k | VAT threshold approaching (£90k) | ✅ Implemented |
| Revenue ≥£90k | VAT registration likely required | ✅ Implemented |
| Total income >£100k | PA taper zone (60% effective rate) | ✅ Implemented |
| Total income >£125,140 | PA fully lost | ✅ Implemented |
| Profit ≤£12,570 | "Survival mode" — limited strategy options | ✅ Implemented |
| Taken > take-home | Overdrawn warning | ✅ Implemented |
| Sole director + EA claimed | Employment Allowance not available | ✅ Implemented (tooltip) |
| Total income £60k-£80k | HICBC clawback zone | ❌ Phase 4 |
| Pension contribution >£60k | Annual Allowance exceeded | ❌ Phase 4 |
| Dividends > retained profit | Illegal dividend | ❌ Phase 4 |
| Associated companies exist | CT thresholds divided | ❌ Phase 4 |

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

### Income Tax
- [ ] rUK: £12,570 PA, 20% to £50,270, 40% to £125,140, 45% above
- [ ] Scotland: All 6 bands (19/20/21/42/45/48%)
- [ ] PA taper: Starts exactly at £100,000
- [ ] PA taper: £0 PA at exactly £125,140
- [ ] PA taper: 60% effective rate in £100k-£125,140 zone

### National Insurance
- [ ] Employee NI: 8% from £12,570 to £50,270
- [ ] Employee NI: 2% above £50,270
- [ ] Employer NI: 15% from £5,000
- [ ] Employer NI: £0 at exactly £5,000
- [ ] Employer NI: £225 at £6,500 (LEL)
- [ ] Employer NI: £1,135 at £12,570 (PA)
- [ ] Employment Allowance: £10,500 offset
- [ ] LEL: £6,500 qualifies for State Pension credits

### Corporation Tax
- [ ] 19% at exactly £50,000
- [ ] Marginal relief kicks in at £50,001
- [ ] 25% at exactly £250,000
- [ ] Marginal relief formula: (250000 - profit) × 3/200

### Dividend Tax
- [ ] Allowance: £500
- [ ] Basic rate: 8.75%
- [ ] Higher rate: 33.75%
- [ ] Additional rate: 39.35%
- [ ] UK rates used for Scottish taxpayers

### Student Loans
- [ ] Plan 1: £26,065 @ 9%
- [ ] Plan 2: £28,470 @ 9%
- [ ] Plan 4: £32,745 @ 9%
- [ ] Postgrad: £21,000 @ 6%
- [ ] Multiple plans stack (Plan + Postgrad = 15%)
- [ ] Applied to TOTAL income (salary + dividends + BIK + other)

### VAT
- [ ] Warning at £85k-£90k
- [ ] Required warning at ≥£90k

### Strategy Comparison
- [ ] All Salary calculates correctly
- [ ] Recommended picks higher take-home (LEL vs PA)
- [ ] All Dividends calculates correctly
- [ ] £12,570 salary usually wins over £6,500

### Edge Cases
- [ ] Zero profit: Appropriate message
- [ ] Negative profit: Loss handled gracefully
- [ ] Profit < salary: Warning shown
- [ ] £100k income: PA taper warning shown
- [ ] Sole director + EA: Tooltip warning shown

### UI/UX
- [ ] Slider: Updates all figures live
- [ ] Slider: Breakpoints at £0, £6,500, £12,570, £50,270
- [ ] Email: Sends with correct data
- [ ] Key dates: .ics downloads work
- [ ] Two Pots: Correct monthly amounts
- [ ] Warnings: Appear at correct thresholds
