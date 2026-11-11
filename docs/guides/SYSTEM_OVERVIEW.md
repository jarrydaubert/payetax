# System Overview

PayeTax is a Next.js and TypeScript public R&D project for UK tax calculation.

## User Surface

- Main PAYE calculator
- Director Intelligence
- Tax tools
- Blog
- About, privacy, compliance, install
- Email-results flows

## Integrations

- Vercel hosting
- Vercel Web Analytics for cookieless traffic visibility
- Vercel Speed Insights for real-user performance signals
- GA4 for consent-based event analytics
- Sentry error monitoring for retained calculator, tool, blog, and email surfaces, plus source maps
- Brevo API for transactional results email
- Upstash Redis for distributed rate limiting

## Key Files

- Tax rates: `src/constants/taxRates.ts`
- PAYE calculation: `src/lib/taxCalculator.ts`
- Director calculations: `src/lib/tax/`
- Email boundary: `src/lib/email/emailDelivery.ts`
- Env validation: `src/lib/env.ts`
- Production env contract: `src/lib/productionEnvContract.ts`
- Sitemap: `src/app/sitemap.ts`
- CI: `.github/workflows/ci.yml`
- Testing strategy: `docs/guides/TESTING.md`
- Operations: `docs/guides/OPERATIONS.md`
- API and abuse controls: `docs/guides/API_AND_ABUSE_CONTROLS.md`
- Currency arithmetic decision: `docs/guides/CURRENCY_ARITHMETIC_DECISION.md`

## Tax-domain architecture

> One effective-dated policy model, one policy selector, one pay-basis derivation, one rule owner
> per deduction, one supported route to each statutory calculation, one transparent result,
> and one compact independent set of full-calculation cases.

### Flows

- Policy: official change → effective-dated policy data → one selector.
- Calculation: normalised input → shared pay bases → statutory rules → supported orchestration → transparent result.
- Verification: official rules and independent working → compact fixtures → comparison against the production calculation.

### Principles

- Published rates, thresholds and effective dates belong in policy data.
- Calculation mechanics belong in small, clearly owned rule modules.
- Consumers must not recreate statutory calculations.
- Production policy and mechanics must remain separate from independently derived verification expectations.
- JSON fixtures cover representative full-calculation interactions.
- TypeScript tests cover rules, boundaries and detailed mechanics.
- Playwright covers critical browser journeys.
- Do not introduce a generic rules engine, plugin system, duplicate calculator, test-only calculator, exhaustive JSON matrix or cosmetic folder reshuffle.
- Repository-root configuration and generated artefacts must have clear ownership; do not relocate conventional framework files merely to make the root look tidier.

### Ownership

| Concern | Production owner |
| --- | --- |
| Published policy | `src/constants/taxRates.ts` holds typed annual rUK, Scottish and ancillary policy. Mid-year employee-NI changes are effective-dated data. Do not copy these tables into this document. |
| Policy selection | `selectTaxPolicy()` in `src/lib/tax/taxPolicy.ts` selects the supported year and hands consumers the rUK and Scottish records together. |
| Pay basis | `derivePayePayBasis()` in `src/lib/tax/payePayBasis.ts` owns annual/monthly employment, non-employment, adjusted-net-income, NI and Student Loan bases. Both pension methods reduce PAYE pay and adjusted net income. Salary sacrifice also reduces employee NI and Student Loan earnings. Omitted methods default to salary sacrifice. |
| Income Tax | Shared rUK and Scottish band slicers own annual progressive band allocation. `src/lib/tax/month1IncomeTax.ts` owns HMRC Month 1 formula selection, exact accrued thresholds, threshold tax and final-penny truncation. The main PAYE and Director Intelligence routes may orchestrate different statutory bases, but consumers must not reimplement either mechanic. |
| Tax codes and Tables A | `src/lib/tax/taxCode.ts` owns accepted formats, regional prefixes, non-cumulative markers, code-derived amounts, K adjustments and Tables A period adjustments. `src/lib/tax/taxCodeDecoder.ts` derives explanations from that model. |
| National Insurance | `src/lib/tax/nationalInsurance.ts` owns Class 1 slicing and effective-date selection. Payroll uses pay-period mechanics; `employeeNI.ts` deliberately exposes the separate annual earnings-period basis used for directors. |
| Student Loans | `src/lib/tax/studentLoan.ts` is the shared repayment mechanic, with employment-specific pay bases supplied by the PAYE orchestration. |
| Periods and money | `src/lib/periodCalculator.ts` owns general period conversion and `src/lib/tax/utils.ts` owns general penny rounding and shared threshold conversion. Month 1 Income Tax's distinct whole-pound, four-decimal and final-penny rules live with that statutory routine. |
| Public tax-domain boundary | Application code should consume `@/lib/tax`. `check:tax-imports` prevents new direct-import debt while the existing baseline is reduced. |
| Result assembly | `TaxCalculationResults` exposes deductions and tax-code calculation basis. The target result contract exposes selected policy, relevant pay bases, pension method and every deduction; inspect code before claiming those fields are implemented. |

