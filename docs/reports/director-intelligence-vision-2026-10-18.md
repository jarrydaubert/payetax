# Director Intelligence — Product Vision & Delivery Brief

**Status:** Dated candidate product vision — **not an approved feature specification, active roadmap or statutory guidance**

**Prepared:** 18 October 2026

**Repository:** https://github.com/jarrydaubert/payetax

**Live experience:** https://payetax.co.uk/tools/director-guide

**Audience:** Maintainer and future product reviewers

**Authority:** This candidate proposal sits below [`PRODUCT_DIRECTION.md`](../business/PRODUCT_DIRECTION.md)
and the canonical [`DIRECTOR_INTELLIGENCE.md`](../business/DIRECTOR_INTELLIGENCE.md) specification. It does
not change the active backlog order. The [18 October gap assessment](director-intelligence-gap-assessment-2026-10-18.md)
records the implementation comparison, source checks and recommended first PR.

> **Product thesis:** Make Director Intelligence the UK micro-company director's **decision-support cockpit**: what salary, dividends and pension contributions are *plausible*, what they cost, whether they are affordable and compliant, and what cash to reserve. It should explain *why* — without pretending to be payroll, bookkeeping, or statutory filing software.

## 1. Why this matters

Conventional salary/dividend calculators start from a clean annual hypothetical. Real directors arrive mid-year with payroll already running, accounts with different year ends, money in the bank that is not distributable profit, and HMRC entries that may not have been allocated. A good decision-support tool needs to reconcile those distinctions **at the input and output levels**, not merely display a tax total.

This dated idea was prompted by practical UK small-company accounts questions. All monetary examples in this integrated proposal are deliberately **synthetic teaching and acceptance cases**, not verified records of any company or individual. Specific source-case figures were generalised before repository integration; the earlier PR history remains separately accessible.

## 2. Existing strengths — protect, don't rebuild

The implementation already provides annual and monthly modes, Quick Start/Full Inputs, salary/dividend comparisons, salary and profit what-if controls, explicit Your Setup editing, YTD salary/dividends/drawings, employer pensions, tax pots, an NI earnings panel, cash/runway planning, year-end dates, calendar export and optional email results. Extend these owners; do not rebuild them. YTD inputs do not yet constrain the annual strategy search to salary already paid, and cash/runway planning does not verify distributable reserves. **The gap assessment distinguishes existing behaviour from proposed extensions.**

Read **`AGENTS.md`**, **`docs/PROJECT_STATE.md`**, **`docs/BACKLOG.md`**, **`docs/business/PRODUCT_DIRECTION.md`**, **`docs/business/DIRECTOR_INTELLIGENCE.md`**, **`docs/README.md`**, and **`docs/guides/TESTING.md`** in the local repo before implementation. Preserve existing product boundaries, code patterns, accessibility and verification gates. This document is a candidate addition, **not** a replacement for the canonical product-direction document.

## 3. Target user and core jobs

**Primary:** Single-director UK limited-company scenarios, consistent with the canonical specification. These users may use a payroll provider and basic bookkeeping and have other income. Multi-director and household optimisation remain outside scope unless the maintainer explicitly changes that boundary.

The tool should answer clearly:

1. **What does my existing salary really cost my company?** Include employer NIC and tax-year-to-date pay.
2. **Does this pay level normally earn an NI qualifying year?** Show the approximate earnings test but also explain that other NI contributions or credits (for example qualifying Child Benefit credits) may change the personal outcome. Never infer the user's HMRC NI record.
3. **Can I lawfully pay that dividend?** Distributable retained profits are not bank balance.
4. **What can I safely set aside?** Separate forecast Corporation Tax, PAYE/employer NIC, salary payable, working capital and personally spendable amounts.
5. **What can I change from *now*, not retrospectively?** Distinguish next-tax-year planning from the remaining months of an active payroll year.

## 4. Product principles / non-negotiables

