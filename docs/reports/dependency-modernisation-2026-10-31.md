# Dependency modernisation — 31 October 2026

Branch `chore/dependency-refresh` from `de610ada` (v5.2.2). Local commits only; nothing pushed,
merged or deployed. Supporting evidence is in
[`dependency-modernisation-2026-10-31/`](dependency-modernisation-2026-10-31/); raw logs,
screenshots and Sentry envelopes stayed in a local scratch directory and are identified by
SHA-256 in `raw-artifacts-sha256.txt`. The Sentry envelopes are not committed because they contain
the local machine name and OS details.

## Environment

- Windows 11, Node 24.18.0, Bun 1.4.3 locally. CI pins Bun 1.3.13: the final `bun.lock` stays at
  `lockfileVersion: 1` and Bun 1.3.13 accepts it with `--frozen-lockfile` without changes.
- Baseline: clean detached worktree at `de610ada`, `bun install --frozen-lockfile`.
- Playwright differs by design: baseline 1.61.1 (Chromium 149, WebKit 26.5), upgraded 1.64.1
  (Chromium 156, WebKit 27.2). Pixel and computed-style comparisons drive both servers with the
  same Chromium 149 build, so browser version is not a variable there.
- Both trees were built with `build:ci` (source-map upload disabled) and the same environment.
- Jest ran with `CI=true` (two workers), matching CI.

## Versions

| Package | From | To |
| --- | --- | --- |
| `next`, `@next/bundle-analyzer` | 16.4.1, 16.2.10 | 16.4.3 |
| `react`, `react-dom` | 19.2.7 | 19.3.1 |
| `@types/react`, `@types/react-dom` | 19.2.17, 19.2.3 | 19.3.0 |
| `@sentry/nextjs` | 10.75.2 | 11.10.0 |
| `framer-motion` | 12.42.2 | 14.9.0 |
| Radix checkbox / collapsible / dialog / label | 1.3.7 / 1.1.16 / 1.1.19 / 2.1.11 | 1.4.1 / 1.2.1 / 1.3.1 / 2.1.17 |
| Radix select / slider / slot / switch / tooltip | 2.3.3 / 1.4.3 / 1.3.0 / 1.3.3 / 1.2.12 | 2.4.1 / 1.6.1 / 1.5.0 / 1.4.1 / 1.4.1 |
| `lucide-react` | 1.25.0 | 1.66.0 |
| `shiki`, `rehype-pretty-code` | 4.3.1, 0.14.4 | 4.5.0, 0.14.5 |
| `tailwind-merge`, `zustand`, `lru-cache` | 3.6.0, 5.0.14, 11.5.2 | 3.7.0, 5.0.16, 11.5.3 |
| `typescript` | 6.0.3 | 7.0.2 |
| `@typescript/typescript6` (new) | — | 6.0.2 |
| `@biomejs/biome` | 2.4.16 | 2.6.4 |
| `jest`, `jest-environment-jsdom` | 30.4.2, 30.4.1 | 30.5.2 |
| `@testing-library/jest-dom` / `react` / `user-event` | 6.9.1 / 16.3.2 / 14.6.1 | 7.0.1 / 16.3.3 / 14.6.8 |
| `jest-axe` | 10.0.0 | 11.0.0 |
| `@playwright/test`, `@axe-core/playwright` | 1.61.1, 4.12.1 | 1.64.1, 4.14.0 |
| `knip`, `tsx`, `@types/node` | 6.27.0, 4.23.1, 26.1.1 | 6.44.1, 4.23.15, 26.6.6 |
| `@emotion/is-prop-valid` | 1.4.0 | removed (unused since Motion 13) |
| overrides `rollup` / `yaml` / `picomatch` | 4.60.2 / 2.8.3 / 4.0.4 | 4.64.8 / 2.9.1 / 4.0.7 |
| overrides `minimatch`, `brace-expansion` | 10.2.5, 5.0.12 | removed |

Held back: `zod` 4.6.6 (4.6.7 available), pinned by the existing override; changing it is reserved
for the maintainer. No major version was rolled back.

## Migrations

- **TypeScript 7** ships no JS compiler API. `scripts/tax-domain-controls.ts` (behind
  `check:tax-imports`, `check:tax-facts` and `taxDomainControls.test.ts`) now imports
  Microsoft's `@typescript/typescript6` API package, the side-by-side route documented for 7.0.
  Without it the import guard crashes and 3 of 21 guard tests fail; with it, both checks print
  output byte-identical to baseline. Next.js 16 type-checks through the `tsc` CLI
  (`experimental.useTypeScriptCli` defaults to `true`).
