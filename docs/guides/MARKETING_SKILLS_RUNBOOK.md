# Marketing Skills Runbook

## Purpose

Operational guide for maintaining the local marketing skills setup in `PayeTax`.

## Current Standard

1. Source repo: `https://github.com/coreyhaines31/marketingskills`
2. Canonical install path: `.agents/skills/`
3. Product context path: `.agents/product-marketing-context.md`
4. Shared project constraints skill: `.agents/skills/payetax-context/SKILL.md`
5. Pinned tag: set in `scripts/sync-marketing-skills.sh` (`UPSTREAM_REF`)

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

## Local Customizations That Must Persist

These are enforced automatically during `scripts/sync-marketing-skills.sh --sync`:

1. Remove legacy `.claude` fallback wording inside synced skills.
2. Ensure skills that read `.agents/product-marketing-context.md` also load `.agents/skills/payetax-context/SKILL.md`.
3. Keep `product-marketing-context` aligned to `.agents`-only usage plus the local `payetax-context` hook.
4. Preserve PayeTax-only/local skills that are not part of the upstream marketing repo.
5. Regenerate `.agents/skills/VERSIONS.md` from the actual synced/install state.
6. Keep the deliberate upstream exclusions aligned with PayeTax model:

- `lead-magnets`
- `paid-ads`
- `paywall-upgrade-cro`
- `pricing-strategy`
- `referral-program`
- `signup-flow-cro`
- `revops`
- `sales-enablement`
- `site-architecture`

7. `scripts/validate-marketing-skills-setup.sh` must pass after each update.

## Fast Health Check

```bash
bun run skills:check
```

## One-Command Refresh

```bash
bun run skills:sync
```