- **No double counting:** distinguish profit *before* the salary being varied from accounting profit *after* salary; recognise that salary already paid cannot simply be deducted again.
- **Two clocks:** personal PAYE/dividend year (6 April to 5 April) and company accounting year (for example 1 January to 31 December). Corporation Tax accounting periods cannot exceed twelve months, even where statutory accounts are longer.
- **Realism beats a magic optimum:** show assumptions, trade-offs, editable constraints and conditional recommendations; don't call a strategy universally optimal.
- **Explanations beside values:** source tax rules by tax year; show scenario differences and why results change.
- **Cash ≠ profits ≠ tax:** bank movements, salary expense accruals, earned revenue, tax deductions, PAYE credits and distributable reserves are distinct.
- **Privacy by default:** retain client-side calculation and guarded browser persistence. Preserve the existing explicit email-results action, which sends the chosen inputs to the server for recalculation and delivery. Analytics uses coarse financial buckets and interaction metadata; do not claim that no data ever leaves the browser. Use only synthetic financial examples in public fixtures, screenshots and documents.
- **No statutory claims:** not a substitute for HMRC's NI record, RTI payroll submissions, an accountant's advice on complex circumstances, or CT600/Companies House filing.
- **Scope discipline:** no bank login, HMRC credential storage, self-filing, bookkeeping synchronisation or retrospective payroll edits in the early phases.

## 5. Roadmap — problem, behaviour, proof

### Phase 0 — Verify the existing implementation (documentation/research PR)

The linked assessment completes the initial source/test comparison and browser inspection for
commit `6412b6b9`. Refresh that evidence if the implementation changes before a feature PR.

**Before coding:** inventory current director inputs, tax data versions, calculation functions, validations, telemetry, and unit/E2E tests. Compare actual live and source behaviour to this vision; identify what is already present versus partly present. Confirm the product's existing `docs/business/PRODUCT_DIRECTION.md` and avoid duplicate plans. Identify whether the dashboard's description/instructions inconsistently use "revenue" and "profit". Record source-file paths and acceptance gaps, not speculative defects.

**Deliverable:** reviewed gap map, screenshots (without user data), and a proposed incremental PR sequence. No changed tax arithmetic in this phase.

### Phase 1 — Safe input semantics & understandable output (P0)

**Opportunity A — Select the starting point.** First align instructions with the existing revenue-minus-expenses contract: the input says revenue, while the empty state says profit. A later, approved extension could offer an explicit choice:

- **Turnover and operating expenses:** annual turnover and costs, with a clear declaration about *whether the selected director salary is included*.
- **Profit before director remuneration:** a known profit pool **before** the variable salary, employer NIC and employer pension contributions being modelled.

If a user instead knows **profit after an already-paid salary**, support that only with explicit prior-pay details, or refuse to calculate until the inputs are reconcilable. Add short worked examples and tooltip definitions. Do not silently reinterpret data.

**Opportunity B — Cost waterfall.** Extend the existing breakdown tables and Money Flow panel into a reconciled explanation per scenario: gross revenue or profit baseline → operating costs → director salary → employer NIC → employer pension → illustrative taxable profits/Corporation Tax → possible distributable profit → personal taxes → spendable take-home. Deduct employer pension exactly once and show it separately from spendable cash. This is an illustrative scenario allocation, not evidence of legal dividend capacity. Label conditional steps and omissions.

**Acceptance:** equal underlying business economics entered through both supported input modes produce equal results; never deduct the same payroll expense twice; errors and warnings are accessible and keyboard navigable.

### Phase 2 — Current salary & NI year adviser (P0/P1)

Extend the existing YTD inputs and Your Setup comparison into a separately specified current-year planning mode. Keep the existing annual/monthly toggle for income projection; it is a different distinction. Do not advertise next-tax-year planning before that year's policy is supported. Existing-pay mode would additionally need a supported tax-year choice, pay frequency, paid-to date, director appointment/start timing where relevant, and employer NIC already paid. Show remaining-year scenarios *without rewriting paid months*.

Correct and extend the existing **NI earnings panels** (`PensionGapWarning`, survival guidance and education) with:

- company employer NIC estimate;
- whether pay alone is at, below or above the applicable Lower Earnings Limit (LEL) for the selected tax year;
- explanation that actual NI qualifying years depend on the whole NI record, other employment/self-employment and credits;
- eligibility question about other qualifying credits (e.g. Child Benefit) presented as an information link, **not** a claimed determination;
- special rule for the sole director being the only employee liable for employer NIC and Employment Allowance.

