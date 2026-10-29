# Agent guidance review — 28 October 2026

## Scope and baseline

Fresh review against merged `main` at `6f60dc9d440d2898c9a8e29260ff36bb5492cc32`, in branch `docs/agent-guidance-review`. Reviewed root `AGENTS.md` and `CLAUDE.md`, all seven Markdown files under `.claude/commands/`, the frontend verification skill, root README, documentation policy, project-state handover, testing/operations guidance, package scripts, Jest configuration, CI, tracked configuration inventory and relevant source/test paths. This is an agent-configuration review, not a new tax, security, legal or production certification.

## Decisions and evidence

| Finding | Focused correction |
| --- | --- |
| `CLAUDE.md` deferred to `AGENTS.md` in prose and repeated the read-first rules. | Replace it with exactly `@AGENTS.md`; shared guidance lives in `AGENTS.md`. |
| Current Claude support differs from older assumptions. | Official documentation confirms direct support from v2.1.277, subject to loader/settings conditions. Retain the documented import for compatibility rather than enforce client versions or add settings/hooks/symlinks. Local `claude --version`: `2.1.308 (Claude Code)`. |
| The commands README claimed 32 installed skills, a shared `.agents/skills/` tree and a canonical guide that are not tracked. It promoted removed growth/newsletter workflows. | Replace the catalogue with the six existing commands, one checked-in frontend skill and client-loading notes. Do not restore removed infrastructure or move skills just for naming symmetry. |
| Root workflow assumed client-specific loop commands, unconditional commits and stopping a PR loop on merge. | Use bounded, client-neutral tasks; commit/push only when requested; stop for maintainer review. Explicit approval remains required separately for merge and deployment. |
| Root analytics wording excluded existing Vercel integrations. | Match the existing Vercel Web Analytics, Speed Insights and consent-based GA4 surface. No provider or consent implementation changes. |
| `/finance` embedded a fixed 2025/26 checklist and annual NI example, risking stale or period-inappropriate expectations. | Direct reviews to selected canonical policy, current official sources, payroll basis/rounding and independently derived fixtures. No replacement hardcoded rates or tax outputs. |
| `/compliance` assumed Resend/newsletters, no calculator storage/transmission, blanket consent requirements, a free-product regulatory exemption and repeated stock disclaimers. | Trace actual data flows and Brevo results email; verify legal claims with current primary guidance. Refer blog work to its existing editorial owner and retain material caveats without adding a second review loop. |
| Audit, cleanup, debug and security commands referenced removed paths/features or contradicted evidence policy. Debug suggested logging sensitive calculation inputs. | Correct the email/UI paths, remove obsolete examples and mode bans, defer evidence rules to root, use synthetic debugging and a redacted secret scan. Keep security checklist items as applicability-based investigation prompts. |
| Root and frontend skill said no focused PAYE test command existed. The test's own header documented direct Jest execution. | Document and execute the supported file-specific Jest invocation. Preserve full Jest plus golden E2E requirements for completed calculation changes. |
| Frontend skill demanded starting over after every failure and never returning blocked work. | Rerun affected checks, report blocked/unrelated failures honestly and retain direct browser interaction and completion gates. |

Official sources consulted on 28 October 2026:

- [Claude Code: project memory and AGENTS.md](https://code.claude.com/docs/en/memory): direct loading, precedence, imports, deduplication and Windows guidance. A prose pointer does not guarantee loading. The import remains a supported compatibility option even on current versions.
- [OpenAI: Codex instruction discovery](https://developers.openai.com/codex/guides/agents-md): root guidance loads directly; no second Codex contract is needed.

No repository-specific hooks, MCP configuration, shared Codex configuration or shared `.agents/skills/` catalogue appeared in the tracked-file inventory. Personal settings and credentials were not inspected or changed.

## Coordination with draft PR #146

Compared [#146](https://github.com/jarrydaubert/payetax/pull/146), head `3d13a2a2dc39d784c4e14302f6d2f3b7cf271fda`, with its `main` base. Its six-file proposal owns the TaxInsights voice standard and deferred backlog entry. Its only agent-contract edit adds Read First item 5 pointing to `docs/blog/README.md`.

This branch leaves Read First and all blog/backlog files untouched. The compliance command points at the existing blog entrypoint without copying the proposed voice rules, inventing another reviewer loop or requiring an unmerged file. The exact committed head's merge-compatibility result is recorded in the PR after a non-mutating `git merge-tree --write-tree HEAD origin/pr-146` check; neither PR is merged by this review.

## Verification

- `bun --no-env-file install --frozen-lockfile`: passed; lockfile unchanged. No local env files copied into the isolated worktree.
- `bun --no-env-file run check:repo`: passed, including lint, app/test typechecks and repository contract checks. Its tax-fact inventory is report-only, not independent statutory proof; Biome does not lint Markdown here.
- `bun --no-env-file run test:no-coverage --runTestsByPath src/lib/__tests__/taxCalculator.verification.test.ts --runInBand`: passed, 1 suite / 51 tests. Confirms argument forwarding and the focused oracle command.
- `bun --no-env-file run build:ci`: passed, including TypeScript and static generation. Existing warnings: Sentry `withSentryConfig` import deprecation and Next.js `experimental.useCache` deprecation. The version check also warns that the release version is unchanged; no release/version change belongs in this documentation PR.
- Ad hoc PowerShell reference check across the ten guidance files: all 8 local Markdown links, 78 literal repository paths and 30 `bun run` script references resolve; `CLAUDE.md` is exactly the import. Glob/convention patterns were inspected separately rather than treated as literal files. An initial check also matched optional absent middleware references; those prompts now discover middleware/proxy entrypoints instead of presuming a file exists.
- `git diff --check`: passed. Scope check confirms no changes to runtime, tax policy, fixtures, package/lockfile, CI, deployment, blog or backlog files.
- Full Jest, browser E2E and UI screenshots are not required for this documentation-only change; no application behaviour, tax policy, fixtures, dependencies, CI or deployment configuration changed.

## Independent review and limits

A separate fresh-context agent reviewed the substantive ten-file instruction diff, repository references, PR #146 overlap and current official sources. It reported no actionable findings and confirmed preservation of independent expectations, full Jest/golden checks, browser interaction, review and approval gates. It did not execute tests or a live Claude loading session. The PR records the follow-up review against the final committed ref, including this report and the middleware-discovery correction.

Loader behaviour is verified from official documentation, not a live session across every managed/user setting. Older-client coverage is a compatibility decision; this repository does not pin Claude versions. Use `/memory` or `/context` in a new Claude session to confirm local loading. Vendor dashboards, branch-protection settings and production behaviour were not audited or changed. No new rate verification or legal verdict is implied by removing stale command examples.

The maintainer explicitly accepted automatic PR previews for this branch. No deployment command, merge, auto-merge or remote settings change is authorised or performed by this work.