PAYE and Director orchestration can use different statutory bases; reuse the rule owners
without forcing equal results between different bases. Generated golden masters, API projections,
Dataset/structured data, `llms.txt`, reports and article tables are downstream outputs, not policy
sources. Published rates, thresholds and effective dates change through canonical policy data,
current primary official-source evidence and independent verification.

The [ownership audit](../reports/paye-tax-domain-ownership-audit-2026-07-21.md) is dated
evidence, not a second architecture plan. Remaining work and implementation order live in Linear.

## Tax-code contract

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

The [independent tax-code reconciliation](../reports/tax-code-correctness-follow-up-2026-08-23.md)
records disputed points and primary-source derivations.

## PAYE projection contract

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

## Preserved interaction and privacy contracts

These are regression obligations, not a second backlog:

- Amount entry preserves pounds/pence; rejected text stays visible with an associated error.
  Pension-unit changes cannot silently reinterpret amounts or bypass invalid restored values.
- Input changes invalidate results and require explicit Calculate. Display-only period changes
  reuse the calculation. Email, open dialogs and other actions cannot use stale/invalid results.
  First use/Reset have no result actions; invalid submissions retain values and allow recovery.
- Pension suggestions add to the existing annual contribution, convert back to the selected pay
  period and round up to a penny without adding a penny to exact values. Applying changes input
  only and requires Calculate. Preserve parser/storage and exact-penny regressions.
- Preserve five desktop summary cards, forward/reverse focus clear of the fixed header, deliberate
  What-if scrolling and readable seven-column normal tables when enabled. Yearly, Monthly,
  Weekly, Daily and Hourly are selected by default; Fortnightly and 4-Weekly remain available.
  Resizing preserves selections and the calculation.
- Mobile results open in the submitted period; annual input opens Monthly with annual context.
  Period switches do not recalculate. Keep the Marginal Rate Estimate's visible rounded
  next-£100 payroll explanation, including applicable employee deductions and excluding pension.
- Preserve the Director interim email safeguard: current valid annual inputs and active financial
  results must match the server-recalculated original recommendation. Same-value edits remain
  eligible; changed, stale, failed or divergent scenarios cannot send, including already-open
  dialogs and same-task edits. Do not bypass a mismatch because controls cannot reproduce a
  recommendation. The client safeguard is not a server security boundary or full active export.
- Financial inputs are session-only by default. A shared explicit remembering opt-in covers PAYE
  and Director; legacy snapshots stay quarantined until restore-or-clear. Clear-data and opt-out
  clear both stores and results without changing analytics preferences. Recheck authority before
  writes and on cross-tab/lifecycle events; remove expired snapshots when the app is active.
  Blocked storage can prevent physical erasure and must be reported, never silently treated as success.
- Preserve financial-telemetry exclusions, sanitised URL boundaries, opt-in GA4 and its withdrawal/
  expiry/cross-tab lifecycle. Do not treat browser expiry guards as physical storage erasure or
  claim opt-in remembering without checking its implementation. Provider history needs separate
  deletion evidence; a prospective code fix does not erase it.

Detailed retained acceptance and evidence:
[calculator integrity](../reports/project-documentation-reconciliation-2026-10-27.md#retained-127-regression-acceptance-criteria),
[input-state presentation](../reports/mc03-input-state-presentation-2026-10-28.md),
[submitted period](../reports/mc04-submitted-pay-period-2026-10-28.md),
[summary cards](../reports/summary-cards-v5.2.3-rereview-2026-10-31/README.md),
[Director safeguard](../reports/di05-interim-email-safeguard-2026-10-27.md)
and [privacy](../reports/privacy-telemetry-minimisation-2026-10-27.md).
Those reports certify their recorded refs and limits, not later heads or production outcomes.
