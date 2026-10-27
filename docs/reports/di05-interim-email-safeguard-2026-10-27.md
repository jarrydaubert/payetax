# DI-05 interim email safeguard — 27 October 2026

## Scope and starting point

Started from fetched `main` at `6e2a4c8bfaf3b11ad1b6694f5fd3c79d789c1691` (#138),
on `fix/di05-interim-email-safeguard`. This implements only the interim guard in
[DI-05](../BACKLOG.md#urgent-correctness-exceptions). The full DI-05 export contract
remains open. No #128, calculation mechanics, tax policy, API payload/template,
deployment, dependency or unrelated backlog changes are included in the initial slice.
The later [email inspection and active-export assessment](di05-email-content-and-active-export-assessment-2026-10-27.md)
records the requested end-to-end follow-up and its one-line personal-reserve
template correction. The checks below describe the initial safeguard revision;
the follow-up report carries the added validation and findings.

## Investigation and implementation

The dashboard constructs email inputs from the original form and resolved annual
financials. `sendDirectorResultsEmail()` recalculates those inputs and always
exports `comparison.recommended`. The screen's `useActiveDirectorScenario()` can
instead apply a profit adjustment, another strategy or a salary-slider calculation.
The objective previously lived only inside `StrategyComparisonTable`.

The interim guard permits email only when:

- complete, valid form input values shallowly equal those captured by the successful
  current calculation, with no calculation/error pending;
- the mode is annual and a positive-profit active pay strategy exists;
- profit what-if is reset, the objective is Maximize take-home, and the selected
  strategy is the original comparison's recommendation;
- every financial field of the active scenario is finite and exactly matches that
  recommendation, including deductions, salary, dividends, pension, benefits,
  company cost, take-home and effective rate.

This allows the salary slider's automatic baseline initialization when its result
matches. Comparing only salary or only take-home would miss other financial
differences. Divergent states retain results but disable both email entry points
with an associated explanation. An open dialog also disables submission. The submit
handler checks the current store reference against its render's reference, rejecting
a same-task store edit before React propagates the updated guard props.

The store retains the successful calculation's form reference and the objective
only in memory. Neither is added to persisted storage or the email payload. Reset
clears them. Year-end fields participate in the dashboard's recalculation dependency
so editing them cannot leave email permanently paused. Dates do not change the
exported financial calculation; the dialog explicitly says company key dates are
not included. No deadline arithmetic or calendar export is changed.

Shallow field equality is deliberate: currency edits that parse to the same number
(such as adding a trailing decimal point) replace the form object without triggering
the value-based calculation debounce. Reference-only equality could permanently
pause email. The guard and dashboard now compare the same field values, including
the student-loan array reference, so genuine changes pause and same-value edits work.

Monthly mode is blocked because its cash-aware monthly draw can differ from the
email's annual take-home divided by twelve. Survival mode is blocked because there
is no active pay strategy matching the strategy report. Supporting those exports
belongs to the full DI-05 work; this guard does not repair their display/calculation
issues or change strategy/objective selection behaviour.

## Verification evidence

All results below are local maintainer-run evidence unless explicitly identified
as hosted CI or independent review. Email browser requests are intercepted; no
real email is sent.

| Command / check | Result |
| --- | --- |
| `bun install --frozen-lockfile` | Passed; final retry verified the unchanged lockfile after initial concurrent cache-copy EBUSY failures. |
| `bun run lint`, `bun run typecheck`, `bun run test:changed --runInBand` | Passed; changed-test run: 17 suites, 167 tests. |
| `bun run test:no-coverage --runInBand` | Passed: 251 suites, 4,467 tests, including independent PAYE fixtures. Latest focused rerun below additionally verifies the review's final non-mix wording and realistic salary-clamp assertions. |
| `bun run test:no-coverage --runInBand --testPathPatterns='DirectorGuide\|directorGuideStore\|useDirectorEmail'` | Passed after the final production guard changes: 16 suites, 177 tests. The new hook has 26 cases. |
| `bun run typecheck:tests` | Passed with all three new browser regressions. |
| `bun run check:repo` | Passed after final production and unit-test changes. |
| `bun run build:ci` | Passed again after the final production wording change. |
| `bun run test:e2e:smoke` | All 47 Chromium tests passed (4.2 minutes). The command then exited 1 because its Unix-only `test`/`open` report-opening tail is unavailable on Windows. No test was skipped or weakened to work around this. |
| Direct Playwright Director suite, four projects | Passed: 32/32 (1.3 minutes), including all new and existing Director critical journeys on Chromium, WebKit, Mobile Chrome and Mobile Safari. Direct invocation exits 0 without the Unix report-opening tail. |
| Direct Playwright `--grep DI-05`, four projects | Passed: 12/12 (Chromium, WebKit, Mobile Chrome and Mobile Safari). |
| Local browser inspection | Passed at 1440×1000 and 390×844 using repository Playwright; Browser plugin not available. Details below. |
| Independent Claude review | Initial REQUEST_CHANGES; re-review APPROVE after fixes. Read-only local Claude CLI, no MCP services or validation commands; details below. |

The mocked browser regressions cover each salary/profit/strategy/objective divergence
and recovery; one allowed request whose input/year reconstructs the visible financial
summary; year-end edit recovery; blocked monthly mode and annual recovery; and an
already-open dialog receiving an input edit plus submit in the same JavaScript task.
Unit tests also cover invalid inputs, pending recalculation for financial inputs,
failed calculations, survival mode, reset/non-persistence and the dialog's content
promise and guarded submit handler.

Earlier browser runs exposed an ambiguous Close locator, an over-specific expected
safe-submit error, and an annual-only helper used when returning from monthly mode.
Those test issues were corrected. Additional mobile runs exposed a dropdown/drawer
timing race: accessible-role queries briefly excluded the still-mounted drawer
behind the dropdown. The helper now selects with Enter, waits for the listbox to
close, and verifies actual drawer removal including hidden instances. This is a
test interaction correction, not a production drawer/focus redesign.

The wider four-project suite also exposed existing test assumptions about clearing
a focused currency field before its formatted-to-editable transition completed,
leaving the mobile drawer open while checking email, and matching both mounted
copies of an error message. The test helper now waits for editable formatting and
verifies complete selection before replacement; the integrity journey closes the
drawer and selects the visible error. Financial/error assertions remain intact.

Direct Playwright runs used the shipped device/test settings with a temporary
configuration overriding only server reuse, artifact paths and reporter. The final
production build was served persistently with `bun run start --port 3100`, avoiding
a server-lifetime race in an earlier parallel run. Reproduce the same test selection
with the normal repository configuration (which manages its own build/server):

```powershell
bunx playwright test e2e/director-guide-critical.spec.ts --project=chromium --project=webkit --project='Mobile Chrome' --project='Mobile Safari' --workers=1
```

## Browser inspection and durable artifact summaries

The inspected flow was `/tools/director-guide` → enter £100,000 revenue, £20,000
expenses and England → enabled email → move salary one step → disabled email with
its visible what-if salary explanation → select the recommended strategy → open
the dialog and inspect the corrected dates copy. This passed at both viewport sizes
with zero email requests. Page URL/title and nonblank content matched the route;
no framework overlay or app warning/error appeared. Local-only Vercel insights
scripts were fulfilled with empty JavaScript because those endpoints do not exist
on `next start`; without that mock they produced expected local 404/MIME errors.
These checks do not verify those providers. The actual API tests mock only email.

Screenshots were inspected: desktop and mobile explanations and controls fit their
containers, the mobile CTA wraps readably, and the dialog copy is visible. Raw local
artifacts are not committed; these summaries and SHA-256 fingerprints preserve the
evidence in a reviewable repository location:

| Artifact | SHA-256 |
| --- | --- |
| Desktop enabled CTA | `7D83984690506D93BF77F4B37383E0AE87935C60890C830F88783C9F74A7B77B` |
| Desktop disabled CTA and visible reason | `BB6908C847F0F2885A3011464EAEECCB24FC9F55072BAED068DB64FBBF083540` |
| Mobile disabled CTA and visible reason | `05F453660CB3C5373E36B6A9901DA11601E54FC63B40DD175CDAA018B858778A` |
| Mobile dialog with corrected dates copy | `5176996F4315E48A1226BEEC68076A7258D6E0CA32B611FADB25B236EF63F4EE` |
| Browser URL/title, viewport, console and interaction JSON | `F466B2D8BD15022C973457236C24C26D746CB1923E22A0F6D88716E0A6FD4C9A` |

## Independent review

Claude Opus 5.5 reviewed the working-tree implementation independently through the
local CLI with only Read/Grep/Glob tools, no MCP services and explicit instructions
not to read secrets or mutate anything. This is maintainer-invoked external-model
review evidence, not a formal GitHub review or independently hosted CI result.

The first verdict was REQUEST_CHANGES. Its actionable findings were reconciled:

1. **Same-value recovery (medium):** reproduced from the setter/debounce paths;
   changed reference-only equality to `shallow` equality and added same-value setter
   and trailing-decimal browser regressions.
2. **Non-mix recommendation recovery wording (medium, fails safe):** engine fixtures
   confirm All Salary recommendations at £500,000 profit and with Employment
   Allowance. Existing DI-04 salary controls can still generate a different result.
   The guard blocks it with a setup-unavailable explanation, including before card
   selection. Tests model the actual card selection followed by the existing salary
   clamp. The strategy mechanics themselves remain deferred to DI-04.
3. **Hidden survival controls (low):** prioritised the survival explanation over
   retained objective/profit adjustments, with regression coverage.
4. **Advanced baseline coverage (low):** added pension, loans, BIK, losses, minimum
   salary, low-profit, other-income and Scottish fixtures.

The focused re-review verdict was APPROVE, finding no new blocking bug. It requested
the final non-mix wording improvement and report reconciliation above; those were
applied with focused tests. Reviewer limitations: no tests/build/browser were run
by Claude, and it reviewed a working-tree patch rather than the eventual PR head.
Small unchanged performance trade-offs (whole-store dialog subscription and another
active-scenario hook consumer) were noted; restructuring these is outside this guard.

Raw review-result JSON fingerprints:

- Initial REQUEST_CHANGES: `5D74E1014AF9AFC2E32319EDFA703332F5AE35A5A479C07DE4F465C17EBCE0EE`.
- Focused APPROVE: `BC98DF769C55303DDF63C747F27ECB43FF9CFB25F7757E131492BC503FE96B08`.

## Limits and deferred work

- This is a client safeguard, not an API authorization/security boundary. Direct
  API callers still receive the existing server-recalculated original recommendation.
- No complete validated scenario export, custom strategy payload, objective-aware
  email, accounting-period export, monthly cash-aware report or survival report is
  implemented. DI-05 remains open for those requirements.
- Existing DI-02/04/06 and other Director display/calculation discrepancies remain
  with their backlog owners. Equality here is display/email parity, not independent
  proof of statutory correctness. Calculation outputs and fixtures were not changed.
- In particular, when All Salary is recommended, existing DI-04 salary initialization,
  clamping and recalculation differences can prevent the controls from displaying
  that exact recommendation. Email remains unavailable while that mismatch exists;
  this safeguard does not promise that selecting the card can repair those controls.
- Brevo delivery, production/preview deployment and physical-device interaction are
  unverified. Existing Next/Sentry deprecation warnings and the unchanged release
  version warning are outside this safeguard.
- No merge or deployment is authorized or performed.
