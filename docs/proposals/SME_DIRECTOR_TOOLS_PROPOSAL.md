SME Finance Director Tools - Product Proposal
For Review: AccountingWeb Partnership Team
Prepared By: PayeTax Development Team
Date: October 2025
Status: Pre-Development Feedback Request


🎯 Executive Summary (1-Page Overview)
What We're Building

6 interconnected tools for director remuneration optimization:

Director Salary vs Dividend Optimizer (Priority 1) - Compare strategies, show £8k+ annual savings
Dividend Tax Calculator - Instant dividend tax breakdown with stacking logic
Director's Loan Account Checker - S455 tax warnings and repayment scenarios
Corporation Tax Extraction Analyzer - Optimal profit extraction strategies
Employer NI Calculator - Multi-employee NI budgeting
VAT Scheme Comparator - Flat rate vs standard scheme ROI
What We Need
✅ Feedback: Feature prioritization, edge cases, partnership fit
✅ Partnership: Co-marketing at launch, AccountingWeb newsletter feature, beta access for AW members




📋 Full Proposal
Following our demo and discussion, we're proposing a suite of SME-focused financial tools targeting Finance Directors, CFOs, accountants, and small business owners. This expansion leverages our existing HMRC-compliant calculation engine while addressing a gap in the market for accessible, accurate business tax optimization tools.

Target Users:

Finance Directors (SMEs with 10-250 employees)
CFOs of growing companies
Accountants managing multiple SME clients
Directors of limited companies
Business owners doing their own bookkeeping


Key Value Proposition:
"Instant, accurate director remuneration optimization and tax planning—built by tax nerds, designed for busy FDs."



🎯 Proposed Tools Suite
1. Director Salary vs Dividend Optimizer
The Problem:
Directors often struggle to determine the optimal mix of salary and dividends to minimize both personal and company tax liabilities. Most rely on accountants for annual planning, lacking tools for real-time "what if" scenarios.

The Solution:
Interactive calculator comparing:

All salary strategy
All dividend strategy (after corporation tax)
Optimal mix strategy (recommended)
Custom mix scenarios

Key Features:

INPUT:

- Total compensation required (gross)

- Current tax year (2025-26)

- Region (England/Wales/NI vs Scotland)

- Existing salary (if any)

- Company profit available

OUTPUT:

Side-by-side comparison showing:

├─ Gross amounts (salary + dividends)

├─ Income tax breakdown

├─ Employee NI

├─ Employer NI (15%)

├─ Corporation tax impact (19% or 25%)

├─ Dividend tax (8.75%, 33.75%, 39.35%)

├─ Total company cost

├─ Net take-home to director

└─ Savings vs alternative strategies

INSIGHTS:

• "Save £X by switching to optimal mix"

• "Company cost reduced by £Y"

• NI credits impact on state pension

• Marginal rate on next £1,000

Example Output:

Strategy
Salary
Dividends
Personal Tax
Take-Home
Company Cost
Take-Home Gain
All Salary
£60,000
£0
£14,643
£45,357
£67,635
-
Optimal Mix
£12,570
£47,430
£6,414
£53,586
£76,331
+£8,229 ✅
All Dividend
£0
£60,000
£13,929
£46,071
£80,000
+£714


Note: Uses 2025-26 rates (Employee NI 8%, Employer NI 15%, Corp Tax 25%)

Technical Implementation:

Extend existing tax calculator with dividend tax logic
Corporation tax calculation (marginal relief for £50k-£250k)
Employer NI calculation
State pension NI credit warnings

User Journey:

Land on /tools/director-optimizer
Enter total compensation needed
See instant comparison table
Adjust inputs (toggle pension, add bonuses)
Export PDF report or save scenario
Compare multiple scenarios side-by-side


2. Dividend Tax Calculator 
The Problem:
Dividend tax is confusing—it stacks on top of other income, has its own allowance (£500 for 2025-26), and different rates per tax band. Directors often miscalculate and get surprised by tax bills.

The Solution:
Standalone dividend tax calculator with clear breakdown.

Key Features:

INPUT:

- Non-dividend income (salary, rental, etc.)

- Dividend income (from UK companies)

- Region (for Scottish rates)

OUTPUT:

├─ Dividend allowance utilized (£500)

├─ Basic rate dividends (8.75%)

├─ Higher rate dividends (33.75%)

├─ Additional rate dividends (39.35%)

├─ Total dividend tax due

├─ Effective rate on dividends

├─ Net dividend income

└─ Payment dates (SA deadlines)

INSIGHTS:

• "You're in higher rate—consider salary sacrifice"

• "Dividend allowance: £500 used, £0 remaining"

• "Compared to salary, dividends save you £X"

Example:

Total Income: £12,570 (salary) + £40,000 (dividends)

Tax Band: Basic rate taxpayer

Dividend Tax:

• First £500 at 0%: £0

• Next £37,700 at 8.75%: £3,299

• Next £1,800 at 33.75% (higher rate): £608

Total Dividend Tax: £3,907

