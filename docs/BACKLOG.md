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

Verified Director Intelligence correctness exceptions (see [Urgent correctness exceptions](#urgent-correctness-exceptions)) may be taken as small independent slices between these items; they do not reorder them. Main-calculator input integrity comes next: parsing is merged, but PRs #127 and #128 are open and their work must not be marked complete.

For the calculator reconciliation, use the [22 October evidence and decisions](reports/calculator-backlog-reconciliation-2026-10-22.md). The implementation order is:

1. Close MC-01, MC-02 and MC-03's integrity criteria in the input-integrity prerequisite (#127), with store and browser regressions. #127 must independently prevent stale results, mismatched email and stale suggestions before merge; those requirements cannot wait for #128. MC-09, a reproduced wrong-money defect in the same suggestion handler, joins the MC-03 slice as its own commit.
2. Complete the DI-05 interim email guard next. MC-03's presentation scope and MC-04/05 may then proceed alongside the Director urgent slices, without pre-empting a ready, verified wrong-money fix. The entire Director queue is not a prerequisite for completing the main calculator; retain its internal order and existing Foundation insertion points.
3. Before the first deployment containing #128's homepage/hero change, complete the search audit's pre-deployment gate below. This applies to that change wherever it is eventually delivered, not merely a later audit PR. MC-04/05 and #127's integrity guarantees are also acceptance requirements for the redesign.
4. MC-06/07 are smaller follow-ups. Complete the search audit's performance observation after release using the windows and mitigation trigger recorded before deployment. Any newly reproduced wrong-money defect takes correctness priority.

Each implementation slice carries its own relevant regression coverage and independent review by the other model (Claude reviews Codex changes and vice versa), reconciliation against code/evidence, and re-review after material fixes. MC-08 owns only the remaining coverage gaps listed there. Record exact refs and results; do not infer approval from earlier audits. Keep the PRs small, reuse the existing checks and reports, and merge only when separately authorised.

When rebasing #127/#128, reconcile their `BACKLOG.md` and `PROJECT_STATE.md` edits against this authoritative backlog: discard superseded deletions, premature "landed" claims, duplicate queues and conflicting design decisions, not useful evidence. Preserve distinct implementation details and dated verification in reports, and update current-state prose only to verified merged behaviour. An MC item is removed or narrowed only by the PR that demonstrably closes that scope, with evidence; do not accept an older branch's version wholesale. The [reconciliation report](reports/calculator-backlog-reconciliation-2026-10-22.md#documentation-reconciliation-on-rebase) maps the conflicts.

### Security and dependencies

The 24 October dependency advisories (Next.js, Sentry, Zod, fast-uri) were patched in [#133](https://github.com/jarrydaubert/payetax/pull/133), which carries the exposure assessment and verification. It was merged and deployed to production as `28f0a63` on 26 October. The items below are its residual findings.

- [ ] P2 — Results-email routes buffer the whole request before the size check. `send-results` and `send-director-results` call `request.text()` and only then compare `rawBody.length` (50 × 1024 *characters*, not bytes) with `MAX_BODY_SIZE`. Zod 4.6.6 now bounds validation work for oversized collections (#133's regressions), but nothing limits how much is read. DoD: record the platform's effective request-body limit for these functions from current Vercel documentation. Then either justify that limit as sufficient, or reject oversized requests before buffering, measured in bytes. Keep the existing 413 response, origin, rate-limit and validation order, with regressions for an oversized body and for a missing or understated `Content-Length`.
- [ ] P3 — Zod is pinned twice. `package.json` lists `zod` 4.6.6 in both `dependencies` and `overrides`. The override was needed to remove Knip's nested 4.4.3, and it silently wins over the direct pin: in #133's review, a frozen install with a direct pin of 4.6.5 still resolved 4.6.6. DoD: the two cannot drift unnoticed. Either a repo check fails when they differ, or the override is removed once a frozen install proves no vulnerable nested copy remains.

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

Currency parsing through `parseCurrencyInput` is merged in #125. The following items replace the previous focus/stale-result and pension-switch entries, including the outstanding work in [#127](https://github.com/jarrydaubert/payetax/pull/127). Claude's review reports two additional blockers; #128 inherits them and the existing stale-result integrity requirements. The [reported review evidence](reports/calculator-backlog-reconciliation-2026-10-22.md#reported-calculator-review-evidence) records reproduction details and limits without depending on private chat access.

- [ ] **MC-01 · P1 · Release blocker — Preserve the intended amount through focus, typing and blur.** Main erases untouched values on focus/blur; #127's select-on-focus replacement can insert typed digits into existing text in WebKit, silently calculating a different salary (Claude B1).

  **DoD:** Focus-and-leave preserves the value; deliberately clearing a used amount retains an explicit empty/error state rather than committing zero. Replacing initial `0.00` and an existing £25,000 with `30000` produces exactly £30,000, or a specific visible rejection, never another accepted amount. Mounted salary, pension, allowance, partner-wage and additional-income fields preserve pence and reject malformed/negative text. Production-browser regressions exercise pointer clicks at left/middle/right positions, touch entry, keyboard focus and actual typing/paste in Chromium and WebKit; replacement tests must not rely solely on `fill()`. Existing valid entry, Enter/Calculate, Reset and focus-return journeys still work. Before #127 merges or any affected release ships, the fixed head passes repeat runs of the targeted WebKit regression on desktop and touch-emulated mobile. Record the command, ref, engine version, projects, repeat/worker counts and results. A local production-build run is sufficient; explicitly record that Chromium-only CI does not enforce it and that emulation is not a physical-iPhone test. Missing or failing WebKit evidence blocks acceptance, not a reason to assume Chromium parity. Stale-result behaviour belongs to MC-03.

- [ ] **MC-02 · P1 · Release blocker — Keep pension units and restored inputs valid and recoverable.** Main can reinterpret £5,000 as 5,000%. #127 resets new unit changes, but its persistence merge still accepts a previously saved percentage above 100; Calculate then throws without an actionable field error (Claude B2; #128 adds a form alert).

  **DoD:** £↔% changes never silently reinterpret a contribution; the resulting value and unit are valid or visibly need correction, and any reset/conversion is explained. Returning visitors with synthetic legacy `{pensionContribution: 5000, pensionContributionType: 'percentage'}` can recover without clearing browser storage: invalid restored data is visibly corrected or associated with the pension field and blocks calculation until resolved. Calculate never silently fails or publishes a result for invalid input. Store and production-browser regressions in Chromium and WebKit cover both switch directions within/above limits, valid restoration, the legacy case and recovery; store tests also cover expiry and tax-year rollover. Edits still require Calculate under MC-03. This is input integrity, not the separate Foundation pension-method work.

- [ ] **MC-03 · P1 · #127 integrity acceptance; separate #128 presentation scope — Keep calculation explicit and prevent stale-result use.** Valid edits on main leave current-looking results and mismatched email/suggestions; #127 clears them atomically, while #128 removes the entire statement on the first keystroke (Claude S2). Both PRs still recalculate immediately when a pension suggestion is applied, contrary to the product decision.

  **#127 DoD (release-blocking integrity):** Every calculation-input change, including valid/invalid drafts, pay frequency, year, region/code, hours, loans, exemptions, source add/remove and pension suggestions, requires an explicit Calculate submission before new results become current. Applying a current suggestion changes the input only; a stale suggestion cannot be applied. Existing Enter-to-submit remains an explicit Calculate action. Presentation-only period/comparison changes reuse the same calculation. After an edit, no result is presented as current. Email (including an already-open dialog) and result-dependent actions cannot send/apply stale or invalid data; after successful Calculate they use the same validated inputs as the displayed result. Mounted-store and desktop/mobile Chromium/WebKit regressions cover £30,000 calculated → valid £40,000 edit → blur → no calculation/no stale export or suggestion → Calculate → matching result/email, plus invalid drafts, recovery and suggestion application. Preserve these guarantees when rebasing #128; do not close this scope solely because MC-01/02 pass.

  **#128 DoD (presentation):** Edits expose an accessible "Inputs changed — Calculate again" state. Previous figures may be cleared or retained as context; if retained, they are visibly out of date and cannot be mistaken for, or combined with, results for the new inputs. First use and Reset show no calculated result or enabled result actions and offer salary entry/Calculate; after editing an existing result, the message requests recalculation rather than saying no salary was entered. Invalid submissions identify the affected fields and allow correction without losing entered values or trapping focus. Verify those states across desktop cards/table and mobile statement. Presentation choices do not defer or replace #127's integrity criteria.

- [ ] **MC-09 · P1 · Wrong money (reproduced) — Apply tax-trap suggestions as an annual addition in the user's pay period.** `CalculatorContainer.handleApplyPensionOptimization` writes `calculateOptimalPension`'s annual *additional* amount directly as `pensionContribution` with type `amount`. The engine (`payePayBasis.ts`) reads that amount per selected pay period, and the write replaces any existing contribution although the alert says "Add". Reproduced against the engine on 24 October (2026-27, England): £110,000 entered monthly → "Add £10,000" → £110,000 annual pension (capped at gross); £110,000 annual with £5,000 existing → "Add £5,000" → £5,000 total, leaving adjusted income in the taper. Present on `main` and #127.

  **DoD:** Applying a suggestion produces existing annual pension plus the suggested amount, stored correctly for the current pay period; converting an existing percentage to £ is visibly explained. The alert's wording matches the behaviour. Under MC-03, applying changes the input only and waits for Calculate. Mounted regressions fail before and pass after for monthly and weekly input, an existing £ contribution and an existing % contribution, and confirm the alert no longer shows after Calculate once adjusted income reaches the threshold. Deliver as a separate commit in the MC-03 slice, or first if MC-03 is delayed.

### Main calculator experience

The agreed target combines compact desktop results with the simpler mobile statement. [#128](https://github.com/jarrydaubert/payetax/pull/128) is an unmerged starting point, not acceptance of its removal of desktop cards or comparison-by-mode. Preserve its verified improvements where applicable; do not restore the original audit defects.

- [ ] **MC-04 · P2 · Redesign acceptance — Lead with the user's pay period.** #128 always starts Monthly (Claude S1).

  **DoD:** On successful Calculate, the statement starts in the submitted input period for monthly, four-weekly, fortnightly, weekly, daily and hourly pay; annual input defaults to Monthly with annual context. A subsequent Calculate applies that rule to the newly submitted input. Users can inspect other periods without recalculation, and resizing preserves the current calculation and selected presentation. Tests cover all seven input periods, a changed input period and display-only switching, using engine-owned period values.

- [ ] **MC-05 · P2 · Redesign acceptance — Restore desktop density and preserve the mobile payslip.** #128 removes all five cards, stretches statement rows widely and puts comparison behind an action below the statement (Claude S3 and the product discussion).

  **DoD:** Desktop shows five summary cards and all seven period columns in the default results flow, without opening a comparison mode. Preserve annual/monthly take-home, annual Tax & NI and a clearly defined effective-rate summary; the fifth card explains the next-£100 payroll difference honestly rather than calling it a statutory marginal rate. After Calculate, the five cards, table headers and first monetary row are visible together at 1440×900, 1920×1080 and 2560×1440 without further interaction or scrolling through a statement. Full figures, pence and essential labels remain unobscured with no unintended horizontal scrolling. Before/after captures at those widths demonstrate label-to-value alignment and are assessed by the independent reviewer before acceptance; there is no fixed column-width prescription. The mobile statement, direct Edit action and complete two-period comparison remain usable at 393×852, 852×393 and 320px width. Breakpoint neighbours, 200% zoom, large amounts, active optional inputs and errors stay usable. All details remain reachable, native copying works, and computed visibility confirms five-card content is visible with reduced motion. Keyboard, semantic headers, focus and light/dark contrast are verified in both engines. Exact layout and breakpoint choices are left to implementation; MC-03's current/stale distinction applies to every card/table/statement.

  **Production evidence (`28f0a63`, 26 October):** main already shows the five cards and seven period columns, but the table overflows at every desktop width. `ResultsTable` sets a 74.5rem minimum (15rem fixed plus 7 × 8.5rem), which is 1,192px before card padding. `CalculatorContainer` gives the results column about 962px at 1440 (`xl:px-8`, a 390px input column, `gap-6`). From 1536 upwards it is capped at about 1,068px (`max-w-screen-2xl`, a 380px column), so wider monitors never help. The shortfall at 1440 is about 230px; narrowing columns towards the widest realistic value (£1,234,567.89) recovers only about 70px, so meeting this DoD needs a structural layout change. What-if mode doubles the period columns (134.5rem) and cannot fit any common desktop width. Acceptance must state what-if's intended behaviour rather than treat its scrolling as unintended. Whether to fix the existing desktop layout on `main` before #128 lands is an open sequencing decision.

- [ ] **MC-06 · P2 · Follow-up — Make deduction and rounding presentation auditable.** Claude found unsigned deductions, no deduction total and period statements that differ by a penny when rounded displayed rows are added.

  **DoD:** Users can identify gross pay, each employee deduction, total deductions, any non-taxable addition and take-home consistently across statement/comparison. Deduction signs and zero-row visibility follow one documented convention, including zero pension versus zero allowance. Employer NI is visibly separate from employee deductions; tax-band rows describe income taxed in a band. A reproduced reconciliation for each of the seven periods, including pension/loans/allowance cases, either balances at displayed precision or has a nearby, accurate explanation of the rounding difference and its size. Preserve engine-owned period figures; do not adjust statutory results merely to balance a display. Any discovered calculation defect becomes a correctness slice with independent expectations. This does not duplicate Foundation rounding ownership or the existing marginal-rate chart/optimizer tasks.

- [ ] **MC-07 · P2 · Polish — Use consistent labels and readable input proportions.** #128 exposes `fourWeekly` in the mobile setup summary, calls paired comparison "all 7", varies Gross/Net/Take-home labels and wraps common field labels in the narrow input rail.

  **DoD:** Setup summaries use human-readable names for every period; comparison headings describe the periods actually shown while making all seven discoverable. The same financial concepts use consistent wording across summary, statement and comparison. Common labels such as Tax code and Student loan remain readable with their controls at supported widths, zoom and expanded-error states, without squeezing financial figures. Essential inputs remain easy to edit; active optional adjustments, rejected text, named pension units and salary-sacrifice assumptions stay visible or clearly signposted. Keyboard and screen-reader names agree with visible labels. Typography changes are optional and judged by readability, not a separate font redesign.

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
and updates `TESTING.md`, in line with the compact independent fixture set in the Foundation
burn-down.

#### Urgent correctness exceptions

These items silently alter inputs or show wrong money figures, deadlines or statutory rates. Under
the first working rule they may be taken as small independent slices between the Foundation items
in the current correctness sequence; they do not reorder that sequence, and an exception that needs
a Foundation change waits for, or is folded into, that Foundation item. DI-05, DI-06, DI-26 and
DI-27 are exceptions because they show or send wrong money figures (decision: PR #123).

Agreed order, with one small PR per item unless stated otherwise (DI-08 lands with DI-24). DI-01
and the minimal part of DI-02 have landed:

1. The [main-calculator input-integrity queue](#main-calculator-input-integrity): currency parsing
   is merged; MC-01/02 and MC-03's integrity scope are #127 acceptance criteria, inherited by #128.
   Keep fixes independently reviewable; neither PR is merged.
2. The interim email guard from DI-05.
3. DI-07, then DI-26, DI-23, DI-06 and DI-27.
4. Company budget: DI-19, then DI-21.
5. Personal tax: DI-08 with DI-24, then DI-20, then DI-25. DI-08, DI-20, DI-24 and DI-25 share
   `strategyComparison.ts` income attribution; the DI-08/DI-24 PR settles the shared helper's
   design.
6. DI-04, the rest of DI-02, DI-05, then DI-03.

In the current correctness sequence, explicit pension-method handling is planned after step 3
and before step 4, and transparent calculation results after step 5.

- [ ] **DI-02 · P1 — Expose validation and updating state (remaining scope).** An empty or invalid required input, or any invalid amount, now removes the previous result and disables email (minimal slice, landed with DI-01). Still open: the debounced recalculation leaves the previous result on screen, looking current, until the new one arrives; the store's `error` and `isCalculating` are not surfaced; there is no summary when several fields need attention; and email and save do not yet share one validated input snapshot with the display.

  **DoD:** Incomplete, invalid, updating, and current-result states are explicit and visible. Field errors stay associated with their controls (currency fields already are), multi-field failures have an actionable summary, and email/save actions require the same current validated input snapshot used by the display. Browser regressions cover the updating state, recovery, mode changes, and export gating against that snapshot.

- [ ] **DI-03 · P1 — Separate affordable monthly draw from desired spending.** The safe-draw helper returns the requested minimum when its cash ceiling is zero, while monthly outputs use the baseline mixed strategy rather than the active what-if scenario.

  **DoD:** Desired personal spending, projected after-tax capacity, actual cash, reserved taxes, and the protected operating buffer are separate quantities with a documented cash/forecast basis. £0 cash cannot produce a positive cash-funded safe recommendation without a modelled receipt; an unfunded requested minimum is shown as a shortfall. Salary, strategy, and profit changes recalculate draw and buffer from the active scenario. Annual mode labels annual take-home divided by 12 as an average, not a safe cash withdrawal. Independent boundary cases cover zero cash, an exhausted buffer, minimum draw above capacity, reserved tax, forecast receipts, and projection-period limits.

- [ ] **DI-04 · P1 — Keep selected strategy, objective, slider, and results aligned.** Selecting All Salary can retain its selected card while the salary slider clamps its amount to the NI upper earnings limit and produces a mixed result; the hero and objective can describe another strategy.

  **DoD:** Named strategies consume their exact calculated results and are never silently changed by a slider effect. Salary-slider affordability reuses DI-21's shared company-cost calculation, including applicable allowances and benefits, rather than an NI threshold cap. Every selected card agrees with summary, breakdowns, reserves, warnings, and export; moving a what-if salary control exposes a Custom selection. The visible recommendation explicitly follows the chosen objective or is clearly identified as a different reference. Named-strategy parity, affordability boundaries, input changes, objective changes, and custom/reset transitions have browser regression coverage.

- [ ] **DI-05 · P1 — Export the displayed scenario and fulfil the email promise.** Profit/salary what-if state, selected strategy, objective, and accounting-period settings are absent from the email snapshot; the server regenerates the original comparison and the dialog promises key dates that are not generated.

  **Interim guard (lands straight after the main-calculator input fixes):** until the full fix, email is unavailable, with a visible reason, whenever the displayed scenario differs from what the email would contain. This includes at least a what-if salary or profit, a selected strategy other than the one the email reports, and a chosen objective, none of which the email payload currently carries. The dialog does not promise key dates or other content the email lacks. Mocked-request browser tests show email disabled, with its reason, for each divergence and enabled when the displayed scenario matches; a dialog copy test confirms key dates are no longer promised.

  **DoD:** Display and export share a validated scenario snapshot containing all inputs needed to reproduce the active result; the server recalculates from that snapshot rather than trusting client-supplied tax totals. Reports clearly distinguish current scenario, original inputs, and comparison alternatives. Salary/profit what-if values and annual/monthly modes reproduce on-screen figures in generated HTML and text; year-end settings and key dates are included if promised, otherwise the promise is corrected. Mocked browser requests and generated-email assertions prove parity without sending real email. Follows DI-04 and the rest of DI-02, which define the active scenario and the validated snapshot it exports.

- [ ] **DI-06 · P1 — Use resolved monthly financials in every breakdown and survival result.** `DetailCards` and `SurvivalModePanel` read annual-mode revenue/expenses while the active calculation uses monthly projections, allowing contradictory company figures or a £0 loss for a loss-making monthly case.

  **DoD:** Both components consume the shared resolved active financials and projection period, with no fallback to retained annual inputs in monthly mode. The visible revenue, expenses, pension, payroll costs, taxable profit, tax, and survival-loss example reconcile with that same scenario. Tests cover a fresh monthly-only session, annual-to-monthly and monthly-to-annual switches, positive/zero/negative projected profit, and changes to projection start month and pension.

- [ ] **DI-07 · P1 — Correct deadline arithmetic and validate accounting-period dates.** Adding nine months then one day gets 7 of 12 month-end due dates wrong against [HMRC CTM01800](https://www.gov.uk/hmrc-internal-manuals/company-taxation-manual/ctm01800) (first day of the tenth month): 31 May, 31 July and 31 December are late (4 Mar, 2 May, 2 Oct); 28 February, 30 April, 30 June and 30 November are a day early; impossible custom dates silently roll into another month and the calendar guesses the next year-end occurrence.

  **DoD:** A complete, valid accounting-period end is selected explicitly; impossible dates are rejected with an associated error and cannot produce an ICS export. One date helper generates visible dates and all-day calendar events without month overflow, including 31 December 2026 → 1 October 2027, non-month-end ends whose ninth month lacks the corresponding day (30 May → 1 March), and every month-end case in the [19 October addendum](reports/director-intelligence-audit-addendum-2026-10-19.md#corporation-tax-deadline-arithmetic-extends-di-07) for the ordinary payment rule. The company tax return filing date comes from the same helper rather than by adding a year to a `Date` (which rolls a 29 February period end into March). Its expected values are derived from the filing rule, "12 months after the end of the accounting period" ([HMRC Company Tax Returns](https://www.gov.uk/company-tax-returns)), and independently tested. Company accounting periods and personal tax years remain distinct, unknown dates are handled explicitly, and instalment-payment exceptions are qualified. Independent cases cover December, leap years, month ends, invalid days/months, previous periods, and unknown dates; events retain stable identifiers and correct exclusive end dates. [HMRC deadline guidance](https://www.gov.uk/pay-corporation-tax) is linked beside the schedule.

- [ ] **DI-08 · P1 — Correct other-PAYE National Insurance treatment.** `getEmployeeNIWithNoThreshold` removes this employment's primary threshold solely because the user has another PAYE job, and Learn repeats that assumption.

  **DoD:** Ordinary separate-employer cases calculate NICs normally on this employer's earnings; any supported aggregation case is distinguished using the necessary facts, or explicitly excluded from the supported model. Independent fixtures and tests pin separate employment, aggregation boundaries, and resulting strategy comparisons; explanatory and pension-related wording agrees with the implemented basis. The implementation is reconciled against [HMRC's employer guide, section 3.4.1](https://www.gov.uk/government/publications/cwg2-further-guide-to-paye-and-national-insurance-contributions/2026-to-2027-employer-further-guide-to-paye-and-national-insurance-contributions#para341), without treating another job as automatic threshold consumption.

- [ ] **DI-19 · P1 — Keep All Dividends within the company's budget when Class 1A applies.** With £80,000 profit and a £10,000 benefit in kind, All Dividends reports Class 1A £1,500, CT £17,450 and dividends £62,550: £81,500 of outflow. Class 1A is deductible ([BIM42523](https://www.gov.uk/hmrc-internal-manuals/business-income-manual/bim42523)), so the independent result is CT £17,052.50 and dividends £61,447.50.

  **DoD:** Every strategy and the slider satisfy salary + secondary Class 1 + Class 1A + CT + dividends + retained = profit after employer pension; Your Setup reports any excess over the same funds through its existing overdraw flag. Class 1A reduces both available funds and CT profit. Independent fixtures cover benefit-in-kind cases for All Dividends, mixed and custom salaries, with expected values derived from statutory rates rather than engine output.

- [ ] **DI-20 · P1 — Attribute the Personal Allowance taper caused by extraction.** With £100,000 of other non-dividend income and a £40,000 pool, All Dividends reports £0 income tax although the £32,400 dividends remove the allowance and add £5,028 tax on the other income; mixed and slider paths cancel the same increment by subtracting a baseline that already uses the reduced allowance.

  **DoD:** Attributed income tax equals tax with the extraction minus tax on the other income alone, where the baseline uses the adjusted net income *without* the extraction, consistently in every strategy, the slider and Your Setup. Independent rUK and Scottish fixtures cover other income below, inside and above the taper band with dividend, salary and mixed extraction. Designed together with DI-08, DI-24 and DI-25 because they share `strategyComparison.ts` income attribution.

- [ ] **DI-21 · P1 — Honour Employment Allowance affordability and feasible minimum salaries.** With an eligible allowance the All Salary card shows £79,347, but the same target through the slider becomes £70,217.39 plus dividends because affordability ignores the allowance. A £60,000 minimum salary (total cost £68,250 against £200,000 profit) returns £50,270 because the search bound replaces the constraint.

  **DoD:** One company-cost affordability calculation, including a declared allowance and Class 1A, serves strategies, slider and custom salaries. A feasible minimum salary is always honoured; an infeasible one is reported rather than silently replaced. Search bounds never override user constraints. Boundary tests cover allowance exhaustion, the Secondary Threshold, the Upper Earnings Limit and minimums above it. Overlaps DI-04's affordability requirement; implement once.

- [ ] **DI-23 · P1 — Correct the Section 455 rate.** The Learn warning states 33.75%; [CTM61505](https://www.gov.uk/hmrc-internal-manuals/company-taxation-manual/ctm61505) gives 35.75% for loans made on or after 6 April 2026.

  **DoD:** The rate is derived from the canonical dividend upper-rate policy (`DIVIDEND_TAX_RATES[year].HIGHER_RATE`, the ITA 2007 s8(2) dividend upper rate) for the tax year in which the loan is made, consumed through the `@/lib/tax` interface rather than a new direct import, and not stored as a separate value. [CTA 2010 s455(2)](https://www.legislation.gov.uk/ukpga/2010/4/section/455) charges "such percentage of the amount of the loan or advance as corresponds to the dividend upper rate specified in section 8(2) of ITA 2007 for the tax year in which the loan or advance is made". There is no loan-date input, so the warning states which tax year's loans it describes. Years outside the supported policy range are handled explicitly, never by silent fallback. The warning links CTM61505, and a content test fails if the text diverges from the derived rate. The `33.75` EducationPanel entry in `scripts/tax-facts-baseline.ts` is removed in the same PR, under the shrink-only rule.

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

- [ ] **MC-08 · P2 · Remaining regression debt — Close the pension/region coverage and test-documentation gaps.** #128 replaces many tests; raw test-count reduction is not proof of lost coverage. The successful pension-apply journey is missing, stale-action guards exist, and the Scottish region-override notice already has a replacement test; the Welsh conflict case was removed.

  **DoD:** Mounted production-path tests protect current pension suggestion → input update → no automatic recalculation → Calculate → matching result and both Scottish/Welsh code overrides conflicting with the selected region. Keep the Scottish replacement and restore the Welsh case. The existing critical script includes a deterministic responsive journey, and `TESTING.md` accurately states which engines run in CI, how required WebKit evidence is obtained and that critical E2E is currently non-blocking. Close this item when these four gaps are verified and documented; work already completed by an implementing PR counts toward it. MC-01/02/03 carry their own blocking regressions, including the successful suggestion journey where needed; MC-05 owns motion/theme/copy/geometry checks. This item neither duplicates those acceptance checks nor defers them, and requires no new testing platform.

- [ ] Fixture coverage for every supported year and every band boundary (current suites concentrate on 2026-27 plus Scottish top-rate history). DoD: each supported year has independent fixtures at each band edge.
- [ ] Statutory-boundary scenarios independent of stored thresholds for each band edge (extend the `progressive-120k-no-top-rate` pattern). DoD: each band edge has a fixture whose expected values are derived from statutory numbers, not repo thresholds.
- [ ] Director annual-method consistency test: Scottish-tool/main-engine and NI-tool/main-engine comparisons exist. DoD: the remaining Director annual-method comparison has a documented tolerance and passes.
- [ ] Article-to-engine verification for every published figure in evergreen posts. DoD: a check maps each evergreen figure to verified engine output and fails on drift.
- [ ] Fixture provenance controls: per-scenario official-figure citations; derivations start from statutory numbers, never from repo thresholds; reviewer instructions verify against sources (the PR #83 lesson). DoD: every fixture carries a source citation and the review rule is written into `TESTING.md`.
- [ ] Public human-readable calculator verification report generated from the fixture suites, replacing hand-written accuracy claims. DoD: the report generates from fixtures and the public claims cite it.
- [ ] Machine-readable verification output (extend `/api/tax-rates` or a dedicated route). DoD: the route serves generated verification data and is covered by a test.
- [ ] Director critical E2E on mobile viewports. `e2e/director-guide-critical.spec.ts` fails on `Mobile Chrome` on `main` as well as on the DI-01 branch: closing the Your Numbers drawer intermittently leaves it open, and the results assertions query a page that is inert while the drawer is open. The CI critical slice runs desktop Chromium only, so this is not gated. DoD: the Director critical spec passes on the `Mobile Chrome` project without retries, or the mobile drawer journey has its own stable spec.
- [ ] Non-gated E2E specs failing on `main`. On desktop Chromium, `e2e/hicbc-comprehensive.spec.ts` (1 child at £60k), `e2e/pension-limits.spec.ts` (£50k with £20k sacrifice: £3,482.40 against an expected £3,484.80) and three `e2e/accessibility-wcag22.spec.ts` checks (privacy page in dark mode, desktop and mobile; 24×24px touch targets) fail identically on `main` and on the currency-parsing branch. None is in the CI critical slice. DoD: each expectation is reconciled against primary evidence or the UI is fixed, and the specs pass, or a spec that no longer earns its place is removed.
- [ ] P2 — Intermittent browser input/commit failures (investigation, not an established cause). #125 evidence includes golden-master `emergency-m1` (results never appeared), `pension-sacrifice-10pct` (filled/blurred 10 displayed as 0.00) and Director pasted-pence (field empty). Targeted repeats passed 12/12 and 75/75, and the critical slice passed at `--workers=1`. The golden-master setup waited for `networkidle` and a visible server-rendered salary input, making pre-hydration entry a lead, not a proven cause. Claude additionally reported one WebKit pension `5.00` with an empty-field error (217/218), unreproduced in 20 targeted and 25 scripted repetitions. Main also loses some Calculate clicks; #128 has a separately traced scroll repair. DoD: record exact refs, engines, readiness and draft/commit/error event ordering; after any fix, displayed/committed values, errors and Calculate eligibility agree and the critical slice passes repeated production-build runs under recorded parallel worker/repeat counts. Alternatively, close an unreproduced symptom only with a documented no-reproduction matrix covering all three #125 symptoms and the WebKit stale-error sequence at single and parallel worker counts, recording commands, results and limits without claiming a fix. Do not hide failures with skips, blanket retries or arbitrary sleeps, or assume one hydration cause. Promote reproducible wrong amounts or blocked valid input to correctness priority; MC-01 owns its deterministic typing defect.

  **#133 evidence (24–25 October), line numbers refer to `e2e/calculator-critical.spec.ts` at `c5ed77b`:**
  - **Codex (Windows):** the Mobile Safari "Rejected amounts" journey failed after Reset in 2/5 runs on `main` and 5/5 on the patch.
  - **Claude's independent review (Linux, Playwright 1.61.1, WebKit iPhone 12 emulation, production builds, interleaved 8 × 5 runs per arm):**
    - Failure rates were 23/40 on `main` and 16/40 on the patch; the step after Reset (line 334) failed 11/40 and 9/40. That is no regression.
    - Failures occurred at four steps: lines 269, 299, 307 and 334.
    - At line 269, the typed salary had reverted to `0.00` before the first Calculate, which supports the pre-hydration lead.
    - Desktop WebKit `director-guide-critical` passed 20/20 on both arms, though Codex's Windows runs failed it.
- [ ] P2 — Local unit-environment disagreement (technical investigation). Codex reported five failures in InputTooltip, analytics, rateLimit and origin on both main and the PRs; Claude reported zero failures on all three refs. DoD: a bounded clean comparison records exact refs, runtime, relevant non-secret test configuration and commands; any reproducible environment dependency is corrected or documented with its limits. Reports no longer label the five failures universal main defects. Close with evidence if they cannot be reproduced; do not weaken assertions merely to align counts.

  **Probable cause (#133):** Codex traced five Windows baseline failures to `src/test/env.ts`. Jest's case-insensitive environment proxy on Windows ignored `Object.defineProperty` for runtime `NODE_ENV` reads. #133 switched to assignment and added helper tests. It did not confirm that these were the same five tests, so close this item by re-running the five named suites on Windows at `28f0a63` or later.
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

- [ ] **Dedicated search audit — Pre-deployment protection gate; P2 post-release observation.** Removal of the large hero is accepted for access to the calculator; its SEO effect is unproven. Keep one audit with two distinct completion points tied to the first release containing #128's homepage change, even if it is delivered in another PR.

  **Scope:** Compare the last unchanged homepage and proposed/deployed replacement: raw server HTML and rendered mobile/desktop content, meaningful H1/title/description, canonical and robots directives, response status/redirects, sitemap inclusion, structured data versus visible content, useful explanatory/trust copy and internal links to the calculator, tools and retained guides. Check crawlability without calculator interaction, mobile usability/performance and existing discoverability tests. Review page/query evidence for the homepage and retained organic surfaces, including the Scottish calculator, salary pages and beginner guide; use the August audits as dated context rather than a current baseline.

  **Pre-deployment DoD (release-blocking for the homepage change):** A dated report captures the unchanged production homepage's served HTML, response headers/status and rendered mobile/desktop content, plus its live Search Console URL Inspection indexed status, Google-selected canonical and last-crawl date, with collection dates and URLs. Inventory the removed heading, copy and `#tax-calculator`/`/tools` links and record whether each useful purpose is retained or replaced. Identify the exact proposed release ref and compare its technical behaviour against that captured baseline using the scope above, including retained routes, useful links and indexability; resolve/recheck technical regressions before deployment. Record the planned post-recrawl observation interval, matched prior interval and year-earlier comparison where available, page/query/device/geography segments and a quantified traffic-drop threshold that triggers investigation/mitigation. The threshold and response are chosen from the baseline evidence before deployment, not after seeing results; missing year-earlier data is an explicit limitation. Historical performance exports may be obtained later; the current URL Inspection state and unchanged production response must be captured before they change. Missing essential evidence leaves this gate open with a specific evidence request, not an assumed pass. This authorises no deployment.

  **Post-release DoD (P2 observation):** Record the actual deployment ref/date and recrawl timing; compare Search Console clicks, impressions, CTR and position across the predeclared matched windows and segments, using year-earlier data to assess seasonality where available. Assess indexing/canonical changes and any other releases or tax-year/query shifts separately from performance attribution. Apply the predeclared drop trigger: record whether it was met, investigate affected pages/queries and record mitigation or an evidence-backed reason for no change. Available consented GA4 calculator engagement may contextualise traffic without adding a vendor or personal data. Mark conclusions protected, improved, regressed or inconclusive with supporting evidence; insufficient access, traffic or recrawl leaves measurement pending with a named evidence request and revisit condition. Neither a changed indexed-URL count nor passing local tests proves search protection. Technical completion does not close this measurement scope. Keep testable follow-ups in this backlog, cross-referencing existing beginner-link and trust/content owners; do not authorise mass redirects, consolidation, content expansion or ranking guarantees.

- [ ] Beginner-guide contextual inbound links: add a small number of genuinely relevant inline anchors from retained guides that already discuss PAYE basics, tax codes or employee deductions. Do not add site-wide boilerplate or rewrite the beginner article in this slice, and do not prioritise it above the active correctness sequence. DoD: the source graph records the deliberate links and each anchor is contextually useful.

## Parked / Triggered work

These are not active for the R&D app unless traffic evidence or an explicit product decision makes them worthwhile.

- Optional blank-amount semantics (Claude proposal). Trigger: an explicit decision on whether a deliberately emptied optional allowance, partner-wage or income-source amount may mean "none". Pending that decision, preserve #127's explicit empty/error behaviour; Salary remains required and invalid non-empty text is never coerced. DoD: a field-by-field rule is agreed, explained beside affected inputs and verified for typing, clearing, hidden/inactive fields, restoration and Calculate recovery without reintroducing silent zeroing or stale-result use. This does not hold up the two confirmed blockers.
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
