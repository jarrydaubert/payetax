# PWA upgrade safety: first review slice

Date: 29 October 2026. Branch: `fix/pwa-upgrade-safety`.
Base: `27dd3da9c438e9005e9fcdd4f24389cd7cdfb86e` (`origin/main`, fetched before work).
Status: local implementation; independent Claude review pending. No merge or deployment authorised.

## Scope and delivery order

1. This slice: service-worker routing, offline shell, registration and safe legacy upgrades.
2. Follow-up PR: stable build identity shared by the document, worker and deployment metadata;
   distinguish it from the human-facing package version and isolate caches by build.
3. Follow-up PR: uncached live production identity verification, with current/older/unverified
   states, offline and failure behaviour, and stale-session tests. A waiting worker alone is
   not evidence that the open document is the latest production build.

The package version remains `5.1.4`. The `pwa1` cache suffix is a migration/schema identifier,
not a build identifier. This slice does not solve or claim production freshness by itself.

## Audit findings and resulting behaviour

| Finding in the existing path | Change in this slice |
| --- | --- |
| `lazyOnload` can execute after `load`, so registration never starts | Start immediately for a complete document, otherwise attach a once-only load handler |
| Standalone mode sends `SKIP_WAITING`, followed by a forced reload; an old cached bootstrap can still do this | Neither the worker nor the current bootstrap permits forced activation/reload. The new worker ignores legacy messages |
| The controller listener is attached after sending the activation request, with an unsafe reload fallback | Remove forced activation and reload entirely; notify users to finish before closing all tabs/windows |
| Only browser tabs get a prompt, which disappears automatically after 30 seconds | Both browser and standalone receive a persistent, dismissible notification; Later keeps the calculation open |
| Generic `.js` cache matching can trap the registration script; API and Flight/prefetch requests fall into generic caches | Bootstrap/manifest requests use `no-store`; APIs and Next protocol requests bypass the worker; static caching uses an explicit allowlist |
| Broad `caches.match` can return data from v5.1.4's mixed caches | Read only the new named caches. Prepare separately while the legacy worker remains active |
| Navigation freshness depends on whether navigation preload exists | Network-first document navigation with or without preload; current cached document/root/offline page on network failure |
| Install catches precache failure and still succeeds | Fail installation and retain the working active worker if essential shell preparation fails |
| The offline HTML lacks its page bundles, producing a hydrated error screen | Precache scripts/styles referenced by the calculator and offline documents; protect shell assets from runtime eviction |
| Detached writes can outlive the worker; storage errors can discard usable network assets | Attach writes/eviction to `waitUntil`; contain write failures; fall back to the network when asset cache reads fail |
| `registration.update()` promise rejections escape a synchronous try/catch | Await/catch update checks on resume/reconnect and retry a failed initial registration on reconnect |

The browser lifecycle activates an update only when the old worker controls no clients. We do
not call `clients.claim`, unregister workers, clear calculator storage, or serialize financial
drafts. Closing a window can still discard unfinished input through ordinary application/browser
behaviour; the notification explicitly says to finish first. This change prevents an update
from doing that closing/reloading for the user.

Legacy workers already waiting on a device can still implement their old unsafe message
handler; new code cannot rewrite those workers. The tested migration specifically installs the
new worker over an active v5.1.4 worker and resists the old bootstrap's activation request.

## Test strategy and provenance

`e2e/pwa-upgrade.spec.ts` serves exact v5.1.4 scripts and the changed scripts on one disposable
local HTTP origin. Application routes proxy the local production build; worker updates use the
real browser lifecycle rather than fetch-routing mocks. No deployed service is mutated.

The fixtures' Git blob hashes match `v5.1.4:public/sw.js` and
`v5.1.4:public/register-sw.js`; their README records the hashes. They use `.txt` extensions to
preserve the historical bytes through formatting. The test exercises the exact legacy
standalone bootstrap, two unfinished calculator amounts, no controller/document replacement,
closing one window, natural activation after the last window closes, offline root relaunch,
an uncached-route offline fallback, and the mobile Later action with an invalid unfinished input.

Jest executes the real worker/bootstrap scripts in isolated contexts to cover routing, cache
isolation/eviction, precache failure, async update rejection, load timing and notification safety.
The old source-text fallback assertions were replaced by behavioural worker tests; manifest
and asset checks remain.

`test:e2e:pwa` is the supported focused browser command. The PWA spec is also included in the
existing critical CI command. No workflow, branch protection, dependency or secret is changed.
The existing critical E2E job remains non-blocking. Playwright's ServiceWorker inspection API
is Chromium-only, so the spec is excluded from WebKit rather than reporting a fake Safari pass.

## Verification

All results below were run locally on 29 October 2026, with Bun 1.4.3, Node 24.18.0,
Playwright 1.61.1 Chromium and the existing installed dependencies. They are repository evidence,
not hosted CI or production verification.
The repository declares Bun 1.3.13 for CI; that exact runtime has not been rerun locally.

| Check | Final result |
| --- | --- |
| `bun --no-env-file run check:repo` | PASS: lint, application/test types, version/environment contracts and repository guards |
| `bun --no-env-file run build:ci` | PASS; also rebuilt by the supported PWA browser command |
| Focused Jest, four affected suites | PASS: 60 tests |
| Full source Jest suite | PASS: 252 suites, 4,426 tests, two workers, 103.7 seconds |
| Existing smoke/homepage/calculator/Director/payslip specs plus PWA, Chromium, one worker | PASS: 59 tests, 4.3 minutes |
| `bun --no-env-file run test:e2e:pwa --reporter=line` | PASS: 2 tests through the standard build/server setup; final run 32.9 seconds |
| Legacy fixture Git blobs | PASS: byte-identical to the v5.1.4 tag |
| `git diff --check` | PASS |

