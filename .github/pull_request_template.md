## Change

Explain the concrete problem, resulting behaviour and material limitations for a public reviewer.

## Linear scope and closure

- Issue URL/key, or why this change has no existing issue:
- Relationship: Related to (relation only) / Refs or Contributes to (no merge closure) / Fixes, Closes or Resolves (whole issue).
- What remains open after merge (production/provider/search checks, or none):

<!-- For partial work or an external gate use "Related to <issue URL>"; avoid its ID in
branch/title/commits and remove conflicting closing keywords. Use "Fixes"/"Closes"/"Resolves" only when the whole issue is
satisfied and automation is verified. See docs/guides/WORK_MANAGEMENT.md. -->

## Acceptance criteria claimed

Restate the bounded criteria this PR satisfies so reviewers without Linear access can assess it.
Map each criterion to its implementation/evidence; name deferred criteria and their owner.
Do not publish private issue contents or sensitive data.

## Version

- Previous -> new `package.json` version:
- Category and reason: patch (fix/maintenance), minor (capability/tax-year support), major (breaking change), or exempt (docs/tests/CI only).
- `bun run check-version --base origin/main` result after fetching current `main`:

## Verification and independent review

Commands, pass/fail, exact refs and reviewable evidence (committed dated report or attached artifacts).
Distinguish local checks, preview, deployed behaviour and checks not run.

- Independent other-model reviewer/verdict and reviewed ref:
- Findings addressed/deferred and re-review after material fixes:
- Remaining limits/external acceptance:

For docs/CI/repo-control changes, state affected workflows/checks, branch-protection implications,
environment/secret changes and the practical safety benefit.

Independent other-model review is mandatory under AGENTS.md. Merge and deployment each require
explicit maintainer approval; publishing retains the existing release-policy approval boundary.
