---
name: payetax-context
description: Project-specific marketing, trust, privacy, and implementation context for PayeTax. Use before other marketing skills when work touches calculator UX, SEO, email, analytics, referrals, or launch messaging.
---

# PayeTax Context

## Scope

This skill captures constraints and defaults for the `PayeTax` project.

Use this context before applying other marketing skills when tasks involve:

1. Homepage, calculator, or conversion UX.
2. SEO, salary pages, schema, or content strategy.
3. Email, newsletter, or referral messaging.
4. Analytics and event instrumentation.
5. Launch, positioning, or audience research tied to the live product.

## Project Constraints

1. Accuracy first. Tax-related claims and examples must stay aligned with HMRC rules and the repo's source of truth.
2. Treat PayeTax as a calculator-first, privacy-first UK utility, not a generic SaaS funnel.
3. Avoid generic SaaS assumptions like free trials, upgrade paths, paid tiers, or user-account onboarding unless explicitly requested.
4. Tax Pack is planned, not live. Default to shipped flows unless the task explicitly asks about planned work.
5. Primary user trust themes are correctness, clarity, privacy, and fast answers.
6. Keep UK terminology and context. Avoid US payroll or generic global-tax framing.
7. Director Intelligence is shipped; preserve that product naming even where some technical paths still use `director-guide`.

## Product Realities

1. Main product: free UK PAYE salary/take-home-pay calculator.
2. Supporting motions: blog SEO, newsletter growth, referral/partner leads, and Director Intelligence usage.
3. Email model is split:
   - Kit for newsletter flows
   - Resend for transactional email
4. No accounts, no billing, and no paid upgrade path are assumed by default.

## Skill-Specific Guardrails

1. For `directory-submissions`, treat directory work as optional distribution support, not the default growth plan. Do not assume SaaS pricing, trials, G2 review motions, Product Hunt readiness, paid tiers, or user accounts unless the user explicitly asks for that route. Verify current directory rules, pricing, and platform claims before recommending them.
2. For `competitor-profiling`, keep competitive claims factual and sourced. Do not create persistent research folders or raw scrape archives unless the user explicitly asks for saved artifacts.
3. For `image` and `video`, prefer real PayeTax UI screenshots, tax-calendar context, and UK-specific financial imagery over generic SaaS visuals. Do not use AI-generated product UI as evidence of shipped features.
4. For `social-content`, `copywriting`, and `ad-creative`, keep tax examples conservative and source-backed. Avoid implying personalized financial advice.
5. For any marketing skill that includes benchmark percentages, platform algorithm claims, pricing, or current vendor behavior, verify against current primary sources before presenting the claim as fact.

## Source Of Truth

Consult these files before making product or marketing claims:

1. `AGENTS.md`
2. `src/constants/taxRates.ts`
3. `src/lib/taxCalculator.ts`
4. `docs/guides/SYSTEM_OVERVIEW.md`
5. `docs/BACKLOG.md`
6. `docs/guides/RESEND.md`

## Quality Gates

Before claiming work complete for code or runtime changes, run:

```bash
bun run fix-all
bun run test:no-coverage
```

For skills maintenance changes, also run:

```bash
bun run skills:review
bun run skills:check
```
