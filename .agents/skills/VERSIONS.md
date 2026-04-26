# Skills Version Tracking

Canonical source for upstream skill provenance and local inclusion policy.

## Upstream Reference

- Repository: https://github.com/coreyhaines31/marketingskills
- Version tag: `v1.9.0`
- Commit: `1bcff9fc79c64fd7886c3c7aa583f4bd63916ff2`

## Freshness Check (2026-04-26)

- Local sync metadata is stored in `.agents/skills/.sources/marketingskills.json`.
- Upstream skills at tag: 40 total
- Included upstream skills: 30
- Local-only skills: 8

## Upstream Skills Included (30/40)

`ab-test-setup`, `ad-creative`, `ai-seo`, `analytics-tracking`, `churn-prevention`, `cold-email`, `community-marketing`, `competitor-alternatives`, `competitor-profiling`, `content-strategy`, `copy-editing`, `copywriting`, `customer-research`, `directory-submissions`, `email-sequence`, `form-cro`, `free-tool-strategy`, `image`, `launch-strategy`, `marketing-ideas`, `marketing-psychology`, `onboarding-cro`, `page-cro`, `popup-cro`, `product-marketing-context`, `programmatic-seo`, `schema-markup`, `seo-audit`, `social-content`, `video`

## Upstream Skills Excluded (10)

`aso-audit`, `lead-magnets`, `paid-ads`, `paywall-upgrade-cro`, `pricing-strategy`, `referral-program`, `revops`, `sales-enablement`, `signup-flow-cro`, `site-architecture`

## Local-Only Skills (8)

`accessibility`, `codebase-cleanup-sweep`, `design-an-interface`, `engineering`, `frontend-design`, `payetax-context`, `prd-to-issues`, `tdd`

## Optimization Policy

1. Canonical skills path is `.agents/skills/` (agents-first route).
2. Shared product context lives in `.agents/product-marketing-context.md`.
3. Shared project constraints live in `.agents/skills/payetax-context/SKILL.md`.
4. Upstream marketing skills stay close to upstream; PayeTax-specific rules are centralized instead of duplicated in every synced skill.
5. `scripts/validate-marketing-skills-setup.sh` must pass after every sync/update.
6. Canonical keep/sync lists live in `.agents/skills/.profiles/` and should be edited there rather than re-hardcoded in scripts.
