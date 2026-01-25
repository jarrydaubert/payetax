# Feature & Product Ideas

> **Warning:** Read [READ_THIS_FIRST.md](./READ_THIS_FIRST.md) before building any of these.
> Features don't matter until you have paying customers.

---

## Priority Framework

| Priority | Criteria | Action |
|----------|----------|--------|
| **NOW** | Generates revenue directly | Build immediately |
| **NEXT** | Strong demand signal from paying users | Build after PMF |
| **LATER** | Nice to have, no revenue signal | Don't build yet |
| **NEVER** | Doesn't serve paying avatar | Delete from backlog |

---

## NOW: Revenue-Generating

### 1. SME Director Optimizer (Full Spec)

See [SME_DIRECTOR_TOOLS.md](./SME_DIRECTOR_TOOLS.md)

**Status:** Spec complete, ready to build
**Revenue:** £19-49/month per user
**Avatar:** SME Directors, FDs, Accountants

---

## NEXT: Build After PMF

### 2. Landlord Tax Calculator

**Target:** "Accidental landlords" - inherited property, spare room renters, Airbnb hosts

**Keywords (all LOW competition):**
- landlord tax: 3.6K/mo
- making tax digital for landlords: 2.4K/mo (+3329% growth)
- landlord rental income tax: 880/mo

**Why it matters:**
- Making Tax Digital expanding to landlords (April 2026)
- No free UK-specific calculator that shows Section 24 impact
- Cross-sells to main calculator

**MVP Features:**
1. Rental income calculator with expense checklist
2. Tax liability showing combined employment + rental
3. Section 24 mortgage interest impact
4. Rent-a-Room scheme comparison

**Monetization:** 
- Free tool for SEO
- Premium: PDF reports, multiple properties
- Partner: Landlord accounting software affiliate

**Build trigger:** SME tools generating £500+ MRR

---

### 3. Lead Magnet: Tax Planning Checklist

**Purpose:** Transform newsletter signup from "give email" to "get value"

**The Asset:** UK Tax Planning Checklist 2025/26 (1-2 page PDF)
- Key deadlines
- Personal allowance reminder
- Tax band reference
- Pension contribution checklist
- Marriage allowance eligibility
- Student loan thresholds

**Implementation:**
1. Create PDF in `/public/downloads/`
2. Update newsletter signup copy
3. Add to homepage hero
4. Add post-calculator CTA

**Effort:** Low (1-2 days)
**Impact:** Higher email conversion, better lead quality

**Build trigger:** After SME tools launched (need audience for newsletter)

---

## LATER: Nice to Have

### 4. Dividend Tax Calculator (Standalone)

Simpler version of director optimizer. Just dividends, not full salary/dividend split.

**Build trigger:** Director Optimizer has 100+ users asking for simpler version

### 5. Corporation Tax Calculator

For SME directors already using director optimizer.

**Build trigger:** User requests in feedback

### 6. Director's Loan Account Checker

DLA tax implications calculator.

**Build trigger:** User requests

### 7. Employer NI Calculator

For businesses calculating hiring costs.

**Build trigger:** Firm tier has 20+ accounts

---

## NEVER: Don't Build

| Idea | Why Not |
|------|---------|
| Mobile app | Web works, app is expensive maintenance |
| AI chat assistant | Complexity without monetization |
| Crypto tax calculator | Different avatar, different market |
| US/EU tax calculators | Loses UK focus, massive scope |
| Free premium features | Undermines revenue |

---

## Content Ideas (Distribution, Not Product)

These are **content pieces**, not features. Build for SEO/distribution.

### Blog Posts Needed
- "Director Salary vs Dividends 2025/26: Complete Guide" (cornerstone for SME tools)
- "£100k Tax Trap: How to Keep More of Your Money"
- "Making Tax Digital for Landlords: What You Need to Know"
- Salary insight series: £25k, £30k, £35k, £45k, £55k, £65k, £75k, £90k

### Case Studies
- "How [Name] Saved £8,229 by Optimizing Director Pay"
- "From £100k Salary to £67k Take-Home: The Tax Trap Explained"

### LinkedIn Content
- Weekly calculation breakdowns
- Tax tip threads
- "Did you know?" HMRC facts
- Seasonal reminders (Self-Assessment deadline, new tax year)

---

## Integration Ideas (Partnerships, Not Features)

### Accountant Partnerships
- White-label calculator for accounting firms
- Referral commission structure
- Co-marketing opportunities

### Software Integrations
- Xero/QuickBooks export
- Sage integration (see planning/SAGE_IMPLEMENTATION_PLAN.md)
- Payroll software APIs

**Build trigger:** 50+ Firm tier accounts requesting integrations

---

## Validation Before Building

For any idea above:

1. **Search volume:** Is anyone looking for this?
2. **Willingness to pay:** Will SME Directors/Accountants pay?
3. **Competitive gap:** Is there a free, good solution already?
4. **Build time:** Can we ship MVP in 2 weeks or less?
5. **Revenue path:** How does this make money?

If you can't answer all 5, don't build it.

---

## Related Docs

- [READ_THIS_FIRST.md](./READ_THIS_FIRST.md) - Why distribution > features
- [MONETIZATION.md](./MONETIZATION.md) - Current revenue infrastructure
- [SME_DIRECTOR_TOOLS.md](./SME_DIRECTOR_TOOLS.md) - Priority #1 product spec
