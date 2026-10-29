# PWA upgrade safety: review corrections

Date: 29 October 2026. Branch: `fix/pwa-upgrade-safety`.
Review base: `c25ba70eb3cba485a77ddf7e5c4a772424cc1bd0`.
Status: Claude APPROVE reported by the maintainer for the review corrections; finalisation
adds the bounded delayed-activation check below. No hosted review or separate review of this
last amendment is claimed. No push, merge or deployment.
The [initial report](pwa-upgrade-safety-2026-10-29.md) records historical checks only;
its migration-test pass did not establish the safety property now tested below.

## Critical test correction

The original test dispatched the legacy script's load handler, then sent `GET_VERSION`.
The load handler awaits `register()`, so that probe could precede the actual legacy
`SKIP_WAITING`. An unsafe worker could therefore pass before activation was requested.
The cache version string also did not identify the controller object or the waiting state.

The corrected test wraps the page's native `ServiceWorker.postMessage` while executing the
exact pinned legacy standalone bootstrap. It forwards the original message and arguments,
then sends a probe **only when that bootstrap actually sends `SKIP_WAITING` to the captured
waiting worker**. Test-origin worker instrumentation acknowledges the probe after any
`skipWaiting()` promise triggered by the preceding message settles. No production message
protocol is added. The test server wraps its served worker source; the production worker file
and pinned legacy file are unchanged by that instrumentation.

After the receipt, the test requires the captured worker to remain `installed`, the
registration's waiting worker to remain the same object, and the controller to remain the
same object. It checks both tabs against their original controller handles and retains the
document-identity and unfinished-input assertions. Closing one tab must still leave the
other tab's controller and the installed waiting worker unchanged. Natural activation is
then verified after the last legacy tab closes.

`PAYETAX_TEST_UNSAFE_PWA_WORKER=1` adds a test-server-only listener that deliberately calls
`skipWaiting()` for the legacy message. The normal test assertions stay unchanged. This
switch is used only for the negative control; the checked-in production worker remains safe.

| Original review-correction control, before the final observation amendment | Result |
| --- | --- |
| Unsafe worker, migration scenario repeated five times | 5/5 fail at the intended waiting-state assertion: expected `installed`, received `activated` |
| Safe worker, both PWA scenarios repeated five times | 10/10 pass: five migrations/offline shell checks and five quiet waiting-update checks |

The negative result is expected evidence that the test detects the defect, not a passing
production test or a waived failure. The receipt also asserts no `skipWaiting()` invocation;
the lifecycle assertions do not rely on the old version string alone.

### Final delayed-activation check

Claude's 500 ms mutation can act after the immediate receipt. The migration test now observes
the same worker for one second after that receipt, then checks both that `skipWaiting()` has
not been called and that the registration still has an `installed` waiting worker. The
observation runs in the worker context so an unsafe legacy page reload cannot destroy it.
The existing controller-identity, document and input assertions run afterward.

This is an intentional bounded negative-observation window, not a general readiness sleep.
It covers the reported 500 ms mutation; it does not prove the absence of activation delayed
arbitrarily far into the future. `PAYETAX_TEST_UNSAFE_PWA_WORKER=delayed` schedules the test-only
unsafe activation after 500 ms, with `waitUntil` keeping that work alive. Mode `1` retains
the original immediate mutation. Neither mode changes the production worker file.

Final verification results and log hashes are recorded below.

## Registration changes who uses the PWA path

Fixing `lazyOnload` registration is a behaviour expansion. Visitors whose bootstrap previously
ran after `load` and never registered will now install a worker and download the offline
shell. This includes ordinary browser visitors, not just existing installed-PWA users.
Supported first-time clients can encounter service-worker document caching on later visits
where they previously used the browser network path alone.

The installation page remains uncontrolled: no `clients.claim()` or automatic reload is
used. The fresh-context browser test verifies a null controller after `ready`, then verifies
control after an ordinary reload. Registration/update checks still depend on browser support,
secure-context policy, storage availability and connectivity. This is a release-impact
consideration to review, not a claim that production registration has already changed.

