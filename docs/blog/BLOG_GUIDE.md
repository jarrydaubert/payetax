# Blog Guide

Purpose: help agents publish and refresh PayeTax blog content that is accurate, calm, useful, and visually consistent.

The blog is a public trust surface for the calculator. Treat every tax claim, deadline, rate, threshold, and image as part of that trust.

## Canonical Files

- Posts live in `content/blog/*.mdx`.
- Slug is the filename unless a post has explicit legacy frontmatter for SEO.
- Frontmatter is validated by `BlogFrontmatterSchema` in `src/lib/validation.ts`.
- Category data lives in `src/config/blog.config.ts`.
- Visual category styling currently lives in `src/constants/blogCategories.ts`; keep it aligned with `src/config/blog.config.ts` until the two sources are consolidated.
- Featured images live in `public/images/blog/`.
- Image workflow and prompt rules live in `docs/blog/IMAGE_WORKFLOW.md` and `docs/blog/ai-image-prompts.json`.
- Open content work belongs in `docs/BACKLOG.md`, a GitHub issue, or the pull request description. Do not leave loose future-work notes in evergreen docs.

## Editorial Position

- Write as `TaxInsights by PayeTax`: plain, practical, and source-backed.
- Help the reader understand what changed, why it matters, and what to check next.
- Prefer calm precision over urgency. Do not use fear-mongering, exaggerated savings claims, or aggressive sales language.
- Use UK English in frontmatter, headings, body copy, CTAs, image alt text, and generated image prompts.
- Be honest about calculator scope. PayeTax is a PAYE and director calculator, not a full Self Assessment, accounting, or regulated financial-advice product.

## Source Hierarchy

Use this hierarchy whenever publishing or refreshing content:

1. `src/constants/taxRates.ts` for tax-rate values supported by the calculator.
2. Official primary sources for rules and dates:
   - GOV.UK Income Tax: `https://www.gov.uk/income-tax-rates`
   - GOV.UK Scottish Income Tax: `https://www.gov.uk/scottish-income-tax/how-it-works`
   - GOV.UK National Insurance: `https://www.gov.uk/national-insurance-rates-letters`
   - GOV.UK student loan repayments: `https://www.gov.uk/repaying-your-student-loan/what-you-pay`
   - GOV.UK Self Assessment deadlines: `https://www.gov.uk/self-assessment-tax-returns/deadlines`
   - GOV.UK Making Tax Digital for Income Tax: `https://www.gov.uk/guidance/sign-up-for-making-tax-digital-for-income-tax`
   - Companies House guidance for company-formation claims.
   - Student Loans Company or GOV.UK guidance for student-loan claims.
   - Scottish Government sources for Scottish tax policy where GOV.UK has not yet mirrored the detail.
3. HMRC manuals, legislation, or policy papers for specialist claims.
4. Reputable secondary sources only for context, never as the sole source for a tax rule, date, rate, or obligation.

If official sources disagree, stop and document the conflict in the PR or issue. Do not guess.

## Tax-Year Discipline

- Use exact tax years, for example `2026/27` or `2026 to 2027`, instead of relying on "this year".
- Use absolute dates for deadlines and policy starts.
- Do not publish "latest", "current", "now", or "from today" claims without checking official sources during the current work session.
- Do not silently convert a 2025 or 2025/26 article into a 2026/27 article if the slug, examples, and links still imply the old year. Either refresh the whole post or leave a clear scope.
- Keep `publishedAt` as the original publication date.
- Set or update `updatedAt` when a post receives a meaningful factual, rate, deadline, or policy refresh.

## Hardcoded Numbers

The house rule is conservative:

- Avoid hardcoded tax-rate and threshold values in prose when the calculator can carry the answer.
- Hardcoded values are allowed only when they are the subject of the article, source-checked, and necessary for clarity.
- Any worked example must be recalculated against `src/constants/taxRates.ts` or the app calculator before publication.
- Never copy a worked example forward from a previous tax year without recalculating it.
- Avoid "save thousands", "free money", or similar claims unless the exact assumptions are visible and sourced.

## Frontmatter

Required fields:

- `title`
- `description`
- `excerpt`
- `publishedAt`
- `category`

Expected fields for public posts:

- `seoTitle`
- `updatedAt` when refreshed
- `featured`
- `tags`
- `image`
- `imageAlt`

Frontmatter guidance:

- Titles should state the topic plainly and include the tax year only when it is genuinely part of the search intent.
- Descriptions should be useful summaries, not keyword stuffing.
- Excerpts should avoid stale claims such as "new", "latest", or "this January" unless the date context is explicit.
- `imageAlt` should describe the image content, not repeat the title. Example: "Tax forms, calendar, calculator, and coins on a warm paper desk".
- Keep canonical URLs only where the existing post already uses them or the SEO route needs explicit preservation.

## Slugs And Redirects

- Prefer stable slugs for existing posts, even when the title is refreshed.
- Do not rename a published post file just to replace `2025` in the slug unless the work also adds a redirect and checks internal links.
- For new evergreen posts, avoid year-specific slugs unless the post is intentionally tax-year-specific.
- If a stale slug is retained for SEO, make the title, metadata, and intro clear about the current tax year.

## Post Structure

Use this default structure unless the article has a better natural shape:

1. Clear intro with the current takeaway.
2. Short summary for the reader who wants the answer.
3. Plain-language explanation of the rules or decision.
4. Worked example only when it adds clarity and has been recalculated.
5. Reader action section linking to the calculator or relevant tool.
6. Short FAQ for search intent and common misunderstandings.
7. Informational disclaimer.

## Reader Journey

Apply this before publishing or refreshing every post:

- Primary calculator path present: link to `/#tax-calculator` where appropriate.
- Secondary calculator path present: link to `/tools/director-guide` when relevant.
- Trust/compliance path present: link to `/compliance`.
- At least one contextual internal tool or article link when it genuinely helps.
- Do not link to tools, features, or future products that do not exist.

## Refresh Workflow

Use this workflow for audits, tax-year refreshes, or consistency passes:

1. Inventory the posts being touched and classify each as `keep`, `refresh`, `rewrite`, `merge`, or `retire`.
2. Check frontmatter, slug/date alignment, current tax year, image path, and links.
3. Source-check unstable claims against the hierarchy above.
4. Compare calculator-linked examples with `src/constants/taxRates.ts` or the running calculator.
5. Update prose, examples, metadata, disclaimer, and internal links together.
6. Regenerate the featured image if the post image does not match the Ledger style in `docs/blog/IMAGE_WORKFLOW.md`.
7. Update `updatedAt` only for meaningful factual refreshes.
8. Record large refresh batches in `docs/BACKLOG.md`, a GitHub issue, or the PR description.

## Accuracy Checklist

Before a content PR is ready:

- Current tax year and absolute dates are correct.
- Official sources were checked during the work session for unstable claims.
- Examples match the calculator or `src/constants/taxRates.ts`.
- No unsupported provider, product, security, production-status, or usage claims were introduced.
- UK English is used throughout.
- The article does not overpromise savings, certainty, or personalised advice.
- The disclaimer is present and proportionate.
- The image path exists, the image is 1600x1000, and the `imageAlt` is accurate.

## Verification

For docs-only changes, run the smallest relevant checks.

For post or image changes, prefer:

```bash
bun run check:repo
bun run build:ci
```

When touching blog rendering, category behaviour, image paths, or MDX components, also inspect:

- `/blog`
- one category page
- at least one changed post

Use local visual inspection when practical. The build catches MDX and route-generation failures, but it will not tell you whether a post reads well or whether a generated image feels off-brand.
