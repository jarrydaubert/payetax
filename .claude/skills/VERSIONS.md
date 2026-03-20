# PayeTax Skills Versions

Canonical inventory for PayeTax skills, with clear separation between upstream (vanilla) content and PayeTax customization.

## Upstream Sources

Skills and tools are primarily sourced from [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills), with selected engineering and UI workflow skills adapted from [mattpocock/skills](https://github.com/mattpocock/skills) and Anthropic's Claude Code skills. Use this file when syncing or auditing drift.

## Separation of Concerns

### 1) Marketing Upstream Layer (coreyhaines31/marketingskills)
- Marketing/CRO/SEO baseline methodology synced from upstream.
- `references/` and `.claude/tools/` are upstream-first assets for that set.

### 2) Engineering + UI Workflow Upstream Layer
- Engineering workflow skills adapted from `mattpocock/skills`.
- UI/design workflow skills adapted from Anthropic Claude Code skills.

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
| ab-test-setup | 1.4.0 | 2026-03-14 |
| ad-creative | 1.4.0 | 2026-03-14 |
| ai-seo | 1.4.0 | 2026-03-14 |
| analytics-tracking | 1.4.0 | 2026-03-14 |
| churn-prevention | 1.4.0 | 2026-03-14 |
| cold-email | 1.4.0 | 2026-03-14 |
| competitor-alternatives | 1.4.0 | 2026-03-14 |
| content-strategy | 1.4.0 | 2026-03-14 |
| copy-editing | 1.4.0 | 2026-03-14 |
| copywriting | 1.4.0 | 2026-03-14 |
| email-sequence | 1.4.0 | 2026-03-14 |
| form-cro | 1.4.0 | 2026-03-14 |
| free-tool-strategy | 1.4.0 | 2026-03-14 |
| launch-strategy | 1.4.0 | 2026-03-14 |
| marketing-ideas | 1.4.0 | 2026-03-14 |
| marketing-psychology | 1.4.0 | 2026-03-14 |
| onboarding-cro | 1.4.0 | 2026-03-14 |
| page-cro | 1.4.0 | 2026-03-14 |
| popup-cro | 1.4.0 | 2026-03-14 |
| product-marketing-context | 1.4.0 | 2026-03-14 |
| programmatic-seo | 1.4.0 | 2026-03-14 |
| schema-markup | 1.4.0 | 2026-03-14 |
| seo-audit | 1.4.0 | 2026-03-14 |
| social-content | 1.4.0 | 2026-03-14 |

## PayeTax-Only Skills

| Skill | Version | Last Updated |
|-------|---------|--------------|
| accessibility | 1.1.0 | 2026-02-20 |
| engineering | 1.1.0 | 2026-03-17 |

## External-Adapted Skills (4)

Sources:
- [mattpocock/skills](https://github.com/mattpocock/skills), commit `8e51ff7`
- Anthropic Claude Code `frontend-design` skill (adapted for PayeTax)

| Skill | Version | Last Updated |
|-------|---------|--------------|
| design-an-interface | 1.0.0 | 2026-02-20 |
| frontend-design | 1.0.0 | 2026-03-16 |
| prd-to-issues | 1.0.0 | 2026-02-20 |
| tdd | 1.0.0 | 2026-02-20 |

## New Skill Alignment Standard

When adding a new upstream skill to PayeTax:
- Use `metadata.version` in frontmatter to track the pinned upstream repo release used in PayeTax installs. The sync script normalizes installed upstream skills to the current local pin.
- Add a `## PayeTax Context` section with:
  - what applies to PayeTax,
  - what does not apply by default,
  - key file paths and conversion definitions.
- Remove or correct stale references to excluded skills.
- Normalize terminology to current product naming.

## Deliberately Excluded Upstream Skills

- lead-magnets
- paid-ads
- paywall-upgrade-cro
- pricing-strategy
- referral-program
- signup-flow-cro
- revops
- sales-enablement
- site-architecture

## Recent Changes

### 2026-03-16
- Added `frontend-design` as a local adapted skill based on Anthropic's Claude Code design prompt.
- Registered the skill in the canonical inventory/docs so it is discoverable from `AGENTS.md`, the commands README, and the skills guide.
- Scoped the skill for PayeTax to favor strong visual direction while preserving calculator trust, accessibility, and performance constraints.

### 2026-03-17
- Removed overlapping slash commands `/plan` and `/test` in favor of the installed skills `design-an-interface`, `prd-to-issues`, and `tdd`.
- Verified the current upstream `marketingskills` release is still `v1.4.0`; no pin bump was required.
- Rewrote the local `engineering` skill to match the repo's real build path, current Next 16 cache guidance, and evidence-based audit standards.

### 2026-03-14
- Synced upstream marketing skills to `coreyhaines31/marketingskills` release `v1.4.0` for the existing 24-skill PayeTax profile.
- Preserved all local `## PayeTax Context` sections during sync.
- Explicitly deferred the new upstream `lead-magnets` skill pending a shipped gated-content or downloadable-resource motion.
- Kept the new upstream Composio/tooling and headless CMS docs out of the local profile because they are not evidenced in the current PayeTax stack.

### 2026-03-02
- Synced upstream marketing skills to `coreyhaines31/marketingskills` release `v1.3.0`.
- Updated all 24 upstream-synced installed skills to support `.agents/product-marketing-context.md` with `.claude/` fallback.
- Preserved all existing `## PayeTax Context` local sections during sync.
- Deferred newly added upstream skills (`site-architecture`, `sales-enablement`, `revops`) pending explicit activation.
- Added local skills-ops workflow:
  - `scripts/sync-marketing-skills.sh`
  - `scripts/apply-marketing-skill-profile.sh`
  - `scripts/validate-marketing-skills-setup.sh`
- Added `.agents` compatibility symlinks while keeping `.claude/skills/` as canonical local path.

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
