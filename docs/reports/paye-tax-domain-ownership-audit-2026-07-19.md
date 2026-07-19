# PayeTax Tax-Domain Ownership Audit — 2026-07-19

Dated evidence report. Snapshot of `origin/main` at `d15ff79c` (includes PR #82 and PR #83).
Method: ownership conclusions are based on actual import and execution paths (grep of
non-test importers, headless execution of modules), not on comments claiming canonicity.
No behaviour, rates, or content were changed by this audit.

## 1. The chain today

```
official sources (GOV.UK, gov.scot, SRR, legislation)
  → TAX_YEAR_SOURCES + sources.ts ................ source metadata (partly wrong)
  → taxRates.ts .................................. annual policy (canonical, mixed concerns)
  → taxCalculator.ts ............................. month-1 mechanics + tax-code parsing
  → lib/tax/* .................................... second (annual-method) mechanics family
  → calculatorStore → main calculator UI ......... engine consumers
  → tool clients ................................. two re-implement math, one consumes helpers
  → crawlableTaxFacts / api/tax-rates / llms.txt / StructuredData ... derived projections
  → blog MDX ..................................... manually copied numbers
  → src/test/payeVerificationFixtures ............ independent evidence (with a known failure mode)
  → e2e golden master ............................ engine-generated anchor (NOT independent)
```

## 2. Module classification

| Module | Classification | Evidence |
|---|---|---|
| `src/constants/taxRates.ts` | **Canonical annual policy** + source metadata + some mechanics constants | ~69 import statements across 66 non-test files; every rate/threshold in the app resolves here. Also holds `TAX_YEAR_SOURCES`, `PERIOD_CONVERSION_FACTORS`, `PAYROLL_PERIOD_THRESHOLDS`, dividend/CT rates — four concerns in one 860-line file |
| `src/constants/sources.ts` | Canonical source metadata, **partly misleading** | `REVENUE_SCOTLAND_INCOME_TAX_URL` cited as the Scottish income tax authority on homepage FAQ, compliance page, llms.txt — Revenue Scotland does not administer income tax |
| `src/constants/freshness.ts` | Derived | Reads `TAX_YEAR_SOURCES.verifiedOn` |
| `src/lib/taxCalculator.ts` | **Stable calculation mechanics** (month-1 payroll model) + **tax-code interpretation** (`parseTaxCode`, `resolveBandOverride`) | Sole engine for the main calculator, salary comparison, emails, crawlable facts, marginal-rate finite difference, e2e golden master |
| `calculateNIContributions`, `calculateIncomeTaxFromBands`, `calculateStudentLoanRepayments` (exported from taxCalculator.ts) | **Shadow helpers** | Exported "for testing"; `calculateTax` re-implements the same logic inline and never calls them. Helper tests pass while the real path could drift |
| `src/lib/tax/incomeTax.ts`, `employeeNI.ts`, `employerNI.ts`, `studentLoan.ts`, `personalAllowance.ts`, `dividendTax.ts`, `marriageAllowance.ts`, `corporationTax.ts` | **Duplicate implementation family** (annual method) — canonical only for the director vertical | Consumed by `directorCalculator.ts`, `strategyComparison.ts`, `warnings.ts`, and the marriage-allowance tool. Same policy data, independently re-implemented band/NI/SL iteration |
| `src/lib/tax/payrollPeriodDeductions.ts` | **Shadow mechanics** (third PAYE implementation, cumulative) | Only importer is `taxCalculator.hmrcPayrollFixtures.test.ts` — production never executes it |
| `src/lib/taxCodeDecoder.ts` | **Second tax-code interpretation path** | Own grammar + meanings for the decoder tool; kept consistent with `parseTaxCode` today only by tests/fixtures added in PR #82 |
| `TaxCodeSchema` (`validation.ts`) and `TAX_CODE_EDIT_PATTERN` (`calculatorStore.ts`) | Third and fourth partial reinterpretations of tax-code grammar | PR #82 review showed `TaxCodeSchema` has no runtime consumer; the store edit-pattern is the only live gate |
| `ScottishTaxCalculatorClient.tsx` | **Duplicate implementation** (annual band math + own PA taper) + derived display | Local `calculateTax()` function; band table now uses the shared taper mapping |
| `NICalculatorClient.tsx` | **Duplicate implementation** (own NI band math) | Inline employee+employer NI |
| `MarriageAllowanceClient.tsx` | Correct helper consumer | Uses `lib/tax/marriageAllowance` |
| `src/lib/crawlableTaxFacts.ts` | **Derived public projection** (reference implementation) | Renders bands/examples from `taxRates.ts` + `calculateTax` + `taxableThresholdToTotalIncome` |
| `src/app/api/tax-rates/route.ts` | Derived projection | Serialises `TAX_RATES` + crawlable examples |
| `src/app/llms.txt/route.ts` | Derived labels + source links | Carries the Revenue Scotland misattribution |
| `StructuredData.tsx` (Dataset JSON-LD) | Derived projection | Reads `TAX_RATES` directly (not via crawlableTaxFacts — two projection paths for similar facts) |
| `chartUtils.estimateMarginalRate` | Duplicate band interpretation (display) | Own band loop; shows 45% rather than the ~67.5% Scottish/60% rUK effective rate inside the £100k taper (PR #83 review note) |
| `calculatorMarginalTax.ts` | Derived (finite difference over `calculateTax`) | Correct consumption pattern |
| `pensionOptimizer.ts` | Derived from policy data, **own interpretation** | Hardcodes "always 60%" trap rate (40%+20% rUK assumption; wrong for Scottish taxpayers) |
| `salaryComparison.ts`, email payload builders, `SalaryQuickResults`, `TaxRatesOverview`, results UI | Derived engine consumers | Import `calculateTax`/`taxRates` |
| `periodCalculator.ts` | Stable mechanics (period conversion) | Factors live in `taxRates.ts`, logic here — split ownership |
| `src/lib/taxRateDescriptions.ts` | **Obsolete/shadow, wrong output** | Zero production consumers; executing it prints "2000% basic rate rate … National Insurance is 800%" (`band.rate * 100` on an already-percent value). Its own test exercises it |
| `compliancePageData.ts` | **Manually written trust claims, partly misleading** | "Historical rates back to 2020/21" (data starts 2023-24), "within 24 hours/same day", "verified against Revenue Scotland", ITTOIA 2005 citation for rates |
| `content/blog/*.mdx` (tax tables/examples) | **Manually copied content** | Detail in §5/Q4 |
| `src/test/payeVerification.ts` + fixtures | **Independent verification evidence** | 5 suites / 26 scenarios; independence failure mode documented in Q7 |
| `e2e/fixtures/golden-tax-cases-*.json` | Engine-generated regression anchor — **not independent** | Generated by `generate-golden-master.ts` from `calculateTax`; locks behaviour, cannot detect statutory error |
| `scripts/check-rate-freshness.ts` | Existing CI control | Fails when `verifiedOn` goes stale |
| `scripts/audit-blog-content.ts` | Partial content control (non-blocking) | Inventory/refresh queue, no fact checking |

## 3. Answers

**Q1 — What genuinely acts as the source of truth today?**
`src/constants/taxRates.ts` for values — genuinely: all four calculation families
(main engine, `lib/tax/*`, both tool clients, all projections) read it, and PR #83
demonstrated a single-file rate change propagating everywhere automatically.
Nothing is the source of truth for *rules*: band iteration, PA taper, NI banding and
tax-code grammar each exist in 2–4 independent copies, and the *meaning* of stored
values (taxable vs total income) lived only in comments — which is exactly how the
112,570 boundary error survived: the number was internally consistent and every
copy trusted it.

**Q2 — Which annual values and calculation rules are duplicated?**
Values: effectively not duplicated in code (good) — one legacy test hardcoded the
wrong 2024-25 top rate until PR #83; blog MDX duplicates values in prose (Q4).
Rules, by count of independent implementations:
income-tax band iteration ×4 (engine inline, `lib/tax/incomeTax`, Scottish tool client,
`payrollPeriodDeductions`) plus 2 display interpreters (`chartUtils`, crawlable facts);
employee NI ×4 (engine inline, shadow helper, `lib/tax/employeeNI`, NI tool client);
student loans ×3 (engine inline, shadow helper, `lib/tax/studentLoan`);
PA taper ×4 (engine, `lib/tax/personalAllowance`, Scottish tool client, `pensionOptimizer`'s
zone maths); tax-code grammar ×4 (`parseTaxCode`, `decodeTaxCode`, `TaxCodeSchema`,
store edit-pattern); pay-period conversion ×2 placements (factors in taxRates,
logic in periodCalculator, independent scaling in `convertToPeriods`).

**Q3 — Which public surfaces derive automatically?**
Main calculator, salary comparison, quick results, both email payloads, marginal-rate
figure, `crawlableTaxFacts`, `/api/tax-rates`, Dataset JSON-LD, llms.txt year labels,
OG images, tool band *tables*, tax-year selector, freshness stamps. These needed zero
edits during PR #82/#83 beyond the canonical file — the projection layer works.

**Q4 — Which tools or articles copy or reinterpret tax facts?**
Tools that reinterpret: Scottish tax calculator (own annual engine — can disagree with
the main month-1 engine by a few pounds for identical inputs), NI calculator (own math),
`pensionOptimizer` (own trap model, rUK-only assumption), `chartUtils` marginal display.
Articles that copy: `scottish-vs-english-tax-rates-2026-comparison` (2025-26 bands,
stale vs live engine), `what-{40,60,70,100}k-salary…` (hand-computed tables differing
from engine output by £2–£6, plus uncited percentile/rent/lifestyle claims),
`student-loan-repayment-changes-2025-26` (current-correct copies),
`100k-tax-trap…`/salary-sacrifice/EV guides (correct-manual maths),
`understanding-uk-tax-codes` (no 50%-cap mention; "K500 = you owe £5,000" conflation).
Trust surfaces that assert rather than derive: compliance page, homepage FAQ source
labels, llms.txt source list.

**Q5 — Which field names, units or threshold meanings remain ambiguous?**
- `TaxBand.threshold`: cumulative **taxable** income upper bound — stated only in
  comments; the 112,570 error was this ambiguity materialised. rUK and Scottish
  comments still mix "total income" annotations with taxable values.
- `rate`: percent for bands/NI/SL (`20`), decimal for `DIVIDEND_TAX_RATES`/`CT_RATES`
  (`0.1075`) and `personalAllowanceReductionRate` (`0.5`) — the dead
  `taxRateDescriptions` bug ("2000%") is this inconsistency biting, and
  `generate-golden-master.ts` filters bands with `b.rate === 0.2/0.4/0.45` (never
  matches percent-stored rates), so the generated fixture's
  `basicRateThreshold`/`higherRateThreshold`/`additionalRateThreshold` metadata is
  silently `undefined` (verifiable in the committed golden fixture, which lacks
  those keys).
- `parseTaxCode().allowance`: positive allowance or negative K-adjustment in one field.
- `payNoNI` vs `niCategory 'C'` vs `age >= 66`: three overlapping NI-exemption inputs.
- `grossSalary.annually` excludes non-employment income while `grossSalary.monthly`
  includes it (engine output asymmetry).
- `PERIOD_CONVERSION_FACTORS` unitless ratios with meaning only in comments.
- `hicbc`, `vatRegistrationThreshold`, `ageAllowance*` (now removed) show the policy
  record accretes fields with no consumer discipline.

**Q6 — What files need changing for a normal Budget update?**
Mechanical today: `taxRates.ts` (new year block in two tables + `TAX_YEARS` +
`PAYROLL_PERIOD_THRESHOLDS` + `TAX_YEAR_SOURCES` + dividend entry),
`src/lib/tax/studentLoanPlans.ts` (per-year plan map keyed on the `TaxYear` union —
compile-forced when a year is added), `e2e/scripts/generate-golden-master.ts`
(hardcoded `TAX_YEAR = '2025-2026'`) + regenerated fixture,
`scripts/audit-blog-content.ts` (hardcoded current-year regex used to classify
content freshness), new verification fixture suite (manual, by design),
`check-rate-freshness` window via `verifiedOn`. Requires judgement: Scottish band
*names* (the override mapping and crawlable rendering match by name — a renamed band
needs review), blog refresh (wholly manual, no control), compliance-page claims
(manual), e2e specs that frame a pinned year as "latest"
(`e2e/payslip-regression.spec.ts` needs re-derivation, not re-pinning), any
structural change (new band, mid-year change) lands in mechanics code.
Aspiration: only the policy/source/fixture area should change for value-only updates —
today that is nearly true for code and entirely untrue for content, scripts and e2e config.

**Q7 — How did fixtures inherit the wrong threshold assumption?**
The PR #83 first-pass fixture derived the £150k expectation "by hand" but took the
**stored band table** as the starting point (monthly boundary = ceil(112,570/12)),
deriving only the arithmetic, not the policy, independently. The first fresh-context
review then validated "consistency with the repo's stored table" — the same trap.
Only an external reviewer that compared against the Scottish Rate Resolution caught it.
Correlation mechanism: the derivation procedure consumed production data as an input.

**Q8 — What controls would keep fixtures independent?**
1. Every expected value must trace to a *quoted official figure* in the fixture
   (band limits as published, not read from `taxRates.ts`) — provenance per scenario,
   not just per suite.
2. Derivations in descriptions must start from statutory numbers (e.g. "£125,140
   taxable per SRR"), never from repo thresholds.
3. Reviewer instruction fixed to "verify against the cited source", explicitly not
   "against the stored table".
4. Boundary scenarios that *only* pass if the statutory boundary is stored (the
   `progressive-120k-2026-27-no-top-rate` pattern) for every band edge and year.
5. Periodic cross-check of a sample against an external oracle (HMRC test data or a
   second independent calculator), recorded as a dated report.
6. Keep the e2e golden master clearly labelled as behaviour-lock, never cited as
   correctness evidence.

**Q9 — Smallest safe path towards one tax-domain package?**
Do not move files first. Order: (1) declare `src/lib/tax/` the domain home and add an
`index.ts` public surface re-exporting today's real entry points (`calculateTax`,
`decodeTaxCode`, policy read API) — no behaviour change; (2) add the CI drift guard so
the boundary is enforced before anything migrates; (3) migrate one vertical at a time
(§6), each slice deleting one duplicate implementation and adding fixtures that pin
the outcome before and after; (4) split `taxRates.ts` concerns (policy / sources /
period constants) only after consumers go through the public surface, so the split is
invisible to them.

**Q10 — Evergreen MDX vs pinned historical content?**
Feasible with existing machinery: `crawlableTaxFacts` already produces exactly the
tables and examples the articles copy by hand, and blog MDX is server-rendered, so
a small set of server MDX components (`<TaxBandTable region year>`,
`<SalaryExample salary>`, `<ThresholdFact id>`, `<CurrentTaxYear/>`, `<RatesVerifiedOn/>`,
`<OfficialSource id>`) would emit ordinary static HTML for crawlers. Two explicit modes:
**evergreen** components default to `CURRENT_TAX_YEAR` and follow it automatically;
**pinned** content passes an explicit `year="2025-2026"` that never advances, with the
frontmatter declaring which mode a post is in so `audit-blog-content` can enforce that
evergreen posts contain no hardcoded rate values. Must remain editorial and hand-written:
percentile/median/salary-status claims, rent/mortgage/lifestyle framing, planning
advice, any wording that interprets rather than states policy.

## 4. Current-state ownership matrix

| Domain | Canonical file | Other consumers | Duplicate implementations | Manually copied surfaces | Source coverage | Verification coverage | Risk |
|---|---|---|---|---|---|---|---|
| rUK income tax | `taxRates.ts` → engine inline | store, emails, projections | `lib/tax/incomeTax`, shadow helper, `payrollPeriodDeductions` | salary pages, tax guides | TAX_YEAR_SOURCES ✓ | fixtures: baseline+taper+overrides ✓ | mechanics drift between copies |
| Scottish income tax | `taxRates.ts` → engine inline | projections, decoder rates | Scottish tool client, `lib/tax/incomeTax` | featured comparison post (stale 2025-26) | ✓ (SRR added in #83) | strongest: flat codes, boundaries, history suite | tool/engine method divergence; stale article |
| PA + taper | engine (`calculateAllowanceReduction`) | `taxableThresholdToTotalIncome` display map | `lib/tax/personalAllowance`, Scottish tool, `pensionOptimizer` | 100k article (correct-manual) | ✓ | boundary fixtures ✓ | taper rate hardcoded as 2:1 in helper; 4 copies |
| Tax codes | `parseTaxCode` (engine) | store gate | `decodeTaxCode`, `TaxCodeSchema` (no runtime consumer), edit-pattern | tax-code guide | GOV.UK ✓ | SD/K/decoder-consistency fixtures ✓ | four grammars; consistency held only by tests |
| Employee/employer NI | `taxRates.ts` → engine inline | emails, results UI | shadow helper, `lib/tax/employeeNI`+`employerNI`, NI tool client | how-NI-works article | ✓ | fixtures assert NI on most scenarios | 2023-24 blended rate unmodelled; 4 copies |
| Student loans | `taxRates.ts` → engine inline | director inputs UI | shadow helper, `lib/tax/studentLoan` | student-loan article (current-correct) | ✓ | plan tests; no fixture suite of its own | article drift at next threshold change |
| Pensions | engine (always salary-sacrifice semantics) | optimizer, director modules | `pensionOptimizer` trap model | pension relief guide | n/a (method, not rates) | none for method semantics | RAS/net-pay users get wrong NI; undisclosed |
| Marriage allowance | engine (+£1,260 allowance approx) | `lib/tax/marriageAllowance` (tool) | two models (allowance vs reducer) | marriage article | ✓ | scenario tests ✓ | reducer-vs-allowance deviation, Scottish nuance |
| State Pension age | engine `age >= 66` + `BasicInputs` const | — | duplicated constant ×2 | — | ✓ | SPA fixtures (NI-only effect) ✓ | 66→67 transition (2026-2028) unmodelled |
| Period conversion/rounding | `periodCalculator` + factors in `taxRates.ts` + engine ceil/floor rules | everything | `convertToPeriods` scaling | — | HMRC method comments | period reconciliation tests ✓ | rounding ownership implicit, split across files |
| K-code overriding limit | engine cap (post-#82) | — | none | guide omits the cap | legislation ✓ | cap fixtures ✓ | cap base includes non-employment income |
| Current-year selection | `CURRENT_TAX_YEAR = TAX_YEARS[0]` | ~everything incl. decoder rate text | golden-master script hardcodes its own year | posts titled by year | n/a | year2026 tests | decoder/tools pinned to current year regardless of selected year |
| Official-source metadata | `TAX_YEAR_SOURCES` + `sources.ts` | compliance, llms.txt, homepage | — | compliance claims | partial — Revenue Scotland wrong, ITTOIA wrong | check-rate-freshness ✓ | trust surfaces assert what code doesn't prove |

## 5. Target model (proposal only — not implemented)

Keep the domain at `src/lib/tax/` (existing convention; no new top-level folder):

```
src/lib/tax/
  index.ts          ← the ONLY supported import surface
  policy/           ← per-year data records (2023-24.ts … 2026-27.ts + registry)
  sources/          ← official-source registry: authority, url, legal basis, verifiedOn
  mechanics/        ← band iteration, NI, SL, taper, rounding, period model (one copy each)
  codes/            ← one grammar: parse + validate + describe (engine and decoder share it)
  projections/      ← band tables, salary examples, structured-data facts, MDX helpers
```

- **Public boundary:** application code (`src/app`, `src/components`, `src/store`,
  emails, scripts) imports only from `@/lib/tax` (index). Direct imports of
  `@/constants/taxRates` or `@/lib/tax/internal-paths` become lint errors; `taxRates.ts`
  survives temporarily as a re-export shim until consumers migrate.
- **Unambiguous policy schema:** every value carries basis and unit in the field name
  or type — `upToTaxable: 125140`, `ratePercent: 48` vs `rateFraction: 0.1075`
  normalised to one convention, `perYear/perWeek` explicit, band records generated
  with both taxable limit and derived published total-income presentation so the
  two can never be conflated again. `effectiveFrom` on rate records to represent
  mid-year changes (the 2023-24 NI cut becomes representable data, even if the engine
  initially models only one value per year and says so).
- **Source metadata attaches per domain per year** (income-tax/NI/SL/dividends),
  as `TAX_YEAR_SOURCES` does today, plus legal basis (SRR motion, ITA 2007, SI number).
- **Fixtures stay outside the package** (`src/test/…`) and follow the Q8 controls.
- **CI drift guards:** (a) import-boundary lint; (b) a `check:tax-facts` script that
  fails on hardcoded policy values (`12570|50270|37700|125140|…` per year, generated
  from the policy records) appearing outside `src/lib/tax/**`, fixtures, and pinned
  historical content; (c) `audit-blog-content --strict` extended to verify evergreen
  posts contain no literal rate values; (d) existing rate-freshness check retained.
- **Budget workflow (target):** value-only change = add/edit one policy record +
  sources + new fixture suite; projections, calculators, tools, APIs, structured data
  and evergreen MDX update by rebuild. Mechanics change (new taper, new band type) =
  code change in `mechanics/` with fixtures first. Editorial change (what a band
  *means*, comparisons, advice) = human-reviewed content, never generated.

## 6. Staged migration slices

Each slice: independently reviewable, app stays green, no outcome changes unless stated,
fixture/drift protection included, one complete vertical rather than a scattered abstraction.

1. **Boundary + guard (no behaviour change):** create `src/lib/tax/index.ts` re-exporting
   current real entry points; add the import-boundary lint and `check:tax-facts` scan
   (warn-only first run, then enforced). Delete nothing.
2. **Scottish vertical (recommended first substantive slice — see below).**
3. **Tax-code unification:** one grammar module consumed by engine, decoder, schema and
   store gate; delete the three re-implementations; decoder-consistency fixtures extend
   to every code class.
4. **NI vertical:** NI mechanics module consumed by engine + NI tool + director family;
   delete shadow helper + tool-inline copy; add 2023-24 blended-rate decision (model or
   document) with fixtures.
5. **Student loans + pensions semantics:** consolidate SL mechanics; make pension method
   explicit (sacrifice/net-pay/RAS) — an intended outcome change, shipped with fixtures
   and disclosure copy.
6. **Policy record split:** move year data to `policy/` records with the unit-explicit
   schema; `taxRates.ts` becomes a shim, then is retired.
7. **Generated MDX + trust surfaces:** MDX fact components; compliance/llms.txt claims
   regenerated from fixture output; article-to-engine verification in CI.

**Recommended first substantive slice — Scottish vertical, confirmed.** Inspection
supports the candidate: the Scottish tool contains the clearest duplicate engine
(annual method, own taper); `crawlableTaxFacts` already renders Scottish tables and
would become the single projection; the strongest fixture base already exists
(flat codes, statutory boundaries, cross-year history); the featured Scottish article
is the worst manually-copied content and can consume the first generated MDX table;
and the two recent defect clusters (#82 SD codes, #83 boundary) were both Scottish, so
drift protection lands where drift has actually occurred. Scope: Scottish policy record
→ one band-iteration mechanic shared by engine and tool → tool client consumes it →
`crawlableTaxFacts`/API unchanged interfaces → one generated MDX band table (used by the
refreshed comparison article) → fixtures extended to pin tool-vs-engine consistency.

## 7. Limitations of this audit

Static analysis plus targeted execution; no runtime tracing of the deployed site.
Blog classification covers the tax-fact-bearing posts identified in the 2026-07-18
production truth audit, not a re-read of all 32 posts. Director-vertical internals
(`strategyComparison`, dividend/CT mechanics) were classified by import path and prior
session evidence, not line-by-line re-review.
