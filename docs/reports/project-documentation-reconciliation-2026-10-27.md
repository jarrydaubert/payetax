# Project documentation reconciliation — 27 October 2026

Documentation only, based on merged main `e3f857397e65a4aef79a47889641756bdaad5bfe`.
This records the evidence and disposition decisions behind the updated project state/backlog;
it is not another delivery queue or a production-deployment certificate. No application change,
rebase of #128, provider-setting change, deletion, release or merge is performed here.

## Evidence and completed scope

| Source | Verified disposition | Limits |
| --- | --- | --- |
| [#135](https://github.com/jarrydaubert/payetax/pull/135), merged `3c758f77`, 26 October; runtime review `1fc01a92` | Recorded five cards, all seven desktop periods visible by default at that reviewed ref, no normal-table horizontal scrolling, cards/headers/first monetary row visible together and usable forward/reverse focus below the header. | What-if deliberately scrolls within its labelled region; #136 later changes default selection. This is historical runtime evidence, not a new production check. |
| [#136](https://github.com/jarrydaubert/payetax/pull/136), merged `534b8eff01c09b959139c4276aac779bccb986bd`, 27 October | Optional Tax Code input with region-aware placeholder/tooltip; five default periods, seven available. | Supersedes the historical all-seven-default review of #135; does not remove the fifth card or change financial formulas. |
| [#127](https://github.com/jarrydaubert/payetax/pull/127), merged `51aaf14522d19579f3be9e5f7a4440f97180fc7a`, 27 October | MC-01, MC-02 and MC-03 integrity are merged; amount entry, legacy pension recovery, explicit Calculate and stale result/email/suggestion guards are no longer unfinished implementation tasks. | The complete regression contracts are retained below. MC-03 presentation and MC-04–08 remain open. Pointer/action-delivery and native-device limits remain separately owned. |
| [#137](https://github.com/jarrydaubert/payetax/pull/137), merged `e3f857397e65a4aef79a47889641756bdaad5bfe`, 27 October | Financial telemetry minimised; GA labels/parameters and URLs filtered; useful non-financial Sentry diagnostics retained; policy/storage/PAYE email disclosures corrected. Claude's independent APPROVE was supplied by the maintainer. | Automatic remembering, Director privacy controls, provider verification and vendor history are not fixed by prospective collection changes. No production behaviour is certified by the merge. |
| #137 final head `35a2c7fa3875faba560358f4fcdd2264455c9cf3` | Independently accessible [hosted CI](https://github.com/jarrydaubert/payetax/actions/runs/40547076908/job/122340439388) records 250 suites/4,441 tests passing and TrafficMetrics 100% statements/branches/functions/lines. [Critical Chromium E2E (non-blocking)](https://github.com/jarrydaubert/payetax/actions/runs/40547076908/job/122340438859) and [CodeQL](https://github.com/jarrydaubert/payetax/actions/runs/40547077038) also succeeded for this head. [Vercel preview status](https://vercel.com/jgfprojects/payetax/Endv3Ww8HXUWqQmorAFy3nGLqeBX) was also checked successful. Windows `bun run test:ci` with the same counts/coverage is a separately supplied maintainer report. | Hosted run metadata, job status and CI test/coverage log were independently read for the recorded head; the reported Windows command was not rerun in this documentation task. The earlier 4,433-test run lacked the new component suite; the final test-only commit closes the coverage failure without lowering thresholds. |
| [Privacy verification report](privacy-telemetry-minimisation-2026-10-27.md) | Preserves actual GA/Sentry/Vercel interceptions, regression results, M1/M2/M3 resolutions and L1–L5 limitations. | Its "PR open" wording is historical to that report; current merge truth is recorded here. The 17/18 WebKit run is not rewritten as fully green. The Director timing race reproduced 6/10 on candidate and base. |
| [22 October calculator reconciliation](calculator-backlog-reconciliation-2026-10-22.md), [MC-01 input](mc-01-webkit-monetary-input-2026-10-22.md) and [touch-pan follow-up](mc-01-touch-pan-follow-up-2026-10-23.md) | Original decisions, disagreements, acceptance requirements, commands and limitations remain unchanged. | Their old open-PR/MC status is dated evidence, not current project state. Native WebKit pan, physical devices, OS clipboard/native paste are not newly verified. |
| [18 October Director audit](director-intelligence-audit-2026-10-18.md) and [19 October addendum](director-intelligence-audit-addendum-2026-10-19.md) | Preserve F01–F18/DI-19–27 arithmetic, sources, examples, UI observations and original uncertainty. | No fresh financial or browser audit is claimed. Apart from removing warning telemetry, #137 does not close the Director correctness queue. |

GitHub PR metadata and the local merged graph were checked against fetched `origin/main`.
The last independently recorded production baseline remains `44d8d02`; successful previews and
repository merges are not evidence of what a public visitor currently receives.

### #137 review and local-evidence provenance

The [maintainer-authored #137 description](https://github.com/jarrydaubert/payetax/pull/137)
records Claude's independent **APPROVE as reported by the maintainer**, not a formal GitHub
review. [GitHub review submissions](https://api.github.com/repos/jarrydaubert/payetax/pulls/137/reviews)
returned an empty list when checked on 27 October 2026. The supplied approval covers the reviewed
implementation; the later final-head TrafficMetrics test-only change has the hosted CI evidence
above, not a newly inferred Claude approval.

Preserved maintainer-reported local results are 4,433 tests/249 suites, repository checks and
production build passing; a fresh consent/privacy slice passing 18/18 in Chromium/WebKit; and
the broader reviewed-source regression run passing 73/73 Chromium and 17/18 WebKit. The existing
Director focus-timing race reportedly reproduced 6/10 on both candidate and base `51aaf145`.
The final Windows report gives exact `bun run test:ci`, 250 suites/4,441 tests and TrafficMetrics
100% statements/branches/functions/lines. These local and independent-review reports are retained
with their attribution; the linked hosted CI independently corroborates the final test/coverage
counts, not the local browser, outbound-payload or Claude-review execution.

The [historical implementation report](privacy-telemetry-minimisation-2026-10-27.md) remains
unchanged, including its local/scratch artifact references and the 38-file source-hash/build
provenance summary. Those raw artifacts are not bundled or independently verified here; the
committed summaries preserve their reported results and limitations. Its historical pending-review
wording does not override the merge record. Future PR evidence must follow `AGENTS.md`'s permanent
report/PR-attachment rule, including a useful summary and original-artifact hash where raw
artifacts cannot be retained safely. No production or provider-dashboard verification is implied.

Earlier #127 acceptance records remain reachable: MC-01 at `f0bcdc97`; Claude's MC-02 APPROVE at
`6a9bee73` ([maintainer-supplied record](https://github.com/jarrydaubert/payetax/pull/127#issuecomment-6440302170));
and MC-03 integrity APPROVE at `8ad733a2`
([comparative review record](https://github.com/jarrydaubert/payetax/pull/127#issuecomment-6441865445)).
These establish the accepted scope and its reported evidence; the final merge supersedes their
old pending-cleanup status, without certifying the separate pointer/tap or physical-device paths.

## Delivery decisions preserved

The Foundation order remains explicit pension methods → transparent results → independent
fixture/test-portfolio completion and Foundation reconciliation. Verified wrong-money/deadline/
statutory-rate exceptions retain their agreed insertion points; this documentation does not
promote general privacy, supporting-page or design work above that order.

The main-calculator prerequisite #127 is now complete. The next agreed delivery slice is still
the **DI-05 interim email guard**, then the existing **#128** mobile payslip/redesign work.
The guard makes email unavailable with a visible reason whenever its report would differ from
the viewed scenario, including salary/profit what-if, selected strategy and objective, and removes
the unfulfilled key-dates promise. The full DI-05 snapshot/export contract remains later, after
DI-04 and the rest of DI-02. A privacy notice is not a financial-parity guard.

The Director sequence after that interim guard remains:

1. DI-07 → DI-26 → DI-23 → DI-06 → DI-27.
2. Company budget: DI-19 → DI-21.
3. Personal tax: DI-08 with DI-24 → DI-20 → DI-25.
4. DI-04 → remaining DI-02 → full DI-05 → DI-03.

Explicit pension methods remain between the first and second rows above; transparent results
remain after the personal-tax row. MC-03 presentation/MC-04/05 may interleave after the interim
guard without pre-empting a ready verified wrong-money fix. The entire Director queue is not a
prerequisite for #128. The search pre-deployment gate still applies to the first homepage/hero
change wherever it ships; post-release observation remains a separate completion point.

#135's five desktop summary cards remain the agreed design. The earlier #128 direction to
remove those cards and introduce a separate homepage comparison mode was superseded, as recorded
in the [22 October documentation reconciliation](calculator-backlog-reconciliation-2026-10-22.md#documentation-reconciliation-on-rebase).
Mobile two-period comparison remains within MC-05; it does not revive the superseded homepage mode.

## #128 reconciliation checkpoint

Recorded head: `b4f10087b263a2f87456a432ef03c65385f4fc5e`, branch
`feat/calculator-pay-statement`, [PR #128](https://github.com/jarrydaubert/payetax/pull/128), open.
Its common ancestor with current main is `8d12f20a6c70e0faf76c4f1910555b8aadc1ed4e`;
`git rev-list --left-right --count origin/main...origin/pr-128` gives 9 main-only / 3 branch-only
commits. `git merge-tree --write-tree --messages origin/main origin/pr-128` returns conflicts at
16 paths. This computes a virtual merge only; neither branch nor working-tree files were merged.

| Conflict area | Paths reported by the probe |
| --- | --- |
| Current documentation | `docs/BACKLOG.md`, `docs/PROJECT_STATE.md` |
| CI command and browser contracts | `package.json`, `e2e/calculator-critical.spec.ts`, `e2e/display-periods.spec.ts`, `e2e/responsive-calculator-layout.spec.ts` |
| Input/control code and tests | `src/components/atoms/__tests__/NumberInput.test.tsx`, `src/components/organisms/CalculatorInputs/BasicInputs.tsx`, `src/components/organisms/CalculatorInputs/CalculatorInputsSection.tsx`, `src/components/organisms/CalculatorInputs/__tests__/BasicInputs.test.tsx` |
| Calculation/result integration | `src/store/calculatorStore.ts`, `src/components/organisms/CalculatorContainer.tsx`, `src/components/organisms/CalculatorResults/ResultsTable.tsx`, `src/components/molecules/ResultCard.tsx` (modify/delete) |
| Mounted integrity coverage | `src/components/organisms/__tests__/CalculatorContainer.amountIntegrity.test.tsx`, `src/components/organisms/__tests__/CalculatorContainer.test.tsx` |

### Silent deletions outside the conflict list

The same #128 head deletes the following paths relative to its common ancestor. These deletions
can merge without a textual conflict because main did not modify them; the 16-conflict inventory
therefore does not cover all semantic risks:

- `src/components/organisms/CalculatorResults/ResultsSummaryCards.tsx`
- `src/components/organisms/CalculatorResults/__tests__/ResultsSummaryCards.test.tsx`
- `src/components/molecules/__tests__/ResultCard.test.tsx`

The existing `ResultCard.tsx` modify/delete conflict is already counted above. Review both the
conflicted paths and clean deletions for loss of #135's five-card desktop functionality and
meaningful regression coverage. Retain or restore the files where needed; where their
functionality genuinely moves to replacement components, preserve equivalent behaviour and
coverage on the mounted production path rather than blindly retaining obsolete files/tests.

Reconcile in the existing PR against latest main; do not take either side wholesale or infer that
an automatically merged file is semantically safe. The implementation owner must preserve:

- #135's five cards, desktop density, accessible navigation and deliberate What-if scrolling;
  #136's five selected defaults, seven available periods, optional Tax Code and retained selections.
- [#134/MC-09](https://github.com/jarrydaubert/payetax/pull/134) pension-suggestion arithmetic:
  add the additional annual suggestion to the existing £/% pension through the engine-owned pay
  basis, convert the total from annual to the selected pay period, round **up** to the penny
  before storage, then require **Calculate again**. Applying alone cannot publish results.
  Preserve `src/components/organisms/__tests__/CalculatorContainer.pensionSuggestion.test.tsx`
  and `src/lib/__tests__/pensionOptimizer.test.ts` regressions: existing £/% pension addition,
  monthly/weekly/hourly conversion, exact pennies without an extra penny, parser-valid storage/
  rehydration, independent payroll expectations and invalidation of old results/actions. The
  separate exact-£100,000 floating-point residual remains open; this preservation does not close it.
- #127's amount/empty/error handling, unit-aware legacy restoration, atomic invalidation, explicit
  Calculate, matching validated email inputs and input-only/current-suggestion guards.
- #137's removal of financial derivatives/warnings, shared GA/Sentry/Vercel URL and label filters,
  exact approved campaign tuples, accurate disclosures and unchanged GA consent machinery. Resolving
  the store conflict must not restore financial telemetry or bypass the outbound boundary.
- The union of the critical input, responsive, consent and privacy regressions; use the exact
  coverage-gated `bun run test:ci`, retain TrafficMetrics coverage and thresholds, then the relevant
  production browser/real-outbound checks. Do not resolve a script conflict by dropping either slice.
- MC-03's remaining presentation, MC-04/05 and MC-08's named portfolio gaps; keep Scottish region
  coverage and recover Welsh conflict coverage where absent. Earlier #128 counts do not certify
  the reconciled build, pointer-repeatability, physical devices or statutory completeness.
- The current backlog priorities and residual defects, not #128's superseded completion claims or
  duplicate local-verification queue. Preserve its [21 October implementation report](https://github.com/jarrydaubert/payetax/blob/b4f10087b263a2f87456a432ef03c65385f4fc5e/docs/reports/main-calculator-redesign-2026-10-21.md)
  as dated evidence, including traced focus/scroll repairs, without reviving superseded desktop decisions.

This checkpoint does not perform or authorise rewriting #128's history, changing its financial
expectations, accepting the redesigned homepage or deploying it. Fresh independent review of the
reconciled implementation remains necessary.

## Supporting-pages dispositions

The complete independent [supporting-pages audit](payetax-supporting-pages-audit-2026-10-27.md)
is copied byte-for-byte from the maintainer-supplied evidence file. SHA-256:
`8f211cc17008342cf5be456e3adb2c1247c28c58576412f858fcfe554bc86dbf`.
It remains a `534b8eff` / 27 October live Chromium snapshot with its original defects, opinions,
uncertainties, sources and raw-artifact references. Those external local captures are not bundled
or claimed to be repository-relative evidence. No audit text or original recommendation is rewritten.

The preference for data minimisation over permission-broadening superseded the audit's first
suggested policy-only option and was implemented by #137. Finding IDs below refer to the supporting
audit, not to the later #137 M1–M3/L1–L5 review. This is a disposition index; actionable DoDs have
one owner in the backlog. Audit severity is not a new execution order.

| Findings | Disposition / single backlog owner |
| --- | --- |
| P1/P2 financial GA/Sentry attributes | Closed prospectively by #137. Provider state and historical deletion are separate, unverified Privacy follow-ups. |
| P3 browser storage; M3 `llms.txt` storage promise | Disclosure/inventory wording closed by #137. Opt-in off by default, clear-data, legacy snapshots and cross-tab erasure stay with Privacy follow-ups, owning the remembering part of DI-18. Automatic remembering has not changed. |
| P4 IP/rate-limit wording | Public disclosure corrected by #137, including social-preview endpoints. The base64 fallback's misleading source comment/test description remains a P3 Security wording item, not a claim of cryptographic hashing. |
| P5 retention; audit GA/Sentry/provider open questions | P2 Privacy provider verification. Do not invent retention periods/IP settings or infer them from local SDK tests. |
| P6/P11 controller/complaints/ICO questions; Terms applicability | P2 Privacy obligations verification using current primary guidance/legal input. These remain uncertainties; no legal conclusion or duty exemption is assumed. |
| P7 statistical analytics exception; P9 self-assessment tone | Decision-gated supporting-page/privacy proposals. GA4 remains opt-in; no vendor or consent redesign is authorised. |
| P8 policy links and focusable tables | Existing Verification accessibility owner; closure explicitly requires fixing `link-in-text-block` and all three `scrollable-region-focusable` violations, with passing desktop/mobile keyboard and axe evidence. Removing a spec or changing privacy wording cannot close P8. Dark-mode and footer target debt remain there too. |
| P10 PAYE collection notice | Closed by #137. Remaining Director email/blog absolutes (#137 L5) have a separate Privacy disclosure owner, coordinated with DI-05 without changing its order or financial-parity scope. |
| A1/C5 Scottish attribution/dead source link | P2 Trust attribution/source-link owner, now explicitly including About. |
| A2/T2 missing linked limits | Existing P2 Verification modelling-assumptions owner, coordinated with Foundation transparent results. |
| A3/C10 proof access and verification-method claims | Trust evidence-backed verification wording; generated report work stays with the existing Verification owner. |
| A6/C11 authority/endorsement framing; C1–C4/C6/C8/C9 claims | P2 Trust Compliance/authority correction, including licence wording, legal/source-card descriptions and a qualified footer/non-affiliation statement. |
| C7/C12–C14 build identity and source dates/path | P3 Trust source-check/build-transparency owner, without inventing deployment/source-check evidence. |
| A4/A5/C15 optional About/contact/Compliance redesign | Parked proposals, not prerequisites for correcting claims or publishing actual limits. |
| I3/I4 install instructions/share target | P3 Content/PWA verification; current iOS steps need evidence, and shared-input support requires an explicit product contract. |
| I2 optional HowTo utility | Parked supporting-page proposal. I1 remains a strength, not repair work. |
| O1–O3 offline persistence/sync/metadata | P2 Content accuracy. Remembered inputs do not imply saved results or automatic tax-rate synchronisation. |
| T3 Tools optimiser description | Opinion; explicitly decision-gated with parked DI-18 qualified naming/estimate scope. Agree the wording contract before implementation, including the Tools hub; no active defect or parallel Director redesign is created. |
| T4 navigation; blog sub-brand | Parked product proposals. Stale blog/listing/`llms.txt` year titles stay with the existing Content evergreen/historical owner. |
| D1 Director privacy/consent/Compliance access | P2 Privacy controls owner, coordinated with DI-12/13 without duplicating their landmarks/drawer work. |
| D2 Director hint contrast | DI-12's existing P2 accessibility acceptance; not closed by a privacy wording change. |
| M1 `llms.txt` crawler promise | P2 Trust crawler-claims owner; compare with served robots directives. |
| M2 training-crawler principle | Parked explicit policy decision. A wording correction does not silently permit/block additional agents. |
| M4/M5 social ownership and organisation/service offers | P3 Trust structured-data truth; verify assertions or remove them, rather than inventing identities or standalone tools. |
| M6 Dataset licensing/date projection | Existing Foundation generated-projection owner, extended to reconcile actual rights and verification dates. |
| M7 unused giscus CSP allowance | P3 Security hygiene after a consumer check. |
| Cross-site observations | Claims, missing limits, authority and dates/footer have the owners above. Visual style, translation, colour-scheme and copyright presentation are decision-gated proposals; verified accessibility defects retain their active owner. |
| A7/I1/T1 and the 404 | Preserve the recorded strengths; no new repair task. |

#137 L1–L4's opaque Sentry metadata and conservative Vercel/GA-utility trade-offs remain explicitly
separate lower-priority Privacy follow-ups; no current financial producer was identified for the
opaque Sentry paths. A newly demonstrated material leak would be assessed under existing risk
rules, not suppressed by these priority labels. Broader DI-15/17/18 proposals stay parked; resetting/
remembering has one owner and does not wait for an unrelated Director redesign.

## Retained #127 regression acceptance criteria

These are the full pre-reconciliation DoD texts, retained verbatim below as regression contracts.
Their original acceptance wording does not mean #127 is still open. MC-03's separate presentation
DoD stays active under its original ID in the backlog; no requirement is deleted by narrowing scope.

### MC-01

Focus-and-leave preserves the value; deliberately clearing a used amount retains an explicit empty/error state rather than committing zero. Replacing initial `0.00` and an existing £25,000 with `30000` produces exactly £30,000, or a specific visible rejection, never another accepted amount. Mounted salary, pension, allowance, partner-wage and additional-income fields preserve pence and reject malformed/negative text. Production-browser regressions exercise pointer clicks at left/middle/right positions, touch entry, keyboard focus and actual typing/paste in Chromium and WebKit; replacement tests must not rely solely on `fill()`. Existing valid entry, Enter/Calculate, Reset and focus-return journeys still work. Before #127 merges or any affected release ships, the fixed head passes repeat runs of the targeted WebKit regression on desktop and touch-emulated mobile. Record the command, ref, engine version, projects, repeat/worker counts and results. A local production-build run is sufficient; explicitly record that Chromium-only CI does not enforce it and that emulation is not a physical-iPhone test. Missing or failing WebKit evidence blocks acceptance, not a reason to assume Chromium parity. Stale-result behaviour belongs to MC-03.

### MC-02

£↔% changes never silently reinterpret a contribution; the resulting value and unit are valid or visibly need correction, and any reset/conversion is explained. Returning visitors with synthetic legacy `{pensionContribution: 5000, pensionContributionType: 'percentage'}` can recover without clearing browser storage: invalid restored data is visibly corrected or associated with the pension field and blocks calculation until resolved. Calculate never silently fails or publishes a result for invalid input. Store and production-browser regressions in Chromium and WebKit cover both switch directions within/above limits, valid restoration, the legacy case and recovery; store tests also cover expiry and tax-year rollover. Edits still require Calculate under MC-03. This is input integrity, not the separate Foundation pension-method work.

### MC-03 integrity

Every calculation-input change, including valid/invalid drafts, pay frequency, year, region/code, hours, loans, exemptions, source add/remove and pension suggestions, requires an explicit Calculate submission before new results become current. Applying a current suggestion changes the input only; a stale suggestion cannot be applied. Existing Enter-to-submit remains an explicit Calculate action. Presentation-only period/comparison changes reuse the same calculation. After an edit, no result is presented as current. Email (including an already-open dialog) and result-dependent actions cannot send/apply stale or invalid data; after successful Calculate they use the same validated inputs as the displayed result. Mounted-store and desktop/mobile Chromium/WebKit regressions cover £30,000 calculated → valid £40,000 edit → blur → no calculation/no stale export or suggestion → Calculate → matching result/email, plus invalid drafts, recovery and suggestion application. Preserve these guarantees when rebasing #128; do not close this scope solely because MC-01/02 pass.

## Retained browser comparative evidence

The following pre-reconciliation backlog evidence is preserved verbatim. It records the original
refs, counts and limitations; it is not a fresh browser run or a statement that #127 is still open.

  **#133 evidence (24–25 October), line numbers refer to `e2e/calculator-critical.spec.ts` at `c5ed77b`:**
  - **Codex (Windows):** the Mobile Safari "Rejected amounts" journey failed after Reset in 2/5 runs on `main` and 5/5 on the patch.
  - **Claude's independent review (Linux, Playwright 1.61.1, WebKit iPhone 12 emulation, production builds, interleaved 8 × 5 runs per arm):**
    - Failure rates were 23/40 on `main` and 16/40 on the patch; the step after Reset (line 334) failed 11/40 and 9/40. That is no regression.
    - Failures occurred at four steps: lines 269, 299, 307 and 334.
    - At line 269, the typed salary had reverted to `0.00` before the first Calculate, which supports the pre-hydration lead.
    - Desktop WebKit `director-guide-critical` passed 20/20 on both arms, though Codex's Windows runs failed it.

  **#134 evidence (26 October), desktop WebKit tax-trap Apply:**
  - In the monthly journey with an existing 5% pension, clicking "Add £… to Pension" sometimes left the original `5.00%` unchanged instead of applying £1,666.67.
  - It failed once in Codex's targeted MC-09 run (14/15 passed) and once in 10 repeats, with one worker and zero retries.
  - The trace shows three unstable-element waits and then a completed click. The screenshot shows the alert scrolled behind the fixed header.
  - The outcome is fail-safe: nothing is applied, and the original value stays visible.
  - The cause is not established. Before treating this as test-only, check whether the fixed header can cover the alert's button for real users after Calculate scrolls the results into view.

  **#127 comparative evidence (27 October), owner-supplied Claude independent review at `8ad733a2`:**
  - Claude approved all MC-03 integrity requirements. Repeated Mobile Safari MC-03 browser runs nevertheless returned **29/32 and 28/32** because Calculate taps were lost during scrolling. Claude reproduced the same lost-tap defect on main. Exact comparative refs/commands, worker counts, host details and numeric main-arm totals were not supplied in the owner's summary.
  - This is an existing user-facing action-delivery defect, independent of MC-03's accepted stale-result/email/suggestion semantics. Keep the related desktop WebKit pension-suggestion click evidence immediately above under this same owner; neither issue is fixed by changing test activation.
  - Codex's earlier **32/32** at `8ad733a2` was one observed four-project/two-repeat run, not a repeatability guarantee or acceptance evidence that touch delivery works. Claude's comparative repetitions supersede that unqualified claim.
  - The pre-merge MC-03 regression cleanup uses native keyboard activation and retains all correctness assertions, including explicit Calculate, invalid recovery, matching email input, stale-action refusal and input-only pension application. Passing those tests does **not** close this pointer/tap defect or establish physical-device behaviour. No application fix is part of #127's cleanup.


## Retained unit-environment evidence

This is the historical disagreement and probable-cause note, preserved verbatim. The current
Windows coverage gate passes; exact failure-to-fix mapping remains the bounded unfinished scope.

- [ ] P2 — Local unit-environment disagreement (technical investigation). Codex reported five failures in InputTooltip, analytics, rateLimit and origin on both main and the PRs; Claude reported zero failures on all three refs. DoD: a bounded clean comparison records exact refs, runtime, relevant non-secret test configuration and commands; any reproducible environment dependency is corrected or documented with its limits. Reports no longer label the five failures universal main defects. Close with evidence if they cannot be reproduced; do not weaken assertions merely to align counts.

  **Probable cause (#133):** Codex traced five Windows baseline failures to `src/test/env.ts`. Jest's case-insensitive environment proxy on Windows ignored `Object.defineProperty` for runtime `NODE_ENV` reads. #133 switched to assignment and added helper tests. It did not confirm that these were the same five tests, so close this item by re-running the five named suites on Windows at `28f0a63` or later.

## Verification of this documentation change

### Initial revision `c6597eb8` (historical)

`bun --no-env-file run check:repo` and `git diff --check` passed. The local documentation check
passed 54 relative links/anchors, all 53 supporting-audit finding dispositions, all 23 unchanged
active Director DoDs, all three retained merged integrity contracts, the verbatim comparative
evidence, unchanged Foundation order/burn-down and Director insertion points, the unchanged search
gate, the complete audit's byte hash and the five-Markdown-file scope.
No new application build, browser execution, statutory re-derivation, provider inspection or
production verification is claimed by this reconciliation. Stop for independent review; this task
does not authorise a merge or deployment.


### Follow-up to Claude's REQUEST CHANGES at `c6597eb8`

This four-file documentation correction restores #134/MC-09 and #135 preservation requirements,
records #128's silent-deletion risks, clarifies #137 evidence provenance, explicitly decision-gates
T3, retains concrete Compliance examples, requires P8 accessibility fixes for closure and adds the
permanent PR-evidence rule to `AGENTS.md`. The complete imported audit and historical #137
implementation report are unchanged. Independent re-review of this correction remains pending.

Fresh verification on this correction:

- `bun --no-env-file run check:repo` passed (including lint and application/test type checks).
- `git diff --check` passed.
- Read-only Python documentation assertions passed: 56 relative links/anchors across the four
  changed documents and report index; all 53 finding dispositions and every disposition row;
  all 23 original active Director DoDs; unchanged Foundation order/burn-down, Director sequence,
  DI-05 interim guard → #128, search release gate/observation and retained #127 contracts and
  comparative/unit evidence; exactly four changed Markdown files.
- Byte comparisons against `c6597eb8` confirmed the imported audit, historical #137 report and
  22 October reconciliation are unchanged. The audit's SHA-256 remains
  `8f211cc17008342cf5be456e3adb2c1247c28c58576412f858fcfe554bc86dbf`.

No application build/browser run is needed for this documentation correction; no fresh runtime,
statutory, provider or production verification is claimed. No workflow, branch-protection,
environment or secret change, #128 implementation work, merge or deployment is performed.