The full Jest command was:

```powershell
bun --no-env-file run test:no-coverage --maxWorkers=2 --roots src --testMatch '**/src/**/*.test.ts' '**/src/**/*.test.tsx'
```

The focused command additionally used `--runInBand --runTestsByPath` for
`src/lib/__tests__/registerSw.test.ts`, `serviceWorker.test.ts`, `pwaAssets.test.ts`, and
`src/app/__tests__/next-config.test.ts`, with the matching `**/src/**/__tests__/**/*.test.ts` glob.
The browser regression run used the five specs listed in `test:e2e:smoke` plus
`e2e/pwa-upgrade.spec.ts`, against the built server with the temporary config described below.

The initial full Jest run had one failure in the newly added reconnect test: it sent the
online event before the cross-context mocked registration rejection settled. The test now
awaits the registration/load promise before reconnecting; both the focused and full reruns pass.
The offline fallback initially exposed a real missing-page-bundle error, fixed by shell bundle
precaching and verified through the production-build browser test.

The version checker still warns that `5.1.4` is unchanged since the latest tag. It does not
prove build identity, and that warning is not waived as production-freshness evidence.
Existing Sentry import/useCache deprecations and terminal colour warnings remain unrelated.

### Browser evidence

| Check | Evidence/result |
| --- | --- |
| Page identity / nonblank content | Existing homepage smoke and visible real calculator fields pass |
| Framework error screen | None in the verified online, waiting, offline calculator or offline fallback states |
| Runtime / console | Waiting-update pageerror guard passes; existing console CSP smoke passes. Offline network failures for uncached resources are expected |
| Interaction | Legacy standalone request leaves both documents/controllers/drafts intact; Later dismisses the current notice and retains invalid input |
| Responsive layout | Screenshot inspection at 1440×1000 and 393×852; notice fits the mobile viewport |

Screenshots from the final supported PWA run are preserved with this report:

- [Waiting update, unfinished input](pwa-upgrade-safety-2026-10-29/waiting-update-mobile.png)
- [After Later, same invalid input retained](pwa-upgrade-safety-2026-10-29/update-dismissed-mobile.png)
- [Offline calculator](pwa-upgrade-safety-2026-10-29/offline-calculator.png)
- [Hydrated offline fallback](pwa-upgrade-safety-2026-10-29/offline-fallback.png)

The existing Offline page's saved-results/sync overclaims remain visible in the screenshot;
the existing O1–O3 content backlog item owns their correction. This test proves rendering,
not those promises.

Implementation source SHA-256 values (before the independent review):

```text
public/sw.js           0de73651f3dbfd1ececfc241035e2d2527dd7cb51ea55e5d3674245f8ac1ed09
public/register-sw.js  1f5a39fd87a2d1b22de054d3d77a7558f2d60038b1640135cdec19f311a863a1
```

The initial checkout contained unrelated nested verification worktrees, causing Biome root
configuration collisions and duplicate Jest mocks. Work moved into an isolated Git worktree
under `.codex-verification/pwa-upgrade-safety`, sharing the installed dependencies through a
directory junction. The original branch and its source files were restored.

In this Windows dot-directory worktree, Jest's expanded absolute `testMatch` globs discover no
tests. CLI `--roots src --testMatch '**/src/**/*.test.ts' '**/src/**/*.test.tsx'` restores normal
source-suite discovery without changing the checked-in configuration or weakening assertions.
Local browser runs use the checked-in Playwright config with a temporary override to reuse
the already-built server at `http://localhost:3100`, with one worker and the line reporter.
This avoids rebuilding for each development iteration; the production build is checked separately.

The flow under test is: open calculator -> leave input unfinished -> discover a waiting
update -> keep the same document/controller/input -> finish and close all windows -> reopen
under the new worker -> launch the calculator offline. Viewports: 1440×1000 and 393×852.
Browser plugin unavailable; installed Playwright Chromium used.

## Review focus and remaining limits

- Independent Claude review has not happened. Review cache routing, offline bundle discovery,
  failure handling and the migration from the pinned legacy scripts before approving this slice.
- No hosted PR is opened before deployment-safe publication is established: Vercel's Git
  integration normally deploys pushed branches, and this task explicitly prohibits deployment.
- No live production deployment, CDN headers, production freshness or Sentry source-map release
  verification is claimed. The historical v5.1.4 release report is left unchanged.
- Physical installed iOS/Android behaviour, WebKit worker lifecycle, browser eviction of all
  site storage, and every tool's complete offline workflow remain unverified.
- First-install download size increases by the scripts/styles required for a usable shell.
  Bundle URL discovery depends on the current Next HTML's same-origin `/_next/static/` refs;
  the production-build browser test is the regression check for that contract.
- Build identity and live production comparison are deliberately deferred to the next two
  independently reviewable PRs; the existing source-date/build-identity backlog owner remains open.

Primary lifecycle references: [service-worker lifecycle](https://web.dev/articles/service-worker-lifecycle),
[registration options](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register),
and [Vercel Git deployment behaviour](https://vercel.com/docs/git/vercel-for-github).
