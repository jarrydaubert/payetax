# v5.2.2 GitHub handoff

30 October 2026. The maintainer reports independent Claude **APPROVE** for PayeTax v5.2.2, including the final Director National Insurance and pension annual-allowance warning corrections. The agreed input-panel design is accepted. This final approval supersedes the earlier pending-review status and historical no-commit instructions in the verification/re-review checkpoints. The maintainer has now authorised committing the approved scope, pushing the existing feature branch and opening a PR; merge, deployment, release/tag creation and hosted-CI monitoring remain outside that authorisation.

## Scope and base audit

- Branch: `fix/input-help-v5.2.2`.
- Latest fetched `origin/main`: `208a19e27ee47661da5bfa4314a20eb91ee330f7`, identical to the implementation's base. No rebase, merge or application edits were needed.
- All 35 source/test/dependency files match `source-sha256.json` from the final review. Financial engines, rates, stores, fixtures and numerical expectations remain unchanged.
- The working tree contained only the approved implementation, tests and supporting evidence. The pre-handoff audit verified all source and evidence hashes and found no unexpected files.
- Version remains **5.2.2**, one patch increment from main's 5.2.1. The base-aware version check was run after fetching main and staging all new source files, and passed.

## Local verification

Fresh handoff checks passed: frozen-lockfile install (no changes), `bun --no-env-file run check:repo`, `bun --no-env-file run build:ci`, and `bun --no-env-file run check-version --base origin/main`.

Earlier recorded implementation verification: 4,600 unit tests, 65 smoke tests and 32 help E2E cases across four browser projects. The final Director corrections passed 124 focused unit tests, eight focused E2E cases, the production build and repository checks. The reports distinguish those runs; the broader suites were not rerun during this GitHub handoff.

- [Whole-form acceptance and evidence](verification.md)
- [Final Director corrections and accessibility evidence](re-review.md)

Physical-device gestures and real screen-reader speech/announcements remain unverified. Automated DOM, Chromium accessibility-tree and scoped axe evidence does not establish spoken behaviour in NVDA, VoiceOver or other screen readers. No speculative accessibility changes were introduced to claim compliance.

## Committed evidence bytes

Git's text attributes normalise Windows CRLF logs to LF. During staging, that exposed differences between the raw Windows byte hashes and the committed log bytes, plus trailing whitespace in captured terminal output. Only supporting evidence text was normalised to LF; terminal trailing spaces and trailing blank lines were removed. Application/test files and image bytes were not changed.

`evidence-sha256-pre-git-normalisation.json` retains the original raw artifact hashes for provenance. `evidence-sha256.json` identifies the canonical evidence bytes included in this PR, excluding itself. Both working-tree and staged Git-blob bytes were checked against the current manifest. The normalised logs preserve their commands, results and substantive output.

The existing review requests remain historical briefs, not outstanding requests to re-review unchanged code. Final Claude approval is maintainer-reported; no independent GitHub review event is being claimed. This record documents the handoff checks and authorisation, not a deployment or release.
