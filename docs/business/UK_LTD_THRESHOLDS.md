# UK Limited Company Thresholds (2025-26)

> Key thresholds for salary/dividend optimisation and tax planning for UK Ltd company directors.
> Used to build threshold proximity indicators in the calculator.
> 
> **Scope:** Core thresholds used in calculator + common alerts. Not exhaustive - pension details, BIK, and edge cases may require accountant advice.

---

## 1. National Insurance Thresholds (Employee - Director)

| Threshold | Amount | What Happens |
|-----------|--------|--------------|
| **Lower Earnings Limit (LEL)** | £6,500/year (£125/week) | Salary ≥ LEL qualifies for State Pension credits WITHOUT paying NI |
| **Primary Threshold (PT)** | £12,570/year | Employee NI starts at 8% on earnings above this |
| **Upper Earnings Limit (UEL)** | £50,270/year | Employee NI drops to 2% on earnings above this |

### Key Insight: The "Sweet Spot"
- **£6,500 - £12,570**: Earn State Pension credits, pay £0 **employee** NI
- At £12,570: Zero employee NI, but **employer NI still applies** (£1,135 without EA)
- This is why £12,570 salary is popular - pension credits + CT deduction outweigh employer NI cost

---

## 2. National Insurance Thresholds (Employer)

| Threshold | Amount | What Happens |
|-----------|--------|--------------|
| **Secondary Threshold (ST)** | £5,000/year | Employer NI (15%) starts on salary above this |
| **Employment Allowance (EA)** | £10,500 offset | Reduces employer NI bill - but NOT for sole directors |

### Employer NI Impact by Salary Level
| Salary | Employer NI (no EA) | Employer NI (with EA) |
|--------|---------------------|----------------------|
| £5,000 | £0 | £0 |
| £6,500 | £225 | £0 |
| £12,570 | £1,135.50 | £0 |
| £50,270 | £6,790.50 | £0 |
| £75,000 | £10,500 | £0 |
| £80,500+ | £11,325+ | Starts paying (EA exhausted) |

### EA Eligibility Rules
- ❌ Not available if ONLY employee is a director with no other employees above ST
- ✅ Available if: 2+ directors both paid >£5k, OR director + other employee(s) paid >£5k

---

## 3. Income Tax Thresholds (England, Wales, NI)

| Threshold | Amount | Rate Below | Rate Above |
|-----------|--------|------------|------------|
| **Personal Allowance (PA)** | £12,570 | 0% | 20% basic |
| **Basic Rate Band End** | £50,270 total | 20% | 40% higher |
| **Additional Rate Start** | £125,140 total | 40% | 45% additional |

### PA Taper (The £100k Trap)
| Total Income | PA Remaining | Effective Marginal Rate |
|--------------|--------------|------------------------|
| ≤£100,000 | £12,570 | 40% |
| £100,001 | £12,569.50 | **60%** (taper begins) |
| £112,570 | £6,285 | 60% |
| £125,140+ | £0 | 45% (taper ends) |

**Why 60%?** For every £2 over £100k, you lose £1 of PA. So you pay 40% tax PLUS lose 20% of tax-free allowance = 60% effective rate.

---

## 4. Income Tax Thresholds (Scotland)

| Band | Threshold | Rate |
|------|-----------|------|
| Starter | £12,571 - £15,397 | 19% |
| Basic | £15,398 - £27,491 | 20% |
| Intermediate | £27,492 - £43,662 | 21% |
| Higher | £43,663 - £75,000 | 42% |
| Advanced | £75,001 - £125,140 | 45% |
| Top | £125,140+ | 48% |

**Note:** Scottish rates apply to salary/employment income only. Dividends taxed at UK rates.

---

## 5. Dividend Tax Thresholds

| Threshold | Amount | What Happens |
|-----------|--------|--------------|
| **Dividend Allowance** | £500/year | First £500 dividends tax-free |
| **Basic Rate Band** | Up to £50,270 total income | 8.75% on dividends |
| **Higher Rate Band** | £50,271 - £125,140 | 33.75% on dividends |
| **Additional Rate Band** | £125,140+ | 39.35% on dividends |

