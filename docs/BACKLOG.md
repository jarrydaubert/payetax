# PayeTax Backlog

Backlog for the public R&D version of PayeTax. Read [`PROJECT_STATE.md`](PROJECT_STATE.md) first
for the current product, architecture, verification and search handover.

Keep this file for active or parked future work only. Closed work belongs in GitHub pull requests,
dated reports or commit history. Statutory truth belongs in canonical policy and current primary
sources, not in backlog prose.

## Working Rules

- Tax correctness, security, privacy, user-data integrity and evidence-backed public claims take priority over all other work.
- This file holds unresolved work only. Remove completed work; preserve evidence in pull requests, dated reports and git history.
- Independent PAYE fixtures are the statutory correctness oracle. Generated golden-master expectations protect behaviour and presentation regression only — they derive from the engine and can never prove it correct.
- Tax-domain baselines, test-skip baselines and advisory allowlists are shrink-only. Lower them in the same PR that removes the debt; never add broad exceptions merely to pass a check.
- Published rates, thresholds and effective dates change only through canonical policy data, official-source evidence and independent verification.
- Generated golden masters, API projections, structured data, `llms.txt`, reports and article tables are downstream outputs, not editable policy sources.
- Never commit secrets, tokens, raw calculator inputs, unredacted analytics payloads or personal data — in fixtures, logs or evidence.
- Record unrelated findings as named follow-ups here rather than expanding a slice's scope.
- Prefer small independently reviewable slices over generic frameworks, big-bang rewrites or cosmetic restructuring.

## Active

Current correctness sequence:

1. Explicit pension-method handling.
2. Transparent calculation results.
3. Independent fixture/test-portfolio completion and Foundation reconciliation.