**Illustrative 2026/27 example for validation (standard Category A, full-year director, no EA, no special relief):** £500 × 12 = **£6,000** annual director pay. Secondary Threshold **£5,000**, standard employer rate **15%**, so **£150** illustrative employer NIC before adjustments. LEL **£6,708**; this salary alone is under LEL. This is an arithmetic **fixture for cross-checking with HMRC rules and rounding**, not a verdict on an individual's actual credits or final NIC liability. The tool must account for director annual-basis methods and different commencement, category, and EA cases.

**Acceptance:** already-paid salary is immutable in projections; crossing the LEL doesn't promise a personal qualifying year; changing EA eligibility only changes permitted employer cost; a single-NIC-liable-director company does not silently obtain EA. Reference the official HMRC tax-year rates in code and tests.

### Phase 3 — Dividend affordability & company tax reserve (P1)

Subject to a maintainer scope decision, extend the existing cash/runway inputs with an optional **"Check if I could afford the dividend"** planning panel. Ask for opening distributable reserves, realised post-tax profit estimates, dividends already declared, known prior losses, bank cash, outstanding tax/payroll/supplier liabilities and a chosen operating cash buffer. Define which losses and distributions are already included in the opening reserve to prevent subtracting them twice. Show two separately named results:

- **Distributable profit headroom (indicative)** based on available accounts and legal constraints;
- **Cash affordability** after liabilities and reserve assumptions.

If reserves cannot be evidenced, prominently show: **"Dividend legality not verified — check up-to-date company accounts before declaring a dividend."** Do not show a tax-efficient dividend strategy as automatically lawful/affordable.

**Acceptance:** example with £5,000 bank cash but only £1,000 distributable profit cannot be presented as £5,000 dividend capacity. A tax credit shown as "unallocated" must not be presented as cash paid/refunded or set off against liabilities automatically.

### Phase 4 — Optional accounting-calendar context (P2)

Extend the existing year-end summary, Key Dates panel and `.ics` export to explain personal tax years versus company accounting periods. For accounts longer than 12 months, explain HMRC's requirement for separate Company Tax Returns covering the accounting periods. Existing dates are projections from a month/day and the current clock, not a validated filing schedule. Validate period dates and statutory rules before broadening deadline claims. No actual tax filing or period creation.

## 6. Interface direction

A proposed user journey, not a design replacement:

1. **Company position:** "I have turnover and costs" or "I know my pre-director-pay profit"; show why the difference matters.
2. **Director position:** "Starting fresh" or "Already running payroll"; defaults for a sole-director company without silently assuming employment allowance.
3. **Compare:** simple salary/dividend/pension scenarios with company cost, tax reserve, personal take-home and NI interpretation.
4. **Reality checks:** dividend affordability, unresolved tax credits and pay-year/accounting-year differences; make assumptions expandable.
5. **Actionable summary:** "Questions for your payroll provider/accountant" and links to HMRC official records. Reuse the optional email and calendar exports; decide separately whether a redacted downloadable explanation adds value. Existing results emails include financial inputs and are not redacted exports.

Plain labels preferred: "Company turnover", "Business costs excluding the salary being compared", "Pay already received this tax year", "Existing retained profits", "Company money to keep aside", "Income Tax residence". Do not infer tax residence from a Scottish company registration.

## 7. Proposed test matrix (independent oracles required)

| Fixture | Required behaviour |
| --- | --- |
| The same underlying turnover/cost/pay situation entered via two pathways | Identical financial outputs; no double-counted salary |
| Full-year director paid £500/month in 2026/27 | Cross-check annual NIC arithmetic against HMRC; LEL warning without qualifying-year guarantee |
| Single director, only worker liable for secondary Class 1 NIC | Employment Allowance cannot be assumed eligible |
| Director already paid six months of salary | Remaining-year projections preserve previous salary and HMRC periods |
| Scottish-registered company, England-resident individual | Personal income tax bands determined by residency, not company registration |
| First statutory accounts span >12 months | Clearly warn about CT600 accounting-period segmentation |
| £5,000 in bank, £1,000 distributable reserves | Can't present £5,000 as a legally available dividend |
| Unallocated £50 HMRC NIC credit | Keep as an unresolved account entry; cannot count as bank cash, confirmed recoverable funds or an agreed offset |
| Employer pension vs dividend scenario | Present pension savings separately from immediately spendable personal cash |
| Unknown reserves or changed tax rules | Explain uncertainty; do not fabricate a definite optimum |

