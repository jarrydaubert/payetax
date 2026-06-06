# Blog Guide

Purpose: create accurate, helpful content that drives users to the calculator and builds trust.

## Core Principles

- Accuracy first. Use `src/constants/taxRates.ts` as the single source of truth.
- Explain the *why* behind the numbers, not just the results.
- Avoid fear-mongering or aggressive sales language.
- Keep posts useful even if the reader only wants an answer.
- Use UK English throughout. Avoid American spellings and terms in headings, body copy, metadata, CTAs, and image alt text.

## Content Types

- **Searchable:** answers a specific query or intent.
- **Shareable:** insight or perspective that is worth passing on.
- **Hybrid:** does both.

## Post Structure

- Clear title and intro that states the takeaway.
- Step-by-step explanation with plain-language headings.
- Examples where helpful (keep values aligned with `taxRates.ts`).
- Short FAQ section.
- Relevant CTA to the calculator or tool.

## Links

- Always include a calculator link.
- Add internal links that genuinely help the reader.
- Avoid linking to non-existent tools.

## SEO + Trust

- Use clean slugs and canonical URLs.
- Avoid hardcoded rate values in text; reference the calculator.
- Include a brief disclaimer about informational intent.
- Double-check unstable tax/news claims against current official sources before publishing or refreshing a post.

## Publishing

- Add new posts in the backlog before writing.
- Update or retire posts when tax rules change.
- Keep all work items in `docs/BACKLOG.md`.
- Use `docs/blog/IMAGE_WORKFLOW.md` for featured-image prompts and import steps.

## Reader Journey Checklist

Apply this on every new post before publish:

- Primary calculator path present: link to `/#tax-calculator` where appropriate.
- Secondary calculator path present: link to `/tools/director-guide` when relevant.
- Trust/compliance path present: link to `/compliance`.
- At least one contextual internal tool link beyond the three default links when relevant to the topic.