## Other bounded corrections

- Shell documents and unversioned icons still use `cache: 'reload'` during installation.
  Hashed Next scripts/styles use the default HTTP-cache policy and are fetched only when
  absent from the isolated shell cache. This permits reuse of immutable browser-cache
  entries and avoids re-downloading assets already in that shell. Legacy mixed caches are
  never searched or copied. Unit tests check both policies and preservation of existing assets.
- Before the offline checks, the browser HTTP cache is cleared through CDP, both the document
  runtime cache and static runtime cache are deleted, and the test asserts that only the
  precache remains. The calculator is then reopened offline with launch parameters, accepts
  an unfinished amount, and the uncached-route offline fallback renders. A warmed runtime
  cache can no longer hide a missing shell asset.
- The waiting-worker banner is removed. There is no safe immediate-activation action in
  this slice, so repeated notices asking users to close their work provide little value.
  Updates wait quietly for normal closure. Repeated resume/reconnect checks preserve the
  invalid draft, controller and document without showing the old banner or reloading.
- Removed the no-op install/message listeners, disabled logging, waiting-banner observer
  plumbing and unused cache-match options parameter. Connectivity toasts remain. Unit mocks
  no longer simulate state-change listeners that the bootstrap does not use.

Safe legacy waiting, cache isolation, failed-install retention, current input/storage
behaviour and offline support are retained. Build identity and live production freshness
remain separate follow-up PRs; no indicator here claims the document is current production.

Future build SHAs must **not automatically change service-worker cache names**. Build
identification and cache compatibility are separate concerns. Keep the existing cache schema
unless an explicit compatibility or invalidation requirement calls for changing it; immutable
Next asset URLs already carry their content identity. This clarification is also recorded in
the worker header, backlog and initial delivery plan. No build identity or freshness feature
is implemented in this finalisation.

## Verification and reproducibility

Local environment: Windows, Bun 1.4.3, Node 24.18.0, Playwright 1.61.1 Chromium, existing
installed dependencies. Browser plugin unavailable; Playwright used. Desktop 1440×1000 and
mobile-sized 393×852 viewports. Physical iOS/Android and WebKit lifecycle remain unverified.

The flow under test is: leave amounts unfinished in two legacy tabs -> receive the actual
legacy activation request -> retain the same installed waiting worker/controllers/documents
and drafts -> close both tabs normally -> activate -> clear HTTP and runtime caches ->
reopen calculator and fallback offline. The second flow verifies first registration and
quiet repeated update checks with an invalid unfinished amount.

Verification uses the same Windows Jest glob workaround as the initial report. The focused
command covers the worker, bootstrap, PWA assets and Next headers:

```powershell
bun --no-env-file run test:no-coverage --runInBand --roots src --runTestsByPath src/lib/__tests__/registerSw.test.ts src/lib/__tests__/serviceWorker.test.ts src/lib/__tests__/pwaAssets.test.ts src/app/__tests__/next-config.test.ts --testMatch '**/src/**/__tests__/**/*.test.ts'
```

For repeated controls, a local production server at `http://localhost:3100` is reused through
an ignored temporary config importing `playwright.config.ts`, with absolute test/output/setup
paths, `webServer: undefined`, one worker and zero retries. This changes no shipped config.
The supported `bun --no-env-file run test:e2e:pwa --reporter=line` also builds/starts its own
production server and exercises the normal configuration.

```powershell
$env:PAYETAX_TEST_UNSAFE_PWA_WORKER = '1'
bun --no-env-file x playwright test --config audit-outputs/pwa-review.config.ts e2e/pwa-upgrade.spec.ts --project chromium --workers 1 --grep 'v5.1.4 cached standalone' --repeat-each 5 --retries 0 --output audit-outputs/pwa-review-unsafe
Remove-Item Env:PAYETAX_TEST_UNSAFE_PWA_WORKER
bun --no-env-file x playwright test --config audit-outputs/pwa-review.config.ts e2e/pwa-upgrade.spec.ts --project chromium --workers 1 --repeat-each 5 --retries 0 --output audit-outputs/pwa-review-safe
```

