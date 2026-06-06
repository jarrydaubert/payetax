# What We Are, What We Are Not, And What We Want To Be

Owner: Product + Engineering

This document is the strategic compass for PayeTax. Use it before audits, backlog planning, product ideas, marketing work, SEO reviews, and agent skill runs.

It does not replace `docs/BACKLOG.md`. If something is open work, it belongs in the backlog. This document explains how to decide what should be there.

## Short Version

PayeTax is a UK take-home pay calculator that explains payroll reality, not just averages.

The product should become the trusted place to understand PAYE outcomes: what changed, why a payslip looks different from an estimate, and which assumptions matter. It should not become a broad personal finance app, a generic tax blog, or an AI tax adviser.

## What We Are

PayeTax is:

- A UK PAYE calculator focused on accuracy, privacy, speed, and clear user outcomes.
- A deterministic calculation product first, with explanations wrapped around the result.
- A source-backed trust utility, not a growth-hacked content farm.
- A portfolio-first product that should be impressive because it is useful, disciplined, and reliable.
- A practical guide to payroll realities: tax codes, National Insurance, student loans, pensions, salary sacrifice, Scottish tax, director pay, and timing differences.

The default user is someone trying to understand their pay, tax, or payslip without handing personal data to a sales funnel.

## What We Are Not

PayeTax is not:

- A full personal finance app.
- Payroll software.
- Regulated tax, accounting, legal, or financial advice.
- A generic SaaS funnel with calculator branding.
- A thin programmatic SEO site.
- A chatbot-first tax assistant.
- A place to publish broad tax news unless it directly improves calculator trust or user decisions.
- A paid product by default.

If an idea needs one of these identities to make sense, it is probably out of scope unless the product direction changes explicitly.

## What We Want To Be

PayeTax should become the clearest UK pay and tax explanation utility for real-world PAYE questions.

The strongest future version helps users answer:

- What will my take-home pay be?
- Why does my payslip differ from this estimate?
- What changed when my salary, tax code, pension, student loan, or region changed?
- Which assumptions are driving the result?
- What should I check before trusting a number?

The product should feel calm, credible, fast, and precise. It should earn trust through visible assumptions, source-backed explanations, tested calculations, and honest limits.

## Product Moat

The moat is payroll realism.

Most calculators estimate annual take-home pay. PayeTax should be better at explaining the messy details users actually encounter:

- cumulative and non-cumulative PAYE
- weekly, fortnightly, four-weekly, monthly, and annual pay periods
- tax code changes and emergency tax
- pension contribution methods
- salary sacrifice
- student loan timing
- Scottish tax differences
- bonus month effects
- director salary and dividend tradeoffs
- payslip variance against calculator estimates

This does not mean building every edge case at once. It means choosing work that makes the calculator more trustworthy in real payroll situations.

## Content Strategy

Content should behave like calculator support, not a separate media business.

Good PayeTax content:

- answers questions users naturally have before or after calculating
- supports calculator trust with official or primary sources
- uses UK terminology and UK spellings
- explains assumptions and limits clearly
- links back to relevant tools or calculator states
- avoids padding, keyword stuffing, and generic tax commentary

Poor PayeTax content:

- chases unrelated volume
- repeats HMRC pages without adding calculator-specific clarity
- targets broad tax terms without a matching user journey
- creates thin variants for SEO coverage
- sounds like generic SaaS marketing

The homepage and core calculator routes should own broad calculator intent. Tool pages should own distinct use cases. Blog posts should answer "why" and "how" questions that make the tools more trustworthy.

## Technology Direction

The best technology choices are the ones users can feel through accuracy, speed, resilience, and clarity.

Preferred technical posture:

- deterministic calculations at the core
- tax rates and business rules from explicit sources of truth
- small, high-signal regression tests for user-visible outcomes
- fast, accessible UI
- privacy-preserving analytics and forms
- clear module boundaries where they reduce risk
- boring infrastructure where boring is safer

Useful "cool tech" is welcome when it serves the product:

- AI can explain deterministic results, compare scenarios, or turn payroll jargon into plain English.
- AI must not be the source of tax calculations or unsupported advice.
- Automation should improve verification, content quality, observability, or release confidence.
- Visual polish should make complex pay outcomes easier to understand, not merely more decorative.

## AI And Automation Boundary

AI may narrate, summarize, compare, and help users understand calculator output.

AI must not:

- invent tax rules
- override deterministic calculations
- provide personalized regulated advice
- hide uncertainty
- replace source-backed explanations where correctness matters

When AI is used, the calculation remains deterministic and the explanation remains grounded in known inputs, visible assumptions, and checked source material.

## Decision Filter For New Work

Before adding a backlog item, running a skill audit, or planning a feature, ask:

1. Does this improve accuracy, trust, clarity, usefulness, resilience, or maintainability?
2. Does it make PayeTax better at explaining UK PAYE reality?
3. Is the target user and pain clear?
4. Can it be tested or verified without hand-waving?
5. Does it preserve privacy and avoid unnecessary data collection?
6. Is it focused enough to ship without becoming a broad platform project?

If the answer is weak, narrow the idea or leave it out.

## Skill And Audit Guidance

When using agent skills for audits or planning, apply this document as the filter.

Examples:

- SEO work should prioritize calculator intent, source-backed trust, crawl/indexing hygiene, and useful supporting content.
- CRO work should reduce confusion around inputs, assumptions, and results before adding persuasion layers.
- Copy work should sound precise, UK-native, and calm rather than hyped.
- Engineering work should protect calculation correctness, privacy, performance, accessibility, and maintainability.
- AI SEO work should reinforce real expertise and citations without pretending PayeTax is a broad tax authority.
- Content strategy should produce tool-adjacent explanations, not a generic tax publication calendar.

## Quality Bar

Better means:

- more accurate edge-case handling
- clearer assumptions
- fewer confusing flows
- faster page loads
- stronger accessibility
- cleaner route intent
- more useful source-backed explanations
- higher confidence tests
- less stale or duplicate content
- less unnecessary complexity

More is not automatically better. A smaller product that users trust beats a larger product that feels vague.

## Default Direction

When in doubt, build toward this sentence:

PayeTax is the UK take-home pay calculator that explains payroll reality.
