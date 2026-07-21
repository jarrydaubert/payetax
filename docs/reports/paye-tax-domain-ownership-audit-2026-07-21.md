# PayeTax Tax-Domain Ownership Audit — 2026-07-21

Dated evidence report. Snapshot of `origin/main` at `889dce7f` (after PRs #84–#91).
Supersedes `paye-tax-domain-ownership-audit-2026-07-19.md` (snapshot `d15ff79c`, pre-#84–#91),
which is now stale: NI mechanics were unified (#88), tax-code grammar unified (#87), the
Scottish band mechanic shared (#86), the `@/lib/tax` public boundary + import guard added (#85),
and the `calculateNIContributions` shadow helper deleted (#88).

Method: ownership is established from actual imports and call sites (grep of non-test importers,
targeted reads), not from comments claiming canonicity. No behaviour, rates, or content changed.
This slice verifies the Foundation burn-down row **Current ownership audit** only; it does not
reconcile the detailed backlog and changes no application code.

## Concern ownership map

Columns: Concern | Current owner | Consumers (production) | Duplicate logic or values? | Tests | Action | Evidence. `L` = layer (P policy data, M calculation mechanics, O orchestration, D display-only projection, V independent verification).

| Concern | Current owner | Consumers | Duplicate? | Tests | Action | Evidence |
|---|---|---|---|---|---|---|
| Policy data (P) | `src/constants/taxRates.ts` (`TAX_RATES`, `SCOTTISH_TAX_RATES`, `PAYROLL_PERIOD_THRESHOLDS`, `PERIOD_CONVERSION_FACTORS`, `DIVIDEND_TAX_RATES`, `CT_RATES`, `TAX_YEAR_SOURCES`, `TAX_YEARS`, `CURRENT_TAX_YEAR`) | every `src/lib/tax/*` mechanic; guard-approved sole "canonical" location | **Yes, two small out-of-canon sets**: `src/lib/tax/businessThresholds.ts:15-20` (pension annual allowance 60_000, taper 240_000/260_000, POA 1_000) and `directorCalculator.ts:55-64` (`POA_THRESHOLD`, `HIGH_COMPLEXITY_THRESHOLD`, `VAT_WARNING_PROXIMITY`) | `constants/__tests__/taxRates.test.ts` | Move pension-AA/taper + POA thresholds into the canonical record | `tax-domain-controls.ts:79` exception `canonical-policy`; literals at cited lines |
| Policy selection (P/M) | Year: `CURRENT_TAX_YEAR = TAX_YEARS[0]` default + `resolveSupportedTaxYear` (`taxCalculator.ts:100`). Intra-year effective-dated NI: `getEmployeeClass1RateForPayDate`/`getEmployeeClass1MonthSegments`/`getDirectorsAnnualPrimaryRate` (`nationalInsurance.ts`) | engine, director paths, tool clients | **Partly** — ad-hoc year defaults: `pensionOptimizer.ts:79` own fallback, `e2e/scripts/generate-golden-master.ts:19` hardcoded `'2025-2026'`; no single `selectPolicy(year)` selector | `nationalInsuranceVertical.test.ts` (pay-date selection) | Consolidate to one year-resolver; keep effective-dated NI selector | `taxCalculator.ts:100,113`; `nationalInsurance.ts:267,306,336` |
| Pay-basis derivation (M) | Period factors split: `src/lib/periodCalculator.ts` (hardcoded 12/13/26/52/260) **and** `PERIOD_CONVERSION_FACTORS` (`taxRates.ts:39`) | `taxCalculator.ts` (both), `calculatorMarginalTax.ts`, inputs UI | **Yes** — two encodings of the same factors; `convertToPeriods` (`taxCalculator.ts:232`) is **dead** (test-only); engine inlines its own per-period scaling (`taxCalculator.ts` §11) | `periodCalculator.test.ts`, `taxCalculator.periodReconciliation.test.ts` | One owner for conversion factors + scaling | cited lines; `convertToPeriods` non-test importers: none |
| Income Tax mechanics (M) | No single owner — **3 live rUK band iterations** | (1) `calculateTax` inline (`taxCalculator.ts` rUK `else` ~748), (2) `calculateIncomeTax` (`incomeTax.ts:108`) → director + Scottish tool, (3) private `calculateIncomeTax` (`marriageAllowance.ts:28`) → marriage tool/alert | **Yes** — 3 live + `calculateCumulativeIncomeTax` (`payrollPeriodDeductions.ts`, shadow/test-only) + `calculateIncomeTaxFromBands` (dead/test-only). Scottish band split is **unified** via `sliceScottishTaxableIncome` | `incomeTax.test.ts`, `taxCalculator.*`, `scottishTaxVertical.test.ts` | Unify rUK band iteration into one mechanic | cited symbols; `calculateIncomeTaxFromBands` non-test importers: none |
| National Insurance mechanics (M) | `src/lib/tax/nationalInsurance.ts` (pure slicers `sliceClass1Employee/EmployerEarnings`; policy selectors; exemption) | engine (`taxCalculator.ts:847,871,896`), NI tool (`NICalculatorClient.tsx`), director (`strategyComparison.ts`, `directorCalculator.ts` via `employeeNI.ts`/`employerNI.ts`), `payrollPeriodDeductions.ts` | **No** — `employeeNI.ts`/`employerNI.ts` are thin wrappers; `getEmployeeNIWithNoThreshold` (`strategyComparison.ts:176`) wraps the shared fn; `calculateNIContributions` **deleted** | `nationalInsuranceVertical.test.ts`, `employeeNI.test.ts`, `employerNI.test.ts`, `hmrcPayrollFixtures` | **None — complete (#88)** | absence asserted `publicInterface.test.ts:42` |
| Student-loan mechanics (M) | No single owner — **2 live + 1 dead** | (1) `calculateTax` inline monthly loop (`taxCalculator.ts:921-941`, live), (2) `getStudentLoanRepayment` (`studentLoan.ts`) → `strategyComparison.ts:24` | **Yes** — the two live paths + `calculateStudentLoanRepayments` (`taxCalculator.ts:205`, dead/test-only) | `studentLoan.test.ts`, `studentLoanPlans.test.ts`, `taxCalculator.*` | Unify into one SL mechanic | cited lines; `calculateStudentLoanRepayments` non-test importers: none |
| Pension-method handling (M) | Single hardcoded assumption in `calculateTax` (salary-sacrifice / net-pay semantics: pension reduces PA-taper base, income-tax base **and** NI base) | engine; `pensionOptimizer.ts` repeats the assumption | **No duplicate math, but no method choice** — no relief-at-source / net-pay path; `TaxCalculationInput` has only `pensionContribution`/`pensionContributionType` | none for method semantics | Make method explicit + disclose (separate slice) | `taxCalculator.ts:610,681,866-867`; input `calculator.ts:99-102` |
| Tax-code interpretation (M) | `src/lib/tax/taxCode.ts` (`parseTaxCode`, `decodeTaxCode`, `normalizeTaxCode`, `isValidTaxCode`, `TAX_CODE_EDIT_PATTERN`) | engine (`taxCalculator.ts:508`), `payrollPeriodDeductions.ts`, `ResultsTable.tsx`, decoder tool + store via `@/lib/tax` | **No** — no separate `taxCodeDecoder.ts` source, no `TaxCodeSchema` grammar, store uses shared grammar | `taxCode.test.ts`, `taxCodeDecoder.test.ts`, `calculatorStore.validation.test.ts` | **None — complete (#87)** | single grammar in `taxCode.ts`; store `calculatorStore.ts:55` |
| Period conversion + rounding (M) | Rounding: `roundToPence` (`src/lib/tax/utils.ts:8`), 10+ importers | all mechanics | **Yes (rounding)** — 2 production duplicate definitions: `variableIncome.ts:57`, `useActiveDirectorScenario.ts:21`. Conversion split (see Pay-basis) | `variableIncome.test.ts`, reconciliation tests | Single rounding owner; consolidate conversion | cited lines |
| Application orchestration (O) | **Two routes**: main = `calculateTax` (`taxCalculator.ts:483`); director = `calculateDirectorScenario`/`calculateStrategyComparison` (`directorCalculator.ts`, `strategyComparison.ts`) which compose the `get*` modules directly, **not** via `calculateTax` | main: store, `CalculatorContent`, emails, `salaryComparison`, `calculatorMarginalTax`. director: `directorGuideStore`, DirectorGuide UI, emails | Expected two verticals, but director path re-derives income tax via `incomeTax.ts` (feeds the income-tax duplication) | vertical + director spec suites | Keep two supported routes; remove the mechanic duplication they expose | importers per §5 evidence |
| Result assembly / transparency (O/D) | `TaxCalculationResults` (`src/lib/types/calculator.ts:132-164`) | all engine consumers | Exposes each deduction (`incomeTax`, `nationalInsurance`, `employerNI`, `studentLoan`, `pensionContribution`), pay bases (`grossSalary` per period, `taxableIncome`), and `taxBands[]` — but **does not echo selected policy**: no `taxYear`, no region/`isScottish`, no `niCategory` | results-UI tests | Surface applied policy on the result (separate "transparent result" row) | fields at cited range; inputs-only `calculator.ts:84,88,106` |
| Independent verification (V) | `src/test/payeVerification.ts` + `payeVerificationFixtures/*.json` (**5 suites / 26 scenarios**, hand-derived); vertical tests `scottishTaxVertical`, `nationalInsuranceVertical`, `taxCalculator.hmrcVerification` | Jest | Citations are **per-suite** (`source.authority/urls/verifiedOn`), not per-scenario. Golden master (`golden-tax-cases-2025-26-COMPLETE.json`, engine-generated) is a behaviour-lock, correctly labelled — **not** independent | the verification suites themselves | Add per-scenario provenance; widen year coverage | `payeVerification.ts:19-32,133`; `generate-golden-master.ts:5,17` |

## Classification

- **Verified complete:** National Insurance mechanics (#88); Tax-code interpretation (#87). No duplicate math, single owner, delegating consumers, absence of the old shadow helpers asserted by tests.
- **Partial:** Policy data (canonical for rate/threshold tables, but pension-AA/taper + POA thresholds sit outside it); Policy selection (engine resolver exists, other paths default ad-hoc); Period conversion + rounding (single rounding owner but two production duplicate definitions + two conversion-factor encodings); Application orchestration (two intended routes, but the director route exposes the income-tax duplication); Result assembly (deductions transparent; selected policy not echoed); Independent verification (genuinely independent and hand-derived, but per-suite not per-scenario provenance, year coverage concentrated).
- **Requires work:** Income Tax mechanics (3 live rUK band iterations); Student-loan mechanics (2 live + 1 dead); Pension-method handling (single hidden assumption, no RAS/net-pay).
- **Obsolete / superseded (dead or shadow — carry no unique live behaviour):** `calculateIncomeTaxFromBands`, `calculateStudentLoanRepayments`, `convertToPeriods` (all exported from `taxCalculator.ts`, test-only); `payrollPeriodDeductions.ts` (test-only shadow, holds the cumulative-PAYE income-tax loop). Of the 2026-07-19 report's shadow findings, only `calculateNIContributions` is resolved/removed (#88).
- **Unresolved dead/test-only display projection:** `src/lib/taxRateDescriptions.ts` still exists, with **zero production consumers** (only its own test references it), and still formats rates by multiplying percentage-stored values by 100 (`band.rate * 100` at lines 20/32/33 → e.g. "2000%"). It is **not** resolved by this audit and remains owned by the existing detailed backlog items in `docs/BACKLOG.md` ("Dead `taxRateDescriptions.ts` module…" and "Remove shadow helpers…"). Contrary to an earlier draft of this report, it has **not** been removed.

## Drift-guard state (evidence, not action)

- Import boundary (`scripts/check-tax-imports.ts` + `tax-domain-controls.ts`): only `@/lib/tax` is an allowed application import specifier; **68** baselined direct-import debts remain (`tax-domain-boundary-baseline.ts`), chiefly `@/constants/taxRates` deep reads plus direct `@/lib/taxCalculator`/`strategyComparison`/`directorCalculator`.
- Tax-facts scan (`scripts/check-tax-facts.ts`): **144** baselined literal findings (`tax-facts-baseline.ts`), overwhelmingly comment/example/display copy and pinned blog content, not competing policy definitions.

## Bottom line

A current, evidence-backed ownership map now exists (this report). Two deductions are fully
consolidated (NI, tax codes); the remaining duplication is concentrated in **rUK income-tax band
iteration (×3 live), student-loan repayment (×2 live), the personal-allowance taper (×3 forward
implementations), and `roundToPence` (×3)**, plus split period-conversion ownership. Each of these,
and pension-method handling, result-policy transparency, per-scenario fixture provenance, and the
still-present dead `taxRateDescriptions.ts` display module, is already represented by its own
Foundation burn-down row and/or detailed backlog item — so the **Current ownership audit** row's
outcome is satisfied (the map accurately records the unresolved work, which remains tracked
elsewhere) and it is removed, with this report as the preserved evidence. No generic rules engine,
plugin system, folder restructuring, duplicate calculator or exhaustive JSON matrix is proposed.

## Limitations

Static analysis plus targeted reads; no runtime tracing of the deployed site. Director-vertical
internals (`strategyComparison`, dividend/CT mechanics) classified by import path and symbol, not
line-by-line. Fixture provenance confirmed at the schema/loader level and by reading
`uk-baseline-2026-27.json`; not every one of the 26 scenarios' arithmetic was re-derived.
