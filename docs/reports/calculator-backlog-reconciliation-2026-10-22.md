# Calculator backlog reconciliation — 22 October 2026

Documentation only. No application, test, policy, workflow or deployment changes. This records the
reasoning behind the unresolved queue in [`BACKLOG.md`](../BACKLOG.md); it is not a second backlog
or a release certificate. Claude requested changes on the initial #129 revision `3d221e3`; this
documentation correction awaits independent re-review before implementation resumes.

## Evidence and boundaries

| Source | Evidence used | Limits |
| --- | --- | --- |
| Merged `main`, `8d12f20a6c70e0faf76c4f1910555b8aadc1ed4e` | Repository guidance, project state, backlog, current source and tests | This is the merged baseline; the local branch named `main` is older, so comparison uses freshly fetched `origin/main`. |
| [PR #127](https://github.com/jarrydaubert/payetax/pull/127), `1224d3e7a37b8f599df0289c24f05efffafa8d23` | Input/focus handling, atomic result invalidation, pension switches, persistence validation, tests and discussion | Open, unmerged; passing earlier reviews do not resolve later findings. |
| [PR #128](https://github.com/jarrydaubert/payetax/pull/128), `b4f10087b263a2f87456a432ef03c65385f4fc5e` | Statement, comparison, inputs, shared presenter, removed/replacement tests, hero changes, CI command and [implementation report](https://github.com/jarrydaubert/payetax/blob/b4f10087b263a2f87456a432ef03c65385f4fc5e/docs/reports/main-calculator-redesign-2026-10-21.md) | Open and based on #127; neither the code nor its documentation is merged truth. |
| Codex's original "Audit PayeTax calculator UX", 21 October | Five viewports, hierarchy, stale results, motion, clipping, copying, semantics and coverage; findings are summarised below and in the reconciliation table | Browser observations used the public site, whose exact deployed ref was not independently certified; desktop default five columns fitted, all seven did not. |
| Claude's original audit | Supplied excerpt: narrow results, mobile overlays, hidden reduced-motion cards, misleading band/marginal labels, unnamed pension units and empty period selection | The excerpt was retrieved; the full linked artifact was not. Original browser work was Chromium only. The durable summary here does not require access to that artifact. |
| Claude's calculator implementation review, supplied by the owner on 22 October | B1/B2 reproductions, S1–S3, minor findings and test comparisons are preserved in [Reported calculator review evidence](#reported-calculator-review-evidence) | Production-build/browser evidence reported by Claude, not rerun here; touch emulation is not physical iPhone proof. |
| Claude's independent #129 review of `3d221e3`, supplied by the owner on 22 October | REQUEST CHANGES R1–R5 and S1–S6; corrections are recorded below | Source/diff review; this reviewer did not rerun WebKit B1. That does not contradict the earlier calculator review's reported reproduction. |
| Agreed product direction | Explicit Calculate after every input change; compact desktop/five cards/seven periods; simpler mobile statement; hero removal subject to search evidence; incremental mutual review | These decisions supersede earlier design proposals, including automatic recalculation. Clear or retain stale figures is an implementation choice subject to integrity and accessible status. |
| [August search evidence](search-discoverability-evidence-audit-2026-08-23.md) and [landing-page audit](high-value-organic-landing-pages-audit-2026-08-23.md) | Existing URL protections, useful organic surfaces and the evidence standard for the next audit | Dated context, not fresh Search Console data or proof of the hero change's effect. |

The accessible desktop checkout matches #128 and was clean. A separate documentation worktree
starts at fetched `origin/main`, so this PR cannot accidentally include either implementation.
No credentials or saved user inputs were read. Examples in this report/review are synthetic.

## Reported calculator review evidence

This is a durable summary of the owner-supplied reviews, not a claim of fresh browser reproduction.
The calculator review compared main `8d12f20`, #127 `1224d3e` and #128 `b4f1008` on production builds.
The later #129 source review confirms the code findings and explicitly did not repeat WebKit B1.

| Finding | Reported reproduction or observation | Source/verification limit |
| --- | --- | --- |
| B1: pointer focus inserts digits instead of replacing an amount | Playwright WebKit 26.5, desktop and iPhone-sized touch emulation: with Salary `0.00`, click left/middle, type `30000`, Calculate → £300,000 accepted; click the right edge → £0.03 on #128 (validation error on #127). With £25,000 entered, click in the pence and type `30000` → £25,000.30 accepted. Main reportedly produced £30,000; Chromium was unaffected. | Original calculator reviewer reported high confidence for WebKit, moderate for a physical iPhone. `NumberInput.handleFocus` calls `select()`; later pointer events can collapse it. `fill()` bypasses replacement semantics. Release acceptance requires new repeatable WebKit evidence on the fixed ref. |
| B2: restored pension value passes persistence but fails Calculate | On main, switch a £5,000 pension to percentage and retain synthetic saved inputs within the 30-day window. Restore `{pensionContribution: 5000, pensionContributionType: 'percentage'}` on #127, submit Calculate → pension-percentage error without an actionable field error; #128 shows a form alert but still lacks field recovery. | Source confirms separate persisted amount/unit validation and a unit-specific calculation check. #127's transition-based submission differs from #128's direct/caught form call, so the exact exception display remains ref-specific rather than a universal claim. |
| S1: wrong initial headline period | Enter £480 weekly on #128 and Calculate: the Monthly headline is £1,791.24 rather than weekly take-home. | `useState<PayPeriod>('monthly')` confirms the initial selection. MC-04 owns the default rule, not a new tax expectation. |
| S2: result disappears on edit | After calculating, one salary keystroke replaces the statement with "Your pay, explained" and instructions to enter salary. | Source confirms conditional removal. The defect is misleading edited-state feedback; preserving historical figures is optional. |
| S3: desktop density | Reported label-to-figure separation was about 935px at 1440px and 1,120px at 2560px. #128 also removes the five cards and requires opening comparison. | Source confirms the flexible full-width statement and separate comparison. MC-05 specifies observable captures/geometry, not a mandated Annual column or width cap. |
| Existing stale-result mismatch on main | Calculate £30,000, commit a valid £40,000 salary: screen retains the old result while email recalculates from the new input; the old pension suggestion can also be applied. | Already recorded in main's pre-#129 backlog and the original Codex audit. #127's invalidation/guards must remain independently verified acceptance criteria. |

The original audits also reported reduced-motion cards at zero opacity, mobile overlays covering
pence, tax-band income styled like deductions, mouse selection interception, unnamed pension units
and a comparison with no selected period. #128 proposes fixes; MC-05 preserves their visual and
interaction outcomes rather than duplicating completed branch work in new backlog entries.

## Reconciliation and priorities

| Finding or decision | Disposition and single backlog owner |
| --- | --- |
| Focus-and-leave originally erased a filled value; WebKit select-on-focus can silently insert digits (B1) | MC-01, release blocker for #127 and inherited by #128. Preserve the original outcome; do not prescribe Claude's proposed clear/restore mechanism. Real click/touch plus typing is essential evidence. |
| Pension unit changes reinterpret amounts; legacy percentage 5000 passes restoration then fails Calculate (B2) | MC-02, release blocker. #127 fixes new switches but not the restored cross-field constraint. Recovery must be visible and field-actionable, with no storage-clear workaround required. |
| Valid edits leave mismatched screen/email/suggestion state; #128 instead deletes the statement (S2) | MC-03's #127 integrity scope blocks stale results/actions independently of the redesign. Its #128 presentation scope supplies accessible recalculation feedback; old figures may be cleared or retained, never current-looking mixed state. |
| Applying a suggestion recalculates immediately | Source-confirmed additional product conflict: `CalculatorContainer.handleApplyPensionOptimization` calls `calculate()` and `calculatePreviousYear()` after `setInput()`. MC-03 must wait for Calculate, even when the suggested amount is valid. |
| Statement always begins Monthly (S1) | MC-04, product acceptance for #128: submitted frequency, except annual input defaults Monthly. Each successful Calculate reapplies this rule; view changes and resizing do not calculate. This replaces #128's test-pinned persistence across recalculation. |
| Stretched desktop statement, narrow rail, missing five cards and comparison behind a mode (S3/product discussion) | MC-05 restores desktop density and direct seven-period access while preserving mobile. Period/Annual columns and a 36rem cap are possible approaches, not requirements; the outcome is readable compact financial context. |
| Unsigned deductions, missing total, inconsistent zero rows and ±1p reconciliation | MC-06, explanation/presentation follow-up. Preserve statutory amounts; explain independently rounded equivalents or justify a display treatment. A new calculation defect escalates separately. |
| Raw `fourWeekly`, paired "all 7" heading, Gross/Net/Take-home inconsistency and wrapped labels | MC-07, a small consistency/readability slice. Deduction conventions belong to MC-06; layout density belongs to MC-05. |
| Lost successful pension-apply coverage and allegedly missing region-override coverage | MC-08, protect outcomes and new explicit-calculation semantics. The old immediate-recalculation test must not be restored unchanged. Region evidence is qualified below. |
| Intermittent pension empty-error after recovery; main lost clicks and load-related input failures | Extend the existing Verification investigation rather than create another flake programme. A reported one-off is not a proven cause or fixed defect. Keep #128's traced scroll repair, subject to regression evidence. |
| Five local unit failures versus Claude's clean runs | One bounded Verification environment investigation; not five alleged production defects. Preserve both accounts rather than declaring either universal. |
| Original motion, copying, band-label, unnamed pension and empty-selection defects | #128 contains proposed fixes. Preserve their visual/interaction outcomes under MC-05; MC-08 owns only its named remaining coverage gaps. Do not create duplicate "fix again" tasks or mark them merged. |
| Additional-income/hidden-error usability and shared hourly explanatory conversion | Preserve #128's improvements: active adjustments cannot conceal invalid text; use engine period values and the user's hours for annual-only explanatory rows. These are regression criteria, not new calculation owners. |
| Hero removal, SEO and discoverability | One Search and discoverability audit: essential live evidence and technical safeguards block the first deployment containing the homepage change; performance observation follows using predeclared windows/mitigation trigger. No assertion of zero ranking impact. |
| Optional blanks should mean zero/none | Park pending an explicit field-by-field decision. Retain explicit empty/error behaviour in the meantime. |

MC-01, MC-02 and MC-03's integrity scope are independently verified acceptance criteria for #127,
inherited by #128. MC-03's presentation scope is separate and does not require retaining figures.
After the DI-05 interim email guard, MC-04/05 may proceed alongside Director slices without
pre-empting a ready, verified wrong-money fix. The entire Director queue is not a prerequisite.
MC-06/07 are later follow-ups. Tests travel with their behaviour; MC-08 closes only its four named
remaining gaps and cannot defer blocking regressions. Keep one MC-03 item with separately named
closure scopes rather than introducing another numbering scheme.

The existing Director urgent order and Foundation insertion points remain. The new calculator
presentation does not complete pension methods, mixed-income correctness, transparent result
contracts, statutory-rounding ownership, public verification or the remaining tax-domain work.
The existing Verification items retain the inherited browser/Director findings; only the distinct
environment disagreement needs its own entry. Reconcile the unmerged parallel list as below.

## Documentation reconciliation on rebase

This is a conflict-resolution rule for the eventual implementation PRs, not a rebase performed
by #129. `BACKLOG.md` stays authoritative. Do not wholesale accept either old branch's versions of
`BACKLOG.md` or `PROJECT_STATE.md`. Preserve each open scope until the PR that closes it demonstrates
its DoD; record partial completion rather than deleting an entire item prematurely.

| Incoming change | Reconciled outcome |
| --- | --- |
| #127 deletes the input-integrity P1s and says the fixes "have landed" | Drop the superseded deletions/completion prose. Retain MC-01/02 and both MC-03 acceptance scopes until the relevant evidence-backed closure. After an authorised merge, update only the behaviour actually merged; #128's presentation remains open. Keep #127's dated input-integrity evidence. |
| #128 adds the separate "Local verification follow-up" list | Keep the existing Verification owners for HICBC/pension expectations, privacy/footer accessibility and Director mobile journeys. Preserve its exact observed/expected figures and run evidence in the dated implementation report, and link that report from the existing items. The distinct unit-environment disagreement stays in its current item. Do not create the duplicate list or discard its evidence. |
| #128 changes the Foundation result-contract status | Preserve verified presentation facts (year/region, code basis, salary-sacrifice disclosure) in current state only once implemented and merged. The first-class policy/pay-basis/pension-method contract remains incomplete; do not treat presentation as Foundation closure. |
| #128 adds a comparison-as-a-mode project-state section | Drop the superseded design preference. Retain useful technical facts about the shared presenter, engine-owned period amounts, user-hours conversion, tax-band meaning and employer NI, qualified to the ref/merged state they describe. The agreed desktop five-card/seven-period target and mobile statement remain authoritative. |
| #128 adds `main-calculator-redesign-2026-10-21.md` | Preserve this dated implementation report, including original decisions, verification and limitations. Add a note linking this reconciliation where decisions were superseded or evidence disputed; do not rewrite historical results into a universal pass/failure claim. |

Before accepting the rebased documentation, verify that open MC scopes, #127 stale-action criteria,
explicit Calculate, optional stale-figure retention, desktop/mobile decisions, the homepage's
pre-deployment search gate and existing unrelated items all survive. This is a documentation diff
check in the implementing PR, not a new workflow or a second backlog.

## Where review and code differ

- **Region notice tests:** #128's `CalculatorContainer.test.tsx` already exercises `S1257L`
  overriding England in a mounted component. The claim that region notice coverage disappeared
  entirely is too broad. #127 had Scottish and Welsh conflict cases; preserve the Scottish
  replacement and restore the removed Welsh case under MC-08.
- **Successful pension application:** stale-suggestion guards remain in
  `CalculatorContainer.amountIntegrity.test.tsx`, but the successful apply journey removed from
  `CalculatorContainer.test.tsx` has no equivalent there. Replace it with the newly agreed
  apply → explicit Calculate journey, not the old automatic-recalculation expectation.
- **Error handling:** #127's persistence merge permits a pension amount without relating its
  range to its unit. `calculate()` validates the unit-specific limit and rethrows. #127 submits
  inside `startTransition`; #128 calls directly within the form's try/catch. The review reports
  a form alert only on #128; exact error-display behaviour is scenario/ref-specific and needs
  the MC-02 browser regression. An alert alone does not satisfy field recovery.
- **Browser gate:** #128 adds responsive coverage to the existing critical script and enables
  those specs in mobile projects, but CI still installs/runs Chromium only and marks critical E2E
  non-blocking. Local WebKit passes are not a WebKit CI gate. No branch-protection change is
  authorised by this documentation PR.
- **Run evidence:** Codex reported 218/218 browser passes and five local unit failures, reproduced
  locally on main. Claude reported 217/218 with one non-reproduced stale-error failure, and zero
  unit failures on all three refs. Keep exact environment/ref attribution. Test counts alone do
  not prove financial correctness, missing coverage or a universal baseline defect.
- **Existing browser discrepancies:** HICBC/pension expected-value disagreements and privacy/footer
  accessibility failures already have a Verification item. Do not copy engine output into tests
  or relabel inherited failures as introduced by #128. Director mobile failures remain with the
  existing Director journey item and DI-13 where an actual drawer defect is established.
- **Automated missing-CTA claim:** the existing navbar retains Open Calculator. #128's report
  records a 6/6 rerun of the three cited journeys across Chromium/WebKit. No separate CTA repair
  is justified; whether removed homepage content affects discovery is a different audit question.

## Deferred decisions and exclusions

Optional blank amounts remain a product decision. Rounding can be explained without altering
engine results; the exact explanation/reconciliation treatment is chosen in MC-06. Desktop
proportions, responsive breakpoint and typography are implementation choices constrained by MC-05's
observable outcomes. A different font is not a standalone task. The fifth card must use honest
next-£100 wording; the old misleading statutory-rate interpretation is not revived.

Automatic recalculation is rejected for the main calculator, including pension suggestion actions.
No change to Director Intelligence's calculation model is inferred from that main-calculator
decision. No new global design system, visual testing platform, external tracker, analytics vendor,
SEO content programme, new calculator variant or broad refactor is proposed. Existing unrelated
work and tax-domain owners are preserved.

Search evidence has two timings. The unchanged production response, rendered content and live URL
Inspection state must be recorded before the homepage-changing release; technical regressions must
be resolved/rechecked then. Set observation windows, segments, a quantified drop trigger and the
response before deployment; do not invent a threshold in this backlog correction. Historical
performance exports can be obtained afterward. Measurement still needs enough recrawl/observation
and may remain inconclusive; closing the technical gate does not close that scope. Missing essential
pre-deployment evidence leaves the gate open. Hero removal is direction, not proof of protection or
authorisation to deploy. This PR neither performs the audit nor opens a publishing/merge flow.

## Response to the independent #129 review

R1–R5 are accepted: retention is optional; the SEO gate is tied to the first homepage-changing
deployment; #127 retains the existing stale-result/email/suggestion acceptance criteria; incoming
documentation conflicts have an explicit evidence-preserving resolution; and main-calculator work
can interleave after the DI-05 interim guard without waiting for the full Director queue.

S1–S6 are addressed by the durable reproduction summary above, restored #125 spec names and repeat
counts/readiness lead, store and browser pension regressions, mandatory repeated WebKit verification,
a bounded MC-08 closing point and observable initial/reset/desktop capture criteria. Repeatable
local WebKit verification on the fixed ref is proportionate here; Chromium-only CI's lack of a
WebKit gate is explicitly documented, and absence/failure of that evidence still blocks release.
No new CI workflow is prescribed. MC-03 keeps one item with two scopes, rather than the proposed
new suffix IDs; neither choice changes the review's substantive acceptance requirements.

Initial validation at #129 `3d221e3` was documentation-focused. `bun --no-env-file run check:repo`
passed, including lint, application/test typechecks and repository guards. A one-off local check
validated 22 relative links/anchors, eight unique calculator task IDs and unchanged Foundation,
tax-domain, Director task and trust/content sections. `git diff --check` passed. No fresh browser
execution, statutory verification or full build is claimed for these documentation changes.
Follow-up validation also passed `bun --no-env-file run check:repo` and `git diff --check`;
the local documentation check passed 25 relative links/anchors, the same eight MC items, the
three-Markdown-file scope and unchanged unrelated Foundation/tax-domain/Director/trust/content/
parked sections. These checks do not substitute for the WebKit evidence required of the fixes.
The follow-up corrects only these three documentation files, without changing #127/#128 or running
their application. Stop after updating #129 for independent re-review; do not begin application
work or merge anything.
