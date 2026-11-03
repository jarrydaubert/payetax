# JGF-6: salary facts and calculator-link verification

Verified locally on 3 November 2026. This implements the three findings in
[JGF-6](https://linear.app/jgf-projects/issue/JGF-6) and its read-only Claude audit comment.
Verification base: `272fd642d4e09bf13c82121a20acce44e4c2f745` (v5.2.5).
Before PR creation, main advanced to `e9de1b5a` through a README-only PR #166;
version comparison against that target still passes. The verification base is preserved.
Branch: `fix/jgf-6-audit-corrections`. Resulting patch version: **5.2.6**.
At the original audit head `40023fa4`, no merge or deployment command had been run.
The temporary exact-branch Vercel guard suppressed automatic previews during review.
On 3 November 2026 the maintainer subsequently authorised removal of that guard, merge after
successful final checks, normal Vercel production deployment and live smoke verification.
The guard has now been removed; `vercel.json` matches main, with existing redirects and install
settings preserved. No workflow, provider project setting, secret or branch-protection rule changed.
Sentry PR #164 remains untouched and must move to v5.2.7 after this v5.2.6 PR merges.
The original test/review evidence below remains labelled to its audited source snapshot.

The pre-merge Next.js advisory check reopened the official blog, advance notice and repository
security advisories. At this check the latest published advisories were dated 14 October 2026;
no November advisory or applicable newly published fix was available. The 3 November release
was still an advance notice. No dependency upgrade was made. Repeat this check before merge;
the advance notice is not evidence that unpublished advisories are irrelevant.

Production status and live verification must be recorded against the eventual merge SHA and
actual deployment after those actions complete; the original local evidence is not production proof.

## Scope and independent verification

- **£40k article:** the [ONS release of 22 October 2026](https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/bulletins/annualsurveyofhoursandearnings/2026)
  reports provisional April 2026 median gross annual earnings of £40,911 for full-time
  employees in their jobs for at least a year. £40,000 is £911 below it. Corrected heading,
  comparison, FAQ and citation; retained the defined population and percentile caveat.
- **£70k article:** reproduced rounding drift using hand-derived PAYE workings, then compared
  those expectations with the existing engine. Corrected the headline, annual table/deductions,
  Plan 2 annual net, sacrifice monthly net and matching FAQs. Correct monthly, weekly and
  Scottish figures remain unchanged. The dated current-guidance entry and dependent date
  tests follow the factual refresh; `llms.txt` derives its existing last-updated field from it.
- **Tool CTAs:** reproduced `<a><button>...</button></a>` in both tools. The existing
  `Button asChild` pattern now produces one styled anchor. Preserved both destinations and
  the Scottish `setRegion('Scotland')` handler. Decoder logic, input validation, annual-tax-only
  scope, Scottish bands, crossover and comparison article are unchanged.

Checked the [HMRC 2026/27 rates](https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027),
[PAYE v24.0 specification](https://www.gov.uk/government/publications/payroll-technical-specifications-income-tax)
(including the ODT's free-pay and whole-pound/final-penny rules),
[Tables A](https://www.gov.uk/government/publications/tables-a-pay-adjustment-tables),
[Plan 2 deduction instructions](https://www.gov.uk/government/publications/sl3-student-loan-deduction-tables/2026-to-2027-student-and-postgraduate-loan-deduction-tables)
and [Scottish bands](https://www.gov.scot/publications/scottish-income-tax-rates-and-bands/pages/2026-to-2027/).
The Scottish page still labels its table proposed; the same operative bands appear in HMRC's
2026/27 employer table. No statutory policy or engine change was needed.

### Reproducible £70k cases

The new JSON suite in `src/test/payeVerificationFixtures/salary-guide-70k-payroll-2026-27.json`
contains full inputs, explicit independent workings and expectations. Common inputs:
£70,000 annual salary, 2026-2027, 12 equal monthly periods, category A NI, 1257L, England/rUK,
40 hours/week, no marriage/blind allowance, other income, other deductions, pension or loan.
Each row changes only the named input. These are steady-pay Month 1 projections, not cumulative
payroll simulations. The engine derives monthly pay from the unrounded annual salary.

| Case | Annual Income Tax | Annual NI | Annual loan / pension | Annual net | Monthly net (pence display) |
| --- | ---: | ---: | ---: | ---: | ---: |
| Base | £15,427.92 | £3,410.04 | £0 | £51,162.04 | £4,263.50 |
| Plan 2 | £15,427.92 | £3,410.04 | £3,648 loan | £47,514.04 | £3,959.50 |
| 5% whole-salary sacrifice, no loan | £14,026.32 | £3,339.96 | £3,500 employer pension | £49,133.72 | £4,094.48 |
| Scotland, S1257L | £17,377.80 | £3,410.04 | £0 | £49,212.16 | £4,101.01 |

For example, base monthly taxable pay is floor(£70,000 / 12 − £1,048.26) = £4,785.
Tax is £628.3333 + (£4,785 − £3,141.6666) × 40%, truncated to £1,285.66.
NI is (£4,189 − £1,048) × 8% + (£70,000 / 12 − £4,189) × 2%, rounded to £284.17.
Annual deductions are £18,837.96. The article rounds final figures independently to whole pounds;
it must not calculate annual net from rounded monthly presentation amounts.

## Checks and results

| Check | Result |
| --- | --- |
| New regressions before source fixes | 7 expected failures, 92 passes; independent fixture runner already passed against unchanged engine |
| Focused article/fixture/component checks | 99 tests passed |
| Full Jest, final source | **258 suites / 4,627 tests passed** |
| `check:repo` with temporary local exclusions described below | **Passed** |
| `build:ci` with temporary local exclusions | **Passed**, all 64 static pages generated |
| `check-version --base origin/main` | **Passed**, patch 5.2.5 → 5.2.6 |
| `typecheck:tests`, final changed tests | **Passed** |
| `blog:audit` | Completed; planning inventory only, unrelated historical flags retained |
| Broad Chromium smoke + calculator/director/payslip + golden + new CTA slice | 88 passed; one old smoke locator expected the removed nested button |
| Updated smoke + CTA slice | **13 passed**, including pointer navigation and Scottish selection |
| Final focused CTA slice, Chromium + WebKit | **8 passed**, both routes at 1440×900 and 393×852 |
| Direct dev and production browser QA | **8 journeys per server passed**: both tools and both article → calculator routes, desktop/mobile |
| Native Shift+Tab / Tab roundtrip | Passed in component tests and direct Chromium QA; WebKit limitation below |
| Targeted `nested-interactive` axe rule and DOM checks | Passed on both CTAs |
| Full-page axe, after example calculation | One unchanged `heading-order` violation per tool at both widths; below |
| Staged diff whitespace check | Passed |

### Commands and local-check boundary

The supplied workspace path did not exist. Used the existing repository at
`C:\Users\JGF Desktop\Desktop\payetax`; created a normal branch from fetched main, with no
new worktree or duplicate repository. Original branch pointer remains intact. Kept the unrelated
`.gitignore` edit and untracked `.codex-verification/` and
`docs/reports/release-versioning-2026-10-30/` files out of staging and commits.
The `.gitignore` SHA-256 remained
`a0bc9dc74f07aee98a42bdab42e2116316c80fd0d9c20cf1843b4bdc9c17c573`.

Unmodified `check:repo` stopped at lint on two pre-existing untracked verification files.
Unmodified typecheck and `build:ci` included old nested repositories under
`verification-worktrees/` and failed on duplicate declarations and their old E2E sources.
No unrelated files were fixed, moved or removed. A local-only wrapper temporarily excluded those
three locations from Biome and excluded `verification-worktrees/`, `.codex-verification/` and
`audit-outputs/` from TypeScript, then ran the existing commands. Original configuration bytes
were restored in `finally`; neither configuration is part of the PR. Tracked-file lint also passed.
The generated `next dev` AGENTS block was removed after stopping that server; no guidance change.

Key commands (PowerShell-compatible arguments shown):

```text
bun run test:no-coverage --maxWorkers=2 --modulePathIgnorePatterns='<rootDir>/verification-worktrees/'
bun run check:repo
bun run build:ci
bun run check-version --base origin/main
bun run typecheck:tests
bun run blog:audit
bunx --no-install playwright test e2e/tool-calculator-cta.spec.ts e2e/golden-master-PERFECT.spec.ts e2e/smoke.spec.ts e2e/homepage-portal-stability.spec.ts e2e/calculator-critical.spec.ts e2e/director-guide-critical.spec.ts e2e/payslip-regression.spec.ts --project=chromium --workers=1 --config=audit-outputs/jgf6/playwright.config.ts
bunx --no-install playwright test e2e/smoke.spec.ts e2e/tool-calculator-cta.spec.ts --project=chromium --workers=1 --config=audit-outputs/jgf6/playwright.config.ts
bunx --no-install playwright test e2e/tool-calculator-cta.spec.ts --project=chromium --project=webkit --workers=1 --config=audit-outputs/jgf6/playwright.config.ts
```

The temporary Playwright config imports the checked-in config, uses its projects and global setup,
sets absolute `testDir`, `globalSetup` and consent-storage paths, and points to the already built
production server at `http://localhost:3206` with `webServer: undefined`. It uses one worker and
no retries. This avoids rebuilding through the contaminated default TypeScript scope. The broad
run covers the repository's full smoke and golden script file lists; golden fixtures establish
regression parity only. Independent JSON expectations establish the corrected article values.
Browser plugin not available; used the repository's installed Playwright and browsers.

## Browser evidence and remaining limits

Page identity, meaningful content, framework-overlay absence, screenshot readability and target
interactions were checked on all four routes. Article canonical URLs were unchanged. Tool examples
returned annual Scottish tax £8,982 versus £7,486 at £50k, and 1257L decoded to £12,570.
Both CTAs received focus and Enter opened the expected calculator. Scottish region was Scotland.
The £70k mobile table retains its existing horizontal scroller: 344px viewport / 672px content,
verified through `scrollLeft=328` to reach the take-home column.

- Full axe scans identify existing H1→H3 card-title ordering on both tools. Those titles are
  unchanged; this PR does not claim whole-page WCAG conformance or fix that separate issue.
- Production localhost cannot serve `/_vercel/insights/script.js` or
  `/_vercel/speed-insights/script.js`; their 404/MIME console errors were recorded. No calculator
  runtime exception or framework overlay was observed. Dev article navigation also emitted
  occasional existing ViewTransition-aborted / opt-in-disabled messages.
- A strict native Tab roundtrip failed in Windows WebKit because its default traversal skips
  ordinary links; focused Enter activation worked. No runtime tabindex workaround was added.
  Final cross-browser tests assert anchor semantics, focus and Enter; native Tab was separately
  checked in Chromium and component tests. [Playwright's WebKit discussion](https://github.com/microsoft/playwright/issues/5609)
  and [Apple's preference documentation](https://developer.apple.com/documentation/webkit/wkpreferences/tabfocuseslinks)
  describe the preference boundary. Physical Safari/VoiceOver and WebKit with full link-keyboard
  navigation enabled remain unverified.
- This is local source/build evidence. Deployed HTML, Search Console raw exports, indexing/ranking
  changes, live analytics delivery and deployment state were not assessed or changed.
- Independent of PR #164 / JGF-5. No Sentry or release-automation changes. If another PR increments
  main first, follow the existing version policy and recheck the patch increment before merging.

## Independent review

A fresh-context, read-only reviewer independently reopened official sources, recomputed all four
£70k cases using Python Decimal without the production engine, inspected desktop/mobile screenshots,
and reviewed regressions and preservation requirements. **Accuracy: PASS. Readability: PASS.**
No actionable findings. The final browser-test adjustment was separately reviewed with its WebKit
native-Tab limitation explicitly retained. The reviewer did not execute the browser suite.

Reviewed 14-file source snapshot SHA-256:
`e35a63e8dee0b73c9daff37dc8da7537c1fc33a14dc458bda82141c87741f946`.
Hash method: sorted repository-relative paths, each encoded as path + NUL + file bytes + NUL.
Documentation and unrelated local work excluded. The final exact-branch Vercel safeguard then
received a separate independent PASS with no findings. The final 15-file source snapshot, including
that safeguard, is `873bc2602bd7d9fba3ed8d25bd66fe3703b73980adfbffde115b8d51b8a3ef02` using the same
hash method. Maintainer review is still required.

## Preserved screenshots

- [Scottish CTA, keyboard focus, mobile](scottish-cta-mobile.png)
- [Decoder CTA, keyboard focus, mobile](decoder-cta-mobile.png)
- [£40k corrected comparison, mobile](40k-median-mobile.png)
- [£70k payroll table, desktop](70k-payroll-desktop.png)
- [£70k take-home column after horizontal scrolling, mobile](70k-payroll-mobile-scrolled.png)

## Raw evidence fingerprints

Large/raw local artifacts are not committed. The results above, reproduction commands, screenshots
and these SHA-256 fingerprints preserve the useful evidence without a dependency on scratch files.
Local logs are implementer-recorded evidence, distinct from the independent source review and hosted CI.

| Artifact | SHA-256 |
| --- | --- |
| `baseline-tests.log` | `a8d5c044bfaca9eacb315fdc3cda3c99d7a281bf80aded09e91a44c93a3b5908` |
| `jest-complete.log` | `f034ac84cb90d393ef1c2de6e84a2881f658467c9478a872efedc48c4df4cd0f` |
| `check-repo-scoped.log` | `9221a6134f02d63c2e56cd43e94f6aa3ecb993d708ad30f4b699c35facf6561d` |
| `build-scoped.log` | `0f1ba1b5de1d43e8ec102a624dfb564486520afe4771e2257649aae6f8adff30` |
| `typecheck-tests-final.log` | `dde9b905ff86966bc63739896e02cff0c764694706bb963e88ddf2714493aa4c` |
| `playwright.log` | `c6bbf733304d553793d4b2be315c8e73590e49a90cac29cf3ccd7baa81ca5cdd` |
| `playwright-smoke-final.log` | `5a3a2895f7bf6eb933174fb78a09bab3baea6746268bd9146e5115aed999912d` |
| `playwright-webkit.log` | `7c8ef84116f05f8eb210801253949b4092ad4cef4390d63d5fab8bf8bf4f507b` |
| `playwright-cta-final.log` | `a4e4bf8bd3873a674532d4933263bb3395ed2acd5115bf29f7e62c86b2c46718` |
| `browser-dev.json` | `b0d45252a68e0a23b664a7ebbca0f2c878fd4b3dd713cb994902e24b4bde6e1b` |
| `browser-production.json` | `0f190c28f2cf1c9406b0617546847af14189fc1df25fb4573cf8b6ac2d4e3dad` |
| `mobile-table.json` | `4e8f541013d8fdf6c5321ae8a4db90b7d8b8bb7a881de5ce2156c5c01d4d5d5a` |
| `verify-scoped.py` | `72142c7856254067710a414c0204544d686179fa613b384dc734e0dc20cb379e` |
| `playwright.config.ts` | `a9a9841a3d59c6c9706a96d27d1484229aaa538a5f3ebb2cf1b909706d416038` |
