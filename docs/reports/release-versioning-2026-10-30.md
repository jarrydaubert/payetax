# Release versioning catch-up: v5.2.0

Date: 30 October 2026. Status: local implementation and verification complete. Independent
Claude review: **APPROVE, no blockers**, relayed by the maintainer on 30 October 2026.
The maintainer authorised committing these reviewed changes, pushing the branch and opening a PR;
merge, production deployment and release tagging remain unauthorised.

## Review target and scope

- Branch: `fix/release-versioning-v5.2.0`.
- Base: fetched `origin/main` and local `main` both at
  `d9162b84218c63a97d18527c03a9e1b00b1eddd7` (#153).
- Source checkout: `C:\Users\JGF Desktop\Desktop\payetax`. The configured OneDrive checkout
  was absent. Existing untracked verification files and other branches were preserved.
- Verification: an isolated, detached worktree at `.codex-verification/release-versioning-v5.2.0`
  on that base, with the changed source files copied in and existing dependencies shared through
  a directory junction. No local secret files were copied or opened.
- Runtime: Windows, PowerShell, Bun **1.4.3**, Node **24.18.0**, Next.js **16.4.1**.
  Hosted CI pins Bun **1.3.13**; that runtime and hosted Actions execution remain unverified.

`package.json` is now `5.2.0`. The existing `APP_VERSION` import continues to supply the footer
and Compliance page. The page says **App version** and **App version; production deployment is
verified separately.**, replacing the unsupported claim that release tags identify the deployment.
No footer layout or navigation change was made.

The rewritten `check-version` validates stable SemVer. Its `--base` mode requires the next patch,
minor or major version for production-facing changes; missing history fails. Documentation,
test and CI-only paths are exempt; unknown paths conservatively require a bump. It includes
tracked local staged/unstaged edits, with new files needing staging. CI runs it against the PR
merge tree and event base SHA in the existing `CI` job, after full-history checkout and Bun setup.
There is no tag lookup and no service-worker cache/version matching.

Reviewers choose the semantic category: patch for fixes/maintenance, minor for new capabilities
or tax-year support, major for breaking changes. Stable-only versions, no skipped increments and
lower-component resets keep the policy small and deterministic. The PR template and `AGENTS.md`
make the category and base-aware check explicit. The Operations guide owns the process, including
production evidence and an annotated tag on the verified source SHA after explicit approval.

PWA scripts, cache names, `GET_VERSION`, update activation, registration and offline behaviour
are unchanged. `git diff main -- public/sw.js public/register-sw.js
src/components/molecules/Footer.tsx src/constants/version.ts` was empty.

Legacy release-helper retirement is a separate backlog item. Existing site-wide disclaimer,
accuracy/authority claims and build-identity/freshness work remain with their existing backlog
owners. Historical v5.1.4 release reports and legacy release helpers were not rewritten.

## Verification

All commands below ran in the isolated worktree with `bun --no-env-file`.

| Check | Result |
| --- | --- |
| `bun --no-env-file run check:repo` | PASS: lint, app/test types, version format and existing repository guards |
| `bun --no-env-file scripts/check-version.ts --base origin/main` | PASS: `5.1.4 -> 5.2.0` accepted |
| Focused Jest command below | PASS: 3 suites, **87 tests**, including 33 version-guard cases and existing worker/footer regressions |
| `bun --no-env-file run build:ci` | PASS: production build, 64 generated pages |
| `bun --no-env-file run test:e2e:pwa --reporter=line` | PASS: **3/3 Chromium browser tests**, with the supported command building/starting its own production server |
| Direct desktop/mobile browser checks below | PASS: corrected version wording, footer version and navigation; empty warning/error arrays |
| `git diff --check` | PASS |

```powershell
bun --no-env-file run test:no-coverage --runInBand --roots src --runTestsByPath src/lib/__tests__/releaseVersion.test.ts src/lib/__tests__/serviceWorker.test.ts src/components/molecules/__tests__/Footer.test.tsx --testMatch '**/src/**/__tests__/**/*.test.ts' '**/src/**/__tests__/**/*.test.tsx'
```

The first focused Jest invocation with default discovery found no tests in the Windows
dot-directory worktree. The explicit roots/globs above are the already documented workaround;
no repository test configuration or assertion was weakened. Initial lint found formatting issues
in the two new/rewritten files; those were formatted and the full repository check passed again.
Final Jest verification includes rejection of leading/trailing whitespace, including a trailing
newline, in a version string.

Version-guard tests execute the actual CLI against disposable Git repositories. They cover
next patch/minor/major bumps with unchanged caches, missing/backward/skipped bumps, malformed or
unsupported versions, docs/test/CI exemptions, runtime/public-content/dependency/build/unknown
paths, a production file renamed into docs, missing base refs, committed changes, a target branch
already using the proposed version, and invalid CLI options. Test-fixture commits are disposable;
no project commit was created.

The PWA suite covers rejection of proxy authority overrides, a real cached v5.1.4 standalone
bootstrap updating across two tabs, controller/input preservation, waiting activation after normal
tab closure, and offline calculator/fallback relaunch after HTTP/runtime-cache removal. It also
covers late registration/repeated update checks without erasing an unfinished draft. These are
local regression results, not proof of deployment or physical-device behaviour.

Existing Sentry import and Next.js `experimental.useCache` deprecations, and terminal-colour
warnings, remain. No new browser console warnings/errors were captured.

## Browser evidence

The flow under test was: `/compliance` -> corrected app-version card and retained footer ->
click footer **Tools** -> `/tools` renders with the same `v5.2.0` footer.

Browser plugin not available; used installed Playwright Chromium. The development server was
started with `bun --no-env-file run dev --port 3101` at `http://localhost:3101`.
Viewports: desktop **1440 x 900**, mobile **393 x 852**.

| Observation | Result |
| --- | --- |
| Page identity/content | PASS: Compliance title, meaningful H1 and app-version card; Tools title/H1 after navigation |
| Version wording | PASS: `App version`, `v5.2.0`, corrected note; old deployment-from-tags sentence absent |
| Rendering | PASS: screenshots inspected; changed copy and footer readable at both widths, no framework error overlay |
| Console/runtime | PASS: no captured `pageerror`, console `error` or `warning` in either viewport |
| Interaction | PASS: real footer Tools click navigates; version retained on destination |
| Offline/update safety | PASS: separate production-build PWA suite above |

The six raw browser artifacts remain local under `docs/reports/release-versioning-2026-10-30/`;
they are excluded from the maintainer's explicitly authorised **11-file** commit. The table above
preserves their useful results for review without relying on local-only links. The script opened
fresh Chromium contexts at both stated viewports, asserted the Compliance title/H1, app-version
label and corrected note, absence of the old sentence, and `v5.2.0` in the footer. It captured
the card/footer, clicked the footer Tools link and asserted `/tools`, its H1 and the same version.
`ui-results.json` recorded empty pageerror/console warning/error arrays for both viewports.
The script accepted cookies only in disposable local contexts and sent no messages or emails.
Screenshots retained unrelated existing Compliance claims; those claims were not validated here.

Raw-artifact SHA-256 values:

```text
compliance-desktop.png b7dc4696cd3165194dbab261d33ad8cf03ff11aa360fcc9b0b6e8df739464d2c
compliance-mobile.png  58a7d996dd83d6cf3782deffbc772f6be7bea01d03a9e879cf99df9029cf60c8
footer-desktop.png     ab9ad0d876c85e36dc223dbe89fb60db26c3510742b2e8f6f0a3526cefb47a2a
footer-mobile.png      2962f7d8a14e0fa5beeac9e19ee2ecf54b840c91d20cb26ec31b50d8ea8d8818
ui-results.json        3f26fce02b7f3340132f90b215b3c422125871b88a06d8c5e2e4503625781a28
verify-ui.mjs.txt      43ae23a860bac91c716a885262e4445d56ced8f207313df2944f16e6378ae062
```

## Review limits and operational implications

- Claude independently confirmed that `main` branch protection requires **CI** and **up-to-date
  branches**, as relayed by the maintainer on 30 October 2026. These controls prevent reusing an
  old green version check after another PR changes the base version. This implementation did
  not modify repository settings; the confirmation is Claude's, not a new inspection by Codex.
- No new workflow, dependencies, environment variables, credentials or remote settings.
  The version check needs only Git and Bun, before dependency installation.
- The check cannot infer whether a change is breaking. Independent review must validate the
  chosen category and exemption. Administrators can still bypass repository protection.
- No live-site inspection, production alias/source-SHA comparison, provider email, Sentry
  source-map, full coverage suite, physical iOS/Android or WebKit lifecycle verification was run.
  Production checks and tagging remain pending the documented approvals and verification.
- Build identity/live freshness is not implemented by SemVer, cache names or a Git tag.
- Independent Claude review returned **APPROVE with no blockers**, as supplied by the maintainer.
  This records the independent local review, not a submitted GitHub approval or hosted-CI result.
  Hosted checks are to be reported on the PR; merge, deployment and tagging remain separate.

Final source SHA-256 values (working-tree bytes):

```text
scripts/check-version.ts
dcadff23eb71c4cefecfcfcca677fad31e9a5430ddde3b9e96e33acf29ad9181
src/lib/__tests__/releaseVersion.test.ts
3473b0e28d2224f256f5e61eb10f04631abe655568764513a30f88d565964009
public/sw.js
35f79a3eab12dec46ce425439d8872d53b1e613aea00d8d6a23620d26a8d2baf
public/register-sw.js
9d79559e5633d19421192d8cd5c0f15e62d6b0f8f0b90d5708cf126d4fe19de6
src/components/molecules/Footer.tsx
a90c34a7e94122efc0b999c4de0ef5ba28f31efc28b0cdd8662c1f48d5030a00
```