Net After Tax: £36,093

Effective Rate: 9.8% (vs 32% if taken as salary)

Integration:

Link to Tool #1 for optimization
Export to accounting software (FreeAgent, Xero via CSV)
Historical comparison (prior years)


3. Director's Loan Account Checker 
The Problem:
Directors taking loans from their company face complex tax rules:

Loans over £10k for 9+ months trigger S455 tax (33.75%)
Loans written off = taxed as dividend or salary
Poor tracking leads to surprise tax bills

The Solution:
Loan tracking tool with tax consequence warnings.

Key Features:

INPUT:

- Current loan balance (owed to/from company)

- Date loan started

- Company year-end date

- Repayment schedule (if any)

OUTPUT:

├─ S455 tax liability (if applicable)

├─ Due date for S455 payment

├─ Benefit-in-kind charge (if interest-free)

├─ Repayment options comparison

└─ Timeline to next S455 trigger

WARNINGS:

⚠️ "Loan exceeds £10k - S455 tax triggered"

⚠️ "£X due 9 months after year-end"

⚠️ "Interest-free loan: BIK charge of £Y"

OPTIONS TO RESOLVE:

1. Repay £X to drop below £10k (avoid S455)

2. Declare as dividend (£Y tax vs £Z S455)

3. Add to salary (£A tax+NI vs £Z S455)

4. Repayment schedule over N months

Example:

Loan Balance: £15,000 (to director)

Year-End: 31 March 2025

Loan Age: 11 months

⚠️ S455 TAX DUE: £5,062 (£15,000 × 33.75%)

Due: 1 January 2026 (9 months post year-end)

Options:

1. Repay £5,001 by March 2025

   → Avoids S455 entirely (save £5,062)

   

2. Declare as dividend now

   → Pay £5,062 dividend tax (same as S455)

   → But avoid S455 admin and delays

   

3. Declare as bonus salary

   → Pay £6,751 (tax+NI)

   → More expensive than dividend


4. Corporation Tax Extraction Analyzer 
The Problem:
Directors struggle with "leave profit in company vs extract now" decisions. Each has tax implications (corporation tax, personal tax, future flexibility).

The Solution:
Compare taxation on profit extraction strategies.

Key Features:

INPUT:

- Company profit (before director remuneration)

- Current retained earnings

- Planned extraction amount

- Personal tax band

OUTPUT:

Strategy comparison:

1. LEAVE IN COMPANY

   • Corporation Tax (19% or 25%): £X

   • Retained profit: £Y

   • Future flexibility: High

   • Available for: Reinvestment, future dividends

   

2. EXTRACT AS DIVIDEND

   • Corporation Tax: £A

   • Net available: £B

   • Dividend tax: £C

   • Net to you: £D

   • Combined rate: E%

   

3. EXTRACT AS SALARY

   • Corporation Tax: £0 (deductible)

   • Income tax: £F

   • Employee NI: £G

   • Employer NI: £H

   • Net to you: £I

   • Total cost: £J

   

4. OPTIMAL MIX

   • Strategy: £12,570 salary + dividends

   • Net to you: £K

   • Total tax: £L

   • Saves: £M vs all-dividend

Example:

Company Profit: £100,000

Need to extract: £60,000

Option 1: All Salary

├─ Corp Tax: £0 (deductible)

├─ Personal Tax: £11,432

├─ Employee NI: £4,319

├─ Employer NI: £6,626

├─ Net to you: £44,249

└─ Company cost: £66,626

Option 2: Optimal Mix (£12,570 salary + £47,430 div)

├─ Corp Tax on profit: £9,857

├─ Personal Tax: £3,287

├─ NI: £0

├─ Net to you: £56,713

├─ Company cost: £60,144

└─ ✅ Saves £6,482 vs all salary

Recommendation: Optimal mix strategy


5. Employer NI Calculator 
The Problem:
Calculating employer NI (15% above £9,100 as of 2025-26) for multiple employees is tedious. FDs need quick totals for budgeting.

The Solution:

INPUT:

- Employee count

- Individual salaries or total payroll

- NI category (standard, apprentice, veteran)

OUTPUT:

├─ Per-employee NI breakdown

├─ Total annual NI liability

├─ Monthly NI cost

├─ Employment Allowance offset (if eligible: £5,000)

└─ Cost comparison: employee vs contractor


6. VAT Return Estimator 
The Problem:
SMEs often miscalculate VAT liability between quarters, leading to cashflow shocks.

The Solution:

INPUT:

- Sales (excl. VAT)

- Purchases (excl. VAT)

- VAT scheme (standard, flat rate, cash accounting)

OUTPUT:

├─ VAT on sales (output tax)

├─ VAT on purchases (input tax)

├─ Net VAT due to HMRC

├─ Quarterly estimate

└─ Flat rate comparison


