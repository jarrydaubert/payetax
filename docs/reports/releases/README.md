# Release Verification Reports

Store one report per shipped version using:
- `docs/reports/releases/v<version>.md`

Workflow:
1. Run `bun run release:report:init` before release validation work starts.
2. Complete checklist entries while running `docs/guides/POST_RELEASE_VALIDATION.md`.
3. Set `Deployment URL` and `Release Notes URL`.
4. Set `Status: COMPLETE` and ensure no unchecked items remain.
5. Run `bun run release:report:check` to enforce completion.
6. Link the report from release notes/changelog.
