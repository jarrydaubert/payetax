# PayeTax Skills Versions

Canonical inventory for PayeTax skills, with clear separation between upstream (vanilla) content and PayeTax customization.

## Upstream Sources

Skills and tools are primarily sourced from [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills), with selected engineering workflow skills adapted from [mattpocock/skills](https://github.com/mattpocock/skills). Use this file when syncing or auditing drift.

## Separation of Concerns

### 1) Marketing Upstream Layer (coreyhaines31/marketingskills)
- Marketing/CRO/SEO baseline methodology synced from upstream.
- `references/` and `.claude/tools/` are upstream-first assets for that set.

### 2) Engineering Workflow Upstream Layer (mattpocock/skills)
- Engineering workflow skills adapted for PayeTax process/tooling.

### 3) PayeTax Custom Layer
- Every skill includes a `## PayeTax Context` section for local rules, constraints, and file paths.
- PayeTax context can override generic advice where needed (free product model, privacy constraints, HMRC-accuracy emphasis).

### 4) PayeTax-Only Skills
- `accessibility/`
- `engineering/`

## Editing Rules

- Prefer keeping upstream content intact when possible.
- Put PayeTax-specific guidance in `## PayeTax Context` rather than editing upstream methodology sections.
- If an upstream reference/tool file is edited for local correctness, log it in **Recent Changes**.
- Keep naming consistent with current product language ("Director Intelligence").

## Upstream-Synced Skills (24)

| Skill | Version | Last Updated |
|-------|---------|--------------|
| ab-test-setup | 1.2.0 | 2026-02-20 |
| ad-creative | 1.2.0 | 2026-02-20 |
| ai-seo | 1.2.0 | 2026-02-20 |
| analytics-tracking | 1.2.0 | 2026-02-20 |
| churn-prevention | 1.2.0 | 2026-02-20 |
| cold-email | 1.2.0 | 2026-02-20 |
| competitor-alternatives | 1.2.0 | 2026-02-20 |
| content-strategy | 1.2.0 | 2026-02-20 |
| copy-editing | 1.2.0 | 2026-02-20 |
| copywriting | 1.2.0 | 2026-02-20 |
| email-sequence | 1.2.0 | 2026-02-20 |
| form-cro | 1.2.0 | 2026-02-20 |
| free-tool-strategy | 1.2.0 | 2026-02-20 |
| launch-strategy | 1.2.0 | 2026-02-20 |
| marketing-ideas | 1.2.0 | 2026-02-20 |
| marketing-psychology | 1.2.0 | 2026-02-20 |
| onboarding-cro | 1.2.0 | 2026-02-20 |
| page-cro | 1.2.0 | 2026-02-20 |
| popup-cro | 1.2.0 | 2026-02-20 |
| product-marketing-context | 1.2.0 | 2026-02-20 |
| programmatic-seo | 1.2.0 | 2026-02-20 |
| schema-markup | 1.2.0 | 2026-02-20 |
| seo-audit | 1.2.0 | 2026-02-20 |
| social-content | 1.2.0 | 2026-02-20 |

## PayeTax-Only Skills

| Skill | Version | Last Updated |
|-------|---------|--------------|
| accessibility | 1.1.0 | 2026-02-20 |
| engineering | 1.0.0 | 2026-02-04 |

## External-Adapted Skills (3)

Source: [mattpocock/skills](https://github.com/mattpocock/skills), commit `8e51ff7`.

| Skill | Version | Last Updated |
|-------|---------|--------------|
| design-an-interface | 1.0.0 | 2026-02-20 |
| prd-to-issues | 1.0.0 | 2026-02-20 |
| tdd | 1.0.0 | 2026-02-20 |

## New Skill Alignment Standard

When adding a new upstream skill to PayeTax:
- Use `metadata.version` in frontmatter (match upstream convention).
- Add a `## PayeTax Context` section with:
  - what applies to PayeTax,
  - what does not apply by default,
  - key file paths and conversion definitions.
- Remove or correct stale references to excluded skills.
- Normalize terminology to current product naming.

## Deliberately Excluded Upstream Skills

- paid-ads
- paywall-upgrade-cro
- pricing-strategy
- referral-program
- signup-flow-cro

## Recent Changes

### 2026-02-20
- Synced upstream skills to v1.2.0.
- Added new skills: ad-creative, ai-seo, churn-prevention, cold-email.
- Added external-adapted engineering workflow skills: tdd, design-an-interface, prd-to-issues.
- Expanded integrations and CLI docs in `.claude/tools/`.
- Aligned all skills to include `## PayeTax Context`.
- Normalized "Director Intelligence" naming across skills and commands.
- Clarified upstream-vs-custom separation and editing rules in this file.

### 2026-02-17
- Added initial PayeTax context sections to customized skills.
- Reframed CRO/email skills for free calculator model.
