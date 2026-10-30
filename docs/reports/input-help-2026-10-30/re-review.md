# v5.2.2: focused follow-up for independent re-review

30 October 2026. The maintainer reports that Claude independently **APPROVED** the implementation and confirmed that the agreed input-panel design is achieved. This follow-up corrects the two Director result statements and reviews the remaining uncertainty about screen-reader announcements. Focused independent re-review of these corrections is **pending**. No commit, push, merge, deployment or hosted-CI monitoring was performed.

## Scope and preservation

Only **two JSX text nodes** changed in production since the approved state, both in `src/components/organisms/DirectorGuide/DirectorDashboard.tsx`. The existing `hasComparison`, `hasOtherPAYEEmployment` and `pensionContribution > 0` display conditions are unchanged, as are the enclosing condition, VAT text, layout, styles and calculations. Pension guidance still appears for a positive contribution even when it is already included in expenses; no allowance threshold or new display rule was introduced.

[Production-only correction diff](re-review/production-copy-correction.diff) compares the pre-correction file with the current file. [Structure check](re-review/production-structure-check.json) compares TypeScript AST nodes excluding JSX text, then checks that exactly two non-empty JSX text nodes differ. The complete pre-correction file and the check script are retained beside it. Tax engines, stores, rates, numerical fixtures and numerical test expectations remain unchanged. `HelpPopover.tsx`, its tests and the existing Learn/Education panel are byte-for-byte unchanged by this follow-up. No results-layout or cosmetic suggestions were implemented.

The original v5.2.2 source manifest is preserved as `re-review/pre-correction-source-sha256.json`; the root `source-sha256.json` now identifies the current working source, including the additional focused dashboard tests. The root evidence manifest includes both the earlier acceptance evidence and this follow-up.

## Financial guidance corrections

### Other PAYE employment

The result now says:

> In the suggested pay options, selecting other PAYE employment means we estimate employee National Insurance from the first pound of director salary. Jobs with separate employers usually have separate thresholds, so this may overstate your NI. Check with your payroll provider.

The previous statement could imply that another job necessarily consumes the director employment's NI threshold. The new text identifies a **calculator assumption**, explains its possible effect and retains the payroll qualification.

Code trace: `getEmployeeNIWithNoThreshold` in `src/lib/tax/strategyComparison.ts` passes `applyPrimaryThreshold: false` to `getEmployeeNI`. `src/lib/tax/employeeNI.ts` sets the primary threshold to zero for that option. The suggested salary/mix paths select it when `hasOtherPAYEEmployment` is true. The wording is deliberately limited to the **suggested pay options**: the separate custom `calculateYourSetup` path calls ordinary `getEmployeeNI` without that option. Neither path was changed.

