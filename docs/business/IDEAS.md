# Feature & Product Ideas

> **Last updated:** January 2026
> **Tax year:** 2025-26 (rates valid 6 April 2025 - 5 April 2026)
> **Next review:** April 2026 (new tax year)
>
> **Read [READ_THIS_FIRST.md](./READ_THIS_FIRST.md) first.**
> Don't build until there's demand signal.
> 
> **Reviewed by:** Grok, Claude, ChatGPT, Gemini (Jan 2026) — internal brainstorm validation only, not market validation

---

## Priority Framework

| Priority | Criteria |
|----------|----------|
| **NOW** | Users asking for it + generates revenue |
| **NEXT** | Strong demand signal from users |
| **LATER** | Nice to have, no signal yet |
| **NEVER** | Doesn't serve our avatar or too risky |

---

## Recently Shipped (2025-26 Tax Year)

| Feature | Tool | Date |
|---------|------|------|
| **Salary Explorer Slider** | Director Calculator (Pro) | Jan 2026 |
| 3-Strategy Comparison | Director Calculator (Pro) | Jan 2026 |
| Salary Point Comparison (£6,500 vs £12,570) | Director Calculator (Pro) | Jan 2026 |
| PA Taper for £100k+ | Director Calculator (Pro) | Jan 2026 |
| Comprehensive Threshold Reference | Director Calculator (Pro) | Jan 2026 |
| HMRC Source Links | Director Calculator (Pro) | Jan 2026 |
| **2025-26 Employer NI update** | Director Calculator (Pro) | Jan 2026 |

*Note: April 2025 Employer NI changes (ST £5,000, rate 15%, EA £10,500) already implemented.*

---

## Core Features (Accuracy Requirements)

> **These are NOT enhancements.** Without them, the Pro calculator is materially inaccurate for key cohorts (student loan borrowers, £100k+ earners, directors with company cars).

| Feature | Why Critical | Effort |
|---------|--------------|--------|
| **Student Loan deductions** (Plan 1/2/4/5) | 9% deduction missing = overstates take-home by £thousands | Medium |
| **Pension contribution input** | #1 tax planning lever for £100k+ earners (PA taper avoidance) | Medium |
| **Company Car (BIK) estimator** | #1 question directors ask after "salary vs dividends" | Medium |

**Student Loan priority:** Plan 1 and Plan 2 first. Plan 5 (courses from Aug 2023) unlikely to have repaying directors until ~2027.

**Company Car value:** Show tax difference between Tesla (2% BIK) vs Range Rover (37% BIK) inside salary strategy = major differentiation.

---

## Tool Ideas (Programmatic SEO)

> Use same engine, different wrappers. These are landing pages, not new products.

| Page | Target Keyword | Notes |
|------|----------------|-------|
| `/tools/dividend-tax-calculator` | "dividend tax calculator 2025" | Stripped-down view of Pro calc |
| `/tools/corporation-tax-calculator` | "corporation tax calculator" | Already partial, make standalone |
| `/tools/employer-ni-calculator` | "employer ni calculator 2025" | Post-budget NI changes = search spike |
| `/tools/should-i-incorporate` | "should I go limited company" | Bridge sole traders to Ltd tools |
| `/tools/tax-year-changes` | "tax changes April 2025" / "2025-26 tax year" | What changed this April (annual refresh) |

⚠️ **Google thin content warning:** Cannot just have inputs/outputs. Must generate dynamic text below fold:
> "Based on a salary of £12,570, you are utilizing 100% of your Personal Allowance. Your dividends of £35,000 will be taxed at 8.75% up to £50,270 total income..."

This unique, generated explanation prevents de-ranking as "spam calculator".

---

## Enhancement Ideas (Existing Tools)

| Enhancement | Impact | Effort | Priority | Status |
|-------------|--------|--------|----------|--------|
| Variable salary slider | High | Medium | — | ✅ Shipped |
| PDF export with workings | Medium | Low | **NOW** | — |
| Marriage Allowance toggle | Medium | Low | **NOW** | — |
| Interest Income input | Medium | Low | **NEXT** | — |
| "What if I earn £X more?" scenarios | Medium | Medium | **NEXT** | — |
| Spouse/partner dividend split | Medium | High | LATER | — |
| Historical comparison (vs last year) | Low | Medium | LATER | — |

---

## B2B Opportunities

> Pricing benchmarks: TaxDome ~£560-600/seat/year excl. VAT, practice tools £25-60/user/month (Karbon, Senta, AccountancyManager).

### For Accountancy Firms

