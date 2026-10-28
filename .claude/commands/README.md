# PayeTax Agent Workflows

[`AGENTS.md`](../../AGENTS.md) owns repository rules for both Codex and Claude Code. These workflows add task-specific steps, not a second contract.

## Instruction loading

Codex reads the root `AGENTS.md` directly. Claude Code can read it directly from v2.1.277, but its default loader uses `CLAUDE.md` instead when one exists in the working directory or above it. PayeTax retains a one-line `CLAUDE.md` containing `@AGENTS.md` for compatibility with older clients and sessions without direct support. Maintain shared guidance only in `AGENTS.md`.

The import is intentional: a prose instruction to read another file does not load it automatically. Native Claude loading deduplicates the imported file when both instruction types are enabled. Use an import instead of a symlink for reliable Windows checkouts. In a new Claude Code session, use `/memory` or `/context` to check loaded instructions; user or managed settings can still affect loading.

Official references (checked 28 October 2026): [Claude Code memory and AGENTS.md support](https://code.claude.com/docs/en/memory), [Codex instruction discovery](https://developers.openai.com/codex/guides/agents-md).

## Checked-in commands

These Markdown commands are available in Claude Code. In Codex, read the relevant file explicitly when useful; do not assume Claude slash commands are installed there.

| Command | Workflow |
| --- | --- |
| [`/audit`](audit.md) | Evidence-led review of shipped code or a scoped target |
| [`/cleanup`](cleanup.md) | Verify duplicates, orphans and dependencies before proposing removal |
| [`/debug`](debug.md) | Reproduce, isolate and verify a bug fix |
| [`/security`](security.md) | Review scoped security controls with concrete evidence |
| [`/finance`](finance.md) | Verify tax policy and calculations against independent official evidence |
| [`/compliance`](compliance.md) | Review implemented privacy, consent, results email and public claims |

## Checked-in skill

[`verify-frontend-change`](../skills/verify-frontend-change/SKILL.md) defines browser verification for UI changes. Claude Code discovers it under `.claude/skills/`; other clients should read it explicitly as directed by `AGENTS.md`.

No shared `.agents/skills/` catalogue is checked in. Personal or plugin skills may be available in a session, but are not repository dependencies and do not authorise expanding product scope.
