# SME Director Tools - Implementation Spec

**Status:** Approved for Development
**Last Updated:** January 2025
**Owner:** PayeTax Product Team

---

## Executive Summary

We're building a suite of SME-focused financial tools, starting with the **Director Salary vs Dividend Optimizer**. This expansion leverages our existing HMRC-compliant calculation engine to address a clear market gap: accessible, accurate business tax optimization tools for UK company directors.

**Target Users:**
- Directors of limited companies
- Finance Directors (SMEs with 10-250 employees)
- Accountants managing multiple SME clients
- Business owners doing their own bookkeeping

**Core Value Proposition:**
*"Instant, accurate director remuneration optimization—built by tax nerds, designed for busy FDs."*

---

## Brand & Positioning

### The Promise We're Protecting

**PayeTax Calculator = Free Forever**

Our consumer PAYE calculator remains 100% free. This is our brand promise and SEO foundation. We will never paywall the core tax calculator.

### The New Opportunity

**PayeTax Pro = SME Tools Suite**

| Brand | Audience | Model | Promise |
|-------|----------|-------|---------|
| PayeTax Calculator | Individuals | Free forever | "What's my take-home pay?" |
| PayeTax Pro | Directors & FDs | Freemium | "How do I optimize my compensation?" |

**Key Distinction:** These are *additional* tools for a *different* audience segment. No broken promises—just expanded value.

### Positioning

- Same domain (`payetax.co.uk/tools/`)
- Different user journey (B2B vs B2C)
- Premium features unlock advanced functionality
- Free tier still provides real value (basic calculations)

---

## Pricing Strategy

| Tier | Price | Target | Features |
|------|-------|--------|----------|
| **Free** | £0 | Individual directors exploring options | Basic calculations, no saves, watermarked PDF |
| **Pro** | £19/mo | Serious FDs optimizing regularly | PDF export, save 5 scenarios, year-on-year comparison |
| **Firm** | £49/mo | Accountants with multiple clients | Unlimited scenarios, client management, white-label reports |

### Pricing Rationale

- **£19/mo Pro:** Low barrier for individual directors. Cheaper than 15 minutes of accountant time.
- **£49/mo Firm:** Aligned with existing B2B widget pricing. Accountants can bill this back to clients.
- **Free tier:** Lead generation and SEO value. Users see the value before paying.

### Revenue Model

- Monthly subscription via Stripe
- Annual discount (2 months free)
- No per-calculation fees
- Free tier has no time limit

---

## Launch Strategy

### Phase 1: Build MVP (Weeks 1-4)
- Director Salary vs Dividend Optimizer only
- Free tier functionality complete
- Basic auth (email/password)
- No payment integration yet

### Phase 2: Soft Launch (Weeks 5-6)
- Invite-only beta (accountant contacts, LinkedIn network)
- Gather real usage data and feedback
- Iterate on UX based on actual behavior
- Fix edge cases discovered through use

### Phase 3: Content Launch (Weeks 7-8)
- Cornerstone blog post: "Director Salary vs Dividends 2025/26: The Complete Guide"
- SEO-optimized landing page
- Link from existing calculator where relevant
- Soft social promotion

### Phase 4: Public Launch (Week 9+)
- Enable Stripe payments (Pro/Firm tiers)
- Announce on LinkedIn, Twitter, accounting forums
- Consider AccountingWeb partnership (nice-to-have, not dependency)
- Monitor conversion rates and optimize

### Validation Philosophy

**Build → Measure → Learn**

We're not seeking external validation before building. The market signal is clear:
- Directors constantly ask "salary or dividends?" online
- Existing tools are either ugly, inaccurate, or behind paywalls
- Our calculation engine is already built and trusted

Real usage data beats survey responses.

---

## Tool Priority

### Tool #1 (NOW): Director Salary vs Dividend Optimizer

This is the flagship tool. Everything else is dependent on demand signals from this launch.

### Future Tools (Build Based on Demand)

| Priority | Tool | Build Trigger |
|----------|------|---------------|
| 2 | Dividend Tax Calculator | High search traffic to optimizer |
| 3 | Director's Loan Account Checker | User requests in feedback |
| 4 | Corporation Tax Extraction Analyzer | Pro tier adoption > 100 users |
| 5 | Employer NI Calculator | Firm tier adoption > 20 accounts |
| 6 | VAT Scheme Comparator | Clear demand signal |

**Decision:** We don't build Tool #2 until Tool #1 proves product-market fit.

---

## Tool #1: Director Salary vs Dividend Optimizer

### The Problem

Directors struggle to determine the optimal mix of salary and dividends to minimize both personal and company tax liabilities. Most rely on accountants for annual planning, lacking tools for real-time "what if" scenarios.

### The Solution

Interactive calculator comparing:
- All salary strategy
- All dividend strategy (after corporation tax)
- Optimal mix strategy (recommended)
- Custom mix scenarios

### Input Fields

```
- Total compensation required (gross)
- Current tax year (2025-26)
- Region (England/Wales/NI vs Scotland)
- Existing salary (if any)
- Company profit available
```

### Output Display

```
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
```

### Insights Panel

- "Save £X by switching to optimal mix"
- "Company cost reduced by £Y"
- NI credits impact on state pension
- Marginal rate on next £1,000

### Example Output

| Strategy | Salary | Dividends | Personal Tax | Take-Home | Company Cost | Gain |
|----------|--------|-----------|--------------|-----------|--------------|------|
| All Salary | £60,000 | £0 | £14,643 | £45,357 | £67,635 | - |
| **Optimal Mix** | £12,570 | £47,430 | £6,414 | **£53,586** | £76,331 | **+£8,229** |
| All Dividend | £0 | £60,000 | £13,929 | £46,071 | £80,000 | +£714 |

