# MC-03 input-state presentation — 28 October 2026

This focused slice starts from `main` at `d2ee3ee80dcccbfc55e2f50f614fb49aa3564159`.
It implements the remaining input-state presentation on the existing desktop/mobile calculator.
#128 was consulted as historical reference only; its redesign was not rebased or imported.
The [retained #127 contracts](project-documentation-reconciliation-2026-10-27.md#retained-127-regression-acceptance-criteria)
remain acceptance requirements.

## Behaviour and scope

| State | Presentation and actions |
| --- | --- |
| First use / Reset | No summary cards, result table or email action. Salary entry and Calculate remain available. Reset clears drafts, errors and calculation history. |
| Entered or restored inputs without a calculation | Ask the user to check inputs and select Calculate, without claiming a result exists. |
| Edits after Calculate | A polite, atomic live notice beside the controls says “Inputs changed — Calculate again”. Previous figures and result actions remain cleared by #127. The placeholder requests recalculation rather than salary entry. |
| Invalid submission | Identify the rejected fields, preserve their text and other entered amounts, and update the summary as individual fields are corrected. The missing-salary error clears after a valid salary is committed. Correction still requires Calculate. |
| Successful Calculate after correction | Restore current cards/table and actions. Existing email/suggestion guards continue to require the same validated result identity. |

`hasCalculated` records successful calculation history in memory only, survives invalidation and
component remounts, and resets atomically with Reset. It is excluded from persisted storage and
does not authorize any result action. Financial mechanics, period selection, five-card desktop
layout/navigation, privacy, analytics and email transport are unchanged. Pension suggestions still
add/convert/round the contribution and require Calculate. The new mobile payslip, mobile focus
repair, submitted-period rule and fifth-card wording remain with MC-04/05.

## Verification

Local Windows runs used Bun 1.4.3, Node 24.18.0 and Playwright 1.61.1 (Chromium 149.0.7827.55 / WebKit 26.5). Browser plugin unavailable;
repository Playwright was used. Development and production served `http://localhost:3100/#tax-calculator`.

| Check | Result |
| --- | --- |
| Frozen lockfile install | PASS; no manifest or lockfile changes |
| `bun --no-env-file run check:repo` | PASS, including lint and application/test typechecks |
| `bun --no-env-file run test:no-coverage --maxWorkers=2` | PASS: 254 suites, 4,505 tests, including independent PAYE fixtures |
| `bun --no-env-file run build:ci` | PASS |
| Development MC-03, four configured desktop/mobile projects, 2 workers, no retries | PASS: 24/24 |
| Production MC-03, same projects, 4 repeats, 2 workers, no retries | PASS: 96/96 |
| Production smoke slice, Chromium, 1 worker, no retries | PASS: 49/49 |
| Desktop preservation, Chromium/WebKit, 1 worker, no retries | PASS: 16/16 |
| Direct visual/console QA, reduced motion, 1440×900 / 393×852 / 320×568 | PASS: first use → Calculate → edit → invalid submission; no page errors or console warnings after local-only Vercel script stubs |

Browser commands used an external config importing `playwright.config.ts`. It overrides only
absolute test/artifact paths, reporting, synthetic consent storage, and disables global setup / the
managed web server so one production build can serve the runs. Projects, device profiles,
timeouts and application behaviour are retained. Synthetic consent is `{analytics:false}` with a
valid ISO timestamp. Tests intercept result-email requests; no real email is sent.

```powershell
bun --no-env-file x playwright test e2e/calculator-critical.spec.ts --grep MC-03 --config <external-config> --project=chromium --project=webkit --project='Mobile Chrome' --project='Mobile Safari' --repeat-each=4 --workers=2 --retries=0
bun --no-env-file x playwright test e2e/smoke.spec.ts e2e/homepage-portal-stability.spec.ts e2e/calculator-critical.spec.ts e2e/director-guide-critical.spec.ts e2e/payslip-regression.spec.ts --config <external-config> --project=chromium --workers=1 --retries=0
bun --no-env-file x playwright test e2e/responsive-calculator-layout.spec.ts --grep 'desktop shows all seven|Calculate keyboard focus' --config <external-config> --project=chromium --project=webkit --workers=1 --retries=0
```

The smoke command is the repository's `test:e2e:smoke` file/project/worker slice with external
artifact/server handling. Desktop preservation checks five cards, all seven available periods,
resize preservation, intentional What-if scrolling, and forward/reverse keyboard focus at the
existing desktop sizes. New browser assertions check focus retention on edits, semantic live
status, rejected text and accessible field descriptions, Tab/Shift+Tab recovery to Calculate,
Reset, matching email inputs, stale dialog refusal and input-only pension suggestion application.

Visual QA compared the £40,000 / `1257L` scenario with the independent
`salary-guide-40k-base` fixture: annual Income Tax £5,484, NI £2,193.96 and net pay £32,322.04.
The page title, populated calculator, five cards, changed/invalid states and absence of a framework
error overlay were inspected. Local Next servers do not provide the two Vercel insights scripts;
the visual console check stubs only those requests with empty JavaScript. Provider behaviour is
not certified by that check.

## Evidence and limits

Raw logs, Playwright JSON, traces and screenshots remain outside source control. The final
artifact hashes and source identity are recorded below so the committed summary is independently
readable without relying exclusively on scratch paths.

| Artifact | SHA-256 |
| --- | --- |
| application.patch | `c1476d8ddfc4e0d1cb9839e0a472d5bc8e74517527d9e7bbc2e73fd816eaabf8` |
| unit-full.log | `b3c53b2e5f23f5ee71c11d1a00dbb3bb82acd26f2cf36851f12a94247c48d416` |
| check-repo.log | `13a8b4b04952adabda99c0b9c67c339e54540b748ec26b509c273b5a982c26ee` |
| build.log | `6d2ece1603a92568ee439a7953d440d2212e7e1933a56e4e593bac983612e2af` |
| production-mc03.json | `449eb3fcfdf8e2ffc2fece2c025d1ad3cf46287340355705cf8071b98e0fc3c3` |
| smoke-results.json | `76646e8297f58bea7cfa5c606a8b9ff8738d31166f1911b7b083d84894a61510` |
| desktop-preservation.json | `4b322cec5c54c61b54fda38cdbc045f7571f6019e68646d990472e90ccf53cfb` |
| visual-qa.json | `398048d34ad7159841cc8a1e21342634da6479ffba93418f2d4fdb658a2f3ccc` |
| 1440-calculated.png | `ead00a8a664b583e9ff79b50fe66d3e56ae96058d038cd116e6f869626ceb9b2` |
| 1440-changed.png | `9d5e4b094b7bce28c25ff958bf69fc4c65c42636c8665620a99837670f867f4d` |
| 393-invalid.png | `5ed4d1adb7590b25f60f1b4abb56ea2b5d6857d8a21b78bcdc61700e53dca304` |
| 320-changed.png | `52421d39c5067e89f78dbc69dc319aae7dc39ecbf4f8f305f63ea2ff76a8cca1` |

Development reduced-motion results emit an existing non-boolean `layout` DOM warning from
`ResultTableRow`'s static path, whose source is unchanged from the base. This is recorded as a
separate Verification follow-up; no baseline runtime rerun or fix is claimed here. The production
visual run has no console warnings after the local script stubs.

The MC-03 regressions deliberately use native keyboard activation. They do not establish a fix
for the existing lost Mobile Safari Calculate taps, desktop WebKit suggestion clicks or mobile
focus/header defect. Touch emulation is not a physical-device test. Native keyboards, OS paste,
screen-reader speech and production provider/deployment behaviour were not verified.

The review gate is a fresh Claude CLI review of the final Git head, with its exact SHA and verdict
recorded in the PR discussion. Earlier approvals are not reused. Do not merge or deploy as part
of this slice.
