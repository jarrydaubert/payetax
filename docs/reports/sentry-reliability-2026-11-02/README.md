# Sentry reliability verification — 2 November 2026

Base: `df62aa56` (`origin/main`, v5.2.5). Change: **patch**, v5.2.6.
Review corrections recorded **3 November 2026** against reviewed head `b150ab22`.
Work is isolated in branch `fix/sentry-reliability`; the original checkout, its modified
`.gitignore` and untracked verification material are not part of this change.

## Findings and decision

- Installed Next.js **16.4.3**, `@sentry/nextjs` and `@sentry/bundler-plugins` **11.10.0**.
  Local Node **24.18.0**, Bun **1.4.3**; hosted CI remains pinned to Bun **1.3.13**.
  `vercel project inspect payetax` (Vercel CLI 65.9.0, read-only) confirms project
  `jgfprojects/payetax`, Node **24.x**, and build command **`bun run build`**. Sentry's installed
  Node range includes Node 24. The running production process's precise patch version was not read.
- Both instrumentation entrypoints were at the root beside `src/app`. They now live in `src/`.
  Root Node/Edge config modules remain valid imported modules. Email routes no longer initialise
  the server SDK themselves. `onRequestError` keeps the existing route gate and sanitised
  diagnostic tags/context, then delegates to `captureRequestError` for Next.js control-flow
  suppression, unhandled classification and serverless flushing.
- Sentry 11's default **`BrowserSession`** integration sends sessions independently of
  `beforeSend`. Node also defaults to **`ProcessSession`**, and its **`Http`** integration enables
  request sessions unless `sessions: false` is set. `integrations: []` only supplements defaults;
  it did not disable them at the reviewed head. The correction removes ProcessSession and replaces
  Http with the supported `sessions: false`, `spans: false`, `disableIncomingRequestSpans: true`
  configuration. Edge uses `@sentry/vercel-edge` defaults, which contain no process/request session
  producer; its filter keeps that invariant explicit. No obsolete `autoSessionTracking` option
  is used. Real SDK transports now verify error envelopes without session/transaction/replay items.
  Console/DOM
  breadcrumb restrictions, financial-data sanitisation, monitored routes, zero tracing and
  disabled replay remain. No error endpoint was added.
- `NODE_ENV=production` also describes Preview builds. The non-secret Vercel deployment label
  is now inlined for browser, Node and Edge. SDK release injection supplies the same explicit
  build release name everywhere (commit SHA on Vercel; app version fallback locally).
- The post-compilation hook is compatible: installed SDK code and [Sentry's build
  documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/build/)
  require Next.js **15.4.1+**. We retain Webpack and wide client-file coverage. Per-bundle upload
  and deletion are suppressed, followed by one post-compilation phase that processes server and
  browser directories. **This is two directory upload commands, not a single HTTP request.**
- The hook alone does **not** suppress release management in each Webpack plugin. Disabling
  release creation/finalisation **and commit association** removes those extra API operations.
  Explicit `release.name` preserves SDK injection when `release.create=false`. The trade-off is
  losing build-populated release finalisation/commit metadata; event release correlation remains.
- The reviewed head's blanket non-throwing `errorHandler` was too broad. Installed Sentry
  11.10.0 passes configuration, injection, upload and cleanup errors through that same callback,
  without an operation argument. It also catches individual `rm` failures internally. The
  correction allows only typed `SentryError` failures with a positive CLI exit code and an actual
  upload adapter stack frame from the verified `@sentry/bundler-plugins/build/{cjs,esm}/core/cli.js`
  module. Node names the frame `SentryCliAdapter.uploadSourcemaps`; Bun names it `uploadSourcemaps`.
  Unknown errors, injection failures and invalid
  plugin configuration fail closed. This is deliberately pinned to the inspected SDK/CLI shape;
  a changed/unrecognised shape fails the build rather than silently broadening the exception.
  The offline harness exercises the installed adapter, not fabricated stack frames alone.
- Diagnostics print only the known operation and numeric CLI exit code. Raw messages, stderr,
  credentials, arguments, stacks and causes are not logged by the handler. Build-plugin telemetry
  remains disabled. After the SDK hook, a separate recursive audit of `.next/static` rejects the
  build if any `.map` remains or the tree cannot be read. It runs even when the hook throws.
  A locked map may remain in failed build output, but that output is not a successful deployable
  build. Server maps remain outside public assets. Failed uploads still lose readable stacks.
