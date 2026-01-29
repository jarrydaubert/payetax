# Director Pay Calculator — Product Spec

> **Vision:** The seamless go-to calculator for ALL your UK limited company director needs.

**Position:** DIY optimization tool that empowers directors to understand their tax position, flags complexity, and hands off to accountants when needed.

**Route:** `/tools/director-guide`

---

## Pillar 1: INPUTS (What We Accept)

### Core Inputs

| Input | Purpose |
|-------|---------|
| Region | Determines income tax bands (rUK vs Scotland) |
| Profit before director remuneration | Base for all calculations — avoids double-counting salary in expenses |
| VAT status | Triggers threshold warnings (not used in tax calc). Note: "Deduct 20%" shortcut is dangerous for mixed-rate/partial exemption businesses — keep as warning-only, not calculation. |
| Already taken this year | Accounts for mid-year usage |
| Other personal income | Affects tax bands, PA taper, student loans |
| Year-end month | Drives key dates calculation |
| Losses brought forward | Reduces CT liability (common for SMEs) |

**Profit Input Guidance (Critical UX):**

> "Company profit BEFORE your pay"
> 
> This means: Revenue minus business expenses, but NOT minus your salary, dividends, pension contributions, or benefits in kind.
> 
> If unsure, ask your accountant for your "profit before director remuneration."

**"Already Taken" Clarification:**

This input mixes multiple concepts (gross salary, net salary, dividends, drawings). Either:
- Split into: YTD gross salary, YTD dividends, other drawings, OR
- Demote behind advanced toggle with explicit guidance on units

### Advanced Inputs