| Opportunity | What They Get | Price |
|-------------|---------------|-------|
| **White-label calculator** | Branded calc + lead capture + qualification analytics | £49/mo |
| **Text-to-Strategy AI** | Junior types scenario → client-ready PDF (saves ~30 mins manager review) | £79/mo per seat |
| **Client Onboarding Link** | Generic link → client fills in profit → structured data (saves ~30 mins email ping-pong) | £29/mo |
| **MTD Readiness Checker** | Which clients affected, digital records status | Free (lead gen) |
| **Accountant Directory listing** | "Find a director-tax specialist near you" | £29/mo |

*Note: SA Evidence Chaser & Pre-filing Reconciler moved to "B2B Bets" — require integrations to validate.*

**Note:** Compliance Pack (vouchers/minutes) moved to B2C - accountants already have this in practice software (IRIS, TaxCalc, AccountancyManager).

### For Formation Agents

| Opportunity | What They Get | Price |
|-------------|---------------|-------|
| **Package Selector widget** | Routes low profit → sole trader, high → Pro formation | Rev share |
| **Post-incorporation calculator** | Bundled "how to pay yourself" tool | £3-5/signup affiliate |
| **Companies House ID tracker** | Verification status, chase, evidence, audit trail | £10/entity |

### B2C Revenue (Director Pro)

| Product | What They Get | Price |
|---------|---------------|-------|
| **Director Pro subscription** | Calculator + Auto-generated Dividend Vouchers + Board Minutes templates | £9/mo |

**Target:** Directors without accountants, or those wanting to save fees. Compliance Pack pivoted from B2B (accountants don't need it - their software does this).

### B2B Bets (Validate First)

| Opportunity | Buyer | Price | Requires Integration? | Risk Level |
|-------------|-------|-------|----------------------|------------|
| DLA & s455 Monitor | Accountants | £2/company/mo | Yes (books) | Medium |
| IR35 Evidence Pack Builder | Recruiters | £15/pack | No | High (disclaimers critical) |
| Tax Code Audit | Payroll bureaus | Free (lead gen) | Yes (payroll) | Low |
| Pre-filing Reconciler | Accountants | £2/return | Yes (books + bank + payroll) | High |
| SA Evidence Chaser | Accountants | £3/client/mo | Yes (email/portal/scans) | Medium |

**Risk definitions:**
- **Low:** Pure calculation, no advice implied
- **Medium:** Requires explicit scope boundaries
- **High:** Must refuse certain outputs, needs legal disclaimers

---

## Moats We're Building

1. **Auditability** - HMRC source links, versioned rates, calculation transparency ✅
2. **Edge-case accuracy** - Scottish 6 bands, PA taper, POA, all thresholds ✅
3. **Workflow integrations** - Xero/QBO push 🔲 **PRIORITY: NEXT** (becomes "Software" not "Calculator")
4. **Paperwork generation** - Dividend vouchers/minutes via Director Pro subscription 🔲 (B2C)

---

## Content Ideas

| Type | Examples |
|------|----------|
| Blog posts | Salary guides by income level, tax trap explainers |
| Case studies | Real savings examples with math |
| LinkedIn | Weekly calculation breakdowns, tax tips |
| Seasonal | Self Assessment deadline, new tax year |

---

## Lead Magnets

| Asset | Purpose |
|-------|---------|
| Tax Planning Checklist PDF | Email capture |
| Payment Schedule PDF | Email capture |
| Key Dates Calendar (.ics) | Value-add |

---

## Integration Ideas

| Partner | Type | Priority |
|---------|------|----------|
| **Xero/QuickBooks** | Post dividends to ledger | **NEXT** - valuation jump from "Calculator" to "Software" |
| Accountants | Referral, white-label | NOW |
| Payroll software | Export | LATER |

---

## Never Build

| Idea | Why |
|------|-----|
| **IR35 Status Determinations** | Wrong market (recruiters not SME directors), requires legal defensibility/insurance/case law expertise. One wrong determination = reputational disaster. |
| **MTD ITSA Submission Software** | Can't compete with Xero/FreeAgent/QuickBooks. Pivot to "MTD Readiness Checker" as free lead gen instead. |
| R&D Tax Credit Automation | HMRC crackdown, high scrutiny, reputational risk |
| AI Accounts Prep | Competing with well-funded Dext, AutoEntry, Xero |
| Mobile app | Web works fine for B2B accountancy tools |
| AI chat | Complexity without monetization |
| Crypto tax | Different market, specialist players dominate |
| US/EU tax | Loses UK focus |

---

## Validation Checklist

Before building anything:

1. Are users asking for it?
2. Will they pay?
3. Is there a free alternative already?
4. Can we ship in 2 weeks?
5. How does it make money?
6. **Do we have the expertise/liability cover?**

No clear answers = don't build.
