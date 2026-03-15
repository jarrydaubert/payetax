# Marketing Skills Runbook

## Purpose

Operational guide for maintaining the local marketing skills setup in `PayeTax`.

## Current Standard

1. Source repo: `https://github.com/coreyhaines31/marketingskills`
2. Canonical install path: `.claude/skills/`
3. Compatibility path for upstream skills: `.agents/skills/` (symlink to `.claude/skills/`)
4. Product context canonical path: `.claude/product-marketing-context.md`
5. Product context compatibility path: `.agents/product-marketing-context.md` (symlink)
6. Pinned tag: set in `scripts/sync-marketing-skills.sh` (`UPSTREAM_REF`)

## Normal Maintenance

```bash
scripts/sync-marketing-skills.sh --check
scripts/sync-marketing-skills.sh --sync
scripts/apply-marketing-skill-profile.sh --apply
scripts/validate-marketing-skills-setup.sh
```

## Future Version Upgrade Workflow

1. Preview a new release:

```bash
scripts/sync-marketing-skills.sh --check --tag vX.Y.Z --commit <full_commit_sha>
```

2. If acceptable, sync to that tag and re-apply profile:

```bash
scripts/sync-marketing-skills.sh --sync --tag vX.Y.Z --commit <full_commit_sha>
scripts/apply-marketing-skill-profile.sh --apply
scripts/validate-marketing-skills-setup.sh
```

3. If that version should become the default pin, update `UPSTREAM_REF` in:

- `scripts/sync-marketing-skills.sh`
- `AGENTS.md` (skills pin text)
- `.claude/skills/VERSIONS.md` (versions and recent changes)

## Local Customizations That Must Persist

1. Preserve every `## PayeTax Context` section when syncing upstream skills.
2. Keep canonical paths in `.claude/` while maintaining `.agents/` compatibility links.
3. Keep the deliberate upstream exclusions aligned with PayeTax model:

- `lead-magnets`
- `paid-ads`
- `paywall-upgrade-cro`
- `pricing-strategy`
- `referral-program`
- `signup-flow-cro`
- `revops`
- `sales-enablement`
- `site-architecture`

4. `scripts/validate-marketing-skills-setup.sh` must pass after each update.

## Fast Health Check

```bash
bun run skills:check
```

## One-Command Refresh

```bash
bun run skills:sync
```