🎨 UX/UI Design Principles
1. Progressive Disclosure
Start simple (core inputs only)
Expand for advanced scenarios (pensions, benefits, loans)
Collapsible sections for detail-seekers
2. Comparison Tables
Side-by-side strategy comparison (max 4 columns)
Color-coded savings (green) vs costs (red)
Clear "Recommended" badges
3. Actionable Insights
"Save £X by switching to Y" callouts
One-click "Apply Suggestion" buttons
Exportable PDF reports
4. Mobile-First
Responsive tables (horizontal scroll on mobile)
Touch-friendly inputs
Collapsible results on small screens
5. Brand Consistency
Same PayeTax design system
Tax rates cards (like homepage)
HMRC compliance badges


❓ Questions for AccountingWeb Team
We'd love your input on the following before we build:
1. Feature Prioritization
Which tool would be most valuable to your audience?
Are we missing any critical calculations/scenarios?
What edge cases do FDs encounter most often?
2. UX/Content
Would your members prefer step-by-step wizards or single-page calculators?
What level of detail in results? (Summary vs deep breakdown)
Should we include explanatory tooltips or link to blog guides?
3. Compliance & Accuracy
Any HMRC calculation nuances we should highlight?
Do FDs need audit trails (calculation step-by-step)?
Should we add disclaimers beyond standard "not financial advice"?
4. Partnership
Would AccountingWeb feature this in newsletter/blog?



Appendix A: Sample Calculations
Note: All calculations use 2025-26 tax rates as of October 2025: Personal Allowance £12,570, Basic Rate 20% on £37,700, Employee NI 8% (above £12,570), Employer NI 15% (above £9,100), Corporation Tax 25%, Dividend Allowance £500, Dividend Tax rates 8.75%/33.75%/39.35%.


Director Optimization Example
Scenario: FD earning £60,000 total compensation

Strategy 1: All Salary

Gross Salary: £60,000

Income Tax: £11,432 (20% on £37,700 + 40% on £9,730)

Employee NI: £3,211 (8% on £37,700 + 2% on £9,730)

Employer NI: £7,635 (15% on £50,900)

Corporation Tax Saved: £16,916 (£60k + £7.6k NI = £67.6k deductible × 25% marginal)

Company Cost: £67,635

Director Take-Home: £45,357

Effective Rate: 24.4%

Strategy 2: Optimal Mix (£12,570 salary + £47,430 dividend)

Salary: £12,570 (Personal Allowance threshold)

Income Tax on Salary: £0

Employee NI: £0

Employer NI: £521 (15% on £3,470 above £9,100)

Dividend: £47,430

Dividend Allowance: £500 @ 0% = £0

Basic Rate (£37,700): £37,700 @ 8.75% = £3,299

Higher Rate (£9,230): £9,230 @ 33.75% = £3,115

Total Dividend Tax: £6,414

Dividend requires £63,240 pre-corp-tax profit (£47,430 ÷ 0.75)

Corporation Tax on Dividend Profit: £15,810

Total Company Cost: £13,091 (salary + empr NI) + £63,240 = £76,331

Director Take-Home: £60,000 - £6,414 = £53,586

Effective Rate: 10.7% (personal tax only)

Comparison from £100k Company Profit:

Metric
All Salary
Optimal Mix
Difference
Salary Cost (inc. Empr NI)
£67,635
£13,091
-£54,544
Corp Tax on Remaining
£8,091
£21,727
+£13,636
Dividend (from post-tax)
£0
£47,430
+£47,430
Director Personal Tax
£14,643
£6,414
-£8,229 ✅
Director Take-Home
£45,357
£53,586
+£8,229 ✅
Total Tax Paid
£22,734
£28,141
+£5,407


Key Insight: Optimal mix delivers 18% more take-home (£53,586 vs £45,357) for the director, trading higher corp tax for massive personal tax/NI savings. Perfect for growth companies prioritizing director income over retained profit.

---

**This calculation complexity is EXACTLY why FDs need this tool!** 😅

---

## Appendix B: Technical Architecture

**Stack:**

- Frontend: Next.js 15 (existing)

- State: Zustand (existing store extended)

- Styling: Tailwind (consistent with current)

- Charts: Recharts (for comparison visualizations)

- PDF: jsPDF or Puppeteer

- Auth: NextAuth.js or Clerk

- Payments: Stripe

- DB: Supabase or Vercel Postgres (scenario saves)

**Reusable Components:**

- TaxCalculationEngine (extend with corp tax, dividend tax)

- ComparisonTable (new component)

- StrategyCard (new component)

- PDFExportButton (new utility)

**Compliance & Updates:**

- HMRC rate changes monitored via official API feeds

- Annual tax year updates (April cutover automation)

- Calculation audit trail for user transparency

- Disclaimer: "For guidance only—consult qualified accountant for advice"

**New Routes:**

- `/tools` (landing page for all business tools)

- `/tools/director-optimizer`

- `/tools/dividend-calculator`

- `/tools/loan-checker`

- `/tools/extraction-analyzer`

- `/tools/pricing` (Pro tier upsell)

---

**Ready for your feedback! What resonates? What's missing? What should we build first?** 🚀

