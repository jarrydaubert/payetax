# Calculator Sentry grouping verification

4 November 2026. Codex implementation from freshly fetched main
`2063dc70c6fd0bcba0a7478bc7556c2da1685ca0`, package 5.2.10.
This is a patch maintenance fix. No UI, arithmetic, validation, result, provider
setting, workflow, dependency or branch-protection changes.

## Assessment and implementation

On the base, `captureCalculatorError` gave both anomaly warnings and unrelated
exceptions `['calculator-error', stage]`. A warning-first group could therefore
absorb a later error without matching the recorded first-seen/error-level native
Linear alert. The recently merged Director capture also used a stage-only
override. That helper's safe fixed message/type/frames and monitoring-failure
isolation remain intact; only its fingerprint override is removed.

The anomaly producer now calls a dedicated warning helper. It filters against
the four existing technical anomaly codes, deduplicates and sorts them, then
joins them with commas as the third fingerprint element. No fields, values,
derivatives, message text or input hashes are accepted as grouping components.
Unsupported stages and empty/unsupported-only code sets produce no event. Four
codes give at most 15 non-empty code sets per fixed stage (45 anomaly groups
across the three stages). Existing detection, breadcrumbs and analytics remain
unchanged. Calculator exception helpers omit the override and retain stage context.
Primary PAYE and Director paths use those helpers; previous-year/what-if exceptions
retain their existing caller/global-handler paths without newly attached stage context.
The direct-helper tests of those stages establish helper behaviour, not new capture paths.

## Executable evidence

`src/store/__tests__/calculatorStore.sentryEnvelope.test.ts` uses the installed
Sentry browser SDK with the production instrumentation configuration; only
network delivery is replaced by an in-memory transport. It asserts:

- All three PAYE stages retain warning severity and the required anomaly
  fingerprint, distinct from exceptions with no fingerprint override.
- A TypeError and RangeError with the same message retain different types,
  non-empty stacks and distinct named stack frames. Those are default-grouping
  inputs; this does **not** claim observed distinct server-side group IDs.
- Reversed/duplicated codes yield the same sorted fingerprint; unsupported
  strings, numbers, objects, null, empty sets and an unsupported stage cannot
  enter grouping or leak into outbound payloads.
- The actual primary, previous-year and what-if store producers emit the expected
  warning groups and preserve the returned result references.
- Financial/query/fragment and unsupported-grouping canaries stay absent from
  complete envelopes; only event envelopes are sent, without user/extra data.

Existing Director real-envelope regressions retain fixed safe diagnostics,
handled-error behaviour, message/query canary removal and repeated-attempt
capture. Their grouping expectation now requires an absent override. Existing
anomaly-detection and privacy regressions remain unchanged.

Local environment: Windows PowerShell, Bun 1.4.3, Node 24.18.0. CI retains pinned
Bun 1.3.13. No environment/credential files were copied into the worktree.

| Command | Result |
| --- | --- |
| `bun --no-env-file install --frozen-lockfile` | PASS; lockfile unchanged |
| `bun --no-env-file run test:no-coverage --runInBand --runTestsByPath src/store/__tests__/calculatorStore.sentryEnvelope.test.ts src/store/__tests__/directorGuideStore.sentryEnvelope.test.ts src/store/__tests__/calculatorStore.anomalyDetection.test.ts src/lib/__tests__/telemetryPrivacy.test.ts` | PASS: 4 suites, 42 tests |
| `bun --no-env-file run check:repo` | PASS: lint, production/test typechecks and repository contracts |
| `bun --no-env-file run check-version --base origin/main` | PASS: patch 5.2.9 → 5.2.10 |
| `bun --no-env-file run test:no-coverage --maxWorkers=2` | PASS: 263 suites, 4,672 tests |
| `bun --no-env-file run build:ci` | PASS: compiled, typechecked, generated 64 pages; existing Next.js `experimental.useCache` deprecation warning |
| `git diff --check` | PASS |
| `bun --no-env-file run check:secrets` (staged tree, Gitleaks 8.30.1) | PASS |

Fresh-context Claude CLI review: [request](review-request.md), [verbatim verdict](claude-review.md).
Claude approved the code with limitations and requested evidence/documentation corrections:

- F1: the reviewer inspected the evidence directory before this report was written.
  Full command/results/ref evidence and the captured review are now committed here.
- F2: Operations now explicitly names new error-level PAYE **and Director** groups
  as potential one-time native ticket sources; warnings do not match the recorded rule.
- F3: clarified helper tests versus production paths. No new secondary-stage catches
  or behavioural changes are introduced in this grouping slice.
- F4: corrected the remaining Director test comment about default grouping inputs.

No runtime fixes were requested. A read-only Claude re-review of these corrections
is recorded alongside the initial review. The reviewer did not rerun checks; the
commands above are implementer-run evidence, not independent execution claims.
The [re-review](claude-re-review.md) approves F1–F4 with limitations. Its R1 noted
that its own redirected output file was empty while the review was running; the
completed verdict is now captured in that file. R2's cosmetic line wrapping is
corrected. No remaining code findings or deferred implementation changes.

## External acceptance and rollout

[JGF-5](https://linear.app/jgf-projects/issue/JGF-5) retains live ingestion,
release/environment labels, source-map symbolication and native diagnostic
link/resolution verification. Local envelopes do not establish those outcomes,
provider alert configuration or distinct live Sentry group IDs.

Warnings stay warnings. Before deployment, JGF-5 owns the explicit decision on
whether correctness anomalies should alert and the expected one-time effects:
new anomaly code-set groups remain below the recorded error-level alert threshold;
restored default PAYE and Director error groups can create new native Linear
tickets under the existing rule. Fingerprint changes do not
migrate old groups, resolutions or Linear links. Do not recreate existing linked
tickets. Preserve the native integration; no webhook or in-app Linear key.

No live events, provider-setting changes, merge or deployment were performed.
Merge and deployment each require explicit approval. Use a `Related to` PR link
and retain manual issue status: team closure automation remains unverified.
