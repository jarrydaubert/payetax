# PayeTax Project State

Read this first. It records the current product, architecture, evidence model and next work. Read
[`BACKLOG.md`](BACKLOG.md) next for unresolved items. Use linked dated reports and pull requests
for the evidence behind this summary.

This document describes current truth, not release history. Code and tests remain authoritative
for implemented behaviour. Canonical policy data and current primary sources remain authoritative
for statutory facts.

## Product

PayeTax is an independent UK PAYE calculator and tax-tool R&D project. Its ambition is to be the
most trustworthy independent implementation of UK PAYE calculations on the web.

Trust has four separate layers:

1. **Correctness:** statutory rules, thresholds, rates, bases and rounding are implemented as
   published.
2. **Explainability:** a user can see which policy, inputs, code basis and deductions produced a
   result.
3. **Independent verification:** expected results are derived without asking the production
   engine for its own answers.
4. **Discoverability:** people and search systems can find the useful, correct surfaces.

Passing one layer does not prove another. A discoverable page can be wrong; a correct engine can
be opaque; a self-consistent generated regression fixture is not independent proof.

PayeTax is not an SEO-content factory. Keep the calculator, useful tools, Director Intelligence,
the retained blog, email results, PWA, analytics and operational controls. Do not create page
families, competitor-intent content or generic articles merely to capture queries. Published
content must earn its place through user value, evidence and maintainable accuracy.

## Main calculator: current state and agreed direction

