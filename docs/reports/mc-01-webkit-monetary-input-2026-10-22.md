# MC-01: WebKit monetary input investigation

**23 October review update:** Claude independently confirmed the wrong-amount fix at `9a2f6d1e`
but requested changes for a newly reproduced touch-pan focus regression (F1). The runs below did
not test that gesture. See the [touch-pan follow-up](mc-01-touch-pan-follow-up-2026-10-23.md) for
the response, fresh verification and exact tree identities clarifying recreated-commit equivalence.

Date: 22 October 2026. Scope: the MC-01 follow-up to [PR #127](https://github.com/jarrydaubert/payetax/pull/127).
Verified source: `810bf04e17b45effc9790b29a9eaf6486841b271`. This is unmerged implementation evidence,
not approval of #127, #128 or a release. The [reconciled backlog](../BACKLOG.md#main-calculator-input-integrity)
continues to own acceptance and the remaining MC work.

## Starting state and reconciliation

- The supplied OneDrive workspace did not exist. The active checkout was
  `C:/Users/JGF Desktop/Desktop/payetax`, clean on `feat/calculator-pay-statement` at `b4f10087`.
  That checkout and the other existing worktrees were preserved.
- Work used a separate `payetax-worktrees/mc01` checkout of #127's existing
  `feat/calculator-input-integrity` branch, initially `1224d3e7`.
- `origin/main` was `c5ed77b7`, containing the engineering guidance (#130) and backlog reconciliation
  (#129). Merge `d8be55bb` brings those into #127 without rewriting its history.
- The three documentation conflict blocks discarded premature completion claims and deletions in
  favour of main's agreed order and open acceptance scopes. Main's reconciliation report remains
  unchanged. The original #127 implementation and its historical PR validation remain distinct
  from this follow-up; earlier approval did not establish correct WebKit pointer interaction.

## Reproduction and cause

The flow under test is: homepage calculator → pointer/touch entry into a formatted amount → type a
replacement → blur/Calculate → the exact intended amount and matching rendered gross pay.

The original production runtime on the reconciled #127 branch still called `select()` only during
focus. The first regression run used actual click/tap coordinates and `pressSequentially`, without
`fill()`. All six desktop Chromium replacement cases passed. All six desktop WebKit cases failed:
left/middle entry into `0.00` produced `300000.00` when typing `30000`; right entry produced
`0.0030000`; insertion into `25,000.00` also preserved unwanted old digits. The first three mobile
WebKit cases reproduced the initial-zero defect. The remaining three failed during setup because
the checkbox action had not taken effect; they are not additional amount-defect reproductions.
The final harness waits for network idle and confirms a mounted interactive checkbox transition.

Event tracing explains why adding another synchronous `select()` to click is insufficient. In
WebKit 26.5, focusin, pointerup, mouseup and click listeners observed selection `[0, 4]`, but after
click returned the input selection was `[0, 0]`. The next native beforeinput inserted into `0.00`.
The browser's pointer default can therefore replace selection after the React handlers have run.

## Focused fix

`NumberInput` now handles primary-button pointer entry before that default. Only when the field is
not already active, select-on-focus is enabled and the displayed draft is valid, it cancels the
default, focuses synchronously and selects the existing text. Keyboard focus keeps the existing
selection behaviour. The value is never cleared or changed by focus alone.

Subsequent pointer actions in an active field remain native, allowing caret placement, selection
and editing. Invalid text stays available for correction, the opt-out remains available, and a
caller cancelling pointer entry is respected. First entry intentionally selects the whole amount;
partial selection is available once focused. There are no deferred timers, extra input state,
parser changes, dependencies, calculation changes or altered expected tax values.

The two component regressions cover explicit pointer focus/selection, subsequent range selection,
unchanged committed value and caller cancellation. The dedicated browser spec contains nine
journeys: six initial/existing-salary coordinate cases plus focus/keyboard/empty/recovery/Reset,
all five mounted amount fields, and subsequent caret/selection/multi-character insertion.
The mobile projects now include that spec. Rapid native touch word selection is accepted alongside
caret placement; it is not mistaken for an application failure.

The £60,000/1257L check explicitly enters the fixture inputs and checks £45,365.28 annual net pay
against `salary-guide-60k-base` in the hand-derived PAYE verification fixtures. Enter in the amount
commits it; Enter on Calculate activates calculation, preserving #127's existing behaviour.

## Verification environment and commands

Windows; Bun 1.4.3 (repository package-manager declaration: 1.3.13); Node 24.18.0;
Playwright 1.61.1; Chromium 149.0.7827.55; WebKit 26.5. Dependencies installed with
`bun --no-env-file install --frozen-lockfile`; no lockfile change.

Browser plugin not available. Regular Playwright used the existing device/project definitions:
desktop Chromium and WebKit 1280×720, Pixel 5 touch 393×727, iPhone 12 touch 390×664.
Development inspection used `http://localhost:3101/#tax-calculator`; production used
`http://localhost:3100/#tax-calculator` after `bun --no-env-file run build:ci` and `PORT=3100`
with `bun --no-env-file run start`. The runtime source matches the verified source commit above.

To avoid rebuilding the same runtime for each slice, execution used an external Playwright config
importing the repository config. Its only overrides were absolute test/setup/storage-state paths,
an external artifact output directory, line reporting and `webServer: undefined`. No checked-in
server readiness, timeout, retry, worker or browser settings were relaxed. Scripts/screenshots/
traces stayed outside tracked source. The following commands reproduce the browser slices with
the normal config (which builds and starts the production server itself):

```powershell
bun --no-env-file x playwright test e2e/monetary-input-interaction.spec.ts --project=chromium --project='Mobile Chrome' --workers=1
bun --no-env-file x playwright test e2e/monetary-input-interaction.spec.ts --project=webkit --project='Mobile Safari' --repeat-each=3 --workers=1
bun --no-env-file run test:e2e:smoke
bun --no-env-file run test:e2e:golden
```

Actual focused execution substituted `--config=<external-config> monetary-input-interaction` for
the explicit spec path. Smoke/golden execution used the same external config and the exact file
lists/projects/workers from their repository scripts. All runs used zero retries.

| Check | Result |
| --- | --- |
| `bun --no-env-file run check:repo` | Passed: lint, application/test types and repository guards |
| `bun --no-env-file run test:changed -- --runInBand` | 9 suites / 217 tests passed on the final pointer implementation |
| Targeted NumberInput/parser/mounted BasicInputs regressions | 3 suites / 147 tests passed during development |
| `bun --no-env-file run build:ci` | Passed, production runtime |
| Final focused Chromium + Mobile Chrome, one worker | 18/18 passed |
| Final focused WebKit + Mobile Safari, three repeats, one worker | 54/54 passed (27 desktop + 27 touch-emulated mobile), zero retries |
| Production smoke + golden slices, Chromium, one worker | 47/47 passed: 27 smoke/critical + 20 golden cases |
| `bun --no-env-file run test:no-coverage -- --runInBand` on verified source | 237 suites passed / 4 failed; 4,152 tests passed / the same 5 failed; independent PAYE fixtures pass |
| Clean-main comparison of the four failing Jest suites | Same five failures; 70 passed / 5 failed at `c5ed77b7` |

The failing baseline suites are InputTooltip (one missing warning), analytics (two missing
development logs), origin (localhost still present after selecting production), and rateLimit
(in-memory fallback after selecting production). These are the existing local environment
disagreement recorded by #129. None of those source/test files differs from main; this slice does
not diagnose their root cause or change their expectations.

Direct browser inspection confirmed the intended URL/title, meaningful calculator content, no
framework overlay and no uncaught application error in Chromium, WebKit and mobile WebKit.
Screenshots show the salary after typing and Calculate as `30,000.00`. Console messages retain
the existing local Vercel analytics/speed-insights 404/MIME failures and WebKit's unsupported
`interactive-widget` viewport warning. No amount-interaction runtime error was observed.

## Acceptance limits and review handoff

- This completes an implementation/verification slice for independent review. Keep MC-01 open
  until its acceptance evidence is reviewed. MC-02's legacy saved pension constraint and MC-03's
  explicit-Calculate/suggestion acceptance remain blockers for #127 and inherited by #128.
- Three repeated local desktop/touch WebKit runs are the browser acceptance evidence. Existing
  Chromium-only CI does not enforce WebKit; no workflow or branch-protection change is introduced.
- Touch emulation is not a physical-iPhone or virtual-keyboard test. `keyboard.insertText`
  exercises native multi-character insertion with currency punctuation, not the OS clipboard or
  a native paste event. Those boundaries remain unverified, rather than being certified by fill.
- Independent Claude review remains required before an authorised merge. Historical reviews of
  earlier heads do not approve this change. No merge, release, production email or provider
  configuration change was performed.

## Preserved historical #127 evidence

The 21 October PR body at `1224d3e7` recorded passing repository checks/build, a fresh review run
of two component/store suites (74 tests), two container/mock suites (45 tests), all 20 generated
golden cases, 27 production smoke/critical cases, and Chromium focus/edit/clear/recovery/pension
journeys. Its full Jest attempt recorded 4,149 passes and six failures: one changed mock was fixed
and rerun; five unchanged failures were reproduced on clean main `8d12f20a`. Independent PAYE
fixtures passed without regenerating expectations. The fresh second-agent review reported no
actionable findings then. These are historical reports for that ref, not newly rerun counts or
approval of the present head; the later WebKit and legacy-pension findings supersede any implied
acceptance. The current-source and current-main comparisons above are separate evidence.

Publication note: GitHub rejected the initial push under its email-privacy guard (GH007). Only the
three unpublished commits were recreated with the verified GitHub noreply identity. Code and test
trees are identical to those exercised above; only documentation refs changed. A local backup was
retained. No global Git setting or existing remote history changed; no force push was used.