The unsafe command must exit nonzero, and each repetition must fail at the installed-state
assertion; a timeout or unrelated error is not the recorded negative-control result.

To reproduce without the temporary reuse config, run the supported `test:e2e:pwa` command
with the same `--grep`, `--repeat-each`, `--retries` and `--reporter=line` options, first with
the unsafe flag and then without it. Stop any server already using port 3100 before doing so.

No dependency, workflow, branch-protection,
secret or calculation-rule changes are included. The earlier full-unit count is historical,
not a fresh full-suite run for these corrections.

### Check results before the final observation amendment

| Check | Result |
| --- | --- |
| Focused Jest, four affected suites | PASS: 60 tests |
| `bun --no-env-file run check:repo` | PASS, including application/test types and repository guards |
| Production build through the supported PWA command | PASS |
| `bun --no-env-file run test:e2e:pwa --reporter=line`, normal build/server config | PASS: 2/2 tests, 30.9 seconds |
| Safe PWA controls, five repeats, zero retries | PASS: 10/10 tests, 45.4 seconds |
| Deliberately unsafe worker, five repeats, zero retries | EXPECTED FAIL: 5/5 at `installed` versus `activated`, no unrelated failures |
| Existing smoke/homepage/calculator/Director/payslip browser slice | PASS: 57/57, 4.0 minutes, one worker, zero retries |
| `git diff --check` | PASS |

The initial development browser run timed out at an added `networkidle` wait after the
migration assertions had passed. That unnecessary readiness condition was removed. The
cache clearing and actual offline calculator/fallback assertions then passed in every safe
repeat. No timeout extension, automatic retry or skip was added.

The version warning still reports `5.1.4` unchanged since the last tag. It is not evidence
of production freshness. Existing Sentry/useCache deprecations and terminal-colour warnings
remain unrelated. The declared CI Bun 1.3.13 runtime is not the locally tested Bun runtime.

### Raw-log provenance

Full logs stay in ignored `audit-outputs/`; the results above preserve their useful summary.
SHA-256 hashes identify the original local files without treating local output as hosted CI:

```text
pwa-review-unsafe.log      0feb23c503f8d528512de3b8cea7e96cae6d061444c5de42518f6b75a467f5aa
pwa-review-safe.log        ec6226495455259eb096439a68abff7e58c1256b20866b9fea185d61d1e336fd
pwa-review-regression.log  be514416d1d22be361031679a47575ce90b3587cc1d9204559194652c920bc57
pwa-review-standard.log    017460d910f392e70e4f472e39ae99ad56180fe55d3f025632682c2f8f961627
```

Production and test source SHA-256 snapshots before the final observation amendment:

```text
public/sw.js              28bbbcdb844243837aa35b09dfcdff444501b2fb0df639e926d8e816cea6f5a2
public/register-sw.js     9d79559e5633d19421192d8cd5c0f15e62d6b0f8f0b90d5708cf126d4fe19de6
e2e/pwa-upgrade.spec.ts    ce77bcc0b8058dd5d7d4cc088f91244fbe03139ad253b2eafba23656ab0112f7
```

Claude's APPROVE is maintainer-reported; it does not authorise merge or deployment. These
results establish the tested local
lifecycle and offline behaviour, not production deployment, physical-device support or
production-build freshness.

### Browser evidence

| Check | Result |
| --- | --- |
| Page identity / nonblank content | Real calculator controls and existing homepage smoke pass |
| Framework error state | Absent in the inspected mobile waiting, offline calculator and offline fallback screenshots |
| Runtime / console | PWA pageerror guard and existing CSP smoke pass; offline failures for uncached resources are expected |
| Input and lifecycle interaction | Actual legacy message processed before assertions; both drafts/controllers survive; natural activation follows last closure |
| First registration | Fresh page registers via lazyOnload, stays uncontrolled until ordinary reload, then becomes controlled |
| Offline shell | HTTP and runtime caches removed before root relaunch/input acceptance and uncached-route fallback |

