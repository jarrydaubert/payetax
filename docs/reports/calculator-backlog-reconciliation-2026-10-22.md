# Calculator backlog reconciliation — 22 October 2026

Documentation only. No application, test, policy, workflow or deployment changes. This records the
reasoning behind the unresolved queue in [`BACKLOG.md`](../BACKLOG.md); it is not a second backlog
or a release certificate. Claude will review this reconciliation before implementation resumes.

## Evidence and boundaries

| Source | Evidence used | Limits |
| --- | --- | --- |
| Merged `main`, `8d12f20a6c70e0faf76c4f1910555b8aadc1ed4e` | Repository guidance, project state, backlog, current source and tests | This is the merged baseline; the local branch named `main` is older, so comparison uses freshly fetched `origin/main`. |
| [PR #127](https://github.com/jarrydaubert/payetax/pull/127), `1224d3e7a37b8f599df0289c24f05efffafa8d23` | Input/focus handling, atomic result invalidation, pension switches, persistence validation, tests and discussion | Open, unmerged; passing earlier reviews do not resolve later findings. |
| [PR #128](https://github.com/jarrydaubert/payetax/pull/128), `b4f10087b263a2f87456a432ef03c65385f4fc5e` | Statement, comparison, inputs, shared presenter, removed/replacement tests, hero changes, CI command and [implementation report](https://github.com/jarrydaubert/payetax/blob/b4f10087b263a2f87456a432ef03c65385f4fc5e/docs/reports/main-calculator-redesign-2026-10-21.md) | Open and based on #127; neither the code nor its documentation is merged truth. |
| Codex's original "Audit PayeTax calculator UX", 21 October | Retrieved original audit in chat `01a15eee-912f-7760-8135-d8cded7ade79`: five viewports, hierarchy, stale results, motion, clipping, copying, semantics and coverage | Browser observations used the public site, whose exact deployed ref was not independently certified; desktop default five columns fitted, all seven did not. |
| Claude's original audit | Supplied excerpt in "Redesign PayeTax calculator", chat `01a15f0b-e774-71d1-9b67-35e48f541291`: narrow results, mobile overlays, hidden reduced-motion cards, misleading band/marginal labels, unnamed pension units and empty period selection | The supplied excerpt was retrieved; the full linked artifact was not retrieved for this reconciliation. Original browser work was Chromium only. |
| Claude's latest review, supplied in this chat | B1/B2 reproduction steps, S1–S3, minor findings, test comparisons and REQUEST CHANGES verdicts | Independent production-build/browser evidence reported by Claude, not rerun or presented as newly reproduced here; touch emulation is not physical iPhone proof. |
| Product direction, supplied here and in "Check PayeTax PRs" | Explicit Calculate after every input change; compact desktop/five cards/seven periods; simpler mobile statement; hero removal accepted subject to search evidence; incremental mutual review | These decisions supersede earlier design proposals, including automatic recalculation. |
| [August search evidence](search-discoverability-evidence-audit-2026-08-23.md) and [landing-page audit](high-value-organic-landing-pages-audit-2026-08-23.md) | Existing URL protections, useful organic surfaces and the evidence standard for the next audit | Dated context, not fresh Search Console data or proof of the hero change's effect. |

The accessible desktop checkout matches #128 and was clean. A separate documentation worktree
starts at fetched `origin/main`, so this PR cannot accidentally include either implementation.
No credentials or saved user inputs were read. Examples in this report/review are synthetic.

## Reconciliation and priorities

| Finding or decision | Disposition and single backlog owner |
| --- | --- |
| Focus-and-leave originally erased a filled value; WebKit select-on-focus can silently insert digits (B1) | MC-01, release blocker for #127 and inherited by #128. Preserve the original outcome; do not prescribe Claude's proposed clear/restore mechanism. Real click/touch plus typing is essential evidence. |
| Pension unit changes reinterpret amounts; legacy percentage 5000 passes restoration then fails Calculate (B2) | MC-02, release blocker. #127 fixes new switches but not the restored cross-field constraint. Recovery must be visible and field-actionable, with no storage-clear workaround required. |
| Valid edits leave mismatched screen/email/suggestion state; #128 instead deletes the statement (S2) | MC-03. Keep result/input provenance coherent and exports unavailable while stale. Historical context is allowed, current-looking mixed state is not. |
| Applying a suggestion recalculates immediately | Source-confirmed additional product conflict: `CalculatorContainer.handleApplyPensionOptimization` calls `calculate()` and `calculatePreviousYear()` after `setInput()`. MC-03 must wait for Calculate, even when the suggested amount is valid. |
| Statement always begins Monthly (S1) | MC-04, product acceptance for #128: submitted frequency, except annual input defaults Monthly. Each successful Calculate reapplies this rule; view changes and resizing do not calculate. This replaces #128's test-pinned persistence across recalculation. |
| Stretched desktop statement, narrow rail, missing five cards and comparison behind a mode (S3/product discussion) | MC-05 restores desktop density and direct seven-period access while preserving mobile. Period/Annual columns and a 36rem cap are possible approaches, not requirements; the outcome is readable compact financial context. |
| Unsigned deductions, missing total, inconsistent zero rows and ±1p reconciliation | MC-06, explanation/presentation follow-up. Preserve statutory amounts; explain independently rounded equivalents or justify a display treatment. A new calculation defect escalates separately. |
| Raw `fourWeekly`, paired "all 7" heading, Gross/Net/Take-home inconsistency and wrapped labels | MC-07, a small consistency/readability slice. Deduction conventions belong to MC-06; layout density belongs to MC-05. |
| Lost successful pension-apply coverage and allegedly missing region-override coverage | MC-08, protect outcomes and new explicit-calculation semantics. The old immediate-recalculation test must not be restored unchanged. Region evidence is qualified below. |
| Intermittent pension empty-error after recovery; main lost clicks and load-related input failures | Extend the existing Verification investigation rather than create another flake programme. A reported one-off is not a proven cause or fixed defect. Keep #128's traced scroll repair, subject to regression evidence. |
| Five local unit failures versus Claude's clean runs | One bounded Verification environment investigation; not five alleged production defects. Preserve both accounts rather than declaring either universal. |
| Original motion, copying, band-label, unnamed pension and empty-selection defects | #128 contains proposed fixes. Verify they survive MC-05 and MC-08; do not create duplicate "fix again" tasks or mark them merged. |
| Additional-income/hidden-error usability and shared hourly explanatory conversion | Preserve #128's improvements: active adjustments cannot conceal invalid text; use engine period values and the user's hours for annual-only explanatory rows. These are regression criteria, not new calculation owners. |
| Hero removal, SEO and discoverability | Separate Search and discoverability audit with technical before/after checks, retained-surface scope and post-release Search Console observation. No assertion of zero ranking impact. |
| Optional blanks should mean zero/none | Park pending an explicit field-by-field decision. Retain explicit empty/error behaviour in the meantime. |

MC-01 and MC-02 should be independently reviewable repairs to the existing #127 prerequisite.
MC-03's explicit-calculation and stale-action integrity is required for #128, but the historical
context presentation can be reviewed separately from #127's useful atomic invalidation. MC-04/05
are acceptance work for the new experience, not newly alleged statutory errors. They should not
hold back a corrected input-integrity prerequisite or outrank verified Director wrong-money work.
MC-06/07 are later incremental follow-ups. Tests travel with the behaviour they protect; MC-08 is
not permission to release blockers without regression coverage.

The existing Director urgent order and Foundation insertion points remain. The new calculator
presentation does not complete pension methods, mixed-income correctness, transparent result
contracts, statutory-rounding ownership, public verification or the remaining tax-domain work.
The unmerged "Local verification follow-up" list duplicates existing browser/Director backlog
entries; retain those owners and add only the distinct environment disagreement. Do not import
that parallel list when reconciling #128's documentation.

## Where review and code differ

- **Region notice tests:** #128's `CalculatorContainer.test.tsx` already exercises `S1257L`
  overriding England in a mounted component. The claim that region notice coverage disappeared
  entirely is too broad. #127 had Scottish and Welsh conflict cases; preserve the Scottish
  replacement and verify/restore the Welsh case under MC-08.
- **Successful pension application:** stale-suggestion guards remain in
  `CalculatorContainer.amountIntegrity.test.tsx`, but the successful apply journey removed from
  `CalculatorContainer.test.tsx` has no equivalent there. Replace it with the newly agreed
  apply → explicit Calculate journey, not the old automatic-recalculation expectation.
- **Error handling:** #127's persistence merge permits a pension amount without relating its
  range to its unit. `calculate()` validates the unit-specific limit and rethrows; #128's input
  form catches that error and alerts, unlike #127. An alert alone does not satisfy field recovery.
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

Search measurement has an external dependency: fresh redacted Search Console evidence and enough
post-deployment recrawl/observation. Baseline technical evidence precedes deployment; later search
outcomes may remain inconclusive. The audit may close its technical findings while leaving its
measurement conclusion explicitly pending. Hero removal is accepted as direction, not proof of
search protection or authorisation to deploy. This PR neither performs that audit nor opens a
publishing/merge flow.

Validation for this reconciliation is documentation-focused. `bun --no-env-file run check:repo`
passed, including lint, application/test typechecks and repository guards. A one-off local check
validated 22 relative links/anchors, eight unique calculator task IDs and unchanged Foundation,
tax-domain, Director task and trust/content sections. `git diff --check` passed. No fresh browser
execution, statutory verification or full build is claimed for these documentation changes.
After opening the PR, stop for Claude's independent backlog review; do not begin application work
or merge anything.
