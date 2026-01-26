# Director Tools - Product Pivot

> **Version:** 1.0 | **Created:** 2026-01-26 | **Status:** New Direction - Awaiting Review

---

## The Pivot: What Changed

We started with: **"Director Salary vs Dividend Optimizer"** - a tax optimization tool for people who understand the system and want to minimize tax.

We're pivoting to: **"First-Time Director's Guide to Paying Yourself"** - an educational tool for people who don't understand the system and just want clarity.

---

## The Real Problem (In User's Own Words)

> "I'm being paid X, what tax do I need to pay?"
> "Even with 0 revenue, how do I pay myself?"
> "Can I just draw from the business account?"
> "How do dividends work?"
> "How to gauge my salary vs having enough to pay for self assessment/corp tax at the end of my first trading year?"
> "All of this is very confusing for me - I want to focus on my day job, not all this tax stuff!"

**This is not someone asking for optimization. This is someone asking for understanding.**

---

## Target Audience (Revised)

| Who | Their Situation |
|-----|-----------------|
| Young content creators | Just hit monetization, formed Ltd, no idea what to do |
| Freelancers gone Ltd | Used to be self-employed, Ltd is new territory |
| First-time founders | Technical person, built a product, business admin is alien |
| Side-hustle directors | Day job + Ltd company, minimal time for tax stuff |

**Common traits:**
- Don't earn loads (yet)
- Can't justify accountant + payroll + registered address + filing fees
- Stressed about getting it wrong
- Just want to focus on their actual work
- Need clarity, not optimization

---

## The Insight: Two Audiences, Same Tool

| Audience | Their Problem | How They Use It |
|----------|---------------|-----------------|
| **First-time director** | "I don't understand any of this" | Uses it directly |
| **Accountant** | "I'm tired of explaining basics to every new client" | Sends link to client |

**Key realization:** Accountants don't need to EMBED a widget. They need to SHARE a resource.

**The tool becomes their client education resource:**
- Client asks "how do I pay myself?"
- Accountant sends link: "Read this first, then call me with specific questions"
- Saves accountant 30 minutes per client
- Client feels empowered, not stupid
- Accountant looks helpful

**Accountants will share this voluntarily because it saves them time.**

---

## Old vs New Positioning

| Old (Optimizer) | New (Guide) |
|-----------------|-------------|
| "Lowest tax extraction strategy" | "How to pay yourself - explained simply" |
| For people who understand tax | For people who don't |
| Calculator-first | Education-first, calculator-second |
| "Save £1,654" | "Understand what you're doing" |
| Pro tool for FDs | Beginner tool for confused directors |
| Complex optimization | Simple, safe approach |
| Jargon-heavy | Tooltip-heavy, jargon-free |

---

## The Product (Revised)

### Name Options
- "First-Time Director's Guide to Paying Yourself"
- "How to Pay Yourself from Your Ltd Company"
- "Director Pay Explained"

### Tone
- Friendly, not formal
- No jargon (or jargon always explained)
- "We've got you"
- Reassuring, not overwhelming

### Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  SECTION 1: UNDERSTAND                                          │
│  (Education - What Are My Options?)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  "How can I take money from my company?"                        │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   SALARY    │  │  DIVIDENDS  │  │  DIRECTOR'S │             │
│  │             │  │             │  │    LOAN     │             │
│  │ Like a job  │  │ Share of    │  │ Borrowing   │             │
│  │ Tax + NI    │  │ profits     │  │ from company│             │
│  │ deducted    │  │ Lower tax   │  │ ⚠️ Careful! │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
│  [ⓘ] Every term has a tooltip explaining it in plain English   │
│                                                                 │
│  FAQ Section:                                                   │
│  - "Can I just transfer money to my personal account?"          │
│  - "What if my company has no profit yet?"                      │
│  - "Do I need to run payroll for just myself?"                  │
│  - "What's the difference between salary and dividends?"        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  SECTION 2: CALCULATE                                           │
│  (Simple Tool - What Should I Do?)                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  "Let's work out a simple, safe approach for you"               │
│                                                                 │
│  How much do you expect your company to make this year?         │
│  £ [__________]  [ⓘ] Revenue minus expenses, roughly            │
│                                                                 │
│  How much do you want to take home?                             │
│  £ [__________]  [ⓘ] What you need to live on                   │
│                                                                 │
│  [Calculate]                                                    │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  HERE'S A SIMPLE APPROACH:                                 │ │
│  │                                                            │ │
│  │  Pay yourself:                                             │ │
│  │  • Salary: £12,570/year (£1,047/month) - tax-free          │ │
│  │  • Dividends: £X when you have profits                     │ │
│  │                                                            │ │
│  │  Set aside for tax:                                        │ │
│  │  • Corporation Tax: ~£Y (due [date])                       │ │
│  │  • Personal Tax: ~£Z (due 31 January)                      │ │
│  │                                                            │ │
│  │  💡 Tip: Put £X/month into a separate "tax" account        │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [ⓘ] This is a safe, simple approach - not necessarily the     │
│      "optimal" one. For complex situations, see an accountant.  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  SECTION 3: PLAN                                                │
│  (Dates & Reminders - When Do I Pay?)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  YOUR KEY DATES:                                                │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📅 Corporation Tax    │ Due: [9 months after year end]  │   │
│  │    ~£Y to pay         │ [Add to Calendar]               │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ 📅 Self Assessment    │ Due: 31 January 2027            │   │
│  │    ~£Z to pay         │ [Add to Calendar]               │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ 📅 Confirmation       │ Due: [date]                     │   │
│  │    Statement          │ [Add to Calendar]               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  💡 Set up a standing order: £X/month to a "tax savings"        │
│     account so you're never caught short.                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  SECTION 4: NEXT STEPS                                          │
│  (What Now?)                                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  WHEN YOU CAN DO IT YOURSELF:                                   │
│  ✓ Simple Ltd company, just you                                 │
│  ✓ One income source                                            │
│  ✓ No employees                                                 │
│  ✓ Below VAT threshold                                          │
│                                                                 │
│  WHEN TO GET AN ACCOUNTANT:                                     │
│  → Multiple income sources                                      │
│  → Employees                                                    │
│  → Complex expenses (home office, car, travel)                  │
│  → Approaching £100k profit                                     │
│  → You just want peace of mind                                  │
│                                                                 │
│  QUESTIONS TO ASK AN ACCOUNTANT:                                │
│  • "What's the most tax-efficient way to pay myself?"           │
│  • "Should I make pension contributions through the company?"   │
│  • "When should I register for VAT?"                            │
│                                                                 │
│  [Find an accountant] (optional referral CTA)                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Why Accountants Will Love This

