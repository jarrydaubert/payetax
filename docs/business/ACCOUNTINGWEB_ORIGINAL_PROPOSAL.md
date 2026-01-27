# SME Finance Director Tools - Original Proposal

> **For Review:** AccountingWeb Partnership Team
> **Prepared By:** PayeTax Development Team
> **Date:** October 2025
> **Status:** Submitted, no response received
>
> **Context:** This proposal came out of an initial meeting with AccountingWeb. They were positive about the director tools concept and thought it would be valuable for their audience. This document captures the original pitch before we pivoted to the simpler "First-Time Director's Guide" approach (see `DIRECTOR_TOOLS.md` for current direction).

---

## Executive Summary

**What We Proposed:** 6 interconnected tools for director remuneration optimization:

1. **Director Salary vs Dividend Optimizer** (Priority 1) - Compare strategies, show £8k+ annual savings
2. **Dividend Tax Calculator** - Instant dividend tax breakdown with stacking logic
3. **Director's Loan Account Checker** - S455 tax warnings and repayment scenarios
4. **Corporation Tax Extraction Analyzer** - Optimal profit extraction strategies
5. **Employer NI Calculator** - Multi-employee NI budgeting
6. **VAT Scheme Comparator** - Flat rate vs standard scheme ROI

**What We Asked For:**
- Feedback: Feature prioritization, edge cases, partnership fit
- Partnership: Co-marketing at launch, AccountingWeb newsletter feature, beta access for AW members

---

## Target Users (Original)

- Finance Directors (SMEs with 10-250 employees)
- CFOs of growing companies
- Accountants managing multiple SME clients
- Directors of limited companies
- Business owners doing their own bookkeeping

**Key Value Proposition:**
> "Instant, accurate director remuneration optimization and tax planning—built by tax nerds, designed for busy FDs."

---

## Tool #1: Director Salary vs Dividend Optimizer

### The Problem
Directors often struggle to determine the optimal mix of salary and dividends to minimize both personal and company tax liabilities. Most rely on accountants for annual planning, lacking tools for real-time "what if" scenarios.

### The Solution
Interactive calculator comparing:
- All salary strategy
- All dividend strategy (after corporation tax)
- Optimal mix strategy (recommended)
- Custom mix scenarios

### Key Features

**Inputs:**
- Total compensation required (gross)
- Current tax year (2025-26)
- Region (England/Wales/NI vs Scotland)
- Existing salary (if any)
- Company profit available

**Outputs:**
- Side-by-side comparison showing:
  - Gross amounts (salary + dividends)
  - Income tax breakdown
  - Employee NI
  - Employer NI (15%)
  - Corporation tax impact (19% or 25%)
  - Dividend tax (8.75%, 33.75%, 39.35%)
  - Total company cost
  - Net take-home to director
  - Savings vs alternative strategies

**Insights:**
- "Save £X by switching to optimal mix"
- "Company cost reduced by £Y"
- NI credits impact on state pension
- Marginal rate on next £1,000

### Example Output

| Strategy | Salary | Dividends | Personal Tax | Take-Home | Company Cost | Take-Home Gain |
|----------|--------|-----------|--------------|-----------|--------------|----------------|
| All Salary | £60,000 | £0 | £14,643 | £45,357 | £67,635 | - |
| Optimal Mix | £12,570 | £47,430 | £6,414 | £53,586 | £76,331 | +£8,229 ✅ |
| All Dividend | £0 | £60,000 | £13,929 | £46,071 | £80,000 | +£714 |

*Note: Uses 2025-26 rates*

### User Journey
1. Land on /tools/director-optimizer
2. Enter total compensation needed
3. See instant comparison table
4. Adjust inputs (toggle pension, add bonuses)
5. Export PDF report or save scenario
6. Compare multiple scenarios side-by-side

---

## Tool #2: Dividend Tax Calculator

### The Problem
Dividend tax is confusing—it stacks on top of other income, has its own allowance (£500 for 2025-26), and different rates per tax band. Directors often miscalculate and get surprised by tax bills.

### The Solution
Standalone dividend tax calculator with clear breakdown.

**Inputs:**
- Non-dividend income (salary, rental, etc.)
- Dividend income (from UK companies)
- Region (for Scottish rates)

**Outputs:**
- Dividend allowance utilized (£500)
- Basic rate dividends (8.75%)
- Higher rate dividends (33.75%)
- Additional rate dividends (39.35%)
- Total dividend tax due
- Effective rate on dividends
- Net dividend income
- Payment dates (SA deadlines)

---

## Tool #3: Director's Loan Account Checker