| Input | Purpose | Notes |
|-------|---------|-------|
| Employment Allowance | Offsets employer NI | Default: No (many don't qualify — eligibility gate needed) |
| Student Loan plans | Adds repayment to personal tax | Only active plans shown (Plan 5 from April 2026) |
| Company Pension Contribution | Reduces taxable profit, personal tax relief | Explicit label to avoid personal pension confusion |
| Benefits in Kind | Adds to personal income | Shows "company cost incomplete" warning (Class 1A = 15% employer NI) |
| Do you have other PAYE employment? | Affects NI threshold usage | If yes, NI threshold may already be used |
| Minimum salary requirement | Floor for mortgage applications | Optional — lenders often require £25k+ PAYE |

**Pension Input Notes:**
- If pension is already included in profit figure, add checkbox: "Is pension already deducted?"
- Warn about Annual Allowance (standard + taper + MPAA)
- Pension carry-forward from previous years not modelled — note in limitations

### Compare Mode Inputs

| Input | Purpose |
|-------|---------|
| Your current salary | What you actually pay yourself |
| Your current dividends | What you actually take |

**Location:** Input Panel (not inside strategy card — avoids fat-finger UX issues)

### Input Validation Rules

| Rule | Behaviour |
|------|-----------|
| Profit ≤ 0 | Trigger "Survival Mode" — show £6,500 salary recommendation to preserve NI credits for State Pension, even if it creates a loss. The NI-credit decision is still valuable at zero/low profit. |
| Compare inputs > available profit | Flag as potential Director's Loan (soft wording: "may create/increase") |
| Already taken > available | Overdrawn warning |
| EA selected but likely ineligible | Show "assumes eligible" banner |

### What We Don't Accept (Scope Boundaries)

| Input | Why Not |
|-------|---------|
| Multiple directors / spouse | Complexity — future consideration |
| Retained profits target | Requires cash flow modelling |
| Contract rate / day rate | Different user journey (contractor vs director) |
| IR35 status | Affects entire validity — out of scope |
| Associated companies count | Affects CT thresholds — noted in limitations |
| Specific accounting period dates | Assumes 12-month periods |

---

## Pillar 2: LOGIC (What We Do)

### Calculations Performed

| Calculation | Notes |
|-------------|-------|
| Income Tax | rUK bands OR Scotland 6-band based on region |
| Personal Allowance | Including taper for high earners |
| Employee National Insurance | On salary above threshold (8% / 2%) |
| Employer National Insurance | On salary above threshold (15% from April 2025) |
| Employment Allowance | Offset against employer NI (if eligible) |
| Corporation Tax | Including marginal relief for mid-range profits |
| Dividend Tax | UK dividend rates for ALL regions (not Scottish bands) |
| Student Loan repayments | On total income (salary + dividends + BIK + other) |
| Director cumulative NI | Directors use annual earnings method — calculated cumulatively over tax year, not per pay period |

**Key Rate Changes (Autumn Budget 2024, effective April 2025):**
- Employer NI: 13.8% → 15%
- Secondary threshold: £9,100 → £5,000
- Employment Allowance: £5,000 → £10,500

### Optimization Approach

1. Test salary/dividend combinations across valid range (0 to sensible cap)
2. For each combination, calculate all taxes
3. Find combination with highest net take-home
4. Label as "Highest Take-Home" (factual, not advisory)

**Slider rationale:** Capped at upper earnings limit because above this, salary is rarely tax-efficient. Users can model higher via "Your Setup".

### Warning Triggers

| Condition | Warning | Tone |
|-----------|---------|------|
| No profit | Survival Mode | Hard constraint |
| Taken > available | Potential Director's Loan | Soft — "may create/increase depending on treatment" |
| Revenue near VAT threshold | May need to register | Soft — based on rolling 12-month turnover |
| Dividends declared | May need to file Self Assessment | Soft — depends on amount and other income |
| Income in PA taper zone | Effective 60% rate explained | Educational |
| Income in HICBC zone | Child Benefit clawback | Educational |
| SA liability >£1k AND <80% deducted at source | Payments on Account likely | Educational — BOTH conditions must be met |
| Salary in pension gap zone | Paying employer NI without earning pension credits | Educational — no specific £ benefit claims |
| Pension contribution exceeds Annual Allowance | Tax charge warning | Educational |
| Total income near pension taper threshold | Annual Allowance may be reduced | Educational |
| Compare inputs exceed available profit | Flags as Director's Loan | Card turns red |

### What We Don't Calculate (Noted Limitations)

| Item | Impact | Shown to User |
|------|--------|---------------|
| £2k unearned income rule for student loans | May overstate SL when dividends ≤£2k (CSLM16035) | Yes — in Accuracy panel |
| Class 1A NI on BIK | Company cost understated by 15% of BIK value | Yes — warning on BIK input |
| Plan 5 student loans | Not applicable until April 2026 | Yes — note in SL options |
| Associated companies CT threshold division | CT may be understated for groups | Yes — in Accuracy panel |
| Short accounting periods | Assumes 12 months | Yes — in Accuracy panel |
| Marriage Allowance transfer | Could shift optimal by small amount | Yes — in Accuracy panel |
| S455 tax on Director's Loan | Not calculated, only flagged | Yes — in warning |
| Pension taper (adjusted income >£260k) | Allowance reduces to min £10k | Yes — in warning |
| MPAA (Money Purchase Annual Allowance) | If accessed pension flexibly, allowance is £10k not £60k | Yes — in Accuracy panel |
| Pension carry-forward | Previous years' unused allowance not modelled | Yes — in Accuracy panel |
| Dividend timing (declare vs pay) | Affects which tax year | Yes — in Key Dates notes |
| Distributable profits verification | Requires accountant sign-off | Yes — in Accuracy panel |

**Dividend Wording Note:**

Replace "illegal dividend" with conditional language:
> "Dividend may be unlawful IF you lack distributable reserves — check your accounts or consult your accountant."

---

## Pillar 3: OUTPUTS (What We Show)

### Strategy Comparison (4 Cards)

| Card | Description |
|------|-------------|
| All Salary | Take everything as PAYE — baseline |
| Highest Take-Home | Optimal salary + dividend split (highlighted) |
| All Dividends | Minimum salary, rest as dividends — baseline |
| Your Setup | User's actual arrangement with delta vs optimal |

**Each card shows:** Salary, Dividends, Total Tax, Effective Rate, Net Take-Home

**Your Setup behaviour:**
- Shows difference vs optimal (e.g., "+£1,200 more tax" or "Matches optimal")
- If inputs exceed available profit → card turns RED with DLA warning
- Pre-populated with optimal values; user edits to compare

### Interactive Salary Slider

- Range: 0 to sensible cap
- Live updates all figures as user drags
- Starts at optimal position
- Strategy cards clickable to jump slider to that position

### Detail Breakdowns

**Salary Breakdown:**
Gross → Income Tax → Employee NI → Employer NI → Net

**Dividend Breakdown:**
Gross → Allowance Used → Taxable → Tax → Net

**Corporation Tax Breakdown:**
Profit → Salary Cost Deduction → Pension Deduction → Taxable Profit → CT Due

### Monthly Set-Aside ("Two Pots")

| Pot | Contents |
|-----|----------|
| Company Pot | Corporation Tax ÷ 12 |
| Personal Pot | (Income Tax + Dividend Tax + Student Loan) ÷ 12 |

**Important labelling:** "Recommended set-aside for budgeting — not HMRC payment amounts. See Key Dates for actual due dates."

### Key Dates

| Date | Calculation |
|------|-------------|
| Year End | Per user input |
| CT Payment Due | Year-end + 9 months + 1 day |
| CT Return Due | Year-end + 12 months |
| Self Assessment | 31 January following the tax year |

**Notes shown:**
- Dividend timing matters: declared in March, paid in April = next tax year
- Actual distributable profits require accountant verification
- Dividends must be properly documented with board minutes and dividend vouchers

### Warnings Panel

**Grouped by severity:**

| Category | Examples |
|----------|----------|
| Hard constraints | No profit, overdrawn, illegal dividend |
| May apply | VAT registration, Self Assessment, POA |
| Complexity flags | PA taper, HICBC, pension issues, associated companies |

**Behaviour:** Context-sensitive — only show relevant warnings based on inputs

### Accuracy & Scope Panel

**Always visible in Education Panel**

**What this calculator does:**
- Compares salary vs dividend extraction strategies
- Uses current HMRC rates (single source of truth)
- Assumes single director, 12-month period, standalone company

**What it doesn't do:**
- Student loan £2k unearned income rule (may overstate)
- Class 1A NI on benefits in kind (company cost incomplete)
- Associated company CT threshold adjustments
- Short accounting period adjustments
- Marriage Allowance transfers
- IR35 status considerations

**Disclaimer:** Illustrative only. Not financial advice. Always consult a qualified accountant.

### What We Could Show (Future Possibilities)

| Output | Value |
|--------|-------|
| Multi-year comparison | Fiscal drag impact, rate change planning |
| Spouse/household view | Joint optimization |
| Cash runway / buffer mode | "Maximise take-home subject to keeping £X in company" — addresses variable income reality, major differentiator |
| Retained profits scenarios | Leave X in company, take Y |
| Dividend voucher generation | Document automation |
| CT payment reminders | Notification service |
| Charts/visualizations | Clearer money flow |

---

## UX / UI

### Desktop Layout

```
┌──────────┬───────────┬─────────────────────┬──────────────┐
│ Sidebar  │  Inputs   │    Main Content     │  Education   │
│  (nav)   │  (form)   │   (results/cards)   │  (warnings)  │
└──────────┴───────────┴─────────────────────┴──────────────┘
```

### Mobile Layout

- Panels stack vertically
- Strategy cards in 2×2 grid (not 4 in a row)
- Compare inputs in collapsible section
- Sticky header for navigation

### Key Interactions

| Interaction | Behaviour |
|-------------|-----------|
| Drag slider | All figures update live |
| Click strategy card | Slider jumps to that position |
| Edit Compare inputs | 4th card recalculates with delta |
| Expand warning | Shows explanation and next steps |
| Toggle advanced inputs | Reveals/hides student loans, pension, BIK |

---

## Monetization Approach

### Free Core (Trust + SEO + Shareability)

Full calculator with no gates. Accuracy is never paywalled.

### Email Capture

"Email my results" — saves scenarios, key dates, set-aside figures. Builds lead list for nurture.

### Accountant Referral

"Need help implementing this? Talk to a specialist" — appears when complexity flags trigger. Revenue share with partner firms.

**Disclosure required:** "We may receive a referral fee if you engage with our partner firms. This doesn't affect our recommendations."

### White-Label (B2B)

Accountants embed calculator on their sites. They get leads; we get recurring revenue.

### Future Possibilities

- Pro features: Multi-director, spouse, retained profits (only if demand proves out)
- Document generation: Dividend vouchers, board minutes
- Integrations: Xero, FreeAgent, QuickBooks

### Red Lines

| Never Do | Why |
|----------|-----|
| Gate accuracy behind pay | Destroys trust |
| Say "you should" | Advisory territory |
| Aggressive CTAs / pop-ups | Erodes credibility |
| Hide limitations | Accountants will catch it |

---

## Competitive Edge

### What We Do Better

| Feature | Us | Most Competitors |
|---------|:--:|:----------------:|
| 4-strategy comparison (incl. Your Setup) | ✅ | ❌ |
| Interactive slider with live updates | ✅ | ❌ |
| Student loans on total income | ✅ | ❌ |
| Scottish tax bands (correct dividend handling) | ✅ | ⚠️ |
| Pension gap warning | ✅ | ❌ |
| Monthly set-aside (Two Pots) | ✅ | ❌ |
| Key dates with year-end customization | ✅ | ❌ |
| HICBC clawback warning | ✅ | ❌ |
| "Compare My Setup" as audit tool | ✅ | ❌ |
| Transparent limitations (Accuracy panel) | ✅ | ❌ |

### What Competitors Have (We Don't — Yet)

| Feature | Value |
|---------|-------|
| Sole trader vs Ltd comparison | First-timer journey |
| IR35 / umbrella comparison | Contractor journey |
| Spouse/share split calculator | Family companies |
| Contract rate → take-home flow | Contractor UX |
| Xero/FreeAgent integration | Real data |

---

## The 10x Vision

**From "Calculator" to "Director Financial Copilot"**

| Current | 10x |
|---------|-----|
| User types profit manually | Connect to Xero → pull live P&L |
| Shows optimal extraction | Shows "You've taken £30k — stop now or hit higher rate" |
| Static annual view | Multi-year projection with fiscal drag |
| Single director | Household optimizer (spouse, children for HICBC) |
| Tax calculation | Constraint-based: "Maximize take-home while keeping 6 months runway" |

### Reviewer-Recommended Priority Features

| Feature | Source | Value |
|---------|--------|-------|
| **Dividend timing optimizer** | Claude | "You have £X basic rate band remaining. Declare £Y before April 5 to save £Z." |
| **Safe Extraction Mode** | ChatGPT, Grok | Max take-home while keeping X months cash runway |
| **"Safe to Spend" number** | Gemini | "Of the £10k in your bank today, £X is yours" |
| **Household optimizer** | Grok | Spouse salary/dividends, HICBC impact |
| **Dividend voucher generation** | Gemini | Zero-marginal-cost sticky feature |
| **Retained profits planner** | ChatGPT | Leave £X in company to avoid future traps |

### Long-Term Wedge

```
Director Calculator → Tax Deadline Dashboard → Director's Toolkit → White-Label B2B → Xero Integration
```

---

## Ask for Reviewers

```
Review this product spec through these lenses:

1. INPUT MODEL
   - Any gaps or confusion risks?
   - What inputs are missing for your use case?
   - Would the "profit before director remuneration" approach work?

2. LOGIC APPROACH
   - Is the optimization sound?
   - What edge cases would break it?
   - Any calculations missing that would embarrass us?

3. OUTPUT CLARITY
   - Would you trust these numbers?
   - Is "Compare My Setup" positioned correctly?
   - What would make an accountant roll their eyes?

4. PRODUCT-MARKET FIT
   - Would you use this? Share it?
   - What's the killer feature?
   - What's the biggest gap vs competitors?

5. LIMITATIONS HONESTY
   - Are we being transparent enough?
   - Anything we claim that we shouldn't?
   - Anything we disclaim that we should actually do?

6. 10x THINKING
   - What would make this indispensable?
   - What's the wedge into broader director tools?

Be brutal. Tell me what's weak.
```

---

## Sign-Off Status

| Reviewer | Technical | Business | Status |
|----------|-----------|----------|--------|
| Grok | ✅ | ✅ | Approved |
| Claude | ✅ | ✅ | Approved |
| ChatGPT | ✅ | ✅ | Approved with input model note |
| Gemini | ✅ | ✅ | Approved with validation note |

**Consensus:** Product is sound. Execute noted improvements, then ship.