Verified Director Intelligence correctness exceptions (see [Urgent correctness exceptions](#urgent-correctness-exceptions)) may be taken as small independent slices between these items; they do not reorder them. The verified [main-calculator input-integrity defects](#main-calculator-input-integrity) are taken the same way, immediately after DI-01, whose parser they reuse.

### Foundation

Permanent architectural and testing direction for the tax domain. This is a verification burn-down, not a new architecture programme: it records the agreed end state and tracks what still needs checking. It does not duplicate the detailed items below or prescribe implementation before a focused audit.

**North star**

> One effective-dated policy model, one policy selector, one pay-basis derivation, one rule owner per deduction, one supported route to each statutory calculation, one transparent result, and one compact independent set of full-calculation cases.

**Flows**

- Policy: official change → effective-dated policy data → one selector.
- Calculation: normalised input → shared pay bases → statutory rules → supported orchestration → transparent result.
- Verification: official rules and independent working → compact fixtures → comparison against the production calculation.

**Principles**

- Published rates, thresholds and effective dates belong in policy data.
- Calculation mechanics belong in small, clearly owned rule modules.
- Consumers must not recreate statutory calculations.
- Production policy and mechanics must remain separate from independently derived verification expectations.
- JSON fixtures cover representative full-calculation interactions.
- TypeScript tests cover rules, boundaries and detailed mechanics.
- Playwright covers critical browser journeys.
- Do not introduce a generic rules engine, plugin system, duplicate calculator, test-only calculator, exhaustive JSON matrix or cosmetic folder reshuffle.
- Repository-root configuration and generated artefacts must have clear ownership; do not relocate conventional framework files merely to make the root look tidier.

**Verification burn-down**

Rows are `Open` or `Partial` after reconciliation against current code and evidence. An item is not
assumed wholly incomplete merely because its residual work also appears in the detailed backlog
below.

| Concern | Desired outcome | Current status | Evidence or completion reference |
| --- | --- | --- | --- |
| Explicit pension-method handling | Salary-sacrifice, net-pay and relief-at-source are handled explicitly, with the method exposed in the result. | Open | The shared pay-basis owner currently models the pension input as salary sacrifice. |
| A transparent result that clearly exposes the selected policy, calculation basis, relevant pay bases and individual deductions | One result exposes the policy selected, the calculation basis, the relevant pay bases and each individual deduction, without callers reassembling them. | Partial | Tax-code basis is exposed after PRs #111/#112. Selected policy, relevant pay bases and pension method remain incomplete. |
| Compact independent full-calculation fixture set | A small set of JSON fixtures, derived independently of production code, covers representative full-calculation interactions. | Partial | Representative PAYE and tax-code fixtures now include Month 1 Cvalue/exact-threshold and final-penny cases. Supported-year, wider boundary and per-scenario provenance gaps remain below. Director extraction calculations have no independent fixtures yet; DI-19 introduces the first minimal set. |
| Balanced test portfolio and updated `TESTING.md` | JSON fixtures, TypeScript rule and boundary tests, and Playwright journeys are balanced, with `TESTING.md` describing the split. | Partial | The three-layer split exists; the final coverage balance and documentation reconciliation remain open. |
| Final backlog reconciliation | After the foundation audit, the detailed backlog items are reconciled against verified outcomes. | Open | Remove the remaining Foundation rows as focused slices close them. |

**Burn-down rule**

- A focused foundation slice must update this section in the same pull request.
- Once an outcome is verified and any required work is merged, remove its open row rather than retaining completed work in the backlog.
- Preserve completion evidence in the pull request, commit history or a dated report.
- If an audit confirms that no work is required, remove the row and cite the audit reference in the related pull request.
- Keep slices small and independently reviewable.
- The permanent north star and flow descriptions remain after the burn-down rows have been removed.

### Main calculator input integrity

Both defects start in the shared `NumberInput` atom, and the second also leaves stale results on screen. They are recorded separately from the Director items and scheduled immediately after DI-01, as separate PRs that reuse its parser (see the [agreed order](#urgent-correctness-exceptions)). Browser evidence: [PR #123](https://github.com/jarrydaubert/payetax/pull/123).

- [ ] **P1 — Currency fields silently change amounts.** Additional income source amounts (`IncomeSourceList`, `NumberInput decimals={0}`) drop the decimal point: typing or pasting `1234.56` or `£1,234.56` displays `123,456`, and the calculation uses £123,456 (Gross Pay £153,456 on a £30,000 salary). In every `NumberInput`, a minus sign is silently dropped (`-500` becomes £500) and malformed text becomes 0 (`abc`, and `1.2.3` in two-decimal fields). Salary and other two-decimal fields keep pence correctly.

  **DoD:** Amounts with pence are preserved or rejected with a specific error, never scaled. Negative and malformed text produce a specific error rather than another amount. Parsing reuses DI-01's parser rather than a second implementation. Regression coverage runs on the mounted main-calculator fields, including the income-source journey in `e2e/calculator-critical.spec.ts`.

- [ ] **P1 — Focusing a filled field and leaving it erases the value while the old result stays visible.** `NumberInput` clears its display on focus by default, and blur parses the empty text as 0. With a £30,000 salary already calculated, clicking into Salary and tabbing away sets the salary to £0.00. After Calculate, the validation message appears, but the £30,000 results remain on screen.

  **DoD:** Focusing a field without editing it never changes its value. A field the user genuinely clears is treated as empty, not zero. A result whose inputs are no longer valid is cleared or marked not current. Browser regression covers focus-and-leave, clearing and recovery.

### Tax correctness and product semantics

- [ ] K-code overriding limit base: the 50% cap uses gross-minus-pension including non-employment income the engine also PAYE-taxes monthly. DoD: documented decision on the payment base for mixed-income users, engine behaviour matching it, and mixed-income K-code fixtures.
- [ ] Pension method semantics: the engine treats every pension input as salary sacrifice (reduces NI). DoD: explicit salary-sacrifice / net-pay / relief-at-source handling, or the assumption disclosed at the input and in results; tests assert whichever is chosen.
- [ ] State Pension age transition: engine and `BasicInputs` hardcode 66 while SPA moves to 67 during 2026–2028. DoD: date-of-birth-aware rule or clearly framed self-declaration replaces the fixed age, with tests at the transition boundary.
- [ ] Marriage Allowance treatment: modelled as +£1,260 allowance rather than a 20% tax reducer; deviates for Scottish taxpayers and edge cases. DoD: documented decision, implementation matching it, and fixtures including Scottish cases.
- [ ] Personal Allowance taper parameterisation: `taxableThresholdToTotalIncome` hardcodes the £1-per-£2 taper shape instead of consuming `personalAllowanceReductionRate` (PR #83 review note). DoD: the function consumes the policy rate; a test pins behaviour for a non-default rate.
- [ ] Dead `taxRateDescriptions.ts` module: zero production consumers and emits "2000% basic rate" (`rate * 100` on percent values). DoD: module removed, or fixed and consumed by production; either outcome asserted by tests.
- [ ] `pensionOptimizer` hardcodes a 60% trap rate (rUK 40%+20% assumption) — wrong framing for Scottish taxpayers. DoD: trap framing derives from policy data or is region-aware/disclosed; a test covers the Scottish case.
- [ ] Marginal-rate chart shows the nominal 45% instead of the ~60%/67.5% effective rate inside the £100k–£125,140 taper (`chartUtils.estimateMarginalRate`, PR #83 review note). DoD: chart reflects the effective rate in the taper band or explicitly labels the nominal basis; a test pins the taper band.

### Tax-domain architecture

- [ ] One supported tax-domain public interface (`src/lib/tax/index.ts`); application code stops importing `constants/taxRates` and domain internals directly. DoD: the `check:tax-imports` baseline shrinks to zero direct imports.
- [ ] Display band interpreters still re-derive band presentation outside the owned mechanics (rUK and Scottish slicing each have one owner since #86/#98). DoD: display code consumes owned mechanics or generated projections; no independent band maths remains in display modules.
- [ ] Shadow helper `taxRateDescriptions` is test-only production-adjacent code. DoD: resolved together with the `taxRateDescriptions.ts` item under Tax correctness; no test-only shadow module remains.
- [ ] NI pay-date basis: payroll rate selection derives a pay date from the tax period start, so a weekly or four-weekly period straddling a mid-year rate change takes the earlier rate. DoD: callers pass a real pay date where they have one; a straddling-period test takes the later rate when the pay date does.
- [ ] Complete ownership of deliberate statutory rounding rules outside Month 1 Income Tax. `month1IncomeTax.ts` now owns U/T, Cvalue/SCvalue, exact-threshold and final-penny rules. DoD: remaining statutory ceil/floor conventions have named owners and consumers do not duplicate them.
- [ ] Generated projections as the only path for UI band tables, tools, `/api/tax-rates`, structured data and llms.txt facts (Dataset JSON-LD currently projects independently of `crawlableTaxFacts`). DoD: all listed surfaces read one projection source; the independent JSON-LD projection is gone.
- [ ] Generated MDX tax facts: server components for band tables, threshold facts, worked examples, current-year labels, source links and last-verified dates. DoD: evergreen posts consume the components; historical posts stay pinned to their stated year; no hardcoded current-year values in evergreen MDX.
- [ ] Annual Budget workflow: value-only updates touch only policy/sources/fixtures. DoD: hardcoded years removed from `e2e/scripts/generate-golden-master.ts` and `scripts/audit-blog-content.ts`; the compile-forced `studentLoanPlans` per-year map folds into the policy records; a dry-run year update touches no other files.
- [ ] Golden-master generator rate-unit bug: `generate-golden-master.ts` filters bands with decimal rates (`0.2/0.4/0.45`) against percent-stored values, so fixture threshold metadata is silently `undefined`. DoD: filter matches stored units, metadata populated, regression test; fix alongside the unit-explicit policy schema.
- [ ] Evergreen-content policy-value guard: extend `audit-blog-content --strict` to reject literal rates in evergreen posts. Import-boundary and tax-fact guards already run in `check:repo`; do not recreate them. DoD: the residual blog guard fails on a seeded violation.

Implementation sequencing for these items remains documented in the ownership audit report §6, beginning with its recommended Scottish vertical.

### Director Intelligence audit follow-up

Evidence: the [18 October 2026 audit](reports/director-intelligence-audit-2026-10-18.md) (F01–F18 map
to DI-01–DI-18) and the [19 October verification addendum](reports/director-intelligence-audit-addendum-2026-10-19.md) (DI-19–DI-27 and the
extended DI-07 and DI-11, and the corrected DI-14). Keep fixes small, preserve the Ledger visual identity and existing
tax-domain owners, and do not duplicate Foundation policy owners or independent-verification tasks.

For calculation changes, completion also requires independently derived fixtures, the
repository's full `bun run test:no-coverage` command, and the required browser regression
slice. Passing generated golden masters alone does not establish statutory correctness. Where an
existing test pins the defective behaviour (DI-03, DI-08), replace its expectation with an
independently derived one; do not edit it merely to pass.
For UI changes, follow `.claude/skills/verify-frontend-change/SKILL.md`, inspect the affected
route and states, and include Director critical-flow coverage. Preserve dated completion
evidence in the implementing PR or a report; remove completed items from this queue. When a PR
completes only part of an item, keep the item and narrow its text to the remaining scope.

Director calculation fixtures stay minimal, independently derived and alongside the existing
verification infrastructure rather than in a large separate harness. The current loader reads
every JSON file in `src/test/payeVerificationFixtures/` as a PAYE suite, so Director cases need
their own directory or a suite-type discriminator. The first engine PR (DI-19) introduces them
and updates `TESTING.md`, in line with Foundation item 3.

#### Urgent correctness exceptions

These items silently alter inputs or show wrong money figures, deadlines or statutory rates. Under
the first working rule they may be taken as small independent slices between the Foundation items
in the current correctness sequence; they do not reorder that sequence, and an exception that needs
a Foundation change waits for, or is folded into, that Foundation item. DI-05, DI-06, DI-26 and
DI-27 are exceptions because they show or send wrong money figures.

Agreed order, one small PR per step unless stated:

1. DI-01 with the minimal part of DI-02: an empty or invalid required input clears the result or
   marks it not current, and disables email.
2. Both [main-calculator input-integrity fixes](#main-calculator-input-integrity), as separate PRs
   reusing DI-01's parser: currency parsing first, then focus-and-leave with stale results.
3. The interim email guard from DI-05.
4. DI-07, then DI-26, DI-23, DI-06 and DI-27.
5. Company budget: DI-19, then DI-21, as separate PRs.
6. Personal tax: DI-08 with DI-24, then DI-20, then DI-25, as separate PRs. DI-08, DI-20, DI-24 and
   DI-25 share `strategyComparison.ts` income attribution; the DI-08/DI-24 PR settles the shared
   helper's design.
7. DI-04, the rest of DI-02, DI-05, then DI-03.

Foundation item 1 is planned between steps 4 and 5, and Foundation item 2 after step 6.

- [ ] **DI-01 · P1 — Preserve currency amounts and editing behaviour.** `InputsPanel` removes decimal points and signs; entering `1234.56` becomes `£123,456` across the live currency-field path.

  **DoD:** One shared currency field separates editable text from the parsed amount; `1234.56`, `1,234.56`, and `£1,234.56` all resolve to £1,234.56; unsupported negative or malformed values produce a specific error instead of another amount. Empty and zero remain distinct, formatting does not move the caret during mid-string editing, and mobile fields expose a decimal input mode. Regression coverage exercises pasted pence, commas, symbols, clearing, invalid signs, and mid-string edits on the mounted input panel, plus one end-to-end case with a pence amount whose expected result is independently derived.

- [ ] **DI-02 · P1 — Invalidate stale results and expose validation state.** Clearing a required field leaves the previous recommendation visible because the auto-calculation effect returns without invalidating its comparison; dashboard errors and calculating state are not surfaced.

  **DoD:** Incomplete, invalid, updating, and current-result states are explicit and visible; clearing revenue/expenses or switching to an incomplete monthly form removes or clearly marks the previous result. Field errors are associated with their controls, multi-field failures have an actionable summary, and email/save actions require the same current validated input snapshot used by the display. Browser regressions cover invalidation, recovery, mode changes, and export gating.

- [ ] **DI-03 · P1 — Separate affordable monthly draw from desired spending.** The safe-draw helper returns the requested minimum when its cash ceiling is zero, while monthly outputs use the baseline mixed strategy rather than the active what-if scenario.

  **DoD:** Desired personal spending, projected after-tax capacity, actual cash, reserved taxes, and the protected operating buffer are separate quantities with a documented cash/forecast basis. £0 cash cannot produce a positive cash-funded safe recommendation without a modelled receipt; an unfunded requested minimum is shown as a shortfall. Salary, strategy, and profit changes recalculate draw and buffer from the active scenario. Annual mode labels annual take-home divided by 12 as an average, not a safe cash withdrawal. Independent boundary cases cover zero cash, an exhausted buffer, minimum draw above capacity, reserved tax, forecast receipts, and projection-period limits.

- [ ] **DI-04 · P1 — Keep selected strategy, objective, slider, and results aligned.** Selecting All Salary can retain its selected card while the salary slider clamps its amount to the NI upper earnings limit and produces a mixed result; the hero and objective can describe another strategy.

  **DoD:** Named strategies consume their exact calculated results and are never silently changed by a slider effect. Salary-slider affordability uses the shared company-cost calculation, including applicable allowances and benefits, rather than an NI threshold cap. Every selected card agrees with summary, breakdowns, reserves, warnings, and export; moving a what-if salary control exposes a Custom selection. The visible recommendation explicitly follows the chosen objective or is clearly identified as a different reference. Named-strategy parity, affordability boundaries, input changes, objective changes, and custom/reset transitions have browser regression coverage.

- [ ] **DI-05 · P1 — Export the displayed scenario and fulfil the email promise.** Profit/salary what-if state, selected strategy, objective, and accounting-period settings are absent from the email snapshot; the server regenerates the original comparison and the dialog promises key dates that are not generated.

  **Interim guard (lands straight after DI-01 and the main-calculator input fixes):** until the full fix, email is unavailable, with a visible reason, whenever the displayed scenario differs from what the email would contain. That covers a what-if salary or profit, or a selected strategy other than the one the email reports. The dialog does not promise key dates or other content the email lacks.

  **DoD:** Display and export share a validated scenario snapshot containing all inputs needed to reproduce the active result; the server recalculates from that snapshot rather than trusting client-supplied tax totals. Reports clearly distinguish current scenario, original inputs, and comparison alternatives. Salary/profit what-if values and annual/monthly modes reproduce on-screen figures in generated HTML and text; year-end settings and key dates are included if promised, otherwise the promise is corrected. Mocked browser requests and generated-email assertions prove parity without sending real email. Follows DI-04 and the rest of DI-02, which define the active scenario and the validated snapshot it exports.

- [ ] **DI-06 · P1 — Use resolved monthly financials in every breakdown and survival result.** `DetailCards` and `SurvivalModePanel` read annual-mode revenue/expenses while the active calculation uses monthly projections, allowing contradictory company figures or a £0 loss for a loss-making monthly case.

  **DoD:** Both components consume the shared resolved active financials and projection period, with no fallback to retained annual inputs in monthly mode. The visible revenue, expenses, pension, payroll costs, taxable profit, tax, and survival-loss example reconcile with that same scenario. Tests cover a fresh monthly-only session, annual-to-monthly and monthly-to-annual switches, positive/zero/negative projected profit, and changes to projection start month and pension.

- [ ] **DI-07 · P1 — Correct deadline arithmetic and validate accounting-period dates.** Adding nine months then one day gets 7 of 12 month-end due dates wrong against [HMRC CTM01800](https://www.gov.uk/hmrc-internal-manuals/company-taxation-manual/ctm01800) (first day of the tenth month): 31 May, 31 July and 31 December are late (4 Mar, 2 May, 2 Oct); 28 February, 30 April, 30 June and 30 November are a day early; impossible custom dates silently roll into another month and the calendar guesses the next year-end occurrence.

  **DoD:** A complete, valid accounting-period end is selected explicitly; impossible dates are rejected with an associated error and cannot produce an ICS export. One date helper generates visible dates and all-day calendar events without month overflow, including 31 December 2026 → 1 October 2027, non-month-end ends whose ninth month lacks the corresponding day (30 May → 1 March), and every month-end case in the [19 October addendum](reports/director-intelligence-audit-addendum-2026-10-19.md#corporation-tax-deadline-arithmetic-extends-di-07) for the ordinary payment rule. The company tax return filing date comes from the same helper rather than by adding a year to a `Date` (which rolls a 29 February period end into March), with its expected values derived from the primary source and independently tested. Company accounting periods and personal tax years remain distinct, unknown dates are handled explicitly, and instalment-payment exceptions are qualified. Independent cases cover December, leap years, month ends, invalid days/months, previous periods, and unknown dates; events retain stable identifiers and correct exclusive end dates. [HMRC deadline guidance](https://www.gov.uk/pay-corporation-tax) is linked beside the schedule.

- [ ] **DI-08 · P1 — Correct other-PAYE National Insurance treatment.** `getEmployeeNIWithNoThreshold` removes this employment's primary threshold solely because the user has another PAYE job, and Learn repeats that assumption.

  **DoD:** Ordinary separate-employer cases calculate NICs normally on this employer's earnings; any supported aggregation case is distinguished using the necessary facts, or explicitly excluded from the supported model. Independent fixtures and tests pin separate employment, aggregation boundaries, and resulting strategy comparisons; explanatory and pension-related wording agrees with the implemented basis. The implementation is reconciled against [HMRC's employer guide, section 3.4.1](https://www.gov.uk/government/publications/cwg2-further-guide-to-paye-and-national-insurance-contributions/2026-to-2027-employer-further-guide-to-paye-and-national-insurance-contributions#para341), without treating another job as automatic threshold consumption.

- [ ] **DI-19 · P1 — Keep All Dividends within the company's budget when Class 1A applies.** With £80,000 profit and a £10,000 benefit in kind, All Dividends reports Class 1A £1,500, CT £17,450 and dividends £62,550: £81,500 of outflow. Class 1A is deductible ([BIM42523](https://www.gov.uk/hmrc-internal-manuals/business-income-manual/bim42523)), so the independent result is CT £17,052.50 and dividends £61,447.50.

  **DoD:** Every strategy and the slider satisfy salary + secondary Class 1 + Class 1A + CT + dividends + retained = profit after employer pension; Your Setup reports any excess over the same funds through its existing overdraw flag. Class 1A reduces both available funds and CT profit. Independent fixtures cover benefit-in-kind cases for All Dividends, mixed and custom salaries, with expected values derived from statutory rates rather than engine output.

- [ ] **DI-20 · P1 — Attribute the Personal Allowance taper caused by extraction.** With £100,000 of other non-dividend income and a £40,000 pool, All Dividends reports £0 income tax although the £32,400 dividends remove the allowance and add £5,028 tax on the other income; mixed and slider paths cancel the same increment by subtracting a baseline that already uses the reduced allowance.

  **DoD:** Attributed income tax equals tax with the extraction minus tax on the other income alone, where the baseline uses the adjusted net income *without* the extraction, consistently in every strategy, the slider and Your Setup. Independent rUK and Scottish fixtures cover other income below, inside and above the taper band with dividend, salary and mixed extraction. Designed together with DI-08, DI-24 and DI-25 because they share `strategyComparison.ts` income attribution.

- [ ] **DI-21 · P1 — Honour Employment Allowance affordability and feasible minimum salaries.** With an eligible allowance the All Salary card shows £79,347, but the same target through the slider becomes £70,217.39 plus dividends because affordability ignores the allowance. A £60,000 minimum salary (total cost £68,250 against £200,000 profit) returns £50,270 because the search bound replaces the constraint.

  **DoD:** One company-cost affordability calculation, including a declared allowance and Class 1A, serves strategies, slider and custom salaries. A feasible minimum salary is always honoured; an infeasible one is reported rather than silently replaced. Search bounds never override user constraints. Boundary tests cover allowance exhaustion, the Secondary Threshold, the Upper Earnings Limit and minimums above it. Overlaps DI-04's affordability requirement; implement once.

- [ ] **DI-23 · P1 — Correct the Section 455 rate.** The Learn warning states 33.75%; [CTM61505](https://www.gov.uk/hmrc-internal-manuals/company-taxation-manual/ctm61505) gives 35.75% for loans made on or after 6 April 2026.

  **DoD:** The rate is derived from the canonical dividend upper-rate policy for the tax year in which the loan is made, not stored as a separate value. [CTA 2010 s455(2)](https://www.legislation.gov.uk/ukpga/2010/4/section/455) charges "such percentage of the amount of the loan or advance as corresponds to the dividend upper rate specified in section 8(2) of ITA 2007 for the tax year in which the loan or advance is made". There is no loan-date input, so the warning states which tax year's loans it describes. Years outside the supported policy range are handled explicitly, never by silent fallback. The warning links CTM61505, and a content test fails if the text diverges from the derived rate. The `33.75` EducationPanel entry in `scripts/tax-facts-baseline.ts` is removed in the same PR, under the shrink-only rule.

- [ ] **DI-24 · P1 — Use one National Insurance basis for Your Setup and every other path.** With other PAYE employment flagged, Your Setup reports £0 employee NI at £12,570 while the slider reports £1,005.60 for the same salary, so its comparison delta uses a different basis.

  **DoD:** Your Setup, strategies and slider obtain employee NI from the same owner and inputs; after DI-08 that is the separate-employer statutory basis. A cross-path test asserts equal NI for equal salary and flags. Land with DI-08.

- [ ] **DI-25 · P1 — Do not deduct another employer's student-loan collection from director take-home.** With £40,000 other employment income on Plan 2, the full £5,461.52 repayment is deducted from the director scenario although about £955.35 is already collected through the other employer's PAYE.

  **DoD:** Attributed repayment equals the total liability less the amount attributable to the other income, consistent with income-tax attribution (DI-20). Plans, postgraduate loans and the Self Assessment treatment of unearned income are confirmed against current GOV.UK/Student Loans Company guidance before fixtures are written. Independent fixtures cover each supported plan with and without other income.

- [ ] **DI-26 · P1 — Align the empty-state instructions with the input contract.** The empty state asks for "company profit" and then expenses, while the fields are Annual Revenue and Business Expenses (excluding the salary being compared); following the instructions can deduct expenses twice. Verified from PR #120.

  **DoD:** Empty-state steps, field labels, hints and tooltips describe the same revenue-minus-expenses contract and state which payroll costs to exclude. A component test pins the wording against the mounted fields. No new input mode is added without a product decision.

- [ ] **DI-27 · P1 — Disclose that amounts already paid do not constrain annual strategies.** Entering £20,000 salary and £5,000 dividends already paid leaves every strategy unchanged, including a £12,570 Baseline Mix salary below the salary already paid. A director part-way through the year can therefore be shown a strategy they can no longer follow, with figures that do not describe their real year. Verified from PR #120.

  **DoD:** Results state that comparisons are full-year totals not adjusted for amounts already paid, and warn when a strategy's salary or dividends fall below amounts already paid. A remaining-year planning contract (paid-to date, director NI method, payroll history) requires an explicit product decision before implementation and is not part of this item.

#### Verified explanation, accessibility, layout and output defects (P2)

- [ ] **DI-09 · P2 — Reconcile every financial total and allocation.** Headline deductions include student loans while the detailed total omits them; displayed taxable profit omits loss relief/pension workings; the dividend taxable amount ignores unused Personal Allowance; Money Flow omits personal deductions and subtracts pension again from an already reduced profit basis.

  **DoD:** A shared calculation-basis projection supplies the company-profit → pension/payroll → company-tax → salary/dividend → personal-deduction → take-home/retained bridge. Student loan repayments, tax/NI, and total deductions are separately labelled and reconcile; loss relief and pension appear in the taxable-profit workings; the dividend calculation explains both unused Personal Allowance and dividend allowance. Money Flow includes all allocation categories, labels pre-/post-pension profit correctly, deducts pension once, and reconciles to the stated starting amount. Representative student-loan, pension, loss, unused-allowance, benefit, and custom-scenario cases assert displayed/engine agreement without creating a second tax calculator.

- [ ] **DI-10 · P2 — Surface consequential warnings and tie them to the active scenario.** Important warnings are hidden in the collapsed Learn panel, use the baseline strategy, and are tracked as seen merely because their component mounted.

  **DoD:** A concise warning summary is visible beside the decision/result even with Learn closed, with links to relevant detail and clear severity. Warning inputs follow the active strategy, salary, profit, and monthly scenario; critical messages remain discoverable on mobile. Seen analytics requires actual visibility rather than hidden mounting and preserves consent gating. Browser/component checks cover hidden Learn, a scenario crossing a warning boundary, summary navigation, warning removal, and visible-only analytics.

- [ ] **DI-11 · P2 — Correct and qualify Director financial explanations.** Learn and survival/pension messaging overstate dividend timing, VAT registration, NI-record certainty, taper rates, contract-end risk, and distributable-profit conclusions; the Child Benefit warning disappears above its upper threshold.

  **DoD:** Each of these corrections is independently verified against relevant primary sources and asserted in focused content/condition tests: dividend timing distinguishes due-and-payable treatment and interim/final dividends; VAT prompts use taxable-turnover registration tests and correct notification timing rather than annual forecasts; pension messaging describes this salary's potential contribution and allows other qualifying contributions/credits; taper wording reflects region and income composition; Child Benefit guidance remains useful above the full-charge threshold; contract-end wording requires actual contract-end evidence or is renamed to describe the projection/runway condition; a current-year loss is not presented as proof that historic distributable reserves are unavailable; the Employment Allowance tooltip states HMRC's test (ineligible where the sole director is the only employee liable for secondary Class 1; an extra employee paid below the Secondary Threshold does not qualify) instead of "only director/employee in most cases". Relevant HMRC/DWP links accompany explanations; no new tax assumptions are invented. See the audit's primary-source references. Wording tied to a calculation fix lands with that fix, so the explanation always matches the behaviour: NI-record and other-employment wording with DI-08, the Employment Allowance tooltip with DI-21, and taper wording with DI-20.

- [ ] **DI-12 · P2 — Repair control semantics, contrast, announcements, and landmarks.** The audit found unnamed salary/profit sliders and chart progressbars, failing hint/warning contrast, nested/duplicate main landmarks, visual-only strategy selection, and no deliberate calculation-completion announcement.

  **DoD:** Both slider thumbs have accessible names, linked visible labels, and currency/percentage value text. The money chart has appropriate chart/list/table semantics, labelled values, and a text equivalent rather than unnamed progress semantics. Tested hint/warning states meet WCAG AA contrast; there is one main landmark with a working skip target; strategy selection is exposed as a labelled single-choice state. A concise debounced result status is announced without reading every changing monetary row. Automated desktop/mobile accessibility checks plus manual keyboard and screen-reader checks verify these behaviours; no new violations are introduced.

- [ ] **DI-13 · P2 — Use complete modal behaviour for mobile input and Learn drawers.** The custom drawer handles Escape but does not wrap Tab focus or restore it to the opener, and only part of the background is made inert.

  **DoD:** Drawers use the existing accessible dialog foundation or equivalent verified behaviour: focus enters appropriately, Tab/Shift+Tab stay inside, all background content is inert, Escape/close works, scrolling is restored, and closing returns focus to the invoking control. View Results requires current valid results and announces readiness. Tests cover both drawers, first/last focus boundaries, the sibling FAQ/skip link, opening/closing with the keyboard, and focus return after editing. Follow the [W3C modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

- [ ] **DI-14 · P2 — Make panel layouts respond to usable workspace width.** At a 1024px viewport, fixed inputs/navigation/Learn panels leave a result workspace of at most about 360px (295–360px depending on the element measured and timing) whose content overflows and whose headline figures overlap.

  **DoD:** Result components respond to their container width, retain a documented useful minimum width, and stack headline side metrics when necessary. Learn/inputs switch to drawers or overlays when simultaneous panels would squeeze results, while preserving the current input state and controls. Direct browser checks cover 320, 390, 768, 1024, 1280, and 1440 CSS pixels with applicable panels expanded/collapsed, large financial values, and 200% zoom; headings, figures, controls, and focus remain usable without accidental horizontal overflow or overlap.

- [ ] **DI-16 · P2 — Make print, copy, and email outputs useful and accessible.** Print CSS retains fixed-height scrolling, hides strategy cards because they are buttons, and relies on brittle panel class-name matching; email success is not deliberately announced.

  **DoD:** Explicit print hooks remove containing height/overflow constraints and non-report panels/actions; printable static strategy summaries remain visible. A copy/print action sits beside email, and saved output includes the selected inputs/scenario, tax year, assumptions, complete deductions, relevant sources, generated date, and supported dates. Multi-page print/PDF inspection confirms readable pagination and complete output. Email retains autocomplete and associated errors, announces success, and has verified focus behaviour after success/retry/close. Snapshot parity is shared with DI-05 rather than implemented twice.

- [ ] **DI-22 · P2 — Retire or correct the unrendered legacy Director route.** `calculateDirectorScenario` is computed by the store but never rendered, and returns dividends of −£705.50 for £13,000 profit; its tests anchor a route users do not see.

  **DoD:** Either the route is removed and its useful assertions are re-pointed at the rendered strategy path, or it is corrected so dividends cannot be negative and its relationship to the rendered path is documented. Aligns with the Foundation principle of one supported route to each statutory calculation; no new calculator is introduced.


### Verification

- [ ] Fixture coverage for every supported year and every band boundary (current suites concentrate on 2026-27 plus Scottish top-rate history). DoD: each supported year has independent fixtures at each band edge.
- [ ] Statutory-boundary scenarios independent of stored thresholds for each band edge (extend the `progressive-120k-no-top-rate` pattern). DoD: each band edge has a fixture whose expected values are derived from statutory numbers, not repo thresholds.
- [ ] Director annual-method consistency test: Scottish-tool/main-engine and NI-tool/main-engine comparisons exist. DoD: the remaining Director annual-method comparison has a documented tolerance and passes.
- [ ] Article-to-engine verification for every published figure in evergreen posts. DoD: a check maps each evergreen figure to verified engine output and fails on drift.
- [ ] Fixture provenance controls: per-scenario official-figure citations; derivations start from statutory numbers, never from repo thresholds; reviewer instructions verify against sources (the PR #83 lesson). DoD: every fixture carries a source citation and the review rule is written into `TESTING.md`.
- [ ] Public human-readable calculator verification report generated from the fixture suites, replacing hand-written accuracy claims. DoD: the report generates from fixtures and the public claims cite it.
- [ ] Machine-readable verification output (extend `/api/tax-rates` or a dedicated route). DoD: the route serves generated verification data and is covered by a test.
- [ ] Documented modelling assumptions and limitations (month-1 projection, NI year model and pension method). Non-cumulative tax-code limitations are now visible. DoD: the remaining assumptions are published where users see results and kept in sync with the engine.

### Trust and sourcing

- [ ] Revenue Scotland misattribution: homepage FAQ link label, compliance page (twice), llms.txt. Scottish income tax is set by the Scottish Parliament and administered by HMRC. DoD: the homepage FAQ, both compliance references and `llms.txt` state the Parliament/HMRC roles correctly.
- [ ] Compliance-page overclaims: "historical rates back to 2020/21" (data starts 2023-24), "updates within 24 hours / same day / immediately", "independently verified against Revenue Scotland", ITTOIA 2005 cited for income-tax rates (ITA 2007 / Finance Acts / SRR). DoD: each claim corrected to match verifiable evidence or removed.
- [ ] Official-source registry: add legal basis (SRR motions, ITA 2007, SI numbers) alongside URLs. DoD: the registry lists legal bases and trust surfaces cite them correctly.
- [ ] Homepage and llms.txt trust wording aligned to what fixtures actually prove. DoD: wording states only what the verification suites demonstrate.
- [ ] Replace unsupported accuracy/verification claims with evidence-backed wording generated from verification output (update cadence, historical coverage, testing claims). DoD: no public accuracy claim exists without generated or cited evidence.

### Content accuracy

- [ ] Tax-code guide: add the statutory 50% overriding limit; fix the "K500 = you owe £5,000" conflation; refresh stale 2025-26 titles/meta; cover Scottish SD codes. DoD: all four corrections published and consistent with the engine.
- [ ] Remaining salary-page unsupported-claim audit: after the priority repair, inspect the retained series for uncited percentile/median, lifestyle, rent, savings and mortgage claims. The verified £70k article is the reference pattern and should not be rewritten without a reproduced defect. DoD: each remaining claim is sourced from an appropriate primary dataset, qualified or removed.
- [ ] Evergreen vs historical article policy: frontmatter declares the mode. DoD: evergreen posts contain no hardcoded rate values; historical posts stay pinned and labelled; the blog audit enforces the split.
- [ ] Blog visual refresh: regenerate legacy post images into the Ledger editorial style and retire stale tax-year content in small verified batches. DoD: each batch lands with refreshed imagery and verified figures.

### Production and public evidence

Work here completes only against deployed behaviour, external services or recorded external evidence — not local tests.

- [ ] Production verification of analytics consent withdrawal behaviour (post-PR #78). DoD: dashboard and behaviour evidence recorded in a dated report.
- [ ] Periodic external oracle cross-check (HMRC test data or an independent calculator sample). DoD: a dated report records the sample, source and outcome.

### Search and discoverability

- [ ] Beginner-guide contextual inbound links: add a small number of genuinely relevant inline anchors from retained guides that already discuss PAYE basics, tax codes or employee deductions. Do not add site-wide boilerplate or rewrite the beginner article in this slice, and do not prioritise it above the active correctness sequence. DoD: the source graph records the deliberate links and each anchor is contextually useful.

## Parked / Triggered work

These are not active for the R&D app unless traffic evidence or an explicit product decision makes them worthwhile.

- Retired intent-route redirects and index remnants. Trigger: Search Console shows material impressions or confusing snippets for retired routes. DoD: affected routes redirected or cleaned, with the GSC evidence and outcome recorded.
- Beginner-guide content/rewrite follow-up. Trigger: Google has recrawled the 29 July rewrite and matched page/query evidence still shows a content or intent problem. DoD: diagnose the post-recrawl evidence before another content, metadata or intent overhaul; keep this separate from the active contextual-link item above.
- Local Search Console CSV analyser. Trigger: redacted page/query exports are available and another manual reconciliation would otherwise be required. DoD: a small credential-free script produces reproducible summaries without storing personal or sensitive exports.
- New calculator variants such as reverse salary, two-job, pro-rata, bonus/overtime, or salary comparison. Trigger: an explicit product decision that one variant is genuinely useful, evaluated one at a time. DoD: the chosen variant ships tested and verified, not as growth-page coverage.
- Separate FAQ/HowTo/`llms.txt` expectation docs. Trigger: evidence that the existing static HTML, visible citations, Dataset JSON-LD and crawlable tax facts stop serving AEO/GEO needs. DoD: a documented decision either adds the docs with owners or confirms the current assets suffice.
- Director Intelligence design and refactoring proposals DI-15, DI-17 and DI-18 (from the [18 October audit](reports/director-intelligence-audit-2026-10-18.md)). These are not defects: they propose a mobile hierarchy, input-component consolidation and context/naming/persistence changes. Trigger: an explicit product decision. Verified facts inside them (dormant input modules with stale help, inconsistent page naming) stay true; their stated DoDs are retained below for reference.

  - **DI-15 · Proposal — Simplify the mobile journey and visual hierarchy.** The empty state delays the main entry action; repeated summary cards and expanded workings make results long; sliders lack precise entry, Your Setup requires hunting through Full Inputs, and normal tax costs use error-like colour.

    **DoD:** The first mobile viewport offers an obvious Enter company figures action and concise task explanation; any example mode is explicitly distinguished from real inputs. One primary take-home result, selected salary/dividend split, reserves, and important checks lead the page, with repeated metrics compacted and detailed workings/education available on demand. Sliders also offer exact numeric entry, a visible current value, and reset; Your Setup has a direct edit route with explicit apply/cancel/reset/clear semantics. Major touch actions are comfortable to target, mobile text/keyboard behaviour is checked on iOS, jargon such as YTD is explained, scripted navigation respects reduced-motion settings, and navigation prioritises the current workflow with labelled major actions rather than competing icon-only menus. Normal deductions use neutral styling; error/success colour has a consistent meaning and shared radius/spacing/border tokens retain the Ledger identity. Before/after desktop/mobile captures demonstrate the revised journey without removing required detail.

  - **DI-17 · Proposal — Consolidate live input components and scenario ownership.** The large mounted `InputsPanel` duplicates seven standalone input modules; those modules and `TaxBreakdownTable` have no live consumer beyond exports, while repeated active-scenario hooks can repeat calculation work.

    **DoD:** An import/consumer audit identifies the production owner of every field and breakdown; unused paths are retired or deliberately integrated after checking consumers, with stale examples/help corrected. Coherent input groups share parsing, validation, labels, and help; tests exercise the mounted production paths instead of treating dormant-module tests as live coverage. Objective, strategy/custom salary, profit adjustment, validated inputs, resolved financials, and result provenance have one coherent ownership path; repeated scenario work is centralised where profiling justifies it. Existing tax-domain owners are preserved, no duplicate calculator/generic rules framework is introduced, and interaction performance is measured before/after any optimisation.

  - **DI-18 · Proposal — Make assumptions, sources, naming, and remembered state visible.** Essential context lives in optional Learn, product/strategy names vary across the route and metadata, and device persistence/reset behaviour is not clear at the decision point.

    **DoD:** A visible context strip states tax year, region, projection period, and selected scenario, with accessible links to calculation basis and relevant primary sources. Route title, heading, navigation, metadata, FAQ placement, and strategy labels use consistent task language; qualified estimates replace unbounded recommendation/optimal claims. Users are told figures are remembered on this device, can clearly erase them, and can undo an accidental reset or recover equivalently. Expiry/tax-year restoration and the existing hidden-detail notice remain correct and tested; Quick Start reveals active saved details rather than concealing their effect. The dated audit remains evidence, and evergreen guidance reflects the final verified behaviour.

New work should add a small, concrete item here only when it is not going straight into an issue or pull request.