### The Problem
Directors taking loans from their company face complex tax rules:
- Loans over £10k for 9+ months trigger S455 tax (33.75%)
- Loans written off = taxed as dividend or salary
- Poor tracking leads to surprise tax bills

### The Solution
Loan tracking tool with tax consequence warnings.

**Inputs:**
- Current loan balance (owed to/from company)
- Date loan started
- Company year-end date
- Repayment schedule (if any)

**Outputs:**
- S455 tax liability (if applicable)
- Due date for S455 payment
- Benefit-in-kind charge (if interest-free)
- Repayment options comparison
- Timeline to next S455 trigger

**Warnings:**
- "Loan exceeds £10k - S455 tax triggered"
- "£X due 9 months after year-end"
- "Interest-free loan: BIK charge of £Y"

---

## Tool #4: Corporation Tax Extraction Analyzer

### The Problem
Directors struggle with "leave profit in company vs extract now" decisions. Each has tax implications.

### The Solution
Compare taxation on profit extraction strategies:

1. **Leave in Company** - Corp Tax, retained profit, future flexibility
2. **Extract as Dividend** - Corp Tax + Dividend Tax
3. **Extract as Salary** - No Corp Tax (deductible), Income Tax + NI
4. **Optimal Mix** - Combined strategy

---

## Tool #5: Employer NI Calculator

### The Problem
Calculating employer NI (15% above £9,100 as of 2025-26) for multiple employees is tedious.

### The Solution
**Inputs:**
- Employee count
- Individual salaries or total payroll
- NI category (standard, apprentice, veteran)

**Outputs:**
- Per-employee NI breakdown
- Total annual NI liability
- Monthly NI cost
- Employment Allowance offset (if eligible: £5,000)
- Cost comparison: employee vs contractor

---

## Tool #6: VAT Return Estimator

### The Problem
SMEs often miscalculate VAT liability between quarters, leading to cashflow shocks.

### The Solution
**Inputs:**
- Sales (excl. VAT)
- Purchases (excl. VAT)
- VAT scheme (standard, flat rate, cash accounting)

**Outputs:**
- VAT on sales (output tax)
- VAT on purchases (input tax)
- Net VAT due to HMRC
- Quarterly estimate
- Flat rate comparison

---

## UX/UI Design Principles

1. **Progressive Disclosure** - Start simple, expand for advanced
2. **Comparison Tables** - Side-by-side, max 4 columns, color-coded
3. **Actionable Insights** - "Save £X by switching to Y" callouts
4. **Mobile-First** - Responsive, touch-friendly
5. **Brand Consistency** - Same PayeTax design system

---

## Questions We Asked AccountingWeb

1. **Feature Prioritization** - Which tool most valuable? Missing calculations?
2. **UX/Content** - Step-by-step wizards or single-page calculators?
3. **Compliance** - HMRC nuances to highlight? Audit trails needed?
4. **Partnership** - Newsletter feature? Beta access for members?

---

## Sample Calculation (Appendix)

**Scenario:** FD earning £60,000 total compensation

### Strategy 1: All Salary
- Gross Salary: £60,000
- Income Tax: £11,432
- Employee NI: £3,211
- Employer NI: £7,635
- Company Cost: £67,635
- Director Take-Home: £45,357
- Effective Rate: 24.4%

### Strategy 2: Optimal Mix (£12,570 salary + £47,430 dividend)
- Salary: £12,570 (tax-free)
- Employee NI: £0
- Employer NI: £521
- Dividend Tax: £6,414
- Company Cost: £76,331
- Director Take-Home: £53,586
- Effective Rate: 10.7%

**Key Insight:** Optimal mix delivers 18% more take-home (£53,586 vs £45,357) for the director.

---

## Technical Architecture (Appendix)

**Stack:**
- Frontend: Next.js 15
- State: Zustand
- Styling: Tailwind
- Charts: Recharts
- PDF: jsPDF or Puppeteer
- Auth: NextAuth.js or Clerk
- Payments: Stripe
- DB: Supabase or Vercel Postgres

**New Routes:**
- `/tools` (landing page)
- `/tools/director-optimizer`
- `/tools/dividend-calculator`
- `/tools/loan-checker`
- `/tools/extraction-analyzer`
- `/tools/pricing` (Pro tier upsell)

---

## What Happened

**Submitted:** October 2025
**Response:** None received

**Lessons Learned:**
- Cold outreach to partnerships rarely works
- Need to build audience first, then partnerships follow
- The "pro tool for FDs" positioning may have been wrong audience

**Pivot (January 2026):**
See `DIRECTOR_TOOLS.md` for the new direction: Education-first guide for confused first-time directors, not optimization tool for experts.

---

*This document preserved for reference. The strategy has evolved.*
