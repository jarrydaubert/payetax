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
| Income Tax | Shared rUK and Scottish band slicers own progressive band allocation. The main PAYE and Director Intelligence routes may orchestrate different statutory bases, but consumers must not reimplement band maths. |
| Tax codes and Tables A | `src/lib/tax/taxCode.ts` owns accepted formats, regional prefixes, non-cumulative markers, code-derived amounts, K adjustments and Tables A period adjustments. `src/lib/tax/taxCodeDecoder.ts` derives explanations from that model. |
| National Insurance | `src/lib/tax/nationalInsurance.ts` owns Class 1 slicing and effective-date selection. Payroll uses pay-period mechanics; `employeeNI.ts` deliberately exposes the separate annual earnings-period basis used for directors. |
| Student Loans | `src/lib/tax/studentLoan.ts` is the shared repayment mechanic, with employment-specific pay bases supplied by the PAYE orchestration. |
| Periods and money | `src/lib/periodCalculator.ts` owns period conversion; `src/lib/tax/utils.ts` owns penny rounding and shared threshold conversion. Statutory ceil/floor ownership still needs a final focused pass. |
| Public tax-domain boundary | Application code should consume `@/lib/tax`. `check:tax-imports` prevents new direct-import debt while the existing baseline is reduced. |
| Result assembly | `TaxCalculationResults` exposes deductions and tax-code calculation basis. Selected-policy, pay-basis and pension-method transparency are not yet complete. |

Material Foundation work already delivered includes shared Scottish and rUK band mechanics,
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
- the Scottish calculator and Scottish-vs-English comparison are the first current-year
  correctness slice;
- the £40k, £60k and £100k pages need evidence-first factual repair while keeping their URLs;
- FAQ extraction can still emit malformed schema by treating bold labels outside the real FAQ
  section as questions.

## Where to resume

Resume in this order unless new primary evidence changes the risk:

1. **Scottish calculator and Scottish comparison correctness.** Fix input validation and scope/
   source transparency in the tool; update and independently verify the comparison article for
   2026/27; fix the FAQ extraction regression with it.
2. **£40k, £60k and £100k salary-page correctness.** Use the £70k page's qualified, answer-first
   pattern; independently verify displayed PAYE/loan figures; remove unsupported lifestyle,
   prevalence, savings and mortgage claims; state pension method assumptions.
3. **Explicit pension-method Foundation slice.** Represent salary sacrifice, net pay and relief at
   source explicitly, or narrow the product contract visibly and consistently.
4. **Transparent-result Foundation work.** Expose selected policy, calculation basis, relevant pay
   bases, pension method and deductions without making consumers reconstruct them.
5. **Independent fixture/test-portfolio completion and Foundation reconciliation.** Widen year and
   boundary coverage, strengthen per-scenario provenance, finish the documented portfolio split,
   then remove completed Foundation rows from the backlog.

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
