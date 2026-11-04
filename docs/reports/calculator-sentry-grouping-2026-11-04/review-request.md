# Independent review request

Codex implementation; fresh-context Claude review required by AGENTS.md.
Base: `2063dc70` (latest fetched main, 4 November 2026).

Review the working-tree diff and new
`src/store/__tests__/calculatorStore.sentryEnvelope.test.ts`, against AGENTS.md and
the JGF-126 acceptance below. Do not edit files. Do not read environment files,
credentials, keys or tokens. No provider calls/settings, live synthetic events,
merge or deployment. Use read-only code/diff inspection; report actionable
findings with severity and locations, or approve with limitations.

Acceptance:

- Anomalies: `['calculator-anomaly', stage, stableSortedCodes]`. Only the four
  existing technical codes; sort/deduplicate. Never fields, values, financial
  derivatives, messages or hashes. Preserve warning severity.
- Exceptions: retain Sentry default grouping and safe stage metadata; remove
  stage-only overrides that force unrelated failures together.
- Real-SDK envelopes distinguish warnings from two exceptions with different
  types/stacks, verify default grouping contribution and all three PAYE stages.
  Identical template spies do not establish distinct server groups.
- Exercise deterministic ordering, unsupported grouping data and financial/query
  canary absence. Preserve calculation/validation/result behaviour, privacy,
  error-only monitoring and Director handled-error safeguards.
- Preserve current alerts/native integration. JGF-5 retains external verification
  and the pre-deployment anomaly alert/new-group/ticket-impact decision. Old
  groups, resolutions and Linear links do not migrate; no ticket recreation.
- Patch version bump and accessible evidence; no automatic issue closure.

Initial focused verification: 4 suites, 42 tests passed. Full Jest, check:repo
and build:ci results will be recorded separately. No arithmetic or UI changes.
Assess whether removing the Director stage-only override is consistent with the
exception grouping acceptance and whether the existing Director privacy tests
remain sufficient. Local envelope evidence does not prove server-side grouping
IDs, ingestion, alert outcomes, linking/resolution or symbolication.
