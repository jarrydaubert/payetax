# Work Management

## Authority and access

[Linear: PayeTax](https://linear.app/jgf-projects/project/payetax-ecec16170865) owns issue scope, priority and status. GitHub owns implementation, tests, PRs and CI. Don't duplicate work queues or PR evidence.

Start from the assigned issue and code. [AGENTS.md](../../AGENTS.md) defines risk tiers; consult [testing](TESTING.md) and [operations](OPERATIONS.md) only when relevant. If Linear is unavailable and scope wasn't supplied, ask for a short outcome.

## Definition of Ready

One observable sentence describing what “done” means is enough for routine issues. Start when scope and permissions are clear; ask only about genuinely blocking decisions. No readiness checklist or separate planning document.

## Definition of Done

For implementation work: achieve the agreed outcome, run appropriate checks, obtain [risk-based review](../../AGENTS.md#pull-request-expectations) where required, and get maintainer approval to merge. The PR and CI are the record: no duplicated reports, hashes or Linear completion commentary.

Mark implementation Done after an accepted merge. Keep genuinely separate production/provider verification under its own issue (for example [JGF-5](https://linear.app/jgf-projects/issue/JGF-5)); don't hold completed code changes open for unrelated external checks. Never claim production verification based on CI.

## Correctness-critical review

Tax, financial, security and privacy changes retain source-grounded checks and Tier 1 other-model review. Check changed financial results against independent official evidence, not generated golden masters alone. Re-review after material logic/safety fixes, not cosmetic changes.

Routine Tier 2 work needs no independent model review.

## Linear states and PR relationships

- **Backlog/Todo:** not started. **In Progress:** work started. **In Review:** PR opened. **Done:** accepted merge completed and issue outcome met.
- Change status at those milestones only; agents or maintainer can do it. No periodic updates.
- Link the PR to its issue. GitHub-to-Linear automatic status changes are unverified; use manual status transitions until configured and tested, without investigating this every task.
- External acceptance stays with its existing issue owner. Don't create issues for incidental observations.

## Merge and external completion

Only the maintainer authorises merges, production deployments, provider/credential changes and historical-data deletion. [OPERATIONS.md](OPERATIONS.md) owns release verification. Remove paperwork, not checks.
