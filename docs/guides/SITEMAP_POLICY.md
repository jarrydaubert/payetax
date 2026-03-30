# Sitemap Inclusion Policy

Purpose: keep sitemap entries focused on high-value, indexable pages and avoid crawl-budget noise.

## Scope

- Source: `src/app/sitemap.ts`
- Applies to salary pages, competitor pages, tool pages, blog posts/categories, scenarios, and use-case pages.

## Inclusion Rules

1. Include only canonical, indexable routes.
2. Prioritize high-intent pages by search demand and conversion potential.
3. Exclude low-value long-tail routes that dilute crawl focus.
4. Keep static/legal/support pages in sitemap only when publicly indexable and useful for users.

## Salary Pages

- Use the curated high-intent salary set (`PRIORITY_SALARIES`) rather than all generated permutations.
- Prioritize by known demand hints (`SALARY_SEARCH_VOLUME_HINT`) and keep priority bounded.
- Review list monthly and adjust based on GSC impressions/clicks and conversion signals.

## Competitor Pages

- Include a capped subset (`MAX_COMPETITOR_SLUGS_IN_SITEMAP`) to prevent index dilution.
- Prefer known high-intent competitors first (`PRIORITY_COMPETITOR_SLUGS`).
- Submit only the canonical `/alternatives/[slug]` route for included slugs.

## Quality Gates

Before adding a route family to sitemap:

- Canonical is stable and correct.
- Route is indexable (`robots`/meta not blocking).
- Content quality meets production standard.
- Internal links exist from relevant hubs.

## Review Cadence

- Monthly review artifact: `docs/reports/seo-tech/YYYY-MM.md`
- Commands:
  - `bun run seo:report:init`
  - `bun run seo:report:status`

Each monthly report should produce at least one concrete action.
