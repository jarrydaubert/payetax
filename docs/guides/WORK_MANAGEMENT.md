# Work Management

## Authority and access

[Linear: PayeTax](https://linear.app/jgf-projects/project/payetax-ecec16170865) in workspace **JGF Projects**, team **JGF Projects**
(key **JGF**) owns planned work, priorities, dependencies, issue-specific acceptance and progress.
GitHub owns engineering standards, this shared Ready/Done, architectural decisions, statutory
fixture provenance and independently reviewable implementation evidence.

Start with [AGENTS.md](../../AGENTS.md), [product direction](../business/PRODUCT_DIRECTION.md),
[system ownership](SYSTEM_OVERVIEW.md) and [testing](TESTING.md). If Linear is unavailable,
ask the maintainer for the issue text, acceptance criteria, dependencies and priority. Do not
infer a queue from old repository reports. Publish enough scope and evidence in each PR for
a public reviewer who cannot access Linear; exclude private or sensitive data.

## Definition of Ready

Before selecting a bounded implementation slice:

- Reconcile its problem and acceptance criteria against current code, completed PRs and
  existing issues. Historical opinions alone do not establish a defect.
- Identify affected production owners, scope/exclusions, preserved contracts and observable,
  issue-specific acceptance criteria with a proportionate verification plan.
- Resolve prerequisites and required product, statutory, legal or provider decisions.
  A bounded investigation can be ready while dependent implementation remains unready.
- For tax work, identify current primary sources, tax year, region, pay basis, rounding and
  independent expected-value derivations; see [fixture standards](TESTING.md#calculation-verification-model).
- Name an implementer and independent other-model reviewer when selecting work, agree a small
  PR boundary and record missing access/evidence.

Parked candidates require their recorded trigger and an explicit scope decision before selection.
Reassess priority and dependencies then; conditional acceptance is not an approved design.

## Definition of Done

- Every issue-specific criterion has accessible evidence under [AGENTS.md](../../AGENTS.md)
  and [TESTING.md](TESTING.md). Verify the mounted/served owner and relevant regression
  contracts, not dormant modules or test counts alone.
- Meet the mandatory other-model review contract in
  [AGENTS.md](../../AGENTS.md#pull-request-expectations), including re-review after material fixes.
- Record exact refs, commands, pass/fail, addressed/deferred findings and limits in the PR
  or a committed dated report. Evidence must not exist only in local scratch files.
  Preserve useful summaries and SHA-256 fingerprints if raw artifacts are too large or
  sensitive; never publish secrets, raw calculator inputs or personal data.
- Apply [version/release policy](OPERATIONS.md#version-policy-and-tagging), update necessary
  engineering guidance and reconcile the Linear issue against the verified outcome in the
  same slice. Grouped issues close only when all mapped concerns are accounted for.
- Keep partial or external acceptance open with its remaining owner, criteria and evidence.
  A merged PR, release tag or successful CI is not production/provider/browser verification.

Keep unrelated discoveries as named Linear follow-ups rather than expanding the slice.
Do not maintain another work queue in repository guides or copy shared standards into Linear.

## Correctness-critical review

For statutory calculations, financial guidance, security/privacy, important indexing architecture
and similarly consequential work:

> primary evidence → implementation → deterministic validation → independent other-model review
> → reconcile disagreements against primary evidence, current code and reproducible arithmetic
> → fix → re-review after material changes → separately approved merge → retain tests and dated evidence

Model agreement is not proof. Never derive statutory fixture expectations from production output,
policy objects or generated golden masters. The mandatory other-model rule also applies when the
issue omits it. Routine maintenance still requires that review, without additional ceremony.

## Linear states and PR relationships

| State | Meaning |
| --- | --- |
| Backlog | Unselected, blocked, evidence/decision-gated or parked; labels and blockers explain why. |
| Todo | Selected and Ready. |
| In Progress | The bounded work is underway. |
| In Review | Implementation and accessible evidence await independent review/re-review. |
| Done | All issue-specific acceptance, including required external checks, is evidenced. |
| Canceled / Duplicate | Preserve the reason and surviving owner; do not delete traceability. |

Put an issue ID in the branch, title or commits only when the PR satisfies the whole issue
and the intended automation is verified; then use Linear's copied branch name or
`type/jgf-123-short-scope`. For partial implementation or an external gate, use a branch/title
without its issue ID and write
`Related to https://linear.app/jgf-projects/issue/JGF-123` in the PR body. Do not place a
conflicting closing instruction in the title, description or commits.

[Linear's GitHub documentation](https://linear.app/docs/github#magic-words) distinguishes:
`Related to` / `Relates to` relation links make no status changes; `Refs` / `Contributes to`
avoid the merge transition but can trigger other mapped transitions; `Fixes` / `Closes` /
`Resolves` can apply the configured merge status. Use a closing relationship only when this
PR satisfies the whole issue and the intended automation is verified. Check the actual
relationship and issue status after linking; branch/title links, existing links or manual
relationships must not contradict the intended gate.

The JGF team's PR/commit automations are **unverified** here. No team setting is changed by this
guide. An authorised maintainer must inspect Linear **Settings → Team → Workflows & automations
→ Pull request and commit automations**, including branch overrides, and record the actual
behaviour before relying on automatic closure. A documented keyword is not evidence of the
workspace's configuration.

## Merge and external completion

Sentry delivery/symbolication, PWA freshness, search observation and provider/privacy checks
remain open until their external criteria pass. Split implementation and external verification
into linked scopes when useful; never infer Done from a merge or weaken a gate to fit automation.

Merge and deployment each need explicit maintainer approval. Provider settings, credentials,
historical-data deletion and publishing retain their existing approval boundaries.
[OPERATIONS.md](OPERATIONS.md) owns release and production evidence.