Current verified merged `main` is `e3f857397e65a4aef79a47889641756bdaad5bfe`, after
[#136](https://github.com/jarrydaubert/payetax/pull/136) (`534b8eff`),
[#127](https://github.com/jarrydaubert/payetax/pull/127) (`51aaf145`) and
[#137](https://github.com/jarrydaubert/payetax/pull/137) (`e3f85739`) merged on 27 October 2026.
The last independently recorded production baseline remains `44d8d02` (#125/#133/#134 included).
This reconciliation verifies repository state, not a new production deployment.

The desktop implementation from #135 remains: five summary cards, direct table access, readable
seven-period fit when enabled, accessible forward/reverse keyboard navigation below the fixed
header, and intentional scrolling for the wider What-if table. The earlier #128 direction to
remove the desktop cards and introduce a separate homepage comparison mode was superseded;
#135's five desktop cards remain the agreed design. #136 supersedes the older
all-seven-default evidence: Yearly, Monthly, Weekly, Daily and Hourly start selected on desktop
and mobile; 4-Weekly and Fortnightly are available but unchecked. Resizing preserves selection and
the current calculation. The Tax Code input is optional, with a region-aware placeholder and
tooltip; a blank stays blank and uses policy-derived allowances.

#127 delivered MC-01, MC-02 and MC-03's integrity scope:

- Amount entry preserves pounds/pence through focus, typing and blur; rejected text stays visible
  with a field error rather than being silently coerced.
- Pension-unit changes cannot silently reinterpret amounts. Invalid legacy saved percentages
  are associated with the pension field, block Calculate and can be corrected without clearing storage.
- Calculation-input edits invalidate results and require explicit Calculate; display-only period
  changes reuse the same calculation. Email, already-open dialogs and result actions cannot use a
  stale or invalid snapshot. A current pension suggestion edits input only and still needs Calculate.

#134/MC-09 remains an explicit #128 preservation requirement: add the suggested annual pension
amount to the existing pension (whether entered in £ or %), convert the total from annual to the
selected pay period and round up to the penny before storing it. Applying edits input only and
requires Calculate again. Preserve `CalculatorContainer.pensionSuggestion.test.tsx` and
`pensionOptimizer.test.ts` regressions, including parser/storage validity and exact-penny cases.

The full [regression acceptance contracts](reports/project-documentation-reconciliation-2026-10-27.md#retained-127-regression-acceptance-criteria)
remain requirements for #128. The dated MC-01 [input](reports/mc-01-webkit-monetary-input-2026-10-22.md)
and [touch-pan](reports/mc-01-touch-pan-follow-up-2026-10-23.md) reports retain their evidence limits:
native WebKit pan, physical-device keyboards, OS clipboard and native paste remain unverified.
Mobile Safari lost Calculate taps, desktop WebKit missed pension-suggestion clicks and the mobile
Calculate focus/header defect remain open under the existing [Verification](BACKLOG.md#verification)
and MC-05 owners. Keyboard-driven integrity passes do not close pointer delivery defects.

[#128](https://github.com/jarrydaubert/payetax/pull/128), head `b4f10087`, remains open and unmerged.
It must be reconciled against latest main, not treated as current behaviour or reopened as a new
redesign. A read-only merge probe against `e3f85739` finds 16 conflicted paths; the
[checkpoint](reports/project-documentation-reconciliation-2026-10-27.md#128-reconciliation-checkpoint)
records scope and preservation requirements, including silent deletions of
`ResultsSummaryCards.tsx`, its test and `ResultCard.test.tsx`. Preserve their five-card desktop
functionality and meaningful regression coverage in retained or equivalent replacement code;
automatic deletion is not evidence that the functionality has been replaced. Its earlier tests
certify its recorded ref, not a reconciled candidate. Preserve #136 defaults, #127 input/result/email contracts and #137 privacy/
consent boundaries, along with #135 desktop behaviour. Reconcile both project documents rather
than accepting stale branch versions wholesale; retain #128's dated implementation report.

The remaining calculator work is MC-03's accessible edited-state presentation, MC-04's submitted
pay-period rule and MC-05's mobile payslip, direct Edit and two-period comparison. The fifth card
still needs honest rounded next-£100 payroll wording, and the existing mobile focus issue remains
open. MC-06/07 are smaller follow-ups; MC-08 owns the named residual test-portfolio gaps.
The **DI-05 interim email guard precedes #128**; its full scenario/export fix keeps its later
Director position. Completing the entire Director queue is not a prerequisite for the calculator.

Hero removal remains accepted direction subject to the [search protection gate](BACKLOG.md#search-and-discoverability):
essential live evidence and technical safeguards before the first deployment containing it, then
measurement against predeclared windows and a mitigation trigger. Neither #128 nor the privacy
work completes the pension-method or transparent-result Foundation work. The backlog owns the
unchanged detailed delivery order; the [dated reconciliations](reports/project-documentation-reconciliation-2026-10-27.md)
preserve review history and superseded decisions.

## Privacy and supporting-page state

#137 minimises financial telemetry at its sources and shared outbound boundaries, sanitises URL
credentials/queries/fragments, and preserves useful non-financial error references, boundary/router
tags, clean request paths, completion counts and technical diagnostics. GA4 remains opt-in with the
existing withdrawal/expiry/cross-tab machinery. Only the two registered results-email campaign
triplets are retained; arbitrary campaign values and click IDs are excluded. The privacy policy,
storage inventory, PAYE email notice and `llms.txt` storage wording describe actual processing.
The final test-only fix exercises both Vercel providers through their real privacy callbacks;
Jest coverage thresholds were preserved. The [implementation report](reports/privacy-telemetry-minimisation-2026-10-27.md)
and [27 October reconciliation](reports/project-documentation-reconciliation-2026-10-27.md)
record the dated checks and limitations; their historical pending-review wording is not current status.
The reconciliation links final-head hosted CI separately from maintainer-reported local tests and
Claude APPROVE; no formal GitHub review submission was found. The historical implementation
report remains unchanged.

Remembering is still automatic. The 30-day PAYE/seven-day Director restoration guards do not
promise physical deletion of browser storage. Explicit opt-in (off by default), clear-data,
legacy saved-data and cross-tab erasure behaviour remain follow-ups, not implemented controls.
The Director shell still lacks accessible privacy/consent entry points. Provider retention/IP
settings and historical telemetry deletion are unverified; code changes do not erase vendor history.
Remaining Director email/blog privacy wording and the other documented telemetry trade-offs remain open.

The complete [independent supporting-pages audit](reports/payetax-supporting-pages-audit-2026-10-27.md)
is preserved unchanged at its `534b8eff`/live-site snapshot. Its former financial-collection and
storage-disclosure findings must be read with #137's resolution; Compliance/source claims,
modelling limits, Offline content, privacy accessibility and the other unresolved findings have
single owners in [BACKLOG.md](BACKLOG.md). Opinions and legal/provider uncertainties remain
labelled as such. The audit's ordering does not replace the agreed correctness/calculator sequence,
and privacy follow-ups are not automatically promoted above it.

## Architecture north star

> One effective-dated policy model, one policy selector, one pay-basis derivation, one rule owner
> per deduction, one supported route to each statutory calculation, one transparent result, and
> one compact independent set of full-calculation cases.

The established ownership direction is:

| Concern | Current owner and state |
| --- | --- |
| Published policy | `src/constants/taxRates.ts` holds typed annual rUK, Scottish and ancillary policy. Mid-year employee-NI changes are effective-dated data. Do not copy these tables into this document. |
| Policy selection | `selectTaxPolicy()` in `src/lib/tax/taxPolicy.ts` selects the supported year and hands consumers the rUK and Scottish records together. |
| Pay basis | `derivePayePayBasis()` in `src/lib/tax/payePayBasis.ts` owns annual/monthly employment, non-employment, adjusted-net-income, NI and Student Loan bases. The current pension input is explicitly modelled there as salary sacrifice; other pension methods remain open work. |
| Income Tax | Shared rUK and Scottish band slicers own annual progressive band allocation. `src/lib/tax/month1IncomeTax.ts` owns HMRC Month 1 formula selection, exact accrued thresholds, threshold tax and final-penny truncation. The main PAYE and Director Intelligence routes may orchestrate different statutory bases, but consumers must not reimplement either mechanic. |
| Tax codes and Tables A | `src/lib/tax/taxCode.ts` owns accepted formats, regional prefixes, non-cumulative markers, code-derived amounts, K adjustments and Tables A period adjustments. `src/lib/tax/taxCodeDecoder.ts` derives explanations from that model. |
| National Insurance | `src/lib/tax/nationalInsurance.ts` owns Class 1 slicing and effective-date selection. Payroll uses pay-period mechanics; `employeeNI.ts` deliberately exposes the separate annual earnings-period basis used for directors. |
| Student Loans | `src/lib/tax/studentLoan.ts` is the shared repayment mechanic, with employment-specific pay bases supplied by the PAYE orchestration. |
| Periods and money | `src/lib/periodCalculator.ts` owns general period conversion and `src/lib/tax/utils.ts` owns general penny rounding and shared threshold conversion. Month 1 Income Tax's distinct whole-pound, four-decimal and final-penny rules live with that statutory routine. |
| Public tax-domain boundary | Application code should consume `@/lib/tax`. `check:tax-imports` prevents new direct-import debt while the existing baseline is reduced. |
| Result assembly | `TaxCalculationResults` exposes deductions and tax-code calculation basis. Selected-policy, pay-basis and pension-method transparency are not yet complete. |

Material Foundation work already delivered includes shared Scottish and rUK band mechanics,
one regional Month 1 PAYE Income Tax routine,
unified NI and Student Loan mechanics, one tax-code grammar, retirement of shadow calculation
routes, shared period conversion and rounding, the policy selector, the effective-dated policy
model, year-correct Director policy selection, and shared PAYE pay-basis derivation. Preserve
these owners. Do not replace them with a generic rules engine, a test-only calculator or a second
production calculator.

The detailed ownership evidence is in the
[21 July tax-domain ownership audit](reports/paye-tax-domain-ownership-audit-2026-07-21.md).
Open residual work belongs in [`BACKLOG.md`](BACKLOG.md), not in a second architecture plan.

## Tax-code state

The resolved model after [PR #111](https://github.com/jarrydaubert/payetax/pull/111) and
[PR #112](https://github.com/jarrydaubert/payetax/pull/112) is:

- a valid supplied HMRC code is the authoritative PAYE coding instruction for that employment or
  pension;
- the policy-derived amount is calculated independently for comparison and disclosure, but is
  not applied on top of a valid supplied code;
- a blank code uses the policy-derived estimate, including the Personal Allowance taper;
- explicit numeric codes and policy-derived numeric amounts use HMRC Tables A consistently;
- blank-code taper coverage is pinned by independently derived JSON fixtures, not by renaming an
  explicit-code case;
- supported formats include rUK, Scottish and Welsh prefixes; `L`, `M`, `N` and `T`; K1–K9999;
  `BR`, current D/SD/CD rates, `0T` and `NT`; and valid `W1`, `M1`, `X` and `NONCUM` markers;
- HMRC's seven-character software boundary, including `999999T`, is supported while longer or
  malformed forms are rejected;
- non-cumulative codes carry a visible steady-pay projection caveat rather than pretending to
  reproduce a particular payslip's cumulative history;
- the calculation basis appears in on-screen results and text/HTML result emails;
- the decoder keeps its canonical URL, tool-first interaction, HMRC checking path and practical
  next steps. Unsupported calculator query prefill was removed.

PR #112 received independent Claude approval after the reviewer re-derived the disputed points
against HMRC primary sources. The durable claim-by-claim evidence, including accepted and rejected
review findings, is in the
[23 August tax-code correctness report](reports/tax-code-correctness-follow-up-2026-08-23.md).
The separate public tax-code article is not covered by that resolution and remains in the backlog.

## PAYE projection state

The employee calculator is a steady-pay Month 1 projection, not a reconstruction of an employee's
cumulative payroll history. Its Income Tax path now follows HMRC's computerised PAYE routines
v24.0 consistently for rUK, Welsh and Scottish codes:

- `taxCode.ts` supplies the Month 1 Tables A free-pay or K-code additional-pay amount;
- taxable pay `U` retains pence for the Cvalue/SCvalue income test;
- after formula selection, taxable pay is rounded down to whole-pound `T`;
- Cvalue/SCvalue is used only to select the formula; the formula uses the exact accrued threshold
  and exact accrued threshold tax, each carried to four decimal places without correction;
- the calculated tax is carried to four decimal places and finally rounded down to the penny for
  every regional regime.

The primary specification is HMRC
[PAYE tax table routines v24.0](https://www.gov.uk/government/publications/payroll-technical-specifications-income-tax),
especially definitions 9–11.1 and paragraphs 4.4.3–4.4.4. Independent tests pin the rounded-up
selection boundary, exact-threshold calculation, Scottish final penny and a binary floating-point
case whose exact £4.60 result must remain £4.60.

## Verification model

The three verification layers have different jobs.

### 1. Independent full-calculation fixtures

JSON suites under `src/test/payeVerificationFixtures/` contain hand-derived or independently
derived expected results anchored to official sources. They are the statutory correctness oracle
for representative full-calculation interactions.

Never update these expectations by copying `calculateTax()` output, canonical policy objects or
generated golden-master values. A production change that disagrees with a fixture must be
reconciled against the fixture derivation and primary evidence before either side changes.

### 2. TypeScript rule and boundary tests

Tests beside the tax-domain modules pin mechanics, invariants, validation, band edges, rounding,
regional behaviour and cross-route consistency. They can be independently derived, but their main
role is precise rule and boundary coverage rather than a huge full-calculation matrix.

### 3. Generated golden masters and browser E2E

The committed golden-master fixture is generated from canonical policy plus the production engine.
Playwright uses it to catch browser, input, rendering, extraction and presentation regression. It
can prove that the UI still agrees with the engine. It can never prove that the engine is legally
correct.

Coverage is strong and representative, especially for current-year PAYE, tax codes, Scottish
rates, NI bases, Student Loans and high-risk interactions. It is not exhaustive proof of every
supported year, band edge, code, income composition or pension method. Year/boundary coverage,
per-scenario provenance and the final balance of the fixture portfolio remain open work.

## Correctness-critical review workflow

Use this gate for statutory calculations, financial guidance, security/privacy, important
indexing architecture and similarly consequential work:

> primary evidence → implementation → deterministic validation → independent external-model
> review → reconcile disagreements against primary evidence and code → fix → re-review where
> material → merge → encode discoveries into tests and dated reports

External-model agreement is not proof. When reviewers disagree, the primary source, current code
and reproducible arithmetic decide. Routine low-risk documentation, styling and maintenance work
does not need dual-model ceremony.

## Search and discoverability state

The durable Search Console snapshot is the
[23 August search-discoverability evidence audit](reports/search-discoverability-evidence-audit-2026-08-23.md).
Its observations were manually supplied and are dated; causal statements remain inferences.

Summary evidence for the latest three-month view was 660 clicks, 180,000 impressions, 0.4% CTR
and average position 10.8. The £40k, £60k and £70k pages had genuine page-one visibility at average
positions 6.7, 6.8 and 8.0. The Scottish calculator produced 242 clicks from 8,979 impressions
(2.7% CTR), while `scotland v england income tax calculator` showed 15.8% CTR at position 3.9.

The durable conclusions are:

- there is no evidence of a sitewide crawl or indexing crisis;
- salary pages have real visibility and must not be consolidated, deleted or migrated on generic
  SEO assumptions;
- the Scottish calculator is the strongest differentiated organic surface and has the broadest
  contextual internal-link footprint;
- the £70k page is the current answer-first, evidence-first editorial reference pattern;
- the fall from 121 to 36 reported indexed URLs occurred while impressions rose from 593 to 4,184,
  so the raw indexed-page decline was not evidence of declining visibility;
- the beginner guide has weak deliberate prominence, but no confirmed technical indexing blocker:
  it is canonical, indexable, in the sitemap and linked through listings/related articles; Google
  had not yet stored the 29 July rewrite when the evidence was captured;
- a small number of deliberate, contextual inbound links to the beginner guide remains justified
  active work, but another content overhaul stays trigger-gated until Google has recrawled the
  29 July rewrite and matched page/query evidence supports it; the link slice does not outrank the
  active correctness sequence below;
- retired competitor-intent routes have no current internal links and should not change without
  new Search Console evidence;
- PR #109 closed the highest-risk current-guidance defects; PR #110 closed the deterministic
  sitemap, redirect-hop, `llms.txt`, 404-metadata and SEO-test hygiene issues.

Wait for recrawl/reassessment or matched query/page exports before inferring cannibalisation,
crawl-budget failure or the need for another broad search change.

## High-value organic surfaces

The current reconciled page-by-page status is recorded in the
[23 August high-value landing-page audit](reports/high-value-organic-landing-pages-audit-2026-08-23.md).
In short:

- tax-code decoder correctness is materially resolved by PRs #111/#112;
- protect the £70k article unless new evidence identifies a concrete defect;
- the Scottish calculator and Scottish-vs-English comparison article now share the canonical
  annual Income Tax comparison model; the article presents current 2026/27 bands, the independently
  verified £33,493 crossover, reproduced examples and dated primary sources;
- the £40k, £60k and £100k pages now use qualified 2026/27 PAYE estimates, independently derived
  payroll fixtures, current primary sources and explicit salary-sacrifice assumptions; their URLs
  remain unchanged;
- FAQ extraction is constrained to deliberate FAQ sections, so bold labels elsewhere no longer
  become malformed FAQ schema.

## Where to resume

Resume in this order unless new primary evidence changes the risk:

1. **Explicit pension-method Foundation slice.** Represent salary sacrifice, net pay and relief at
   source explicitly, or narrow the product contract visibly and consistently.
2. **Transparent-result Foundation work.** Expose selected policy, calculation basis, relevant pay
   bases, pension method and deductions without making consumers reconstruct them.
3. **Independent fixture/test-portfolio completion and Foundation reconciliation.** Widen year and
   boundary coverage, strengthen per-scenario provenance, finish the documented portfolio split,
   then remove completed Foundation rows from the backlog.

**Director Intelligence correctness exceptions.** The October 2026 Director audits verified
defects that silently alter inputs or show wrong money figures, deadlines or statutory rates. They
are listed under the backlog's
[urgent correctness exceptions](BACKLOG.md#urgent-correctness-exceptions). Under the backlog's first
working rule, they may be fixed as small independent slices between the items above. Director
currency-input preservation and minimal stale-result protection have landed, with one shared
currency parser in `src/lib/currencyInput.ts`. The main calculator's amount fields now reuse that
parser: pence are kept, rejected text is shown with its error and clears results until corrected.
With #136/#127/#137 merged, the remaining calculator queue follows the
[backlog's unchanged order](BACKLOG.md#active):

1. the interim DI-05 email guard;
2. reconciliation of existing #128 against latest main, followed by its mobile payslip and
   remaining redesign acceptance, preserving the merged desktop, integrity and privacy contracts.

MC-03's presentation scope and MC-04/05 may proceed alongside
Director urgent slices without pre-empting a ready, verified wrong-money fix; completing the entire
Director queue is not a main-calculator prerequisite. Keep the Director sequence and Foundation
insertion points, including Corporation Tax deadlines. The desktop/mobile acceptance changes and
the search audit's pre-deployment gate precede release of the changed homepage; finish observational
measurement afterward. On #128's reconciliation, preserve the backlog's decisions and open MC
scope, reconcile superseded branch documentation and retain distinct dated implementation evidence;
do not restore premature completion claims or a parallel queue. The backlog owns the detailed order.
Reuse existing tax-domain owners; an exception that needs a Foundation change waits for, or is
folded into, that item. Director design and refactoring proposals remain parked.

Supporting-page and additional privacy follow-ups do not automatically outrank this agreed order.
Optional polish does not outrank these correctness items.

## Protect / do not disturb

- Do not migrate or consolidate retained salary-page URLs without new page/query evidence.
- Do not rewrite the £70k article merely to improve a generic SEO or word-count score.
- Preserve the Scottish calculator's differentiated Income Tax comparison purpose unless an
  explicit product decision changes it.
- Do not cite generated golden masters as independent correctness proof.
- Do not duplicate statutory rates, thresholds or effective dates here; link to canonical policy
  and primary sources.
- Do not remove retired-route redirects, mass-delete URLs, mass-`noindex` pages or optimise crawl
  budget without evidence tied to retained canonical pages.