### Band Stacking Example
Director with £12,570 salary + £40,000 dividends:
- Salary uses PA (£12,570) → £0 income tax
- Taxable dividends: £40,000 - £500 allowance = £39,500
- Basic rate capacity: £50,270 - £12,570 = £37,700
- Basic rate dividends: £37,700 × 8.75% = £3,298.75
- Higher rate dividends: £1,800 × 33.75% = £607.50
- **Total dividend tax: £3,906.25**

---

## 6. Corporation Tax Thresholds

| Threshold | Amount | Rate |
|-----------|--------|------|
| **Small Profits Rate** | £0 - £50,000 | 19% |
| **Marginal Relief Zone** | £50,001 - £249,999 | 19-25% (tapered) |
| **Main Rate** | £250,000+ | 25% |

### Marginal Relief Formula
```
Tax = Profit × 25% - MarginalRelief
MarginalRelief = (£250,000 - Profit) × 3/200
```

### Effective CT Rates in Marginal Zone
| Profit | Effective Rate |
|--------|----------------|
| £50,000 | 19.00% |
| £75,000 | 20.50% |
| £100,000 | 22.00% |
| £150,000 | 23.50% |
| £200,000 | 24.25% |
| £250,000 | 25.00% |

### Associated Companies Warning
If you have associated companies (e.g., spouse's company), thresholds are DIVIDED:
- 2 associated companies: £25k / £125k thresholds
- 3 associated companies: £16.7k / £83.3k thresholds

---

## 7. VAT Thresholds

| Threshold | Amount | What Happens |
|-----------|--------|--------------|
| **Registration Threshold** | £90,000 | MUST register if taxable turnover exceeds in rolling 12-month period |
| **Deregistration Threshold** | £88,000 | Can apply to deregister if turnover falls below |

### VAT Registration Rules
- **Historic test:** If rolling 12-month turnover exceeds £90k, register by end of the month following
- **Future test:** If you expect to exceed £90k in next 30 days alone, register immediately
- Can register voluntarily at any time (reclaim input VAT)

---

## 8. State Pension Thresholds

| Threshold | Amount | Impact |
|-----------|--------|--------|
| **Lower Earnings Limit** | £6,500/year | Minimum to earn qualifying year |
| **Qualifying Years Needed** | 35 years | For full State Pension |
| **Minimum Years** | 10 years | For any State Pension |

### State Pension Amount (2025-26)
- Full new State Pension: £230.25/week (£11,973/year)
- Each missing year costs: ~£342/year in retirement

### Director Strategy
Pay yourself ≥£6,500 salary to earn NI credits even if taking mainly dividends.

---

## 9. High Income Child Benefit Charge (HICBC)

| Threshold | Amount | What Happens |
|-----------|--------|--------------|
| **Charge Starts** | £60,000 | 1% of Child Benefit per £200 over threshold |
| **Full Clawback** | £80,000 | 100% of Child Benefit clawed back |

### HICBC Calculation (2025-26 rates)
- Child Benefit (2 children): £26.05 + £17.25 = £43.30/week = **£2,252/year**
- At £70,000 income: Charge = 50% × £2,252 = £1,126
- At £80,000+ income: Charge = 100% = £2,252 (no benefit)

**Tip:** Income for HICBC = salary + dividends + other income. Pension contributions reduce this.

---

## 10. Student Loan Thresholds (2025-26)

| Plan | Threshold | Rate |
|------|-----------|------|
| **Plan 1** (pre-2012) | £26,065 | 9% |
| **Plan 2** (post-2012 England/Wales) | £28,470 | 9% |
| **Plan 4** (Scotland) | £32,745 | 9% |
| **Plan 5** (post-2023) | £25,000 | 9% |
| **Postgraduate** | £21,000 | 6% |

### How Student Loans Work for Directors

**PAYE (Salary only):** Deducted automatically from salary above threshold.

**Self Assessment (Total Income):** Calculated on salary + dividends + other income via SA return.

### Example: Director with Student Loan Plan 2
- Salary: £12,570
- Dividends: £38,000
- **Total Income: £50,570**
- Plan 2 Threshold: £28,470
- Excess: £22,100
- **SL Repayment: 9% × £22,100 = £1,989**

⚠️ **Dividends DO count** toward student loan repayments via Self Assessment. The "dividends avoid student loans" myth is false - it only delays repayment to the SA deadline.

---

## 11. Self Assessment / Payments on Account

| Threshold | Amount | What Happens |
|-----------|--------|--------------|
| **POA Trigger** | £1,000 SA liability | Payments on Account required |
| **80% PAYE Exemption** | 80% at source | No POA if ≥80% collected via PAYE |

### POA Calculation
- Year 1: Pay 100% of bill + 50% advance for Year 2
- Year 2+: Pay balancing payment + 50% advance
- First SA bill can be **150% of normal**

---

## 12. Pension Annual Allowance

| Threshold | Amount | What Happens |
|-----------|--------|--------------|
| **Annual Allowance (AA)** | £60,000 | Max tax-relieved pension contribution per year |
| **Threshold Income** | £200,000 | If exceeded, check Adjusted Income for taper |
| **Adjusted Income** | £260,000 | AA tapers by £1 for every £2 above this |
| **Minimum Tapered AA** | £10,000 | Floor at £360,000+ adjusted income |
| **Money Purchase AA (MPAA)** | £10,000 | Triggered if flexibly accessed DC pension |
| **Carry Forward** | 3 years | Can use unused AA from previous 3 years |

### Why Pensions Matter for Directors

Pension contributions reduce "adjusted net income" for:
- **PA taper** (£100k+) - restore lost Personal Allowance
- **HICBC** (£60k+) - reduce or eliminate charge
- **Student loan threshold** (for salary portion via PAYE)

### Example: Avoiding the £100k Trap
- Director earning £110,000 (salary + dividends)
- Lost PA: (£110k - £100k) × 50% = £5,000
- Extra tax: £5,000 × 40% = £2,000
- **Solution:** Contribute £10,000 to pension
  - Income drops to £100,000 → full PA restored
  - Tax relief on contribution: £4,000 (at 40%)
  - **Net benefit: £6,000** for £6,000 net cost

---

## 13. Personal Savings Allowance (PSA)

| Tax Band | PSA Amount |
|----------|------------|
| **Basic Rate** (up to £50,270) | £1,000 tax-free interest |
| **Higher Rate** (£50,271 - £125,140) | £500 tax-free interest |
| **Additional Rate** (£125,140+) | £0 (no allowance) |

**Note:** PSA is separate from the £5,000 Starting Rate for Savings (0% on first £5,000 of savings income if total non-savings income ≤£17,570).

---

## 14. Capital Gains Tax (CGT)

| Threshold | Amount/Rate |
|-----------|-------------|
| **Annual Exempt Amount** | £3,000 (individuals) |
| **Annual Exempt Amount (Trusts)** | £1,500 |
| **Basic Rate** | 18% |
| **Higher Rate** | 24% |
| **Business Asset Disposal Relief (BADR)** | 14% (up to £1m lifetime gains) |
| **BADR Rate from April 2026** | 18% |

### CGT Band Determination
CGT rate depends on your total taxable income + gains:
- If income + gains ≤ £50,270 → 18% on gains
- If income + gains > £50,270 → 24% on portion in higher band

### Director Relevance
- Selling company shares
- Selling business assets
- BADR available if 5%+ shareholding for 2+ years

---

## 15. Other Tax-Free Allowances

| Allowance | Amount | Notes |
|-----------|--------|-------|
| **ISA Allowance** | £20,000/year | Tax-free savings/investments |
| **Trivial Benefits (Directors)** | £50 per benefit, £300/year cap | Small gifts, not cash |
| **Beneficial Loan Threshold** | £10,000 | No BIK if director's loan below this |
| **Mileage Allowance** | 45p/mile (first 10k), 25p/mile after | Tax-free business travel reimbursement |
| **Marriage Allowance** | £1,260 transfer | Non-taxpayer can transfer to basic-rate spouse |

---

## 16. Other Regulatory Thresholds

| Threshold | Amount | What Happens |
|-----------|--------|--------------|
| **Annual Investment Allowance** | £1,000,000 | 100% first-year allowance on qualifying assets |
| **R&D Tax Credit (SME)** | <500 employees, <€100m turnover | Enhanced deduction (rates vary) |

### Company Size Thresholds (for accounts/audit)
These were increased from April 2025. Check Companies House guidance for current limits:
- **Micro-entity, Small company, Medium company** - determines filing requirements
- **Audit exemption** - most small companies exempt
- Not directly relevant to salary/dividend optimisation

---

## 17. Key Salary Decision Points

| Salary Level | Pros | Cons |
|--------------|------|------|
| **£0** | No payroll hassle | No State Pension credits |
| **£5,000** | No Employer NI | Just below pension credit |
| **£6,500** | State Pension credits, minimal Employer NI (£225) | Still some Employer NI |
| **£12,570** | Full PA used, pension credits, max CT deduction | Employer NI £1,135 |
| **£50,270** | All basic rate band used | Employee NI £3,016, Employer NI £6,790 |

---

## 18. Threshold Interactions (Complex Scenarios)

### Scenario: £100k+ Total Income
1. PA taper kicks in (60% effective rate)
2. Consider pension contribution to stay under £100k
3. Marriage allowance lost (neither spouse qualifies)

### Scenario: Director with PAYE Job
1. Other income consumes PA and basic band first
2. Dividends start in higher band
3. May push total over £100k → PA taper

### Scenario: Two Director-Shareholders
1. Can split dividends (each uses own PA + basic band)
2. Both can qualify for State Pension credits
3. May qualify for Employment Allowance

### Scenario: Side Hustle Director (Has PAYE Job)
1. Full-time job (e.g., £60k) uses ALL PA and basic rate band
2. ALL dividends from Ltd Co taxed at 33.75% immediately (after £500 allowance)
3. HICBC triggered instantly
4. Calculator should default Ltd salary to £0 in this case
5. Total income may push over £100k → PA taper

---

## Sources

- [Income Tax rates](https://www.gov.uk/income-tax-rates)
- [National Insurance rates](https://www.gov.uk/national-insurance-rates-letters)
- [Corporation Tax rates](https://www.gov.uk/corporation-tax-rates)
- [Dividend Tax](https://www.gov.uk/tax-on-dividends)
- [VAT thresholds](https://www.gov.uk/vat-registration/when-to-register)
- [Scottish Income Tax](https://www.gov.scot/policies/taxes/income-tax/)
- [Employment Allowance](https://www.gov.uk/claim-employment-allowance)
- [State Pension](https://www.gov.uk/new-state-pension)
- [HICBC](https://www.gov.uk/child-benefit-tax-charge)
- [Student Loan repayments](https://www.gov.uk/repaying-your-student-loan)
- [Pension Annual Allowance](https://www.gov.uk/tax-on-your-private-pension/annual-allowance)
- [Personal Savings Allowance](https://www.gov.uk/apply-tax-free-interest-on-savings)
- [Capital Gains Tax](https://www.gov.uk/capital-gains-tax)
- [ISA allowances](https://www.gov.uk/individual-savings-accounts)
- [Trivial benefits](https://www.gov.uk/expenses-and-benefits-trivial-benefits)
- [Mileage allowance](https://www.gov.uk/expenses-and-benefits-business-travel-mileage)
- [Marriage Allowance](https://www.gov.uk/marriage-allowance)

---

*Document version: January 2026 (2025-26 tax year)*