- The hook still awaits network work and provides **no total upload time bound**. Consolidation
  and eliminating release API work reduce amplification; they do not guarantee a deployment
  duration during an outage. Sentry 11 uses the newer `sentry` CLI adapter (installed dependency
  **0.45.0**), not the globally installed `sentry-cli` **3.8.2** / `@sentry/cli` **2.58.5**.
  Legacy retry/timeout variables were therefore not adopted speculatively.

The approximately 12-minute v5.2.5 deployment, previous approximately 50-second compilation,
and outage/502/timeout evidence are **maintainer-supplied context**, not independently rerun
benchmarks. No provider setting, stored environment value or credential was changed.
The original `f99ca2eb` verification retained temporary Preview suppression. The maintainer
subsequently removed it at `5775fca8`; it is no longer in `vercel.json` and must not be restored
or merged to main. That Preview failed. The [3 November release investigation](../sentry-release-readiness-2026-11-03.md)
records the verified failure path, the focused repair and current validation boundaries.
Production deployment and merge remain unauthorised.

## CI evidence and correction

The earlier inference that `check:repo` fails on main was incorrect and is withdrawn. Equality of
one source file with main did not establish main's check result. The isolated Windows checkout,
using a `node_modules` junction, produced a Tailwind sorting diagnostic at
`CalculatorContainer.tsx:446`; it continues to do so locally. The reason it differs from the
passing checks is **not proven**. No source reformat or lint-rule suppression is included.

GitHub independently records **passing** checks for reviewed head
`b150ab2236b81ea0023e85432ce042f3fc8e4f9b`:

- [Required CI](https://github.com/jarrydaubert/payetax/actions/runs/41490162012/job/125430781090):
  repo checks, tests, dependency audit and build all succeeded.
- [Critical E2E](https://github.com/jarrydaubert/payetax/actions/runs/41490162012/job/125430780229):
  succeeded (the job remains non-blocking by repository policy).
- [CodeQL](https://github.com/jarrydaubert/payetax/actions/runs/41490161832): succeeded.

Those results certify the reviewed head; they are not substituted for checks on the correction.

## Local verification

All commands run in the isolated checkout with its own output directories and existing locked
dependencies reused through a `node_modules` junction; no local secret files were copied.
The table's "Correction" results refer to **f99ca2eb**. The subsequent Vercel/Bun repair and
its fresh results are recorded in the [3 November report](../sentry-release-readiness-2026-11-03.md).

| Check | Result |
| --- | --- |
| `bun run test:no-coverage --maxWorkers=2` | Correction: 261 suites / 4,651 tests passed. Reviewed head: 259 suites / 4,642 tests. |
| Focused build/envelope/privacy/instrumentation/diagnostic/Next-config suites (`--runTestsByPath`, six suites) | Correction: 50 tests passed. |
| `bun run typecheck` and `bun run typecheck:tests` | Passed. |
| `bun run build:ci` | Correction passed; compilation 31.2 seconds, 64 static pages; `.next/server/instrumentation.js` exists. Local timing is not a Vercel benchmark. |
| `node docs/reports/sentry-reliability-2026-11-02/verify-build.cjs` | Correction: real installed hook/plugin manager plus the production cleanup gate accept success/upload-failure cases; reject cleanup, injection, unrelated and invalid-configuration failures. Success/upload failures remove browser maps and retain bundles/server maps. No Sentry request or real credential is used. |
| Complete release build with the failing CLI preload below | Correction passed; compilation 30.9 seconds, post-compilation hook 172ms, safe exit-code warning, 64 static pages. Zero browser `.map` files remain; server instrumentation exists. Stubbed network latency is not an outage benchmark. |
| Load emitted instrumentation and call `register()` under Node 24.18.0 | SDK client registered; environment `production`, release `payetax@5.2.6`, trace sampling 0. No DSN/event delivery was tested. |
| `bun run check:repo` | Isolated Windows/junction checkout emits the sorter diagnostic above; this is not evidence of failure on main. GitHub's full repo checks passed at the reviewed head. Cause of the local discrepancy remains unproven. |
| `bun x biome check . --skip=lint/nursery/useTailwindSortedClasses` | Diagnostic run passed; does not replace the normal gate or establish the discrepancy's cause. |
| Remaining `check:repo` commands run individually | Passed: version format, tracked environment paths, environment contract, analytics events, test skips, tax imports/facts, blog guidance and rate freshness. |
| `bun run check-version --base origin/main` | Passed: 5.2.5 → 5.2.6 (patch). |
| `bun run check:secrets` | Passed for the staged tree with Gitleaks 8.30.1. Local-only Windows binary verified against upstream release checksums (SHA-256 `d29144deff3a68aa93ced33dddf84b7fdc26070add4aa0f4513094c8332afc4e`); no global install. |

`verify-build.cjs` deliberately stubs the installed CLI SDK boundary; its "successfully uploaded"
SDK log is simulated. It does not test real network retries, credentials, Sentry ingestion or
source-map matching. It now sets Vercel flags, rejects every unexpected release-management call,
and proves omitting `deploy: false` reproduces the inferred deployment call. Run it with `node`
and `bun`. `verify-cli-failure.cjs` separately uses the real installed CLI against a loopback-only
HTTP 401 fixture and verifies genuine CLI failures are recognised by both runtimes, without
Sentry requests. The build harness disables remote Google Fonts for its full-build mode.
It can also preload a complete production build with a synthetic token and
a failing upload stub:

```powershell
node --require ./docs/reports/sentry-reliability-2026-11-02/verify-build.cjs node_modules/next/dist/bin/next build --webpack
```

The preload sets source-map enablement and a synthetic token **only in its own process/children**.
It never writes environment files or provider configuration. Its output is verification-only.

`src/lib/__tests__/sentryEnvelope.test.ts` uses the real `captureRequestError` implementation
through the production hook, the real Node and Edge init/defaults, and production sanitisation.
Only init's DSN/release/transport are replaced; `captureRequestError`, event processors and
`beforeSend` are not mocked. The in-memory transport inspects the completed outgoing envelope,
including safe referer/user-agent, removal of authorization/cookie/financial/IP headers and query
canaries, and preserved error classification/context. A local ephemeral HTTP request exercises
Node's session instrumentation; an explicit flush would send request aggregates if present.
Both runtimes capture an error and emit only event items, with no process session on the scope.
This is not a live Edge-platform or provider-ingestion test.

## Exception-message assessment

`sanitizeTelemetryText` removes URL credentials/queries/fragments; it is not general financial-text
redaction. A constructed `Error('salary=73123.47')` can retain that literal. The bounded source
review found fixed calculator messages (negative salary, pension limits, missing policy/pay-date
data), validation breadcrumbs that omit values/messages, and email operational failures with
enumerated reasons. The pension schemas in `calculatorStore.ts` use fixed numeric-limit messages.
Both email routes catch malformed JSON and return a fixed 400 instead of reporting the parser's
input-bearing SyntaxError. The email provider wrapper returns an enumerated failure; routes
report the safe reason, not provider text or message subjects containing financial totals.
No credible current calculator/user-input-to-captured-message path was identified in these
producers. This is not an exhaustive proof for arbitrary dependency/runtime errors.

The [separate P3 privacy follow-up](../../BACKLOG.md#privacy-follow-ups) owns producer tracing and
safe free-text diagnostics. Any demonstrated financial-input path must block release. The real
SDK test uses a synthetic stack so ContextLines cannot quote its hardcoded test canaries;
production request headers/query/referrer still pass through the real SDK and outbound sanitizer.

## Acceptance after separate deployment approval

The P2 Observability item stays open for these live acceptance checks:

1. Confirm Preview browser/Node events are labelled `preview` and production events `production`,
   with the expected release identifier. Check Vercel system-variable exposure if labels fall back
   to `NODE_ENV`; any provider correction needs separate approval.
2. Deliver synthetic non-financial browser and Node errors on retained monitored surfaces, including
   a handled email operational failure where safely reproducible. Confirm ingestion and flushing,
   useful diagnostics, query/body/financial-data removal, and suppression on unmonitored routes.
3. Confirm no session, transaction or replay envelopes on normal navigation or error capture.
4. Inspect the approved production build's upload warning/success and map cleanup. Confirm a
   known production stack resolves to the matching source and browser `.map` assets are not served.
5. No Edge route/proxy is currently declared. Verify Edge delivery only when a real Edge consumer
   is deployed; local registration coverage is not live Edge proof.

No provider change is required for this patch. If an extended outage still makes upload latency
unacceptable, a maintainer may separately approve the existing
`PAYETAX_ENABLE_SENTRY_SOURCEMAPS=false` Vercel override, accepting missing maps while retaining
error capture. No such override or retry/timeout setting was changed here.

Claude CLI requested changes on `b150ab22`; these corrections address the supplied findings.
Fresh independent review of the corrected head remains required before merge.
