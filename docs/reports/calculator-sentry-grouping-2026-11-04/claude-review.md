I approve the code changes, with limitations, but the PR isn't ready: the evidence the acceptance requires hasn't been recorded yet. I reviewed the diff and new test read-only. I didn't edit files, read env files, call providers or re-run any checks. I couldn't write the review into `claude-review.md` or the plan file because the Write tool is disabled in this session, so it's only in this reply.

## Findings

**F1 — Medium (blocks the PR): evidence missing**
`docs/reports/calculator-sentry-grouping-2026-11-04/` contains only `review-request.md` and an empty (0-byte) `claude-review.md`. Nothing records the git ref, commands run, results or limitations. Before committing, either fill that report (with this review and the full Jest, `check:repo` and `build:ci` results) or remove the empty file.

**F2 — Low–Medium: the rollout note in `docs/guides/OPERATIONS.md` leaves out Director**
- Removing `['calculator-error', 'director']` in `captureDirectorCalculationFailure` (`src/lib/sentry.ts`) also creates new error-level groups. The new paragraph only mentions "calculator exceptions" and anomalies.
- It should name Director explicitly.
- It should say that new error-level PAYE and Director exception groups will trigger the existing first-seen error-level rule, so they may create one-time Linear tickets. Anomaly warnings are warning-level and won't trigger that rule.
- The JGF-5 new-group/ticket-impact decision should cover all three.

**F3 — Low (pre-existing): the doc claims more than production does**
- Only primary-stage exceptions go through `captureCalculatorError` (`src/store/calculatorStore.ts:1129`).
- `calculatePreviousYear` (`:1138-1153`) and `calculateWhatIf` (`:1227-1262`) don't catch their errors. Those errors reach Sentry's global handlers without the stage context.
- The new envelope test calls the helper directly for all three stages, so it doesn't exercise those production paths.
- The OPERATIONS.md line "retain stage as diagnostic context" is only true for primary. Reword it, or defer a fix to a follow-up issue.

**F4 — Nit:** the comment at `src/store/__tests__/directorGuideStore.sentryEnvelope.test.ts:252` still says the two events have identical "fingerprint". The matching comment in `instrumentation-client.ts` was updated; this one wasn't.

**Observation, no action needed:** a primary-stage error that's captured and then rethrown (`calculatorStore.ts:1129-1132`) now falls into the same default group as any later capture of the same error, and Sentry's Dedupe drops a consecutive identical copy. This is probably an improvement.

## Checked and OK against the acceptance
- **Anomaly fingerprint:** `['calculator-anomaly', stage, codes]` uses only the four existing codes. Codes are matched exactly, deduplicated and sorted in a fixed, locale-independent order. The stage is checked at runtime before it's used in the message. No fields, values, messages or hashes reach the fingerprint, and the severity stays `warning`. A breadcrumb (unchanged by this PR) still sends field names like `netPay.annually` through its allowlist, but not into the fingerprint.
- **Tests use the real Sentry SDK, not identical spies:**
  - TypeError and RangeError events arrive with no fingerprint, different exception types and different stack frames.
  - All three PAYE stages are covered.
  - Code order doesn't change the fingerprint, and unsupported inputs are rejected.
  - The salary and URL canaries never appear in any envelope.
  - Only error events are sent: no sessions or transactions.
  - Store results are the same object after anomaly reporting.
- **No changes to:** alert or integration config, calculation arithmetic, or UI.
- **Version:** 5.2.9 → 5.2.10, a patch bump.

## Your Director question
- **Consistent with the acceptance:** yes. `['calculator-error', 'director']` is exactly the kind of stage-only override that forces unrelated failures into one group.
- **Privacy:** unchanged. The event is identical apart from the missing fingerprint. Grouping now depends only on the bounded built-in error type and the throw-site stack frames with the message removed.
- **Existing tests are sufficient:** they already cover the fixed message, bounded type, throw-site frames, Firefox/Safari-style frames, the fallback for stacks that can't be proven message-free, non-Error throws, canaries, and the Dedupe exemption.
- **Optional extra test:** check that two different Director throw sites or error types produce distinct types and frames.
- **Worth noting in the docs:** non-Error throws and stacks that can't be proven safe fall back to frames from the capture site, so each type of these collapses into a single group.

## Not verified
Server-side grouping IDs, ingestion, alert outcomes, Linear linking/resolution, and symbolication. I also didn't re-run full Jest, `check:repo` or `build:ci`.
