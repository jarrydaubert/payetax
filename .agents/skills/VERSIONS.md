# Skills Version Tracking

Canonical source for upstream skill provenance and local inclusion policy.

## Upstream Reference

- Repository: https://github.com/coreyhaines31/marketingskills
- Version tag: `v1.7.0`
- Commit: `978051caf17c3aef0dafd1729aaf85cea91a4416`

## Freshness Check (2026-04-13)

- Local sync metadata is stored in `.agents/skills/.sources/marketingskills.json`.
- Upstream skills at tag: 36 total
- Included upstream skills: 26
- Local-only skills: 8

## Upstream Skills Included (26/36)

`ab-test-setup`, `ad-creative`, `ai-seo`, `analytics-tracking`, `churn-prevention`, `cold-email`, `community-marketing`, `competitor-alternatives`, `content-strategy`, `copy-editing`, `copywriting`, `customer-research`, `email-sequence`, `form-cro`, `free-tool-strategy`, `launch-strategy`, `marketing-ideas`, `marketing-psychology`, `onboarding-cro`, `page-cro`, `popup-cro`, `product-marketing-context`, `programmatic-seo`, `schema-markup`, `seo-audit`, `social-content`

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
