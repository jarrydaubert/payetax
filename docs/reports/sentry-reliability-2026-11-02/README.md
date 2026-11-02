# Sentry reliability verification — 2 November 2026

Base: `df62aa56` (`origin/main`, v5.2.5). Change: **patch**, v5.2.6.
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
  `beforeSend`; removing it in every environment enforces error-only monitoring. Console/DOM
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
- A non-throwing `errorHandler` keeps upload failures non-fatal and prints no raw CLI error.
  Build-plugin telemetry is disabled. Browser source maps are removed even after a failed
  upload; compiled bundles remain usable. Server maps remain under `.next/server`, not public
  assets. Failed uploads cannot provide readable production source-mapped stacks.
- The hook still awaits network work and provides **no total upload time bound**. Consolidation
  and eliminating release API work reduce amplification; they do not guarantee a deployment
  duration during an outage. Sentry 11 uses the newer `sentry` CLI adapter (installed dependency
  **0.45.0**), not the globally installed `sentry-cli` **3.8.2** / `@sentry/cli` **2.58.5**.
  Legacy retry/timeout variables were therefore not adopted speculatively.

The approximately 12-minute v5.2.5 deployment, previous approximately 50-second compilation,
and outage/502/timeout evidence are **maintainer-supplied context**, not independently rerun
benchmarks. No provider setting, stored environment value or credential was changed.
`vercel.json` disables automatic deployment only for this exact PR branch, following
[Vercel's documented Git configuration](https://vercel.com/docs/project-configuration/git-configuration#git.deploymentEnabled).
Other branches retain their existing behaviour. No merge or deployment is performed.

## Local verification

All commands run in the isolated checkout with its own output directories and existing locked
dependencies reused through a `node_modules` junction; no local secret files were copied.

| Check | Result |
| --- | --- |
| `bun run test:no-coverage --maxWorkers=2` | Final code: 259 suites / 4,642 tests passed (earlier serial run: 4,641 before adding the development-session regression). |
| Focused Sentry/config/privacy/email route suites (`--runTestsByPath`, eight suites) | Final code: 98 tests passed. |
| `bun run typecheck` and `bun run typecheck:tests` | Passed. |
| `bun run build:ci` | Passed; compilation 29.8 seconds, 64 static pages; `.next/server/instrumentation.js` now exists. Local timing is not a Vercel benchmark. |
| `node docs/reports/sentry-reliability-2026-11-02/verify-build.cjs` | Installed SDK's real hook/plugin manager resolves on successful and rejected upload stubs; suppresses all three bundle uploads/release operations; removes browser maps and retains bundles/server maps. No Sentry request or real credential is used. |
| Complete release build with the failing CLI preload below | Passed; compilation 18.6 seconds, post-compilation hook 23ms, fixed warning, 64 static pages. Zero browser `.map` files remain; server instrumentation exists. Stubbed network latency is not an outage benchmark. |
| Load emitted instrumentation and call `register()` under Node 24.18.0 | SDK client registered; environment `production`, release `payetax@5.2.6`, trace sampling 0. No DSN/event delivery was tested. |
| `bun run check:repo` | Stops at an existing Tailwind sorting error in unchanged `src/components/organisms/CalculatorContainer.tsx:446`. `git diff --quiet origin/main -- src/components/organisms/CalculatorContainer.tsx` exits 0. No unrelated code was reformatted. |
| `bun x biome check . --skip=lint/nursery/useTailwindSortedClasses` | Passed. This diagnostic run does not replace the failing normal lint gate. |
| Remaining `check:repo` commands run individually | Passed: version format, tracked environment paths, environment contract, analytics events, test skips, tax imports/facts, blog guidance and rate freshness. |
| `bun run check-version --base origin/main` | Passed: 5.2.5 → 5.2.6 (patch). |
| `bun run check:secrets` | Passed for the staged tree with Gitleaks 8.30.1. Local-only Windows binary verified against upstream release checksums (SHA-256 `d29144deff3a68aa93ced33dddf84b7fdc26070add4aa0f4513094c8332afc4e`); no global install. |

`verify-build.cjs` deliberately stubs the installed CLI SDK boundary; its "successfully uploaded"
SDK log is simulated. It does not test real network retries, credentials, Sentry ingestion or
source-map matching. It can also preload a complete production build with a synthetic token and
a failing upload stub:

```powershell
node --require ./docs/reports/sentry-reliability-2026-11-02/verify-build.cjs node_modules/next/dist/bin/next build --webpack
```

The preload sets source-map enablement and a synthetic token **only in its own process/children**.
It never writes environment files or provider configuration. Its output is verification-only.

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

Claude CLI's independent PR review is pending; local verification is not that review.
