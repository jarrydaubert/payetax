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

- [ ] **Budget 2026 / 2027–28 policy implementation (separate PR):** keep the calculator limited
  to 2026–27 until final legislation, regional rates and independent fixtures are verified.
  Follow the [dated implementation requirements](reports/budget-2026-future-year-requirements-2026-10-28.md);
  the Budget content PR changes no calculations and enables no tax year.

Current correctness sequence:

1. Explicit pension-method handling.
2. Transparent calculation results.
3. Independent fixture/test-portfolio completion and Foundation reconciliation.

Verified Director Intelligence correctness exceptions (see [Urgent correctness exceptions](#urgent-correctness-exceptions)) may be taken as small independent slices between these items; they do not reorder them.

Current merged baseline is `1de37c35`: [#139](https://github.com/jarrydaubert/payetax/pull/139) delivered the interim DI-05 email safeguard and personal-reserve parity correction after #136/#127/#137. The [safeguard](reports/di05-interim-email-safeguard-2026-10-27.md) and [email audit](reports/di05-email-content-and-active-export-assessment-2026-10-27.md) preserve its evidence; the [earlier reconciliation](reports/project-documentation-reconciliation-2026-10-27.md) records the calculator/privacy contracts. The last independently recorded production baseline remains `44d8d02`; merging is not proof of deployment. Full DI-05 remains open. #128 was closed unmerged on 28 October 2026 and remains historical reference only.

The [22 October decisions](reports/calculator-backlog-reconciliation-2026-10-22.md) govern retained acceptance criteria, with the later delivery decision below superseding the #128 rebase plan (agreed in maintainer discussion; recorded in [#140](https://github.com/jarrydaubert/payetax/pull/140)). With #127 and the interim DI-05 guard delivered, continue as follows:

1. **Small mobile payslip PRs from current `main`.** Supersede #128 rather than rebase or merge its broad redesign. Use its `b4f10087` implementation/report only as reference; it was closed unmerged on 28 October 2026. Deliver MC-04/05's remaining criteria while preserving MC-03's input-state presentation in independently reviewable slices. Preserve #136's five-default/seven-available periods, #127's integrity contracts, #137's telemetry/consent protections and #139's Director safeguard. Preserve #134/MC-09: add the annual suggestion to the existing £/% pension, convert the total to the selected pay period, round up to the penny and require Calculate again; retain the `CalculatorContainer.pensionSuggestion.test.tsx` and `pensionOptimizer.test.ts` regressions. Keep #135's five-card desktop functionality/layout/navigation and meaningful coverage through retained or equivalent replacement code. These slices may proceed alongside Director urgent fixes without pre-empting a ready, verified wrong-money fix; the entire Director queue is not a prerequisite.
2. Before the first deployment containing the proposed homepage/hero change, complete the search audit's pre-deployment gate below, whichever replacement PR delivers it. MC-03/04/05 and the merged integrity contracts remain acceptance requirements.
3. MC-06/07 remain smaller follow-ups. Complete the search audit's performance observation after release using windows and a mitigation trigger recorded before deployment. Any newly reproduced wrong-money defect takes correctness priority. Full DI-05, including the bounded annual exporter assessed in #139, retains its later Director position and DI-02/04 dependencies.

Supporting-page severity and the privacy priorities below identify risk and ownership, not a new delivery queue. They do not reorder the correctness sequence, the mobile payslip slices or the Director/Foundation insertion points. Escalate only on new verified evidence under the existing working rules.

Each implementation slice carries its own relevant regression coverage and independent review by the other model (Claude reviews Codex changes and vice versa), reconciliation against code/evidence, and re-review after material fixes. MC-08 owns only the remaining coverage gaps listed there. Record exact refs and results; do not infer approval from earlier audits. Keep the PRs small, reuse the existing checks and reports, and merge only when separately authorised.

When drawing on #128 as reference, retain useful implementation evidence without importing superseded documentation, premature completion claims or lost regression contracts. The [historical checkpoint](reports/project-documentation-reconciliation-2026-10-27.md#128-reconciliation-checkpoint) identifies conflicting paths and silent five-card/test deletions; it is not an instruction to perform that rebase. An MC item is removed or narrowed only by the replacement PR that demonstrably closes it, with evidence. Historical reports remain unchanged.

### Security and dependencies

The 24 October dependency advisories (Next.js, Sentry, Zod, fast-uri) were patched in [#133](https://github.com/jarrydaubert/payetax/pull/133), which carries the exposure assessment and verification. It was merged and deployed to production as `28f0a63` on 26 October. The items below are its residual findings.

- [ ] P2 — Results-email routes buffer the whole request before the size check. `send-results` and `send-director-results` call `request.text()` and only then compare `rawBody.length` (50 × 1024 *characters*, not bytes) with `MAX_BODY_SIZE`. Zod 4.6.6 now bounds validation work for oversized collections (#133's regressions), but nothing limits how much is read. DoD: record the platform's effective request-body limit for these functions from current Vercel documentation. Then either justify that limit as sufficient, or reject oversized requests before buffering, measured in bytes. Keep the existing 413 response, origin, rate-limit and validation order, with regressions for an oversized body and for a missing or understated `Content-Length`.
- [ ] P3 — Zod is pinned twice. `package.json` lists `zod` 4.6.6 in both `dependencies` and `overrides`. The override was needed to remove Knip's nested 4.4.3, and it silently wins over the direct pin: in #133's review, a frozen install with a direct pin of 4.6.5 still resolved 4.6.6. DoD: the two cannot drift unnoticed. Either a repo check fails when they differ, or the override is removed once a frozen install proves no vulnerable nested copy remains.

- [ ] P3 — Remove the unused giscus CSP allowances (supporting audit M7). Confirm no retained consumer needs them; remove only the unused script/connect/frame origins and verify retained GA4/Sentry/email/PWA behaviour. Owner: Security and dependencies.
- [ ] P3 — Describe the rate-limit fallback accurately (P4 residual). Owner: Security and dependencies. `clientIdentifier` encodes/truncates the fallback with base64; its source comment and test description still call it hashed. DoD: describe the actual representation without a cryptographic privacy promise; do not change identifier behaviour as an incidental wording fix. #137 already corrected the public IP/endpoint disclosure.

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

MC-01, MC-02 and MC-03's integrity scope are merged through #127. They are preserved regression contracts, not unfinished implementation tasks. The [retained acceptance criteria](reports/project-documentation-reconciliation-2026-10-27.md#retained-127-regression-acceptance-criteria) carry the full amount-entry, restoration, explicit-Calculate and stale-action requirements into every mobile payslip replacement PR. Native WebKit pan, physical devices and OS clipboard remain unverified; existing lost pointer/tap defects stay with [Verification](#verification). Future mobile statements must also preserve the MC-03 input-state presentation recorded in the 28 October report linked under MC-05.

- [ ] P3 — Tax-trap alert can reappear from floating-point noise at the exact £100,000 boundary. `calculateOptimalPension` compares unrounded adjusted income with the threshold. After #134's penny round-up, Claude probed every whole-pound total from £1,000 to £60,000 across six pay periods and nine weekly-hour values (3.19 million cases). 447 per-period amounts annualise below the target by about 1e-14. This matters only when salary minus existing pension is an exact £1,000 multiple: after Calculate, the alert could then offer "Add £1,000" although nothing remains to fix. The tax effect is unverified and depends on how the engine rounds the allowance taper. DoD: the optimiser compares adjusted income in pence, or with an explicit sub-penny tolerance. The engine's taper is confirmed to treat the same values consistently. Add a regression for an exact-boundary combination that annualises below target.

### Main calculator experience

Small mobile payslip PRs from current `main` own the remaining scope; #128 is closed unmerged and is reference only. Each slice must retain the merged desktop contract from #135/#136: five summary cards, readable seven-period table when enabled, accessible forward/reverse focus order and intentional What-if scrolling. Current defaults are Yearly, Monthly, Weekly, Daily and Hourly; 4-Weekly and Fortnightly remain available but unchecked. Resizing preserves selections and the current calculation. Historical desktop verification remains in the implementing PRs and dated reports. The earlier #128 direction to remove the desktop cards and introduce a separate homepage comparison mode was superseded; #135's five desktop cards remain the agreed design. Do not blindly restore deleted files where equivalent functionality and meaningful regression coverage genuinely replace them.

- [ ] **MC-04 · P2 · Mobile payslip acceptance — Lead with the user's pay period.** The reference #128 implementation always starts Monthly (Claude S1); replacement slices must meet this contract.

  **DoD:** On successful Calculate, the statement starts in the submitted input period for monthly, four-weekly, fortnightly, weekly, daily and hourly pay; annual input defaults to Monthly with annual context. A subsequent Calculate applies that rule to the newly submitted input. Users can inspect other periods without recalculation, and resizing preserves the current calculation and selected presentation. Tests cover all seven input periods, a changed input period and display-only switching, using engine-owned period values.

  **Focused slice:** The [28 October MC-04 report](reports/mc04-submitted-pay-period-2026-10-28.md) records this rule on the existing mobile take-home card, preserving the desktop cards and table defaults. The complete statement and two-period comparison remain MC-05 dependencies; apply the same rule when those components are implemented. Keep this row open until the slice is reviewed and merged.

- [ ] **MC-05 · P2 · Remaining redesign acceptance — Mobile payslip, mobile focus and fifth-card wording.** #135 delivered the desktop layout/navigation slice; the following work remains open.

  **Mobile payslip DoD:** The readable mobile payslip, direct Edit action and complete two-period comparison work at 393×852, 852×393 and 320px width. Details remain reachable and native copying works. Verify keyboard navigation, semantic headers, focus, reduced motion and light/dark contrast in Chromium and WebKit, including large amounts, active optional inputs and errors. Preserve the [MC-03 input-state presentation](reports/mc03-input-state-presentation-2026-10-28.md): first use/Reset have no results or result actions; edits request Calculate again; invalid submissions identify fields and allow correction without losing values or trapping focus. Its current/stale distinction applies to every card, table, statement and comparison, alongside #127's integrity contracts.

  **Fifth-card wording DoD:** Correct the visible "Marginal Tax Rate" label and its explanation so the fifth card clearly describes the rounded next-£100 payroll estimate, including tax, NI and applicable student loans, rather than a statutory marginal rate. Retain all five cards and their financial values; this wording correction is not delivered by #135.

  **Replacement-slice preservation:** Retain #135's five cards, accessible forward/reverse desktop focus order and intentional What-if scrolling, alongside the current requirement for five selected default periods, seven available periods and all seven normal-table columns fitting on desktop when enabled. Re-verify that retained behaviour after each affected slice at the desktop acceptance widths, breakpoint neighbours and 200% zoom, with readable figures/pence, reduced motion and light/dark themes. This is a regression obligation for those later changes, not an outstanding desktop layout implementation.

  **Separate mobile keyboard follow-up (PR #135):** At 393×852 on `c8f21f77`, the delayed Calculate scroll leaves focus on Calculate at roughly 19px, behind the 64px fixed header. Reproduced in Chromium and WebKit with reduced motion; the desktop navigation correction preserves this existing mobile behaviour. Coordinate the mobile scroll and focus destination, then verify forward/reverse keyboard navigation and header clearance in both engines. This remains open independently of the desktop fix.

- [ ] **MC-06 · P2 · Follow-up — Make deduction and rounding presentation auditable.** Claude found unsigned deductions, no deduction total and period statements that differ by a penny when rounded displayed rows are added.

  **DoD:** Users can identify gross pay, each employee deduction, total deductions, any non-taxable addition and take-home consistently across statement/comparison. Deduction signs and zero-row visibility follow one documented convention, including zero pension versus zero allowance. Employer NI is visibly separate from employee deductions; tax-band rows describe income taxed in a band. A reproduced reconciliation for each of the seven periods, including pension/loans/allowance cases, either balances at displayed precision or has a nearby, accurate explanation of the rounding difference and its size. Preserve engine-owned period figures; do not adjust statutory results merely to balance a display. Any discovered calculation defect becomes a correctness slice with independent expectations. This does not duplicate Foundation rounding ownership or the existing marginal-rate chart/optimizer tasks.

- [ ] **MC-07 · P2 · Polish — Use consistent labels and readable input proportions.** The reference #128 implementation exposes `fourWeekly` in the mobile setup summary, calls paired comparison "all 7", varies Gross/Net/Take-home labels and wraps common field labels in the narrow input rail; retain the criteria below for the replacement slices.

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
- [ ] Generated projections as the only path for UI band tables, tools, `/api/tax-rates`, structured data and llms.txt facts (Dataset JSON-LD currently projects independently of `crawlableTaxFacts`). DoD: all listed surfaces read one projection source; the independent JSON-LD projection is gone. Supporting audit M6 belongs here: Dataset dates derive from verified policy/source data, and its advertised licence is reconciled with the actual rights granted; do not assume the repository licence automatically settles rate-data licensing.
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

The merged [#139 email audit](reports/di05-email-content-and-active-export-assessment-2026-10-27.md#findings-and-disposition)
adds the following residuals. Each concern has one implementation owner; dependencies
and shared projections do not create parallel work items or change the delivery order.

| Deferred concern from #139 | Single existing owner |
| --- | --- |
| All Salary/Employment Allowance/high-profit controls cannot reproduce the recommendation, so email remains unavailable | DI-04 |
| Validated active annual export, original/effective inputs, assumptions, YTD/Your Setup context, truthful scenario labels/savings and reproducibility of the recalculation link | DI-05 |
| Scottish HTML uses rUK bands; allowance taper, NI/loan/rate explanations and regional accuracy are missing or misleading | DI-11 (incorrect "Rates used" panel: urgent correctness slice; remaining explanations: P2) |
| Company-cost definition, pre-/post-pension effective-rate basis, shared reserve projection and unexplained personal-tax versus reserve totals/payroll deductions | DI-09 |
| Generic January deadline versus company-period dates/payment schedules and their qualifications | DI-07 |
| Full-year versus remaining-year interpretation of amounts already paid | DI-27 |
| HTML/text content differences, missing deduction/date/source detail, overbroad report promises, 34px large-number overflow at 320px and unverified email-client/accessibility behaviour | DI-16 |
| Empty-form sidebar says email is "paused" as though calculation is updating | DI-02 |
| Unprofiled repeated scenario work and whole-store email-dialog subscription | DI-17 (parked; existing trigger still applies) |

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

DI-11's verified email "Rates used" defect also qualifies under the existing wrong-statutory-rate rule. A small correction or truthful qualification/suppression for affected reports may land independently; this does not reorder the queue below or promote all DI-11 explanation work.

DI-01, the minimal part of DI-02, #127's prerequisite input fixes and #139's interim
email guard have landed. Preserve their contracts in the [main-based mobile slices](#active).
Remaining Director order, with one small PR per item unless stated otherwise:

1. DI-07, then DI-26, DI-23, DI-06 and DI-27.
2. Company budget: DI-19, then DI-21.
3. Personal tax: DI-08 with DI-24, then DI-20, then DI-25. DI-08, DI-20, DI-24 and DI-25 share
   `strategyComparison.ts` income attribution; the DI-08/DI-24 PR settles the shared helper's
   design.
4. DI-04, the rest of DI-02, full DI-05, then DI-03.

In the current correctness sequence, explicit pension-method handling remains after step 1
and before step 2, and transparent calculation results after step 3. Removing delivered
prerequisites from this list does not reorder the remaining work.

- [ ] **DI-02 · P1 — Expose validation and updating state (remaining scope).** Invalid/incomplete inputs clear results (DI-01); #139 additionally gates email against the successful calculation's input values and protects open dialogs. Still open: previous results can look current during the debounce; `error` and `isCalculating` are not surfaced; multi-field errors lack a summary; and display/email/save do not yet share the full validated scenario snapshot. On an untouched form, #139's expanded sidebar misleadingly says email is "paused"; distinguish first use from updating.

  **DoD:** Incomplete, invalid, updating, and current-result states are explicit and visible. Field errors stay associated with their controls (currency fields already are), multi-field failures have an actionable summary, and email/save actions require the same current validated input snapshot used by the display. Browser regressions cover the updating state, recovery, mode changes, and export gating against that snapshot.

- [ ] **DI-03 · P1 — Separate affordable monthly draw from desired spending.** The safe-draw helper returns the requested minimum when its cash ceiling is zero, while monthly outputs use the baseline mixed strategy rather than the active what-if scenario.

  **DoD:** Desired personal spending, projected after-tax capacity, actual cash, reserved taxes, and the protected operating buffer are separate quantities with a documented cash/forecast basis. £0 cash cannot produce a positive cash-funded safe recommendation without a modelled receipt; an unfunded requested minimum is shown as a shortfall. Salary, strategy, and profit changes recalculate draw and buffer from the active scenario. Annual mode labels annual take-home divided by 12 as an average, not a safe cash withdrawal. Independent boundary cases cover zero cash, an exhausted buffer, minimum draw above capacity, reserved tax, forecast receipts, and projection-period limits.

- [ ] **DI-04 · P1 — Keep selected strategy, objective, slider, and results aligned.** Selecting All Salary can retain its selected card while the salary slider clamps its amount to the NI upper earnings limit and produces a mixed result; the hero and objective can describe another strategy.

  **Accepted #139 limitation:** When All Salary is recommended, including Employment Allowance and large-profit cases, existing controls can prevent an exact match and email stays unavailable. Keep the safeguard until display/export parity is proved; do not restore mismatched email as a workaround. DI-04 owns the control limitation, with DI-21 owning its existing shared affordability calculation.

  **DoD:** Named strategies consume their exact calculated results and are never silently changed by a slider effect. Salary-slider affordability reuses DI-21's shared company-cost calculation, including applicable allowances and benefits, rather than an NI threshold cap. Every selected card agrees with summary, breakdowns, reserves, warnings, and export; moving a what-if salary control exposes a Custom selection. The visible recommendation explicitly follows the chosen objective or is clearly identified as a different reference. Named-strategy parity, affordability boundaries, input changes, objective changes, and custom/reset transitions have browser regression coverage.

  **Separate P3 follow-up — Preserve salary what-if across company year-end edits (#139 regression).** Owner: DI-04. Watching `yearEndMonth`/`yearEndCustom` now schedules `calculate()`, which resets `sliderSalary` to null. DoD: editing only accounting dates preserves the chosen salary/strategy scenario, with a regression covering both year-end controls; email still pauses for genuine input changes and recovers safely. This behavioural fix is separate from the documentation reconciliation and DI-07's date arithmetic; its P3 status does not reorder the urgent queue.

- [ ] **DI-05 · P1 — Export the active scenario (remaining scope).** The interim safeguard, corrected company-key-dates promise and HTML personal-reserve parity fix were delivered by [#139](https://github.com/jarrydaubert/payetax/pull/139) at `1de37c35`. Profit/salary what-if state, selection, objective and accounting-period settings are still absent from the export contract; direct API callers still receive the original server-recalculated recommendation. Monthly and survival email remain unavailable. This is a temporary client safeguard, not completion of active export or a security boundary.

  **Bounded annual slice:** The [19-case audit/prototype](reports/di05-email-content-and-active-export-assessment-2026-10-27.md#recommendation) supports a small annual exporter using existing mechanics; its 18 active matches prove parity, not statutory correctness or monthly cash-aware output. Keep the DI-04/rest-of-DI-02 dependencies and the order above. Validate primitive controls; share display/server scenario resolution and reserve projection (DI-09), rather than trusting client totals or duplicating the reserve formula. Recompute scenario savings, allow negative deltas, distinguish the current scenario from the reference recommendation and original inputs, and test the exact named/null-slider path as well as custom salary/profit. Accurate regional/taper explanations from DI-11 are an acceptance requirement for expanded export, not an optional redesign.

  **DoD:** Display and export share the current validated scenario snapshot; the server recalculates it. Record region/year, original and effective financials, other income/PAYE, EA, loan plans, BIK, losses, associated companies, pension method/already-deducted status and pre-/post-pension basis, projection period, YTD and Your Setup context. Reports distinguish current scenario, original inputs and comparison alternatives; the recalculation link does not imply restoration it cannot perform. Salary/profit what-if and annual/monthly exports reproduce displayed figures in HTML and text; survival has an explicit supported report contract before enabling email. Accounting settings are captured and dates are included only if supported/promised, consuming DI-07's owner. Mocked browser requests and generated-email assertions prove parity without real mail; retain stale-dialog/same-task guards. DI-11 owns explanation accuracy, DI-09 financial definitions/reserves, DI-27 full-year/YTD semantics and DI-16 output presentation; consume those contracts without duplicate implementations.

- [ ] **DI-06 · P1 — Use resolved monthly financials in every breakdown and survival result.** `DetailCards` and `SurvivalModePanel` read annual-mode revenue/expenses while the active calculation uses monthly projections, allowing contradictory company figures or a £0 loss for a loss-making monthly case.

  **DoD:** Both components consume the shared resolved active financials and projection period, with no fallback to retained annual inputs in monthly mode. The visible revenue, expenses, pension, payroll costs, taxable profit, tax, and survival-loss example reconcile with that same scenario. Tests cover a fresh monthly-only session, annual-to-monthly and monthly-to-annual switches, positive/zero/negative projected profit, and changes to projection start month and pension.

- [ ] **DI-07 · P1 — Correct deadline arithmetic and validate accounting-period dates.** Adding nine months then one day gets 7 of 12 month-end due dates wrong against [HMRC CTM01800](https://www.gov.uk/hmrc-internal-manuals/company-taxation-manual/ctm01800) (first day of the tenth month): 31 May, 31 July and 31 December are late (4 Mar, 2 May, 2 Oct); 28 February, 30 April, 30 June and 30 November are a day early; impossible custom dates silently roll into another month and the calendar guesses the next year-end occurrence.

  **#139 email residual:** Own the distinction between its generic January Self Assessment date, company accounting deadlines and applicable payment schedules/qualifications, including payments on account. The full exporter consumes the same date basis; a generic date must not imply a complete personalised schedule or company dates that are absent from the report.

  The urgent accounting-date arithmetic fix can land first; narrow the remaining email qualification work afterward rather than holding that fix for a complete email schedule.

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

  Apply that interpretation to exported annual comparisons too; DI-05 owns carrying the YTD/available-extraction and Your Setup data, not a second remaining-year calculation. #139's YTD audit does not close this disclosure defect.

#### Verified explanation, accessibility, layout and output defects (P2)

- [ ] **DI-09 · P2 — Reconcile every financial total and allocation.** Headline deductions include student loans while the detailed total omits them; displayed taxable profit omits loss relief/pension workings; the dividend taxable amount ignores unused Personal Allowance; Money Flow omits personal deductions and subtracts pension again from an already reduced profit basis.

  **#139 email residual:** Own shared definitions/projections for company cost (currently excluding dividends/pension), the pre-/post-pension effective-rate denominator, and personal deductions versus reserve pots. Explain why overall personal tax includes employee NI while the corrected reserve excludes it; distinguish payroll withholding, illustrative budgets and remaining Self Assessment liability without inventing payment history. Display and email consume one reserve projection, preserving #139's correct deduction/take-home figures. DI-07 owns dates, DI-16 their presentation in outputs.

  **DoD:** A shared calculation-basis projection supplies the company-profit → pension/payroll → company-tax → salary/dividend → personal-deduction → take-home/retained bridge. Student loan repayments, tax/NI, and total deductions are separately labelled and reconcile; loss relief and pension appear in the taxable-profit workings; the dividend calculation explains both unused Personal Allowance and dividend allowance. Money Flow includes all allocation categories, labels pre-/post-pension profit correctly, deducts pension once, and reconciles to the stated starting amount. Representative student-loan, pension, loss, unused-allowance, benefit, and custom-scenario cases assert displayed/engine agreement without creating a second tax calculator.

- [ ] **DI-10 · P2 — Surface consequential warnings and tie them to the active scenario.** Important warnings are hidden in the collapsed Learn panel and use the baseline strategy. #137 removed their financial-condition analytics; preserve that exclusion.

  **DoD:** A concise warning summary is visible beside the decision/result even with Learn closed, with links to relevant detail and clear severity. Warning inputs follow the active strategy, salary, profit, and monthly scenario; critical messages remain discoverable on mobile. Financial warning conditions must stay out of analytics; do not reintroduce warning-seen events while improving their presentation. Browser/component checks cover hidden Learn, a scenario crossing a warning boundary, summary navigation, warning removal, and absence of financial warning telemetry.

- [ ] **DI-11 · P2 — Correct and qualify Director financial explanations.** Learn and survival/pension messaging overstate dividend timing, VAT registration, NI-record certainty, taper rates, contract-end risk, and distributable-profit conclusions; the Child Benefit warning disappears above its upper threshold.

  **Urgent #139 email slice:** The allowed Scottish/high-income reports label incorrect rUK band limits and an unqualified standard Personal Allowance as "Rates used". Correct or truthfully qualify/suppress the affected panel under the existing urgent-correctness rule; do not wait for full DI-05 or a redesign. DI-11 remains the sole owner, with its other work retaining P2. Provide accurate applicable Income Tax/dividend/NI/loan explanations from the selected policy and relevant income basis. Consume canonical owners and verify primary sources; do not add independent band maths or a new policy table. These are required explanation corrections for DI-05's annual slice.

  **DoD:** Each of these corrections is independently verified against relevant primary sources and asserted in focused content/condition tests: dividend timing distinguishes due-and-payable treatment and interim/final dividends; VAT prompts use taxable-turnover registration tests and correct notification timing rather than annual forecasts; pension messaging describes this salary's potential contribution and allows other qualifying contributions/credits; taper wording reflects region and income composition; Child Benefit guidance remains useful above the full-charge threshold; contract-end wording requires actual contract-end evidence or is renamed to describe the projection/runway condition; a current-year loss is not presented as proof that historic distributable reserves are unavailable; the Employment Allowance tooltip states HMRC's test (ineligible where the sole director is the only employee liable for secondary Class 1; an extra employee paid below the Secondary Threshold does not qualify) instead of "only director/employee in most cases". Relevant HMRC/DWP links accompany explanations; no new tax assumptions are invented. See the audit's primary-source references. Wording tied to a calculation fix lands with that fix, so the explanation always matches the behaviour: NI-record and other-employment wording with DI-08, the Employment Allowance tooltip with DI-21, and taper wording with DI-20.

- [ ] **DI-12 · P2 — Repair control semantics, contrast, announcements, and landmarks.** The audit found unnamed salary/profit sliders and chart progressbars, failing hint/warning contrast, nested/duplicate main landmarks, visual-only strategy selection, and no deliberate calculation-completion announcement.

  **DoD:** Both slider thumbs have accessible names, linked visible labels, and currency/percentage value text. The money chart has appropriate chart/list/table semantics, labelled values, and a text equivalent rather than unnamed progress semantics. Tested hint/warning states meet WCAG AA contrast; there is one main landmark with a working skip target; strategy selection is exposed as a labelled single-choice state. A concise debounced result status is announced without reading every changing monetary row. Automated desktop/mobile accessibility checks plus manual keyboard and screen-reader checks verify these behaviours; no new violations are introduced.

- [ ] **DI-13 · P2 — Use complete modal behaviour for mobile input and Learn drawers.** The custom drawer handles Escape but does not wrap Tab focus or restore it to the opener, and only part of the background is made inert.

  **DoD:** Drawers use the existing accessible dialog foundation or equivalent verified behaviour: focus enters appropriately, Tab/Shift+Tab stay inside, all background content is inert, Escape/close works, scrolling is restored, and closing returns focus to the invoking control. View Results requires current valid results and announces readiness. Tests cover both drawers, first/last focus boundaries, the sibling FAQ/skip link, opening/closing with the keyboard, and focus return after editing. Follow the [W3C modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

- [ ] **DI-14 · P2 — Make panel layouts respond to usable workspace width.** At a 1024px viewport, fixed inputs/navigation/Learn panels leave a result workspace of at most about 360px (295–360px depending on the element measured and timing) whose content overflows and whose headline figures overlap.

  **DoD:** Result components respond to their container width, retain a documented useful minimum width, and stack headline side metrics when necessary. Learn/inputs switch to drawers or overlays when simultaneous panels would squeeze results, while preserving the current input state and controls. Direct browser checks cover 320, 390, 768, 1024, 1280, and 1440 CSS pixels with applicable panels expanded/collapsed, large financial values, and 200% zoom; headings, figures, controls, and focus remain usable without accidental horizontal overflow or overlap.

- [ ] **DI-16 · P2 — Make print, copy, and email outputs useful and accessible.** Print CSS retains fixed-height scrolling, hides strategy cards because they are buttons, and relies on brittle panel class-name matching; email success is not deliberately announced.

  **#139 email residual:** Define useful common HTML/plain-text content: individual deductions (missing in HTML), reserve/date/generated/source detail (uneven across formats), and honest report/comparison promises. Present DI-05's snapshot/context, DI-09's financial definitions and DI-07's deadline qualifications; do not implement those models here. Fix the counterfactual large-profit HTML's measured 354px width at a 320px viewport. Verify narrow-screen large figures, data-table semantics and declared email-client/accessibility support, or explicitly record unverified clients/delivery/dark-mode limits; browser screenshots alone do not certify mail clients.

  **DoD:** Explicit print hooks remove containing height/overflow constraints and non-report panels/actions; printable static strategy summaries remain visible. A copy/print action sits beside email, and saved output includes the selected inputs/scenario, tax year, assumptions, complete deductions, relevant sources, generated date, and supported dates. Multi-page print/PDF inspection confirms readable pagination and complete output. Email retains autocomplete and associated errors, announces success, and has verified focus behaviour after success/retry/close. Snapshot parity is shared with DI-05 rather than implemented twice.

- [ ] **DI-22 · P2 — Retire or correct the unrendered legacy Director route.** `calculateDirectorScenario` is computed by the store but never rendered, and returns dividends of −£705.50 for £13,000 profit; its tests anchor a route users do not see.

  **DoD:** Either the route is removed and its useful assertions are re-pointed at the rendered strategy path, or it is corrected so dividends cannot be negative and its relationship to the rendered path is documented. Aligns with the Foundation principle of one supported route to each statutory calculation; no new calculator is introduced.


### Privacy follow-ups

Single owners for the unresolved parts of the [supporting-pages audit](reports/payetax-supporting-pages-audit-2026-10-27.md) and #137 review. P2 means a substantive follow-up and P3 a lower-risk verification/hygiene item; neither moves ahead of the agreed mobile-payslip/correctness sequence automatically. #139's interim guard is delivered; full DI-05 keeps its later Director position. #137 already stopped the reported financial telemetry, corrected storage/IP disclosures and added the PAYE email notice; do not reopen those as unimplemented tasks. The [dated disposition map](reports/project-documentation-reconciliation-2026-10-27.md#supporting-pages-dispositions) distinguishes partial closure from residual work.

- [ ] **P2 — Remember figures only with explicit opt-in, off by default (PAYE and Director).** Owner: Privacy follow-ups (audit finding P3; remembering/erasure scope of DI-18). Add a clear-data action that clears current figures/results and persisted snapshots without clearing analytics preferences. Existing saved data is not evidence of opt-in: provide an explicit migration/restore-or-clear choice and prevent unchosen data from being silently reused or saved again. Cross-tab opt-out/erasure must clear stale in-memory state so another tab cannot recreate erased figures. Cover reloads, expiry/year rollover, blocked storage, existing snapshots and concurrent tabs. Preserve #127's input-integrity guarantees. DI-18's wider explanation/design proposal remains parked and must not duplicate this owner.
- [ ] **P2 — Privacy controls on Director (D1).** Owner: Privacy follow-ups; coordinate with DI-12/13 without making this a duplicate accessibility redesign. Provide accessible Privacy, Cookie Settings and Compliance entry points and mount the existing consent UI on the full-screen route, including direct-entry visits. Preserve the established consent lifecycle and test withdrawal on desktop/mobile and across tabs. #137 did not close this access gap.
- [ ] **P2 — Verify provider privacy settings and retention (P5; audit open questions).** Owner: Privacy follow-ups. Record dated GA4 retention, Google Signals and Enhanced Measurement settings, Sentry IP/retention settings, and email-provider log retention. Publish verified periods/criteria without guessing from SDK defaults. Keep GA4 opt-in; the P7 exemption opportunity is not an authorised consent change.
- [ ] **P2 — Verify privacy complaints/controller obligations (P6/P11; Terms applicability).** Owner: Privacy follow-ups, with legal input where needed. Check current primary ICO guidance and applicability before changing complaints rights, direct contact/acknowledgement wording, controller geographic details or ICO fee/registration statements. Assess the audit's service-provider/Terms question rather than asserting the duty applies or does not apply. DoD: dated evidence and any required notice corrections, with uncertain or unavailable facts named explicitly; no unsupported compliance claim.
- [ ] **P2 — Review historical financial telemetry.** Owner: Privacy follow-ups, separately from provider configuration and prospective collection. Identify unnecessary financial attributes already held by GA4/Sentry, agree the deletion scope, obtain explicit authorisation and record completion using provider controls. A code fix does not erase vendor history.
- [ ] **P2 — Align remaining Director email/blog privacy notices (#137 L5).** Owner: Privacy follow-ups. Explain the actual server/Brevo email flow and keep the privacy link at collection; remove absolute browser-only/completely-private promises where inaccurate. Coordinate with DI-05's financial export guard but do not delay or redefine that guard. Tests should cover the actual notice and link; P10's PAYE notice is already delivered.
- [ ] **P3 — Remaining telemetry hardening/utility trade-offs (#137 L1–L4).** Owner: Privacy follow-ups. Audit opaque Sentry `logentry`, mechanism data and fingerprints before new producers use them; no current financial producer was identified. Revisit conservative Vercel suppression (same-site and Speed Insights loss), the blog-category dimension, and whether generic student-loan field interaction counts are necessary. Preserve useful diagnostics, GA consent, minimised data and the coverage gate. Escalate a newly demonstrated financial leak under the existing risk rules; do not describe these defensive paths as already proven leaks.

Privacy link/table accessibility (P8) stays with [Verification](#verification); Director hint contrast (D2) stays with DI-12. Public methodology and source/authority claims stay with [Trust and sourcing](#trust-and-sourcing) and the existing modelling-assumptions owner.

### Verification

- [ ] **P3 — Playwright native-link navigation coverage:** the installed Playwright 1.61.1 /
  Chromium 149 view-transition regression reproduces on unchanged `main`; installed Chrome 156
  and WebKit pass the Budget pointer journeys. Revisit bundled-Chromium coverage with a separately
  scoped dependency update, rather than changing application transitions or weakening assertions.
  [Reproduction and limits](reports/budget-2026-final-verification-2026-10-28.md#navigation-investigation).

- [ ] P3 — Reduced-motion results emit a React DOM warning in development. `ResultTableRow` selects the static `TableRow` when reduced motion is enabled but still passes `layout={false}` to the DOM. Reproduced during MC-03 visual QA; the same source exists on base `d2ee3ee8`. DoD: omit motion-only props on the static path and verify reduced-motion results without the non-boolean `layout` warning. This is separate from the existing mobile focus/pointer work.

- [ ] **MC-08 · P2 · Remaining regression debt — Close the pension/region coverage and test-documentation gaps.** #128's historical test rewrite is reference only; raw test-count reduction is not proof of lost coverage, and replacement slices must preserve the contracts. The successful pension-apply journey is missing, stale-action guards exist, and the Scottish region-override notice already has a replacement test; the Welsh conflict case was removed.

  **DoD:** Mounted production-path tests protect current pension suggestion → input update → no automatic recalculation → Calculate → matching result and both Scottish/Welsh code overrides conflicting with the selected region. Keep the Scottish replacement and restore the Welsh case. The existing critical script includes a deterministic responsive journey, and `TESTING.md` accurately states which engines run in CI, how required WebKit evidence is obtained and that critical E2E is currently non-blocking. Close this item when these four gaps are verified and documented; work already completed by an implementing PR counts toward it. MC-01/02/03 carry their own blocking regressions, including the successful suggestion journey where needed; MC-05 owns motion/theme/copy/geometry checks. This item neither duplicates those acceptance checks nor defers them, and requires no new testing platform.

- [ ] Fixture coverage for every supported year and every band boundary (current suites concentrate on 2026-27 plus Scottish top-rate history). DoD: each supported year has independent fixtures at each band edge.
- [ ] Statutory-boundary scenarios independent of stored thresholds for each band edge (extend the `progressive-120k-no-top-rate` pattern). DoD: each band edge has a fixture whose expected values are derived from statutory numbers, not repo thresholds.
- [ ] Director annual-method consistency test: Scottish-tool/main-engine and NI-tool/main-engine comparisons exist. DoD: the remaining Director annual-method comparison has a documented tolerance and passes.
- [ ] Article-to-engine verification for every published figure in evergreen posts. DoD: a check maps each evergreen figure to verified engine output and fails on drift.
- [ ] Fixture provenance controls: per-scenario official-figure citations; derivations start from statutory numbers, never from repo thresholds; reviewer instructions verify against sources (the PR #83 lesson). DoD: every fixture carries a source citation and the review rule is written into `TESTING.md`.
- [ ] Public human-readable calculator verification report generated from the fixture suites, replacing hand-written accuracy claims. DoD: the report generates from fixtures and the public claims cite it.
- [ ] Machine-readable verification output (extend `/api/tax-rates` or a dedicated route). DoD: the route serves generated verification data and is covered by a test.
- [ ] **P2 — Restore Director pointer-driven critical coverage after #139.** Owner: Verification. The mobile drawer/result journey historically left the drawer open on main/DI-01; #139 records a passing 32-case four-project run after changing dropdown option selection and drawer closure to Enter. That improves keyboard-assisted evidence but does not prove the historical pointer symptom fixed; CI remains desktop Chromium only. DoD: retain the keyboard coverage and add at least one real click/tap path through region/option selection, mobile drawer closure, current results and email eligibility, including a guarded divergence. The Director critical spec passes on Mobile Chrome and Mobile Safari without retries. Verify supported desktop/mobile Chromium and WebKit with exact refs, readiness, workers/repeats and limits; no force/evaluated-click or keyboard fallback may stand in for the pointer actions being verified. Keep physical-device limitations explicit. If real-pointer closure reproduces the left-open drawer, the user-facing defect belongs to the lost-pointer item below; this item owns coverage separately.
- [ ] Non-gated E2E specs failing on `main`. On desktop Chromium, `e2e/hicbc-comprehensive.spec.ts` (1 child at £60k), `e2e/pension-limits.spec.ts` (£50k with £20k sacrifice: £3,482.40 against an expected £3,484.80) and three `e2e/accessibility-wcag22.spec.ts` checks (privacy page in dark mode, desktop and mobile; 24×24px touch targets) fail identically on `main` and on the currency-parsing branch. None is in the CI critical slice. DoD: each expectation is reconciled against primary evidence or the UI is fixed, and the specs pass, or a spec that no longer earns its place is removed. This existing Verification owner also covers supporting audit P8: the Privacy ICO/in-text links are distinguishable without colour alone, and all three scrollable policy tables have keyboard access and an accessible label. Closure requires fixing both P8 rule types (`link-in-text-block` and all three `scrollable-region-focusable` violations) and recording passing keyboard and axe checks on desktop/mobile and the supported theme, alongside resolution of the existing expectations above. Removing a spec cannot close an unresolved P8 defect; #137's wording changes are not an accessibility fix.
- [ ] P3 — Verify repeated Director input-test focus recovery after #139. Its `replaceText` helper now waits for editable currency formatting and verifies complete selection before replacement; the reported four-project pass is not a repeatability guarantee. The earlier privacy-telemetry review reproduced the select-all/focus-format race in 6/10 runs on both candidate and base `51aaf145`. DoD: a bounded repeated WebKit negative/empty-input comparison records refs, readiness, workers and results, confirming that the helper correction preserves real caret/input/error assertions. Keyboard readiness and the pointer-coverage follow-up above have distinct completion evidence.
- [ ] P2 — Intermittent browser input/commit failures and lost pointer actions (existing user-facing defects; root causes under investigation). #125 evidence includes golden-master `emergency-m1` (results never appeared), `pension-sacrifice-10pct` (filled/blurred 10 displayed as 0.00) and Director pasted-pence (field empty). Targeted repeats passed 12/12 and 75/75, and the critical slice passed at `--workers=1`. The golden-master setup waited for `networkidle` and a visible server-rendered salary input, making pre-hydration entry a lead, not a proven cause. Claude additionally reported one WebKit pension `5.00` with an empty-field error (217/218), unreproduced in 20 targeted and 25 scripted repetitions. Mobile Safari Calculate taps can be lost during scrolling on main and #127, and desktop WebKit can miss a pension-suggestion click. These are existing user-facing defects, not merely test flakiness; both remain owned here. #128's separately traced scroll repair is historical reference for replacement slices, without establishing one cause for all symptoms. DoD: record exact refs, engines, readiness and draft/commit/error event ordering, plus pointer delivery, scrolling/fixed-header and focus ordering for lost actions; verify an intended tap/click executes once and produces the expected state; after any fix, displayed/committed values, errors and Calculate eligibility agree and the critical slice passes repeated production-build runs under recorded parallel worker/repeat counts. Alternatively, close an unreproduced symptom only with a documented no-reproduction matrix covering all three #125 symptoms and the WebKit stale-error sequence at single and parallel worker counts, recording commands, results and limits without claiming a fix. Do not hide failures with skips, blanket retries or arbitrary sleeps, or assume one hydration cause. Promote reproducible wrong amounts or blocked valid input to correctness priority; MC-01's merged typing fix remains a regression contract; it does not close these residual symptoms.

  This user-facing defect owner also retains the historical Director drawer remaining open after closure if a real pointer action reproduces it; #139's Enter-driven pass did not establish a pointer fix. Keep that symptom distinct from the coverage restoration above.

  Dated comparative evidence for #133/#134/#127, including 29/32 and 28/32 Mobile Safari runs, is [preserved verbatim](reports/project-documentation-reconciliation-2026-10-27.md#retained-browser-comparative-evidence). It does not close this user-facing defect or establish physical-device behaviour.

- [ ] P2 — Close the historical unit-environment investigation with exact failure mapping. Current Windows coverage-gated tests pass at #137 head `35a2c7fa`; this is not an allegation of five current failures. The earlier disagreement and #133's probable `NODE_ENV` cause are [retained as dated evidence](reports/project-documentation-reconciliation-2026-10-27.md#retained-unit-environment-evidence). DoD: a bounded comparison maps the original five failures to the corrected helper or explicitly records non-reproduction, with exact refs, runtime, non-secret configuration and commands. Correct or document any remaining reproducible dependency; do not weaken assertions merely to align counts.

- [ ] **P2 — Documented modelling assumptions and limitations (month-1 projection, NI year model and pension method).** Owner: Verification, coordinated with Foundation transparent results; supporting audit A2/T2 and Compliance limits. Non-cumulative tax-code limitations are visible, but About/Tools promises must lead to a real methodology/limits section. DoD: explain the steady-pay Month 1 PAYE projection, supported years, NI basis, salary-sacrifice assumption and excluded cases using the actual engine and Tools coverage table; provide sources and reachable fixture/proof links. Publish the same limitations near relevant results and keep linked page claims consistent. A visual rebuild is not a prerequisite and this does not complete the remaining Foundation result contract.

### Trust and sourcing

These extend existing owners rather than creating a second supporting-pages queue. Audit severities remain in the unchanged [dated report](reports/payetax-supporting-pages-audit-2026-10-27.md); P2/P3 below do not override [Active](#active).

- [ ] **P2 — Revenue Scotland attribution and source links (A1/C5).** Owner: Trust and sourcing. Include About's two references as well as the homepage FAQ, both Compliance references and `llms.txt`; state the Parliament/HMRC roles correctly and replace the audit's dead income-tax link with verified primary sources. DoD: all references agree and retained external links resolve. Do not treat rate-verification evidence as an endorsement.
- [ ] **P2 — Correct Compliance/authority claims (C1–C6/C8/C9/C11, A6; cross-site endorsement).** Owner: Trust and sourcing, retaining the existing overclaims item. Correct concrete claims: "historical rates back to 2020/21" versus data starting in 2023-24; "updates within 24 hours / same day / immediately"; "independently verified against Revenue Scotland"; ITTOIA 2005 cited for income-tax rates instead of the evidenced ITA 2007 / Finance Acts / SRR basis; and the Class 1/NICA 2014 attribution. Correct "Open source" versus the proprietary licence, ONS described as calculation verification/inflation data despite the earnings/working-hours link, and the Student Loans Company card linking to GOV.UK. Qualify titles, badges, Person schema and footer wording so no HMRC affiliation/certification is implied; use an accurate estimates/not-advice/non-affiliation statement. DoD: each claim is evidenced, qualified or removed; legal/source corrections are checked against current primary material. Verification-method claims (C10) belong to the proof-wording owner below, modelling limits to Verification and build identity to its named owner, not parallel implementations.
- [ ] **P2 — Official-source registry.** Owner: Trust and sourcing. Add legal basis (SRR motions, ITA 2007, SI numbers) alongside URLs. DoD: the registry lists legal bases and trust surfaces cite them correctly; reuse this owner for source corrections rather than duplicating rate tables.
- [ ] **P2 — Evidence-backed public verification wording (A3/C10; homepage/`llms.txt`/Compliance).** Owner: Trust and sourcing. Describe hand-derived PAYE-routine/Table A fixtures accurately, replace unsupported accuracy/cross-platform verification claims with what the suites actually demonstrate and link reachable repository/fixture proof. Reuse the generated public verification report owned by Verification, without inventing a second proof pipeline; coverage/update promises remain with the Compliance-claims owner above. DoD: every public accuracy claim has matching dated/generated evidence, or is removed.
- [ ] **P3 — Source-check dates and deployed-build identity (C7/C12–C14).** Owner: Trust and sourcing. Replace the release-tag deployment assertion with verifiable build identification; normalise source date formats, distinguish checked/accessed dates from policy effective dates, avoid a stale unexplained "recent" log, and link or remove the exposed source path. DoD: the page identifies its actual build/source evidence without claiming unverified production status or invented source checks.
- [ ] **P2 — Align machine-readable crawler claims (M1).** Owner: Trust and sourcing; coordinate with Search and discoverability. `llms.txt` must accurately describe the served robots policy, including named training-agent exclusions. DoD: tests compare the claim with actual directives. A new training-crawler principle (M2) remains decision-gated below; do not silently change access policy to fix wording.
- [ ] **P3 — Organisation/service structured-data truth (M4/M5).** Owner: Trust and sourcing. Verify ownership of the X/Twitter `sameAs` or remove it; make entity/service/offer markup match visible retained calculator features, without advertising standalone Student Loan/Pension tools or unsupported financial-service status. DoD: visible content and schema agree, social ownership is evidenced or the assertion removed. Dataset licensing/dates (M6) remain with the existing Foundation generated-projection item.

### Content accuracy

- [ ] **P3 — Blog reading typography (small, separate UI slice):** align paragraph and list
  text sizing/line height, keep a comfortable article reading width, and reduce excessive
  uppercase/letter spacing in table headings. Preserve Ledger styling and tax content; verify
  one long post, a four-column comparison and category/listing context at desktop and mobile
  widths, including zoom, horizontal table scrolling and keyboard access. No site-wide redesign
  or calculator changes; the Budget 2026 reader-first content PR only records this follow-up.

- [ ] Tax-code guide: add the statutory 50% overriding limit; fix the "K500 = you owe £5,000" conflation; refresh stale 2025-26 titles/meta; cover Scottish SD codes. DoD: all four corrections published and consistent with the engine.
- [ ] Remaining salary-page unsupported-claim audit: after the priority repair, inspect the retained series for uncited percentile/median, lifestyle, rent, savings and mortgage claims. The verified £70k article is the reference pattern and should not be rewritten without a reproduced defect. DoD: each remaining claim is sourced from an appropriate primary dataset, qualified or removed.
- [ ] Evergreen vs historical article policy: frontmatter declares the mode. DoD: evergreen posts contain no hardcoded rate values; historical posts stay pinned and labelled; the blog audit enforces the split. This existing owner also covers the supporting audit's stale blog/listing/`llms.txt` year titles; do not update genuinely historical content to look current without checking its mode.
- [ ] Blog visual refresh: regenerate legacy post images into the Ledger editorial style and retire stale tax-year content in small verified batches. DoD: each batch lands with refreshed imagery and verified figures.
- [ ] **P3 — TaxInsights editorial voice: one-article-at-a-time refresh after the high-priority queue.**
  Owner: Content accuracy / editorial quality. The new [blog voice and workflow](blog/README.md)
  govern all **future** posts immediately, but they do not authorise mass rewrites of the existing
  33 articles. When correctness, privacy, mobile-payslip and verified Director risks allow, inventory
  retained articles by reader value, accuracy/staleness, search evidence and voice; classify each
  `keep`, `refresh`, `rewrite`, `merge` or `retire`. Pilot the new voice on a few low-risk articles
  (the beginner's guide, Making Tax Digital, and a separately justified pay-rise problem-solver are
  candidates, not committed delivery scope), then handle individual posts or small batches with
  source-checked facts, independent engine fixtures for numbers, desktop/mobile readability, one
  combined accuracy/readability review and maintainer approval. Protect high-visibility salary
  guides (especially the £70k reference) from speculative rewrites and obey the separate
  **beginner-guide rewrite trigger** under Parked / Triggered work: do not override it with this
  pilot suggestion. Keep the already open Budget 2026 content PR outside this item. No new
  analytics vendors or unsupported “read completion” claims; opt-in GA4 `blog_article_read` fires
  on mount, and scroll depth measures the whole page.

  **DoD:** Dated editorial inventory and priority rationale; each accepted change verified and
  merged separately; meaningful qualitative and available consented search/engagement evidence
  reviewed before expanding scope. Do not pre-empt the [Active](#active) correctness sequence.

- [ ] **P2 — Correct Offline claims and metadata (O1–O3).** Owner: Content accuracy. Describe remembered inputs rather than persisted results/saved calculations, and build/service-worker refresh rather than automatic tax-rate sync. Give the offline route coherent title/canonical/noindex metadata consistent with its utility role. DoD: source and browser checks confirm the copy matches actual offline/reload behaviour without promising a saved-results or synchronisation feature.
- [ ] **P3 — Verify Install/PWA contract (I3/I4).** Owner: Content accuracy, coordinated with the PWA implementation. Check installation steps on current iOS and correct them with dated evidence; resolve the unsupported manifest share target by removing the promise/declaration or obtaining an explicit product decision before implementing shared input. DoD: install/share instructions match supported behaviour. Do not restore unsupported calculator query prefill as an incidental fix.

### Production and public evidence

Work here completes only against deployed behaviour, external services or recorded external evidence — not local tests.

- [ ] Production verification of analytics consent withdrawal behaviour (post-PR #78). DoD: dashboard and behaviour evidence recorded in a dated report.
- [ ] Periodic external oracle cross-check (HMRC test data or an independent calculator sample). DoD: a dated report records the sample, source and outcome.

### Search and discoverability

- [ ] **P2 — Triage Ahrefs crawl link failures (29 October 2026; evidence before fixes).**
  Owner: Search and discoverability, with Trust and sourcing for official-source links.
  The [dated Ahrefs crawl snapshot](reports/ahrefs-site-audit-2026-10-29.md) reports
  2 newly affected URLs under “Page has links to broken page”, 3 external 4XX findings
  (+2), and 3 pages linking through redirects (+1); these are crawler classifications,
  not yet verified production defects or unique broken destinations. Do not double-count
  overlapping findings or infer a sitewide indexing issue from the 99/100 health score.

  **DoD:** Export the affected source page, anchor, destination, response code, internal/external
  status, and crawl timestamp for each finding; reproduce failures against the live URL,
  distinguishing genuine 404/410 from bot blocking, temporary responses, retired routes and
  false positives. Prioritise broken essential calculator/navigation and primary-source links;
  fix confirmed failures with the current canonical destination or remove invalid links.
  Check relevant source/route regression coverage and recrawl to verify resolution. Escalate
  severity only on verified material user/trust impact. Inspect the 4 changed pages flagged
  “not submitted to IndexNow” against the actual submission/eligibility contract before
  treating them as defects; record any gap separately under this owner. Redirect hops are
  P3 hygiene unless demonstrably harmful. The 55 training-bot-policy notices belong to the
  existing [crawler-claims owner](#trust-and-sourcing); do not change robots policy to chase
  the audit score. Metadata-change notices are informational, not a rewrite mandate.
  Preserve affected URLs, evidence, checks and outcome in the eventual implementation PR;
  this item does not authorise changes or reorder [Active](#active).
- [ ] **Dedicated search audit — Pre-deployment protection gate; P2 post-release observation.** Removal of the large hero is accepted for access to the calculator; its SEO effect is unproven. Keep one audit with two distinct completion points tied to the first release containing the proposed homepage/hero change, whichever main-based replacement PR delivers it; superseding #128 does not remove this gate.

  **Scope:** Compare the last unchanged homepage and proposed/deployed replacement: raw server HTML and rendered mobile/desktop content, meaningful H1/title/description, canonical and robots directives, response status/redirects, sitemap inclusion, structured data versus visible content, useful explanatory/trust copy and internal links to the calculator, tools and retained guides. Check crawlability without calculator interaction, mobile usability/performance and existing discoverability tests. Review page/query evidence for the homepage and retained organic surfaces, including the Scottish calculator, salary pages and beginner guide; use the August audits as dated context rather than a current baseline.

  **Pre-deployment DoD (release-blocking for the homepage change):** A dated report captures the unchanged production homepage's served HTML, response headers/status and rendered mobile/desktop content, plus its live Search Console URL Inspection indexed status, Google-selected canonical and last-crawl date, with collection dates and URLs. Inventory the removed heading, copy and `#tax-calculator`/`/tools` links and record whether each useful purpose is retained or replaced. Identify the exact proposed release ref and compare its technical behaviour against that captured baseline using the scope above, including retained routes, useful links and indexability; resolve/recheck technical regressions before deployment. Record the planned post-recrawl observation interval, matched prior interval and year-earlier comparison where available, page/query/device/geography segments and a quantified traffic-drop threshold that triggers investigation/mitigation. The threshold and response are chosen from the baseline evidence before deployment, not after seeing results; missing year-earlier data is an explicit limitation. Historical performance exports may be obtained later; the current URL Inspection state and unchanged production response must be captured before they change. Missing essential evidence leaves this gate open with a specific evidence request, not an assumed pass. This authorises no deployment.

  **Post-release DoD (P2 observation):** Record the actual deployment ref/date and recrawl timing; compare Search Console clicks, impressions, CTR and position across the predeclared matched windows and segments, using year-earlier data to assess seasonality where available. Assess indexing/canonical changes and any other releases or tax-year/query shifts separately from performance attribution. Apply the predeclared drop trigger: record whether it was met, investigate affected pages/queries and record mitigation or an evidence-backed reason for no change. Available consented GA4 calculator engagement may contextualise traffic without adding a vendor or personal data. Mark conclusions protected, improved, regressed or inconclusive with supporting evidence; insufficient access, traffic or recrawl leaves measurement pending with a named evidence request and revisit condition. Neither a changed indexed-URL count nor passing local tests proves search protection. Technical completion does not close this measurement scope. Keep testable follow-ups in this backlog, cross-referencing existing beginner-link and trust/content owners; do not authorise mass redirects, consolidation, content expansion or ranking guarantees.

- [ ] Beginner-guide contextual inbound links: add a small number of genuinely relevant inline anchors from retained guides that already discuss PAYE basics, tax codes or employee deductions. Do not add site-wide boilerplate or rewrite the beginner article in this slice, and do not prioritise it above the active correctness sequence. DoD: the source graph records the deliberate links and each anchor is contextually useful.

## Parked / Triggered work

These are not active for the R&D app unless traffic evidence or an explicit product decision makes them worthwhile.

- Optional blank-amount semantics (Claude proposal). Trigger: an explicit decision on whether a deliberately emptied optional allowance, partner-wage or income-source amount may mean "none". Pending that decision, preserve #127's explicit empty/error behaviour; Salary remains required and invalid non-empty text is never coerced. DoD: a field-by-field rule is agreed, explained beside affected inputs and verified for typing, clearing, hidden/inactive fields, restoration and Calculate recovery without reintroducing silent zeroing or stale-result use. This does not reopen #127 or weaken its merged integrity contract.
- Retired intent-route redirects and index remnants. Trigger: Search Console shows material impressions or confusing snippets for retired routes. DoD: affected routes redirected or cleaned, with the GSC evidence and outcome recorded.
- Beginner-guide content/rewrite follow-up. Trigger: Google has recrawled the 29 July rewrite and matched page/query evidence still shows a content or intent problem. DoD: diagnose the post-recrawl evidence before another content, metadata or intent overhaul; keep this separate from the active contextual-link item above.
- Local Search Console CSV analyser. Trigger: redacted page/query exports are available and another manual reconciliation would otherwise be required. DoD: a small credential-free script produces reproducible summaries without storing personal or sensitive exports.
- New calculator variants such as reverse salary, two-job, pro-rata, bonus/overtime, or salary comparison. Trigger: an explicit product decision that one variant is genuinely useful, evaluated one at a time. DoD: the chosen variant ships tested and verified, not as growth-page coverage.
- Separate FAQ/HowTo/`llms.txt` expectation docs. Trigger: evidence that the existing static HTML, visible citations, Dataset JSON-LD and crawlable tax facts stop serving AEO/GEO needs. DoD: a documented decision either adds the docs with owners or confirms the current assets suffice.
- Supporting-page proposals and uncertain policy choices from the [27 October audit](reports/payetax-supporting-pages-audit-2026-10-27.md). Owner: the relevant trust/content/privacy owner after an explicit decision; P3 unless new evidence changes risk. Trigger: a concrete product, accessibility or crawler-policy decision, not the audit's opinion alone. Scope: About audience/contact redesign (A4/A5), Compliance visual rebuild (C15), Terms/disclaimer-page and optional accessibility-statement creation after the legal applicability check, navigation/branding changes (T4/blog sub-brand), T3's Tools "Salary vs dividends optimizer" description (an opinion, decision-gated with parked DI-18's qualified naming/estimate proposal; agree the wording contract before implementation), HowTo markup's usefulness (I2), a consistent training-agent principle (M2), P7's analytics-exemption opportunity (GA4 remains opt-in), P9's self-assessment tone, translation blocking and forced-light/color-scheme choices, and copyright-year presentation hygiene. DoD: record the chosen contract, evidence and affected surfaces; route any confirmed disclosure/contrast defect to its existing active owner rather than opening a duplicate queue.
- Director Intelligence design and refactoring proposals DI-15, DI-17 and DI-18 (from the [18 October audit](reports/director-intelligence-audit-2026-10-18.md)). These are not defects: they propose a mobile hierarchy, input-component consolidation and context/naming/persistence changes. Trigger: an explicit product decision. Verified facts inside them (dormant input modules with stale help, inconsistent page naming) stay true; their stated DoDs are retained below for reference.

  - **DI-15 · Proposal — Simplify the mobile journey and visual hierarchy.** The empty state delays the main entry action; repeated summary cards and expanded workings make results long; sliders lack precise entry, Your Setup requires hunting through Full Inputs, and normal tax costs use error-like colour.

    **DoD:** The first mobile viewport offers an obvious Enter company figures action and concise task explanation; any example mode is explicitly distinguished from real inputs. One primary take-home result, selected salary/dividend split, reserves, and important checks lead the page, with repeated metrics compacted and detailed workings/education available on demand. Sliders also offer exact numeric entry, a visible current value, and reset; Your Setup has a direct edit route with explicit apply/cancel/reset/clear semantics. Major touch actions are comfortable to target, mobile text/keyboard behaviour is checked on iOS, jargon such as YTD is explained, scripted navigation respects reduced-motion settings, and navigation prioritises the current workflow with labelled major actions rather than competing icon-only menus. Normal deductions use neutral styling; error/success colour has a consistent meaning and shared radius/spacing/border tokens retain the Ledger identity. Before/after desktop/mobile captures demonstrate the revised journey without removing required detail.

  - **DI-17 · Proposal — Consolidate live input components and scenario ownership.** The large mounted `InputsPanel` duplicates seven standalone input modules; those modules and `TaxBreakdownTable` have no live consumer beyond exports, while repeated active-scenario hooks can repeat calculation work.

    #139 also notes the always-mounted email dialog's whole-store subscription. Its performance effect is unprofiled; this remains within the existing parked proposal/trigger, not a new active optimisation task.

    **DoD:** An import/consumer audit identifies the production owner of every field and breakdown; unused paths are retired or deliberately integrated after checking consumers, with stale examples/help corrected. Coherent input groups share parsing, validation, labels, and help; tests exercise the mounted production paths instead of treating dormant-module tests as live coverage. Objective, strategy/custom salary, profit adjustment, validated inputs, resolved financials, and result provenance have one coherent ownership path; repeated scenario work is centralised where profiling justifies it. Existing tax-domain owners are preserved, no duplicate calculator/generic rules framework is introduced, and interaction performance is measured before/after any optimisation.

  - **DI-18 · Proposal — Make assumptions, sources, naming, and remembered state visible.** Essential context lives in optional Learn, product/strategy names vary across the route and metadata, and device persistence/reset behaviour is not clear at the decision point.

    **DoD:** A visible context strip states tax year, region, projection period, and selected scenario, with accessible links to calculation basis and relevant primary sources. Route title, heading, navigation, metadata, FAQ placement, strategy labels and the Tools hub description (supporting audit T3) use consistent task language; qualified estimates replace unbounded recommendation/optimal claims. Remembering/erasure is owned solely by Privacy follow-ups (explicit opt-in off by default, clear-data, legacy and cross-tab handling); preserve that contract here without a second implementation. The design continues to require that an accidental reset can be undone or recovered equivalently. Expiry/tax-year restoration and the existing hidden-detail notice remain correct and tested; Quick Start reveals active saved details rather than concealing their effect. The dated audit remains evidence, and evergreen guidance reflects the final verified behaviour.

New work should add a small, concrete item here only when it is not going straight into an issue or pull request.