Statutory check: [HMRC NIM10001](https://www.gov.uk/hmrc-internal-manuals/national-insurance-manual/nim10001) says earnings with different employers are normally treated separately, with exceptions under the regulations. [HMRC guidance for employees with more than one job](https://www.gov.uk/guidance/what-to-do-if-your-employee-has-more-than-1-job/) describes aggregation cases for the same employer or associated businesses. “Usually” preserves those exceptions; the warning does not promise a particular payroll outcome.

### Pension annual allowance

The result now says:

> Company pension contributions count towards your annual allowance across all your pensions. Going over your available allowance may mean a personal tax charge, which is not included in this estimate. Unused allowance from the previous three tax years may help; high income or some pension withdrawals can reduce your allowance.

This replaces the suggestion that pension limits restrict relief on company contributions. It identifies a possible **personal annual-allowance tax charge**, keeps carry-forward and reduced-allowance qualifications, and explains that the estimate omits that charge. “May” avoids claiming that every excess contribution creates a charge or that carry-forward is always available.

Code trace: `compareStrategies` subtracts the pension contribution from available company profit, with no annual-allowance cap; it does not add a personal annual-allowance tax charge to the strategy's personal-tax totals. The existing pension annual-allowance/taper messages in `src/lib/tax/warnings.ts` and the Learn panel are warnings, not additions to those tax totals. The already-in-expenses handling is unchanged.

Statutory check: [GOV.UK annual-allowance guidance](https://www.gov.uk/tax-on-your-private-pension/annual-allowance) includes employer contributions across private pensions, possible carry-forward from the previous three years, and lower allowances for high income or certain flexible pension withdrawals. It also describes the annual-allowance charge as a charge on pension savings and confirms that exceeding the allowance does not itself prevent claiming pension contribution relief. Company deductibility is a separate question: [HMRC BIM46035](https://www.gov.uk/hmrc-internal-manuals/business-income-manual/bim46035) discusses the business-purpose test for employer pension payments. The new paragraph does not guarantee company relief or equate the personal allowance with a company deduction cap. No new numeric tax-policy values were added to the UI.

Primary sources were checked on 30 October 2026. These source checks explain the copy; no statutory calculations were changed.

## Help announcements: evidence and limits

**No accessibility implementation change was made in this follow-up.** The description is associated only while help is open. Keeping focus on the trigger and changing `aria-describedby` establishes an accessible description, but our automated observations cannot prove that any particular screen reader immediately speaks it.

The [WAI disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) supports a button that toggles with Enter/Space, exposes `aria-expanded`, and may reference controlled content through `aria-controls`. That pattern is useful structural guidance; matching it does not establish announcement behaviour across assistive technologies.

Actual production pages were exercised in Chromium and WebKit at 1440×1000 and 375×812, on both the PAYE and Director routes. The [raw results](re-review/browser-accessibility-results.json) distinguish DOM assertions from Chromium accessibility-tree observations:

| Evidence | Observed result | What it does not prove |
| --- | --- | --- |
| DOM / Playwright accessible-description algorithm, both engines and sizes | Opening exposes the expected description, expanded state and controlled explanation; focus stays on the trigger. Escape removes the explanation/description and retains focus. Director mobile help remains inside the drawer, which stays open. | Screen-reader speech or interpretation of dynamic description changes |
| Chromium CDP accessibility tree, both sizes and routes | The focused button has the expected name, expanded=true and actual help text in its AX description after opening. The named explanation region is present and not ignored. Closing removes the AX description. Raw before/open/closed observations are preserved. | Windows accessibility API delivery to a particular AT, VoiceOver/NVDA speech, or mobile screen-reader support |
| Eight scoped axe scans with help open | Zero violations | Full WCAG compliance or announcement quality |
| Existing help unit tests and eight focused E2E cases | Keyboard toggling, dismissal/focus, drawer containment and the Director flow remain working | Physical-device gestures or live screen-reader announcements |

No live NVDA, JAWS, Narrator, VoiceOver or TalkBack speech session was performed. This review therefore neither confirms automatic speech nor establishes that it fails. No speculative live region, automatic focus move or duplicate announcement mechanism was added to claim compliance. Those changes would need evidence from the relevant AT/browser combination.

Focused manual re-review still needed: record screen reader, browser and versions; Tab to “Help for Pension”, open with Enter/Space and note the actual announcement without moving focus. Check the expanded state, whether the explanation is spoken or can be reached through ordinary reading navigation, and whether it is repeated unnecessarily. Close with Escape and verify focus. Repeat with “Help for Other PAYE Employment” inside the Director mobile drawer, including access to its explanation without leaving the modal. Record observed speech rather than inferring it from the accessibility tree.

## Verification and artifacts

| Check | Result |
| --- | --- |
| Focused Jest: dashboard rendering, all three help-control suites, existing Director strategy and warning suites | **124 tests / 6 suites passed**, including five new warning-content/display regression cases |
| Focused Director E2E, Chromium / WebKit / Mobile Chrome / Mobile Safari | **8 passed**: material result warnings and annual/full/monthly help/drawer flow |
| Rendered evidence | **Four engine/viewport combinations passed**, twelve PNGs: updated result notes and open PAYE/Director help |
| Scoped axe | **Eight scans, zero violations** |
| Independent PAYE fixture in browser | **£40,000 / 1257L / England → £32,322.04 annual net**, unchanged |
| Production build | **Passed**, all 64 pages generated |
| `check:repo` | **Passed**: lint, source/test typechecks and repository contracts |
| Production structure check | **Passed**: unchanged AST except two JSX text nodes |
| `git diff --check` and financial-source comparison | **Passed**; engines, rates, stores and independent fixtures have no diff against main |

The earlier full 4,600-unit / 65-smoke / 32-help results remain evidence for the preceding input-help implementation. They were not rerun for this two-paragraph follow-up; the checks above are the current focused verification. No numerical expectations were edited or weakened. The patch version remains 5.2.2; there is no additional release or commit.

Browser plugin not available; installed Playwright was used against the local production server on port 3102. The existing cookie global setup was retained. Exact focused command:

```powershell
bun --no-env-file x --no-install playwright test --config 'C:/Users/JGF Desktop/Desktop/payetax/.codex-verification/re-review-playwright.config.ts' e2e/director-guide-critical.spec.ts --grep 'material Director estimate warnings|help works in annual, full and monthly' --project=chromium --project=webkit --project='Mobile Chrome' --project='Mobile Safari' --workers=1 --output audit-outputs/input-help-re-review --reporter=line
```

`re-review/playwright-reuse.config.ts.txt` preserves that temporary config. `verify-ui.cjs.txt` preserves the browser/AX/axe capture script; `verify-structure.cjs.txt` preserves the text-only structure comparison. Copy these `.txt` artifacts to their original temporary locations as `.ts`/`.cjs` to rerun. The scripts run from the worktree root, use existing dependencies and do not require global installs. Logs are beside the evidence.

[Desktop corrected warnings](re-review/chromium-desktop-director-result-warnings.png) · [375px corrected warnings](re-review/webkit-mobile-director-result-warnings.png) · [375px Director help](re-review/webkit-mobile-director-help.png) · [PAYE help](re-review/chromium-desktop-paye-help.png)

The console showed only the existing local Vercel analytics/speed-insights 404/MIME errors and WebKit's existing `interactive-widget` warning; no page errors occurred. The existing Sentry/Next deprecation warnings remain. The local server was stopped after verification.

Return a focused independent verdict on these two statements and the screen-reader evidence/remaining uncertainty. The agreed forms, other results-layout decisions, cosmetics and calculations are outside this follow-up. See [review-request.md](review-request.md).
