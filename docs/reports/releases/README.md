# Release Verification Reports

Store one report per shipped version using:
- `docs/reports/releases/v<version>.md`

Workflow:
1. Run `bun run release:report:init` before release validation work starts.
2. Complete checklist entries while running `docs/guides/POST_RELEASE_VALIDATION.md`.
3. Set `Deployment URL` and `Release Notes URL` to the release-notes/changelog entry that links back to the report.
4. Set `Status: COMPLETE` and ensure no unchecked items remain.
5. Run `bun run release:report:check` to enforce completion.
6. Link the report from release notes/changelog.

## Release Notes Index

### v5.1.3

- Report: [`v5.1.3.md`](./v5.1.3.md)
- Status: local release readiness in progress; production validation deferred until Vercel migration is complete.

### v5.1.0

- Report: [`v5.1.0.md`](./v5.1.0.md)