For each fixture: independent rule-based expected values; boundary and rounding cases; Jest unit coverage of pure tax functions; state/component tests for input mapping; Playwright E2E for desktop/mobile, keyboard and screen readers where applicable. Snapshot tests alone are not enough. Confirm with current HMRC source pages before changing tax-year constants.

## 8. Delivery sequence for Jarryd

1. **Discover and document** (this candidate change): map existing implementation and prioritise verified gaps without changing the canonical roadmap.
2. **Clarify the existing contract** (recommended first implementation PR, after approval): align revenue/profit instructions and annual-projection limits; qualify existing NI-record claims. No new arithmetic or input mode is needed for this slice.
3. **Input modes and reconciled output** (separate approved slices): define pre/post-remuneration treatment and extend the existing breakdowns without double counting.
4. **Existing-pay planning** (separately specified and verified): constrain scenarios using already-paid salary, timing and director NI method; extend existing LEL/EA explanations.
5. **Dividend headroom and accounting-calendar context** (later, scope-gated): retain the existing cash/runway and export features; add only evidence-backed extensions.

These are candidate Director slices, not a replacement for the active pension-method,
transparent-result and independent-verification sequence in `docs/PROJECT_STATE.md`.

Every PR should cite source data and relevant HMRC guidance, identify decision boundaries, pass existing `bun run check:repo`, targeted/full tests as appropriate, and `bun run build:ci` before release. Follow `AGENTS.md` and `docs/guides/TESTING.md` for the project's actual gates. Don't modify env handling, third-party integrations or deployment settings merely to implement this proposal.

## 9. Explicit product decisions to make

- Keep the established single-director audience. Any multi-director optimisation would require an explicit change to the canonical scope.
- Should affordability be labelled a **planning check** only, never a formal dividend-approval calculation?
- Are source-rate updates manually curated with test evidence, or automatically pulled from a verified official dataset?
- Retain browser persistence and explicit email delivery. Any new cloud scenario storage needs a separate product decision; keep raw salary, payroll and household figures out of analytics.
- What is the smallest feature Jarryd wants to ship in the next release, without broadening PayeTax into bookkeeping or payroll software?

## 10. Official source anchors (validate current status during implementation)

- HMRC PAYE and NIC thresholds 2026/27: https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027
- HMRC single-director Employment Allowance guidance: https://www.gov.uk/government/publications/employment-allowance-more-detailed-guidance/single-director-companies-and-employment-allowance-further-employer-guidance
- HMRC money taken out of a limited company: https://www.gov.uk/running-a-limited-company/taking-money-out-of-a-limited-company
- HMRC company Corporation Tax accounting periods: https://www.gov.uk/corporation-tax-accounting-period
- National Insurance credits: https://www.gov.uk/national-insurance-credits/eligibility
- Director annual and alternative NI methods: https://www.gov.uk/employee-directors
- Director NI technical guidance (CA44): https://www.gov.uk/government/publications/ca44-national-insurance-for-company-directors
- Personal NI record: https://www.gov.uk/check-national-insurance-record
- Scottish taxpayer residence: https://www.gov.uk/scottish-income-tax/who-pays
- Repo's project/product governance: `AGENTS.md`, `docs/README.md`, `docs/business/PRODUCT_DIRECTION.md`, `docs/guides/TESTING.md`.

**This document is deliberately a vision + phased specification, not a claim that the public code is defective or that every listed feature is currently absent.** A repository audit must establish the actual gap and prioritise only work not already implemented.

The source anchors above were reachable during the 18 October 2026 review. The rates page
supports the illustrative full-year Category A £150 employer-NI example and £6,708 LEL;
these are dated verification examples, not an additional policy table. Refresh sources before
implementation, including CA44 for appointment timing and annual-method rounding.
