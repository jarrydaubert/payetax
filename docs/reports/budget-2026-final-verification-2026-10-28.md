# Budget 2026 final verification follow-up — 28 October 2026

PR: [#144](https://github.com/jarrydaubert/payetax/pull/144). The first-pass content head was
`0964c2e48aae31bcbef0a3b2c1a8ad1865e9b29d`; base `main` is
`89b442918db23177bd9faeb7f2309c5bc8119aa0`.

## Scope and deployment configuration

The temporary Vercel branch exclusion is removed at the maintainer's request. The resulting
`vercel.json` matches `main`; this PR's net diff is content and verification evidence only.
The Budget articles and Ledger image are unchanged from the corrected first-pass head, whose
material legal-status revisions still await independent re-review.
No calculator, supported-year selection, tax policy, fixture, dependency, workflow or runtime
code is changed. In particular, no 2027–28 calculations or new features are introduced.

The PR stays in draft. No merge or manual deployment is performed. Restoring the existing
configuration allows the repository's normal automatic Git integration to operate.

## Navigation investigation

The flow under test is a real pointer click from the 2026 Budget article to the 2025 article
and back, followed by verification of a **visible** destination heading and absence of the
loading fallback. No forced clicks, evaluated clicks, keyboard substitution, CSS patch or
application change is used in the passing browser journeys.

The original custom harness had a weak readiness check: matching a title in hidden DOM does
not establish that navigation completed. However, an A/B run with the same API-request warm-up
showed that correcting readiness alone did **not** fix the failure. Later isolation reproduced
it without API warm-up too. API cache corruption and a simple wait race are therefore not
established explanations.

An isolated detached worktree of unchanged `main` was built with the same installed dependencies
and served on localhost:3101; the PR build ran on localhost:3100. Neither checkout supplied
local environment files. The same existing native MDX link, Spring Forecast → tax-code guide,
failed in bundled Chromium on both versions. A standard related-article Next Link passed on
unchanged `main`, including the API-warmed controls.

| Browser / condition | Result |
| --- | --- |
| Playwright 1.61.1, bundled Chromium 149.0.7827.55, existing native link on unchanged `main` | Fails in all five isolation variants: no warm-up, prior browser load, API target fetch, API link crawl, independent Node fetch |
| Same browser and native link on PR | Same failure in all five variants |
| Bundled Chromium, Budget links | Initial short run passed 24 navigations; later isolated runs failed. Not treated as reliable coverage. |
| Installed Chrome channel 156.0.8078.49, unmodified PR | 24/24 pointer navigations pass: desktop/mobile, service workers allowed/blocked, three round trips each |
| Installed WebKit 26.5, unmodified PR | 24/24 pointer navigations pass with the same cases |
| Installed Firefox 151.0 | Harness times out waiting for a second navigation to finish; diagnostic DOM has a visible destination heading and no loading fallback. Not counted as a passing Firefox run. |

The Chromium failure leaves the destination document complete but its article hidden behind
`Loading article...`; the page reports `Transition was skipped`. A diagnostic shows animation
frames not firing even while visibility is `visible` and focus is true. Bringing the page to
the front does not restore frames, and a screenshot can time out too.

This matches [Playwright upstream issue #41562](https://github.com/microsoft/playwright/issues/41562),
which records the exact Playwright/Chromium versions, native cross-document view transitions,
stalled stability checks and skipped-transition error. The maintainer identifies a Chromium
regression fixed in a later browser roll. The application's existing
`@view-transition { navigation: auto }` opt-in is unchanged on both refs.

**Assessment:** the evidence supports a pre-existing bundled-browser/automation regression,
not a Budget-content or local HTTP-link defect. The passing installed-Chrome and WebKit
journeys demonstrate functional user navigation in those tested engines. This is not proof
that every historical Chromium build or physical device is unaffected. Do not disable production
transitions, alter article links or upgrade dependencies in this content PR to mask the issue.

Service workers are not the cause of this localhost reproduction: registration is explicitly
skipped on localhost unless requested, and no registrations were present in either setting.
Vercel analytics endpoint failures on `next start` remain local hosting limitations. No new
JavaScript page exceptions occurred in the passing Chrome/WebKit journeys.

Reproduce from the repository root using the existing installed browsers:

```powershell
$env:BUDGET_QA_BROWSER = 'chromium'
$env:BUDGET_QA_CHANNEL = 'chrome'
node docs/reports/budget-2026-navigation-reproduction.cjs

Remove-Item Env:BUDGET_QA_CHANNEL
$env:BUDGET_QA_BROWSER = 'webkit'
node docs/reports/budget-2026-navigation-reproduction.cjs
```

Start `bun --no-env-file run start --port 3100` after a production build first. Unset these
task-specific variables after use. The script creates only ignored diagnostic files on failure.
Browser plugin not available; the installed Playwright engines were used.

Verbose diagnostic/network artifacts are summarised above. SHA-256 hashes:

- Existing-link main: `fe6e1a56e158cf59c9949b97e029ab176e06c90722b68fd0218cb68195508e64`
- Existing-link PR: `ca2a96f035a4938f47bcdae9079824b87ed306113024e5600720bdb8aa6d4957`
- Chrome pointer run: `76c37f809c74ed2e4c0a1ea93cdf97a31d71e70ff8464465edc50494cfa71b50`
- WebKit pointer run: `bdfe54f255e2493cdc2b3108878ea455d7d89067f5f5eda53c41bc4d506b788a`

## Checks and exact-head review

At `0964c2e4`, [CI](https://github.com/jarrydaubert/payetax/actions/runs/40720323812),
[CodeQL analysis](https://github.com/jarrydaubert/payetax/actions/runs/40720323728) and the
critical E2E job all completed successfully; critical E2E reports **105 passed** in 6.8 minutes.
These are first-pass-head results, not proof for a later commit.

The final follow-up head, local verification and fresh hosted checks will be identified in the
PR verification comment after this report is committed. This avoids changing a reviewed head
merely to insert its own SHA or hosted run results into a file.

The [initial Claude review](budget-2026-claude-review-2026-10-28.md) and
[claim-by-claim dispositions](budget-2026-content-verification-2026-10-28.md#independent-claude-cli-review-and-disposition)
remain required context for a fresh independent review of the exact final SHA, including the
revised distinction between enacted rates and proposals. No later independent approval is
claimed: Claude CLI still reports its session quota limit, resetting at **19:20 London time**.
The maintainer explicitly chose to **keep approval pending** rather than restore capacity.

The merge recommendation remains **hold in draft until exact-head Claude review is complete**.
Any actionable material changes must be followed by checks and another review of the changed head.