- **Sentry 11** removed `sendDefaultPii` and `enableLogs`, and an unset `dataCollection` now
  collects user info, cookies, all HTTP bodies and more. `SENTRY_DATA_COLLECTION` in
  `src/lib/sentryPrivacy.ts` is Sentry's documented equivalent of v10 `sendDefaultPii: false`,
  used by the client, server and edge configs. `attachStacktrace: false` keeps v10
  `captureMessage` payloads. Console breadcrumbs moved to the default Console integration, which
  is now excluded in production. `withSentryConfig` comes from `@sentry/nextjs/config`.
- **Biome 2.6**: schema migration (rule presets, `useTailwindSortedClasses`), and
  `tailwind.stylesheet` now points at `src/app/globals.css`. Without the stylesheet the sorter
  mis-ranked project theme utilities (1,036 diagnostics; 551 with it). The formatter changed 40
  test files (AST-equivalent to before). Nine test-local components were hoisted for the new
  `noComponentHookFactories` rule. No rule was disabled or downgraded.
- **Framer Motion 14**: no API changes required. Motion 13 stopped loading
  `@emotion/is-prop-valid`; every prop passed to a motion DOM element is a motion prop or valid
  DOM/ARIA attribute, so the removed dependency filtered nothing.
- **Overrides**: `minimatch` and `brace-expansion` pins forced out-of-range majors onto
  `glob@10` (wants `minimatch ^9.0.4`) and `minimatch@9` (wants `brace-expansion ^2.0.2`).
  Without the pins every consumer resolves an in-range, patched version. `rollup`, `yaml` and
  `picomatch` pins were below the minimums of Sentry 11 and knip 6.44 and were raised.

## Results

| Check | Baseline `de610ada` | Upgraded tip |
| --- | --- | --- |
| `check:repo` | pass | pass |
| `test:ci` | 258 suites / 4,605 tests pass | 258 suites / 4,606 tests pass (+1 Sentry test) |
| Coverage (stmts / branches / funcs / lines) | 94.70 / 85.53 / 86.20 / 94.70 | 94.70 / 85.53 / 86.20 / 94.70 |
| Per-file v8 coverage (275 files) | — | identical except `sentryPrivacy.ts` (+19 covered lines) |
| PAYE/Director engine snapshot (6,188 cases) | `b6a9e708…adb2` | identical |
| `check:tax-imports`, `check:tax-facts` output | — | byte-identical |
| `test:e2e:critical:ci` (Chromium) | 116 / 116 | 116 / 116, same per-spec counts, 0 flaky |
| `accessibility-wcag22.spec.ts` (Chromium) | 23 pass, 3 fail | same 3 fail with the same violations |
| WebKit / Mobile Safari / Mobile Chrome (mobile-critical specs) | 278 / 279 (1 WebKit MC-01 timeout) | run 1: 277 / 279 (Mobile Safari MC-09 ×2); run 2: 279 / 279 |
| `build:ci` | pass | pass, no warnings |
| `bun audit` / `audit:deps` | 2 moderate, fails | same 2 moderate, fails |
| `bun outdated` | — | `zod` only |

The accessibility failures (`link-in-text-block` on the dark-mode privacy page; one target under
24px) are pre-existing.

The WebKit/mobile run (three projects, two workers, no retries) is flaky locally under load on
both trees, and the failing tests differ between runs. MC-09 failed when salary-field focus timed
out after Radix select interaction (12.8s against a typical 7s), but passed 10/10 in isolation
and in the full rerun. Baseline MC-09 passed 10/10 in isolation. This is evidence against a
regression, not proof of none.

## Visual and behavioural differences

Same-browser captures of calculator, results, payslip example, tax-code decoder, Director,
about, blog, offline and 404 at 390, 768 and 1280px (27 captures; baseline re-capture noise: 0
pixels):

- Baseline vs upgraded: 0 computed-style differences on every element (80 properties each).
  Pixel differences are confined to 36 icon-sized boxes in 18 captures (at most 16×15px;
  `visual-diff-boxes.txt`) from lucide-react artwork updates, for example calendar,
  pound-sign, wallet and check-circle glyphs. lucide 1.66 also adds alias classes such as `lucide-help-circle`, which no
  CSS targets.
