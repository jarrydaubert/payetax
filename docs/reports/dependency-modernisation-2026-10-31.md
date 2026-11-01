# Dependency modernisation — v5.2.4

Completed locally on 1 November 2026 in `chore/dependency-refresh`, integrating
`origin/main` at `9961062e` (PR #158, v5.2.3). No push, PR, merge to main or deployment.
This updates the 31 October dependency evidence and corrects its scanner claim.

## Integration

- Preserved the reviewed dependency upgrades: Next 16.4.3, React 19.3.1, Sentry 11.10.0,
  Motion 14.9.0, TypeScript 7.0.2, Biome 2.6.4, Jest 30.5.2 and Playwright 1.64.1.
  Exact versions and transitive resolutions are in `package.json` and `bun.lock`.
- Reverted only the original mechanical class-sort commit before merging main (`ddce1bf5`),
  then regenerated with Biome's `useTailwindSortedClasses` rule against the merged code.
  PR #158's accessible summary-card interactions, wording, tests and exceptions are retained.
- The regenerated sort changes 552 class strings in 105 files: all token permutations in
  className/cn/cva contexts. The three apparent `tailwind-merge` differences are plain
  className attributes where no merger runs, involving the undefined `bg-ledger-grid` class.
  See [class-sort analysis](dependency-modernisation-2026-10-31/classsort-analysis.json).
- Version is 5.2.4 (patch: dependency maintenance and guard repair, no new product behaviour).
  Public version references derive from `package.json`; historical version references remain.
- Kept the existing TypeScript 6 compiler-API bridge, Biome migration and test-component
  hoists. Removed redundant capture/probe/stub scripts and screenshot inventory hashes;
  retained compact prior comparison summaries and reusable financial/class-sort checks.

## Tax-fact discrepancy

The original claim that both tax-control outputs were byte-identical at the formatted branch
tip was inaccurate. Before formatting, `verification-fixtures` counted 1,056 occurrences;
formatting reduced that to 1,054. In `src/lib/__tests__/scottishTaxVertical.test.ts`, the
personal-allowance assertion now has its `100_000` and `12_570` literals on line 158, separate
from `expect(annual.personalAllowance).toBe(` on line 157. The old scanner required a tax
keyword on the same line and missed those two literals (file count 30 -> 28).

The assertion remained executable, AST-equivalent to main, and covered by the Scottish unit
tests. Financial test coverage was not lost, but the scanner's inventory coverage was.
The scanner now supplements amount context with the enclosing call's callee, using the
existing compiler parser. It does not borrow tax words from unrelated arguments or callback
bodies. Regression tests cover wrapped/unwrapped assertions in application and fixture paths,
and reject unrelated callback context. Rechecking the actual Scottish file gives 30 -> 28 -> 30
(main / formatted with old scanner / repaired scanner), with both literals correctly classified
as `verification-fixtures`. These are inventory exceptions, not independent statutory validation.

The final strict scan has 380 baselined occurrences, zero new findings and 1,064 fixture
occurrences after main's additions and the new guard tests. No baseline or exception rule was
relaxed. The tax-import check is unchanged.

## Financial preservation

The existing deterministic [PAYE/Director grid](dependency-modernisation-2026-10-31/scripts/snapshot.ts.txt)
was run against an archive of current main `9961062e` using the baseline dependency tree, and
against the integrated dependency branch. All **6,188 results are byte-identical**:

`b6a9e708dce00b9135a5313e6b5c468d89fe7be149724a5972138934c0f4adb2` (SHA-256, both).

No financial engine/policy source changed. Thirteen changed financial test files are
AST-equivalent to main. No expected financial outputs, golden fixtures or snapshots were
regenerated or altered. Existing independent PAYE fixtures passed in the unit run; generated
golden tests remain a regression check rather than an independent correctness oracle.

## Security recheck — 1 November

The [glob advisory](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4) and
[minimatch advisory](https://github.com/advisories/GHSA-g3hv-75wg-m249) still require
glob 14.0.2+ and minimatch 11.0.1+. The npm registry reports latest glob 14.0.3 and
minimatch 11.0.3, but no compatible fixed 13.x / 9.x / 10.x releases.
Latest `jest-config`, `jest-runtime`, `@jest/reporters` (30.5.2) and
`@sentry/bundler-plugins` (11.10.0) still declare `glob ^13.0.6`; glob 13 wants minimatch
`^10.2.2`, and the remaining glob 10 consumer wants `^9.0.4`.

Forcing the fixed majors would change matching/ignore semantics and is deferred. The approved
build/test-only exceptions remain, with `lastChecked` updated to 1 November, weekly review due
8 November, and the unchanged **14 November 2026 inclusive expiry** (fail from 15 November UTC).
Audit policy, severities and fail-closed matching/expiry tests are unchanged. `audit:deps` passes
with only these two exceptions; the underlying dependency audit still reports two moderates.
Sources: [Jest manifest](https://registry.npmjs.org/jest-runtime/latest),
[Sentry bundler manifest](https://registry.npmjs.org/@sentry%2Fbundler-plugins/latest).

## Sentry 11

Checked the client/server/edge configs and installed SDK against Sentry's
[v11 migration guide](https://docs.sentry.io/platforms/javascript/migration/v10-to-v11/).
The shared `dataCollection` object matches the documented restrictive v10 baseline:
no user/cookies/bodies, filtered identity headers/query keys, and disabled AI/database/GraphQL
payload collection. Event and breadcrumb sanitisation, monitored-path filtering and actionable
errors remain. Production removes Console integration; DOM breadcrumbs remain disabled.
`tracesSampleRate: 0` is preserved with no sampler override; no Replay integration or sampling
is enabled. The SDK's default tracing integration is present as before, but sampled trace
collection remains zero. Removed APIs and the config entrypoint have already been migrated.

The strengthened configuration tests cover all three init paths, header/query restrictions,
console/UI breadcrumb rejection and zero trace/replay sampling. A focused run exposed a
pre-existing test flake: heapUsed happened to contain the salary sentinel `73123`. Fixed by
mocking process memory/uptime counters in the test; no production privacy check was weakened.
All 69 focused privacy/scope/filter tests pass. Prior local server-envelope comparison remains
recorded in the retained Sentry summary/hashes; it was not repeated as a new capture exercise.

Separate existing defect: root `instrumentation.ts` / `instrumentation-client.ts` sit outside
`src/` alongside this `src/app` application. The SDK warns, and the build does not emit
`.next/server/instrumentation.js`; API routes directly import server config. Placement and
`onRequestError` registration need their own fix. Deployed-origin client/edge capture and the
deployment Node runtime remain unverified. Installed Sentry's Node range is
`>=20.19.0 <22 || >=22.12.0 <23 || >=23.2.0`; local Node 24.18.0 is supported.

## Verification — integrated branch

Windows 11, Node 24.18.0, Bun 1.4.3; CI remains pinned to Bun 1.3.13. The prior dependency
review verified that pin accepts the unchanged lockfile with a frozen install.

| Check | Result |
| --- | --- |
| `bun install --frozen-lockfile` | pass, no lockfile changes |
| `bun run check:repo` | pass |
| `bun run check-version --base origin/main` | pass: 5.2.3 -> 5.2.4 |
| `bun run check:tax-facts:strict` | pass, zero new findings |
| `bun run test:no-coverage` | 258 suites / 4,618 tests pass |
| Focused Sentry/privacy tests after test-only counter fix | 4 suites / 69 tests pass |
| PAYE/Director comparison to current main | 6,188 identical results |
| `bun run audit:deps` | pass with two approved, unexpired exceptions |
| `bun run build:ci` | pass, source-map upload disabled |
| `bun run test:e2e:critical:ci e2e/summary-cards.spec.ts --retries=0 --reporter=line` | 123/124 pass; existing pension-help focus failure (below) |

Browser plugin unavailable; existing Playwright workflow used. Direct Chromium check at
`http://localhost:3100`: desktop 1440x1000 and mobile 390x844, £40,000 / 1257L result matches
the independent fixture (£32,322.04 annual net). All five cards and the visible explanation
remain; hover help opens and Escape dismisses it. Screenshots inspected locally, no overlay
or browser errors/warnings. No new screenshot archive committed.

Build warns about existing deprecated `experimental.useCache`; instrumentation placement is
reported above. Prior review recorded pre-existing privacy-page accessibility issues and
intermittent WebKit/mobile interaction failures; this completion does not close those backlog
items or claim fresh cross-browser certification. No deployment, source-map upload or live
Sentry delivery was attempted. Ready for independent Claude CLI review; not an unconditional release-green result.

### Critical E2E exception

The no-retry critical run passed 123/124, including all golden financial, summary-card,
consent, telemetry, PWA and remaining critical tests. The failure is
`calculator-critical.spec.ts:97`, "desktop mouse can reopen help after focus returns to its
trigger": the final Tab assertion expects `pension-type-select`, but focus remains on the
pension help trigger. Isolation reproduced it in 2/3 dependency-branch runs and **1/3 current
main runs**, using the same Chromium 156 browser against separate production builds (main
Next 16.4.1 / original dependencies, upgraded Next 16.4.3).

Both Radix versions schedule close autofocus using a zero-delay timer. The existing test can
send Tab while that teardown still has a pending trigger refocus. Waiting only for the content
to unmount was insufficient (1/5 still failed); that attempted test change was removed. No
retry, skip, timeout increase, weakened focus assertion or production workaround was retained.
The failure predates this dependency upgrade and remains a separate focus/test-timing defect.
Its presence is explicit review/release evidence, not a passing critical-suite claim.