*Uses 2025-26 rates: Employee NI 8%, Employer NI 15%, Corp Tax 25%*

### User Journey

1. Land on `/tools/director-optimizer`
2. Enter total compensation needed
3. See instant comparison table
4. Adjust inputs (toggle pension, add bonuses)
5. **Free:** View results, watermarked PDF
6. **Pro:** Export clean PDF, save scenario
7. **Firm:** Compare multiple scenarios, add client notes

### Technical Implementation

- Extend existing tax calculator with dividend tax logic
- Corporation tax calculation (marginal relief for £50k-£250k)
- Employer NI calculation
- State pension NI credit warnings
- Zustand store for scenario state
- Stripe for Pro/Firm payments

---

## UX/UI Design Principles

### Progressive Disclosure
- Start simple (core inputs only)
- Expand for advanced scenarios (pensions, benefits, loans)
- Collapsible sections for detail-seekers

### Comparison Tables
- Side-by-side strategy comparison (max 4 columns)
- Color-coded savings (green) vs costs (red)
- Clear "Recommended" badge on optimal strategy

### Actionable Insights
- "Save £X by switching to Y" callouts
- One-click "Apply Suggestion" buttons
- Exportable PDF reports

### Mobile-First
- Responsive tables (horizontal scroll on mobile)
- Touch-friendly inputs
- Collapsible results on small screens

### Brand Consistency
- Same PayeTax design system
- Tax rates cards style (like homepage)
- HMRC compliance messaging

---

## Technical Architecture

### Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (existing) |
| State | Zustand (extend existing store) |
| Styling | Tailwind CSS 4 (consistent with current) |
| Charts | Recharts (for comparison visualizations) |
| PDF | jsPDF or react-pdf |
| Auth | NextAuth.js |
| Payments | Stripe |
| DB | Supabase (scenario saves) |

### Reusable Components

- `TaxCalculationEngine` - extend with corp tax, dividend tax
- `ComparisonTable` - new component
- `StrategyCard` - new component
- `PDFExportButton` - new utility

### New Routes

```
/tools                    → Landing page for all business tools
/tools/director-optimizer → Main tool
/tools/pricing            → Pro/Firm tier comparison
/dashboard                → Saved scenarios (Pro/Firm only)
```

### Compliance & Updates

- HMRC rate changes via `src/constants/taxRates.ts`
- Annual tax year updates (April cutover)
- Calculation audit trail for transparency
- Disclaimer: "For guidance only—consult a qualified accountant for advice"

---

## Decision Log

| Decision | Rationale | Date |
|----------|-----------|------|
| Freemium over pure SaaS | Lower barrier, prove value first, SEO benefits | Jan 2025 |
| £19/£49 pricing | Aligned with market (accountant hourly rate, B2B widget price) | Jan 2025 |
| Build before external validation | Clear market signal, existing engine, real usage > surveys | Jan 2025 |
| Single tool MVP | Focus, faster launch, demand-driven expansion | Jan 2025 |
| Partnership as nice-to-have | Don't block on external dependencies | Jan 2025 |
| Free calculator stays free | Brand promise, SEO foundation, different audience | Jan 2025 |

---

## Success Metrics

### Phase 2 (Soft Launch)
- 50+ beta users complete a calculation
- < 5% drop-off at input stage
- Qualitative feedback positive

### Phase 4 (Public Launch)
- 500+ monthly active users (free tier)
- 20+ Pro subscribers within 3 months
- 5+ Firm accounts within 3 months

### 6-Month Goals
- £1,000 MRR
- Tool #2 demand signal clear
- Organic traffic to `/tools/` growing

---

## Appendix: Sample Calculation

**Scenario:** FD earning £60,000 total compensation

### Strategy 1: All Salary

```
Gross Salary: £60,000
Income Tax: £11,432 (20% on £37,700 + 40% on £9,730)
Employee NI: £3,211 (8% on £37,700 + 2% on £9,730)
Employer NI: £7,635 (15% on £50,900)

Company Cost: £67,635
Director Take-Home: £45,357
Effective Rate: 24.4%
```

### Strategy 2: Optimal Mix (£12,570 salary + £47,430 dividend)

```
Salary: £12,570 (Personal Allowance threshold)
Income Tax on Salary: £0
Employee NI: £0
Employer NI: £521 (15% on £3,470 above £9,100)

Dividend: £47,430
├─ Dividend Allowance: £500 @ 0% = £0
├─ Basic Rate (£37,700): £37,700 @ 8.75% = £3,299
└─ Higher Rate (£9,230): £9,230 @ 33.75% = £3,115
Total Dividend Tax: £6,414

Corporation Tax: £15,810 (on £63,240 pre-tax profit for dividend)
Total Company Cost: £76,331
Director Take-Home: £53,586
Effective Rate: 10.7%
```

### Comparison

| Metric | All Salary | Optimal Mix | Difference |
|--------|------------|-------------|------------|
| Director Personal Tax | £14,643 | £6,414 | **-£8,229** |
| Director Take-Home | £45,357 | £53,586 | **+£8,229** |
| Total Tax Paid | £22,734 | £28,141 | +£5,407 |

**Key Insight:** Optimal mix delivers 18% more take-home (£53,586 vs £45,357). The director pays less personal tax while the company pays more corp tax—but the net benefit to the director is significant.

*This calculation complexity is exactly why FDs need this tool.*