| Their Current Pain | How This Helps |
|--------------------|----------------|
| 30-min call explaining basics to every new client | "Read this first, call me with specific questions" |
| Clients still confused after the call | Visual guide they can reference |
| Repeating the same explanation 100x | Tool does it for them |
| Clients feel intimidated | Friendly tone empowers them |
| Jargon creates barriers | Plain English builds trust |

**Accountants become distribution channel - voluntarily.**

They'll share this because:
1. It saves them time
2. It makes them look helpful (not gatekeeping)
3. It's better than anything they could build themselves
4. It pre-educates clients so calls are more productive

---

## Business Model (Simplified)

### Phase 1: Free Tool (Build Trust)
- Build the guide + calculator
- SEO brings first-time directors
- Accountants discover it, start sharing
- Track usage, gather feedback
- **Goal:** Become the go-to resource for confused first-time directors

### Phase 2: Monetize (If Needed)
- Accountant referral CTA ("Need help? Find an accountant") - referral fees
- Pro features for power users:
  - Save scenarios
  - Year-on-year comparison
  - PDF export
  - Email reminders for tax dates
- **Pricing:** £9-19/mo (low friction)

### Phase 3: Expand (Based on Demand)
- "Should I Incorporate?" (sole trader → Ltd bridge)
- "VAT Explained: Do You Need to Register?"
- "Self Assessment for Directors"
- "Expenses: What Can You Claim?"
- Become the "confused business owner" destination

### What We're NOT Doing (For Now)
- ❌ Embeddable widget
- ❌ Domain validation / license keys
- ❌ B2B SaaS for accountants
- ❌ Complex pricing tiers
- ❌ Sales calls / enterprise features

---

## What Happens to the Existing Docs?

| Document | Status |
|----------|--------|
| `DIRECTOR_TOOLS_IMPLEMENTATION.md` | **Keep.** Math and calculation logic still valid. Reframe the UX around education. |
| `SME_DIRECTOR_TOOLS_STRATEGY.md` | **Superseded.** Widget/B2B strategy on hold. This document is the new direction. |

---

## How This Relates to AccountingWeb Conversation

From user's note:
> "From my call/meet with AccountingWeb, they want a pro tool too. But maybe the easy-to-use, full of tooltips and FAQs could be an easy win for accountants AS WELL that they can share with customers."

**Exactly.** The "pro tool" accountants want might not be a complex optimizer. It might be:
- A simple, jargon-free explanation tool
- That they can send to clients
- Instead of having the same conversation 100 times
- Our version of the explanation, not their jargon-ridden calls

**The same tool serves both audiences.**

---

## Competitive Advantage (Revised)

| Competitor Calculators | Our Guide |
|------------------------|-----------|
| Calculator only | Education + calculator |
| Assumes you understand tax | Assumes you don't |
| Jargon-heavy | Tooltip on every term |
| "Optimal" result | "Simple, safe" approach |
| No context | Full explanation of options |
| Transactional | Relationship-building |

**Our moat:** We explain things. They just calculate.

---

## Success Metrics (Revised)

### Phase 1 (First 3 months)
| Metric | Target |
|--------|--------|
| Monthly visitors | 5,000 |
| Calculator completions | 1,000 |
| Time on page | >3 minutes (they're reading) |
| Accountant shares (tracked via UTM) | 100 |
| NPS from feedback | >40 |

### Phase 2 (6 months)
| Metric | Target |
|--------|--------|
| Monthly visitors | 20,000 |
| Pro conversions | 100 |
| Accountant referral revenue | £500/mo |
| Repeat visitors | 30% |

---

## The USP (Final)

**"Finally understand how to pay yourself from your company - without the jargon, without the stress."**

Not optimization. **Clarity.**

Not for tax nerds. **For busy people who just want to get back to their day job.**

---

## Next Steps

1. **Await 4 reviews** on this pivot
2. **Reframe implementation spec** around education-first UX
3. **Build Phase 1** - the free guide + calculator
4. **Ship and learn** - let real usage guide Phase 2

---

## Open Questions

| Question | Notes |
|----------|-------|
| Do we keep the "optimizer" angle at all? | Maybe as an "advanced" section for those who want it |
| How do we track accountant shares? | UTM parameters? "Share with client" button? |
| What's the minimum content needed for launch? | Guide + calculator + FAQ? Or more? |
| Should we interview first-time directors? | Validate the pain points before building |

---

**Document Status:** Pivot captured. Awaiting review feedback before proceeding.
