# Main calculator implementation — 21 October 2026

## Scope and review order

Started from fetched `main` at `8d12f20a6c70e0faf76c4f1910555b8aadc1ed4e`.
Review the input-integrity PR [#127](https://github.com/jarrydaubert/payetax/pull/127) first,
then the stacked pay-statement PR. Neither is merged. The first slice is independently useful:
focus preservation, explicit empty-field validation, pension-unit reset, immediate stale-result
invalidation and current-result guards. The second changes the information hierarchy and browser
journey on that foundation.

The Codex “Audit PayeTax calculator UX” and Claude's supplied review agreed on the core space and
hierarchy problems. Claude's findings were supplied as text in the implementation chat; the
linked artifact was not independently available as an evidence attachment. This report records
implementation evidence, rather than treating reviewer agreement as proof of tax correctness.

## Decisions and boundaries

- Lead with exact take-home pay for one selected period, with an annual reference. Keep gross and
  employee deductions together as a statement. Show year, effective region and applied-code basis.
- Make comparison one explicit action, spanning both desktop columns. At 1280px and above all seven
  periods are visible by default. Below that, choose any two complete periods side by side. This
  avoids requiring a phone user to drag past clipped currency figures. Switching periods keeps
  the same calculation; comparison selection cannot be emptied.
- Retain the Ledger cream, ink-blue, serif headings, mono money and restrained borders. Raise the
  desktop content cap to 1920px; use a compact 352px input rail and flexible statement. Removing
  the duplicate summary-card band matters more than widening the old table.
- Keep common inputs visible; put allowances/exemptions and additional sources behind labelled
  disclosures. Active adjustments are summarised; rejected optional amounts cannot be hidden.
  Mobile results use a compact setup summary and explicit Edit inputs action. Every draft edit
  clears stale results, email and suggestions; no automatic recalculation of invalid text.
- Native selects and disclosures supply ordinary keyboard behaviour. Main controls have 44px
  height; Enter commits and submits. Server-rendered fields stay disabled until hydrated so
  Safari cannot accept an edit which React then replaces.
- Retire the five result cards and their now-unused ResultCard component. Reuse the comparison
  presenter and extract existing pension/marriage insights instead of creating another calculator.
  Preserve the legacy ResultsTable WhatIf API and its tests.
- Financial engine, statutory policy, independent verification fixtures and golden expected values
  are unchanged. Both result surfaces use the engine's existing per-period values. Annual-only
  explanatory rows use one shared conversion with the user's working hours; this prevents hourly
  allowance values diverging between statement and comparison.

## Audit reconciliation

| Finding | Implementation |
| --- | --- |
| Constrained desktop and unreadable mobile table | Full-width comparison; seven-column desktop and paired mobile presentation; no covered pence |
| Reduced motion makes cards invisible | Remove the animated card band; statement and table render statically; assert computed opacity, not just Playwright visibility |
| Income in bands reads as tax due | Rename Income Tax and “Income taxed at …”; explain band amounts in workings, with neutral row styling |
| Cannot select/copy money | Remove drag interception and scroll overlays; native mouse-selection browser test |
| Finite-difference “Marginal Tax Rate” fluctuates | Honest next-£100 rounded payroll-difference wording in workings; no change to statutory computation |
| Unnamed pension options | Named Percentage and Annual amount options and selected-unit text |
| Every period can be unticked | Reject removing the final selected comparison column; paired mode always has two distinct periods |
| Stale/cleared amounts and pension unit changes | Separate input-integrity PR, including empty-draft errors and atomic result invalidation |
| Responsive tests missing from critical CI | Add responsive spec to existing critical script and mobile projects; no new workflow or protection rule |

## Independent review

A second agent reviewed the integrity slice and complete redesign without writing code.
Review found and prompted repairs for annual-only hourly conversion, Add/Remove implicitly
submitting the new form, paired-table header semantics, heading order, disclosure error visibility,
and the mixed-income limitation disappearing with mobile inputs.

Two Safari interaction defects were reproduced with event traces, rather than attributed to
flaky tests. A delayed Edit callback could steal focus between focusing and entering an amount,
so allowance text landed in salary. All calculator focus timers were replaced by layout effects
after the corresponding DOM commit. The exact sequence passed six WebKit and two Chromium
repetitions with salary preserved and the expected £1,200 annual net increase.

A subsequent concurrent desktop run exposed a separate lost click: Calculate received mousedown,
then the amount's blur triggered native animated scrolling (scrollY 509→536/589), moving the
button before mouseup. Mouseup/click hit a different element and no submit occurred. The route's
root now uses automatic scrolling rather than global smooth scrolling; calculator action scrolls
are immediate. This preserves direct manipulation and avoids motion regardless of preference.
With the root CSS override, 12/12 concurrent WebKit repetitions passed without added waits.
The rebuilt final app then passed another 12/12 across three concurrent WebKit contexts, with
normal motion, no injected CSS, no sleeps and no runtime exceptions. Final source review found
no remaining actionable findings.
A browser regression checks untouched salary and the allowance's annual net effect explicitly.

The reviewer also verified optional validation stays visible, mixed-income warnings survive the
mobile edit boundary, and initial/edited-salary Enter submits in Chromium and WebKit, with no
runtime errors or missing calculator capability found.

## Verification

- `bun run check:repo`: passed, including application/test type checks, tax import boundary,
  shrink-only debt checks, env contract and rate freshness. No new workflow or branch-protection
  requirement, environment variable, secret or dependency was introduced.
- `bun run build:ci`: passed. Browser build enabled existing analytics with public dummy id
  `G-TESTLOCAL1`, matching the critical CI command. No credentials or provider email delivery used.
- `bun run test:no-coverage`: 4079 passed, five failed across four suites. Independent PAYE
  verification and all modified suites pass. The five failures were separately reproduced on
  clean main: InputTooltip unknown-field logging, two analytics development-log assertions,
  rateLimit production failure mode and origin's production-localhost assertion. The broad
  coverage run before the final two regression tests also reproduced only these five failures.
- The broad production browser catalogue ran 390 cases: 365 passed and 25 failed before the
  final scroll fix. Seven failures were addressed by that fix and the disclosure-test selector
  correction. The other 18 are the existing privacy/footer, HICBC/pension expectation and Director
  failures reproduced on clean main. They remain visible and are tracked, rather than skipped.
- A final affected-route slice reruns calculator critical, payslip, display periods, responsive,
  copy-selection, golden-master and smoke journeys on desktop/mobile Chromium and WebKit.
  **218/218 passed in 3.7 minutes**, including all 80 golden-master cases. Normal-motion
  calculator journeys and reduced-motion responsive cases both pass after the scroll repair.
- Browser plugin tools were unavailable; installed Playwright Chromium and WebKit were used.
  All five audit viewports plus narrow/breakpoint cases were checked. Light/dark statement axe
  scans, computed reduced-motion opacity, complete currency geometry, keyboard focus return and
  native text selection are covered. Independent 60k fixture amounts are asserted in browser.
- Mocked main-calculator email submission passed in Chromium and WebKit, including current
  salary, tax code, year and input pay period in the payload. No request reached the server.
- Console comparison against clean-main production showed the same unavailable local Vercel
  scripts; no new calculator runtime exception was observed.

The broad initial run was intentionally not treated as successful: it exposed Enter submission,
Safari native-control colours and the focus race, which were fixed. Outdated browser journeys
were updated to use Edit inputs and Compare rather than reading hidden tables; financial
expectations were not changed, tests were not skipped and baselines were not expanded.

Clean-main production checks reproduced 16 failures/56 passes in accessibility + Director slices,
and one failure each in HICBC (8 pass) and pension (5 pass). The latter assertions expect
£11,428.80 instead of observed £11,424.72, and £3,484.80 instead of observed £3,482.40, respectively.
These are recorded as existing expectation discrepancies, not re-derived or silently approved tax
answers. Privacy dark-mode link distinction, footer wordmark target size and mobile Director
missing-control failures are tracked in the backlog. PR #127's GitHub CI, E2E, CodeQL and Vercel
checks passed despite the locally reproduced unit failures.

To reproduce the final browser slice using the repository's normal production-server setup:

```powershell
$env:NEXT_PUBLIC_ENABLE_ANALYTICS='true'
$env:NEXT_PUBLIC_GA_ID='G-TESTLOCAL1'
bunx playwright test e2e/calculator-critical.spec.ts e2e/payslip-regression.spec.ts e2e/display-periods.spec.ts e2e/responsive-calculator-layout.spec.ts e2e/scroll-indicators.spec.ts e2e/golden-master-PERFECT.spec.ts e2e/smoke.spec.ts --workers=3
```

The local run reused an already-built production server on port 3200 through a temporary config;
only server reuse, port and report/output directories were overridden. Fixtures, test projects,
storage setup and expectations came from the repository. Dated run logs are in the local temp
files `payetax-e2e-ready.log`, `payetax-e2e-complete-final.log`, `payetax-unit-final4.log`,
`payetax-repo-scroll.log`, `payetax-build-ready.log` and `payetax-baseline-*.log`.

## Visual evidence and design fidelity

Local captures are under the Codex visualization directory for chat
`01a15f0b-e774-71d1-9b67-35e48f541291`. Files are named
`chromium-statement-{width}.png`, `chromium-comparison-{width}.png`, with a WebKit phone pair.
The five audit viewports are 2560×1440, 1920×1080, 1440×900, 393×852 and 852×393;
320×720 and the 1586×992 desktop concept dimensions were checked additionally.
`browser-evidence.json` records exact observed money, overflow and console observations.

| Design point | Evidence / deliberate choice |
| --- | --- |
| Take-home hierarchy | Single large mono amount, annual reference, deductions immediately below |
| Ledger identity | Existing paper/ink tokens, serif headings, compact rules and existing wordmark |
| Desktop proportions | 352px input rail; flexible statement; comparison spans full content width |
| Mobile hierarchy | Setup/edit row, one statement, complete amounts; paired comparison with labels above figures |
| Interaction sizing | Native period selects and main actions are at least 44px high |
| Detail density | Optional controls and workings disclosed; essential estimate/code context remains visible |
| Concept comparison | Inspected implementation at the concept's 1586×992 viewport and phone size; retained palette, type hierarchy and payslip structure |

Generated concepts were layout references only. Their illustrative numbers were never used as
financial expectations. Intentional departures include retaining the existing navigation, exposing
real code-basis/steady-pay caveats, omitting a zero non-taxable allowance from the primary statement,
and using native controls to keep behaviour simple. No raster asset or new visual dependency is
needed in the product.

## Limits and follow-up

This work improves presentation and input integrity; it does not validate all mixed-income,
HICBC or pension-method behaviours. Existing financial limitations and their backlog items remain.
The current pension method remains salary sacrifice. Browser coverage uses real Chromium and
WebKit engines with emulated viewports, not physical iPhone Safari. Email UI/payload behaviour is
covered without sending real mail or claiming provider delivery. Local production builds expose
existing unavailable Vercel analytics/speed-insights scripts; WebKit also reports the existing
unsupported `interactive-widget` viewport hint. These are recorded separately from application
runtime errors.
