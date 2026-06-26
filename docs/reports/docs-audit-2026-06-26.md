# Documentation Usefulness And Evergreen Audit - 2026-06-26

## Scope

Reviewed repository-owned documentation and scanned public blog content for staleness signals:

- Root docs: `README.md`, `AGENTS.md`, `CLAUDE.md`.
- Evergreen docs: `docs/business/*`, `docs/guides/*`, `docs/blog/*`.
- Working queue: `docs/BACKLOG.md`.
- Historical evidence: `docs/reports/*`.
- Public content scan: `content/blog/*`.

This audit did not re-fact-check every public tax article against current HMRC guidance. Public blog posts are tax-year-specific content and need a separate editorial/tax accuracy pass when rates, deadlines, or policy change.

## Summary

The docs are useful overall: they explain the project boundary, quality standard, testing layers, operations, API controls, Sentry scope, and product direction without much fluff.

The main evergreen risks found were:

- Active command docs still pointed contributors at generic `bun run build` after the CI/source-map split.
- `docs/BACKLOG.md` mixed future work with closed-work history.
- There was no explicit docs policy explaining where evergreen guidance ends and dated evidence begins.
- Release reports were correctly historical but not labelled as such.
- Public blog content has many tax-year-specific claims; that is expected, but it should stay under a separate refresh/retirement discipline.

## Changes Made

- Added `docs/README.md` as the documentation map and evergreen policy.
- Added `docs/reports/README.md` to mark reports as dated evidence, not evergreen guidance.
- Updated active command docs to use `bun run build:ci` for local/PR proof and reserve `bun run build:release` for Sentry-source-map release validation.
- Left Vercel production guidance on `bun run build`, because that remains the intended production build command.
- Removed closed-work summaries from `docs/BACKLOG.md`.
- Aligned blog workflow guidance with the backlog/issue/PR policy.
- Consolidated Vercel, environment, release, and post-release guidance into `docs/guides/OPERATIONS.md`.
- Consolidated API hardening, bot mitigation, and rate-limit verification into `docs/guides/API_AND_ABUSE_CONTROLS.md`.
- Retired duplicate or low-use process/status docs: `docs/business/STATE_OF_PLAY.md`, `docs/guides/KANBAN.md`, `docs/guides/SKILLS_AND_COMMANDS.md`, and the incomplete `docs/reports/releases/v5.1.3.md` report.

## Evergreen Policy

Going forward:

- Keep stable policy in `README.md`, `AGENTS.md`, and `docs/guides/*`.
- Keep strategy in `docs/business/PRODUCT_DIRECTION.md`.
- Keep active or parked future work in `docs/BACKLOG.md`.
- Keep dated evidence in `docs/reports/*` or PR descriptions.
- Keep public blog content date-stamped and refresh or retire it when tax rules change.
- Keep testing guidance central in `docs/guides/TESTING.md`; do not split calculator, CI, and E2E strategy into separate policy docs without a concrete maintenance reason.

## Watch Items

- Public blog articles should get a separate tax-year freshness audit before the next tax-rate/content refresh.
- `docs/guides/TESTING.md` should continue avoiding exact suite counts and coverage percentages except in dated reports.

## Validation

- Filesystem-relative Markdown links were checked across 52 Markdown/MDX files.
- Active command references were scanned for stale `bun run build` usage.