Screenshots from the final supported PWA run:

- [Quiet waiting update with unfinished input](pwa-upgrade-safety-review-2026-10-29/quiet-waiting-update-mobile.png)
- [Offline calculator after runtime/HTTP cache removal](pwa-upgrade-safety-review-2026-10-29/offline-calculator.png)
- [Offline fallback after runtime/HTTP cache removal](pwa-upgrade-safety-review-2026-10-29/offline-fallback.png)

The brief connectivity toast is retained; it is separate from the removed update banner.
Existing Offline page copy overclaims remain with backlog O1–O3. The screenshots prove
rendering and input behaviour, not those promises or every tool's complete offline flow.

## Finalisation after maintainer-reported Claude APPROVE

The last amendment adds only the one-second worker observation and the test-only 500 ms
mutation mode, plus the cache-naming clarification. The approved registration/cache/input
safety behaviour is retained. No build-identification or freshness feature was added.

| Fresh final check | Result |
| --- | --- |
| Focused Jest, four affected suites | PASS: 60 tests |
| `bun --no-env-file run check:repo` | PASS |
| Production build and supported `test:e2e:pwa --reporter=line` | PASS: 2/2 browser tests, 36.3 seconds |
| Safe PWA scenarios, five repeats each, one worker, zero retries | PASS: 10/10, 48.0 seconds |
| 500 ms delayed unsafe activation, five repeats, one worker, zero retries | EXPECTED FAIL: 5/5 at the new observation assertion; `skipWaitingCalled: true`, waiting state absent rather than `installed` |
| `git diff --check` | PASS |

No delayed-control failure was a timeout, a destroyed execution context or an unrelated
error. The worker-context assertion detects the deferred activation even if the legacy
page has reloaded. The five earlier immediate-mutation failures and 57 passing browser
regressions above remain historical review evidence; they are not claimed as fresh runs
after this narrow amendment.

Reproduce the delayed negative control using the same reuse config described above:

```powershell
$env:PAYETAX_TEST_UNSAFE_PWA_WORKER = 'delayed'
bun --no-env-file x playwright test --config audit-outputs/pwa-review.config.ts e2e/pwa-upgrade.spec.ts --project chromium --workers 1 --grep 'v5.1.4 cached standalone' --repeat-each 5 --retries 0 --output audit-outputs/pwa-final-delayed
Remove-Item Env:PAYETAX_TEST_UNSAFE_PWA_WORKER
bun --no-env-file x playwright test --config audit-outputs/pwa-review.config.ts e2e/pwa-upgrade.spec.ts --project chromium --workers 1 --repeat-each 5 --retries 0 --output audit-outputs/pwa-final-safe
```

The standard command can replace the reuse-config invocation with the same extra options.
The delayed command must exit nonzero at the observation assertion; normal commands must pass.

Final raw-log SHA-256 hashes:

```text
pwa-final-standard.log  7885b5b353bc58f12dad8b8c5d764f17a01d7d9dd2710f574bb0160060470085
pwa-final-delayed.log   702b4083406ad759bc5c264a28102d43b8ec8a8e0fac5813096ba7aca53f7f54
pwa-final-safe.log      d55817b72e8ff85349a3a491b1af696e85bb95215c7ac2a2e5ae196a23665a12
```

Final source SHA-256 snapshots:

```text
public/sw.js            35f79a3eab12dec46ce425439d8872d53b1e613aea00d8d6a23620d26a8d2baf
public/register-sw.js   9d79559e5633d19421192d8cd5c0f15e62d6b0f8f0b90d5708cf126d4fe19de6
e2e/pwa-upgrade.spec.ts  2cd475f011d87dc17b354412945aa0e5fbaf2018a0031ccb0e7aa0f2b300ed1d
```

The three linked screenshots were refreshed from the final supported-command run and are
included with this report in the local completion commit. Approval provenance remains the
maintainer's message; no separate final-amendment review, hosted CI, push, merge, deployment
or live freshness verification is claimed.