- Class ordering alone (pre-sort tip vs sorted): 0 pixels, 0 class-set and 0 computed-style
  differences.

The class-order commit changes 551 strings in 105 files. All are pure token permutations in
className/`cn`/`cva` contexts. `tailwind-merge` resolves 548 of them identically. The other 3
are plain `className` attributes, where no merge runs, and their only conflict involves
`bg-ledger-grid`, a class with no CSS definition.

## Sentry privacy

Both trees were built and run with `NEXT_PUBLIC_SENTRY_DSN` set to a local stub on `127.0.0.1`.
No real DSN or Sentry service was contacted, and the build made no upload requests. The same
probe posted to `/api/send-results` with a forwarded IP, cookie, bearer token, email, salary,
query string and JSON body, then loaded calculator and decoder pages.

- No envelope from either version contained any of those values, `ip_address` or `infer_ip`.
- Apart from ids, timestamps, process memory and SDK integration names, the Sentry 11 error event
  and envelope header are identical to Sentry 10 (`sentry-event-diff.txt`).
- Sentry 11 adds one server process-session "exited" envelope (release, environment and
  `Node.js` user agent only). With `tracesSampleRate: 0` no span envelopes were sent. The
  browser sent nothing on localhost in either version, so client capture was verified through
  unit tests rather than live envelopes.

## Security advisories

`GHSA-3g3m-2fjr-6pw4` (glob ≤14.0.1) and `GHSA-g3hv-75wg-m249` (minimatch <11.0.1), both
moderate and published 2026-10-30, remain. They also fail `audit:deps` on `main`. The patched
releases exist only as new majors (glob 14.0.2+, minimatch 11.0.1+, released 27–28 October).
The latest Jest (`jest-runtime`, `jest-config`, `@jest/reporters` 30.5.2) and
`@sentry/bundler-plugins` 11.10.0 still declare `glob ^13.0.6`. glob 14 changes how `ignore`
patterns starting with `/` resolve, adopts minimatch 11 matching, and changes `walk()` return
types, so forcing it would change behaviour under Jest coverage collection and Sentry source-map
globbing.

Exposure is build and test tooling only. These packages glob repository files with
developer-controlled patterns and are not in the production request path. Sentry's bundler
plugin globs only during release builds with source-map upload enabled. No allowlist entry or
threshold change was made.

## Limitations

- The `@parcel/watcher@2.6.0` install script (new via `jest-haste-map` 30.5) is blocked. It only
  builds from source when `npm_config_build_from_source=true`; the prebuilt binary loads.
- Version bump, CI Bun version, trusted dependencies, the Zod override and integration timing
  relative to PR #158 are maintainer decisions.
- Only Chromium E2E is part of CI; the WebKit/mobile run is additional local evidence.
- Vercel's Node.js runtime must be at least 20.19 for Sentry 11; not verified here.

## Independent review follow-ups (open)

Independent review requested changes without finding an introduced financial-calculation or
privacy regression. These items are recorded for this branch and are not yet resolved:

1. **Correct the tax-fact evidence.** The "byte-identical" row in Results applied only to the
   tooling commit before formatting. At the branch tip, `check:tax-facts` reports 1,054
   `verification-fixtures` exempt occurrences versus 1,056 at baseline; every other count and
   the baseline comparison are unchanged. The whole difference is in
   `src/lib/__tests__/scottishTaxVertical.test.ts`, where the Biome 2.6 reflow (AST-equivalent to
   baseline) changed the layout-sensitive occurrence count from 30 to 28. Update the row and
   evidence accordingly.
2. **Verify the deployment Node.js version** (Sentry 11 requires 20.19 or later) and Sentry's
   remaining privacy surfaces beyond the server error event probed here, for example browser
   events and sessions on a deployed origin, edge runtime events and `onRequestError` captures.
3. **Track the pre-existing Sentry instrumentation placement defect separately.** The app uses
   `src/app`, but `instrumentation.ts` and `instrumentation-client.ts` are at the repository
   root, and neither `main` nor this branch emits `.next/server/instrumentation.js`. API routes
   import `sentry.server.config` directly, so server init and `onRequestError` registration
   need their own investigation and fix outside this dependency change.

The glob/minimatch advisory exception is handled on a separate branch from `main`.
