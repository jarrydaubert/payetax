# PayeTax v5.2.2: input help acceptance evidence

30 October 2026. Final acceptance clarification incorporated into the existing implementation.
**The maintainer reports independent Claude APPROVE for the agreed input-panel implementation.** The two financial-guidance corrections and updated accessibility evidence are documented in [re-review.md](re-review.md); focused re-review is pending. No commit, push, merge, deployment, tag or hosted-CI monitoring was performed.

## Review target

- Worktree: `C:\Users\JGF Desktop\Desktop\payetax-worktrees\input-help-v5.2.2`.
- Branch: `fix/input-help-v5.2.2`, from fetched main `208a19e27ee47661da5bfa4314a20eb91ee330f7` (#156, v5.2.1).
- Patch release: `5.2.1 → 5.2.2`, following the Operations version policy.
- The configured OneDrive checkout was absent. A separate worktree preserved the Desktop repository's existing branch and edits.
- Windows / PowerShell, Bun 1.4.3, Node 24.18.0, Next.js 16.4.1. No secret files were opened or copied. Bun commands use `--no-env-file`.
- `source-sha256.json` identifies the final changed source, tests and lockfile; `evidence-sha256.json` identifies the review artifacts. Both include untracked additions explicitly.

This report supersedes the earlier implementation report. `acceptance-375/` records the agreed whole-form/input-help acceptance. Current Director warning text and the additional accessibility-tree checks are in `re-review/`; see [re-review.md](re-review.md), which supersedes the earlier Director warning wording and screenshots. Root-level before/after PNGs, `ui-results.json` and `verify-ui.cjs.txt` are historical captures of an earlier iteration; its dialog autofocus behaviour was superseded. Do not use those artifacts to infer final focus behaviour.

## Acceptance outcomes

| Requirement | Implementation and verification |
| --- | --- |
| Clean inputs | Removed the pension paragraph and expandable disclosure; removed Director field hints, repeated input-path explanations and additional-income guidance paragraphs. No replacement input guidance was added. Labels, help icons, conditional status and validation remain. Whole PAYE form asserts zero `p` and `details` elements before validation. Director field-hint IDs are absent. |
| Friendly help | Reviewed all 40 existing central input entries and five result-card explanations. The configuration now has 42 entries, adding custom year-end and associated-company help. Seven dormant Director input modules share the same copy and control. [Copy inventory](acceptance-375/help-copy-audit.json) records every entry and character count. Longest central entry is 241 characters including title; no hard length limit was added. |
| Touch at 375px | Exhaustive E2E exercises all 12 mounted PAYE help icons and the union of 27 Director icons in annual/monthly/full/advanced views. Each is opened by real touch, closed by a second tap, reopened, and closed by an outside tap. Partner income, custom date and the pension-in-expenses option are included. Four browser projects run the same 375px cases. |
| Mouse and keyboard | Repeated desktop mouse opening/closing is checked. Every audited input help control toggles with both Enter and Space. Opening leaves focus on its trigger; Escape closes and retains/returns focus there. Tab can continue to the next form field. At 320×280, ArrowDown deliberately enters overflowing help and End/Home scroll it; Escape restores the trigger. |
| Assistive technology | Named button with `aria-expanded`, `aria-controls` and a dynamically associated `aria-describedby` relationship to the open explanation. Content is a named `region`, not a modal dialog. No automatic focus move. Help stays inside the Director drawer's dialog subtree; Escape closes help before the drawer. Validation descriptions remain on their fields. |
| Outside input interaction | The shared control dismisses on outside pointerdown, without cancelling that pointer action. This covers monetary inputs that suppress the later click on Safari touch. Outside dismissal prevents automatic focus restoration, so the tapped input retains focus. The unit regression uses pointerdown without a later click; the browser regression taps the actual salary field from open result help. |
| Estimate limitations in results | PAYE pension warning covers salary-sacrifice treatment of Income Tax, employee NI and student loans, potentially overstated take-home for net pay/relief at source, and omitted employer NI savings. Additional-income understatement warning is in results. Director results show relevant VAT, other-PAYE and company pension tax-limit notes. Input help explains how to enter values. |
| Financial integrity | No changes to tax engines, rate/constants files, stores, calculation fixtures, rounding or numerical expectations. Existing calculation tests remain unchanged. Full Jest includes independent PAYE verification fixtures. Browser capture checks the hand-derived £40,000 / 1257L / England fixture: £32,322.04 annual net before pension or additional income. |
| Whole-form layouts | Both routes inspected in Chromium and WebKit at 1440×1000 and 375×812, including all PAYE inputs and additional income; Director quick start, full inputs, custom date, already-taken amounts, personal situation, advanced pension/loans/car/company thresholds, comparison setup and monthly cash inputs. Validation and result warnings captured separately. |

## Shared help behaviour and design choices

`HelpPopover.tsx` composes the existing design tokens and Radix primitive family. The exact new dependency is `@radix-ui/react-popover@1.3.1`, with its lockfile additions. Generic tooltip primitives elsewhere are unchanged. Help targets are at least 32×32 CSS pixels; explanations use 14px text, viewport collision padding and native overflow scrolling. This is a click/tap disclosure: a mouse hover alone does not open it.

The trigger remains focused when opened with the keyboard, and its description exposes the explanation to assistive technology. ArrowDown is an optional, exposed keyboard shortcut for deliberately focusing a long explanation to scroll it. Close help and Escape return focus to the trigger. Outside interaction preserves the target field's focus.

Two narrow Safari mouse guards prevent an already focused trigger from blurring before its own click, and prevent the close button from blurring that trigger on mousedown. Otherwise the calculator's existing focus-within scroll padding shifts the target before mouseup. They do not cancel pointerdown or touch events.

Actual browser review found that Safari monetary inputs can emit pointer/focus events but suppress the subsequent click. Radix's deferred outside-click dismissal then left result help open. A capture listener, mounted only while help is open, dismisses outside the trigger and content on pointerdown. It does not prevent default or move focus. Review this exception and its focus-restoration guard independently, especially switching between help controls and tapping another field.

The Director drawer's Escape handler now respects `defaultPrevented`, so closing help does not also close the drawer. Portalling inside the drawer keeps the explanation available within the modal's accessible subtree.

## Verification

| Check | Final result |
| --- | --- |
| Full Jest, `bun --no-env-file run test:no-coverage --runInBand` | Passed: 258 suites, 4,600 tests |
| `bun --no-env-file run check:repo` | Passed: lint, source/test typechecks and repository contracts |
| `bun --no-env-file run build:ci` | Passed: production build and all 64 generated pages |
| Focused help E2E, four projects | Passed: 32 tests across Chromium, WebKit, Mobile Chrome and Mobile Safari (2.6 minutes) |
| Existing five-file Chromium smoke slice | Passed: 65 tests |
| Whole-form capture script, four engine/layout combinations | Passed: 72 PNGs; five desktop / four mobile result-card help controls per engine |
| Scoped axe checks with open help | Eight scans, zero violations; no page errors |
| `bun --no-env-file run check-version --base origin/main` | Passed: 5.2.1 → 5.2.2 patch |
| Frozen lockfile install | Passed: 895 installs / 975 packages, no changes |
| `git diff --check` | Passed |

Logs, the final browser last-run records and the copy inventory are in `acceptance-375/`. The initial smoke attempt against a reused server had a cookie-origin setup problem at the extra-small 280px viewport: 64 passed, one helper was obscured by the cookie banner. The final reuse configuration retains the existing global setup against the actual server origin; no application cookie logic or assertions were weakened. A subsequent focused run passed 31/32, failing before opening any help because the Married checkbox setup used a mouse check while hydration/anchor scrolling was still settling in WebKit. That one setup now uses the existing `openCalculatorForAmountEntry(page, true)` readiness helper, which waits for network idle and probes the partner field with real touch. Help interactions are not retried. The prior failure log is retained as `focused-before-readiness-fix.log`; the final focused run uses two workers and no test retries.

The final production build was served on port 3102. `playwright-reuse.config.txt` changes server ownership/base URL and retains the original cookie global setup. It does not change test assertions, retries or project device settings. Commands:

```powershell
bun --no-env-file run build:ci
$env:PORT='3102'; bun --no-env-file run start
# Recreate .codex-verification/help-final.config.ts from playwright-reuse.config.txt.
bun --no-env-file x --no-install playwright test --config .codex-verification/help-final.config.ts e2e/calculator-critical.spec.ts e2e/director-guide-critical.spec.ts --grep 'Pension modelling guidance|Director input help' --project=chromium --project=webkit --project='Mobile Chrome' --project='Mobile Safari' --workers=2 --output audit-outputs/input-help-focused-final --reporter=line
bun --no-env-file x --no-install playwright test --config .codex-verification/help-final.config.ts e2e/smoke.spec.ts e2e/homepage-portal-stability.spec.ts e2e/calculator-critical.spec.ts e2e/director-guide-critical.spec.ts e2e/payslip-regression.spec.ts --project=chromium --workers=1 --output audit-outputs/input-help-smoke --reporter=line
```

For a fresh build/server/setup managed by the original Playwright configuration, omit `--config` and the output override. The existing smoke npm-script's final macOS `open` command is unsuitable for Windows, so the same test files/projects are invoked directly.

The standalone capture script is preserved as `acceptance-375/verify-whole-forms.cjs.txt`. Copy it beside installed dependencies as a `.cjs`, run from the worktree root against port 3102, and install no globals. It captures actual browser layouts, checks the independent fixture, validation associations, result help interactions and scoped axe scans. It does not stub the help components.

## Visual evidence to inspect

There are 18 captures for each engine/layout combination. `whole-form-results.json` lists all images, labels, annual/monthly help inventories, result-card help names, axe findings and console messages. The Director snapshots are overlapping scroll positions through the complete form, not isolated help mocks.

| Area | Examples from final WebKit mobile evidence |
| --- | --- |
| Entire PAYE form, partner and additional income expanded | [Whole form](acceptance-375/webkit-mobile-paye-whole-form.png) |
| Open PAYE explanation | [Pension help](acceptance-375/webkit-mobile-paye-help.png) |
| Visible associated field errors | [PAYE](acceptance-375/webkit-mobile-paye-validation.png), [Director](acceptance-375/webkit-mobile-director-validation.png) |
| Director form, top to bottom | [Quick start](acceptance-375/webkit-mobile-director-quick-start.png), [Year-end](acceptance-375/webkit-mobile-director-company-year-end.png), [Already taken](acceptance-375/webkit-mobile-director-already-taken.png), [Situation](acceptance-375/webkit-mobile-director-situation.png), [Pension/loans](acceptance-375/webkit-mobile-director-advanced-pension.png), [Company car](acceptance-375/webkit-mobile-director-advanced-company-car.png), [Salary/company thresholds](acceptance-375/webkit-mobile-director-advanced-salary.png), [Compare setup](acceptance-375/webkit-mobile-director-compare-setup.png) |
| Monthly fields and open help in drawer | [Income](acceptance-375/webkit-mobile-director-monthly-income.png), [Cash](acceptance-375/webkit-mobile-director-monthly-cash.png), [Open help](acceptance-375/webkit-mobile-director-help.png) |
| Results warnings | [PAYE pension](acceptance-375/webkit-mobile-paye-results-warnings.png), [Additional income](acceptance-375/webkit-mobile-paye-additional-income-warning.png), [Director](acceptance-375/webkit-mobile-director-results-warnings.png) |
| Desktop whole forms | [PAYE](acceptance-375/chromium-desktop-paye-whole-form.png), [Director top](acceptance-375/chromium-desktop-director-quick-start.png), [Director lower form](acceptance-375/chromium-desktop-director-compare-setup.png) |

## Limits and remaining review

Browser contexts simulate touch and mobile viewport sizes; physical iOS/Android devices and live VoiceOver/NVDA sessions were not available. Accessible names, expanded state, live description relationships, focus and dialog containment were checked in unit tests and rendered browsers, with scoped axe scans. These checks do not establish how every screen-reader/browser combination announces a dynamically added description.

No page errors were recorded. Local console messages are limited to existing absent Vercel analytics/speed-insights script 404/MIME failures, and WebKit's existing unrecognised `interactive-widget` viewport warning. Production build/Jest also report the existing Sentry import and Next useCache deprecations. No new help-related runtime error was observed.

The tax-import baseline removes only an obsolete display-year import from a dormant tooltip. PWA cache names, tax facts and financial logic are unchanged. Statutory policy was not edited; this is guidance and interaction work.

Claude should review the current working diff, source/evidence hashes and final PNGs, and exercise both routes independently. See [review-request.md](review-request.md). The initial Claude approval is maintainer-reported. Focused re-review of the financial copy corrections and real assistive-technology announcement checks remain pending; this report is not a new independent approval.
