# TaxInsights blog: writer and reviewer entry point

This folder owns PayeTax's editorial standards. **Read these before creating, revising or independently reviewing any TaxInsights article.** A blog PR is not done because its MDX builds or its figures check out: the writing must help a real reader understand something.

## Reading order

1. [CONTENT_PHILOSOPHY.md](CONTENT_PHILOSOPHY.md) — why TaxInsights exists and the reader promise.
2. [VOICE_AND_STYLE.md](VOICE_AND_STYLE.md) — reader, human voice, answer-first openings, five flexible formats, caveat rule, before/after examples, combined review.
3. [BLOG_GUIDE.md](BLOG_GUIDE.md) — primary sources, tax years, calculations, frontmatter, SEO, publishing and verification.
4. [IMAGE_WORKFLOW.md](IMAGE_WORKFLOW.md) and [ai-image-prompts.json](ai-image-prompts.json) — only when an image is new or being refreshed.

The repo-wide `AGENTS.md`, `docs/PROJECT_STATE.md` and `docs/BACKLOG.md` still govern priorities, evidence and review discipline. If editorial voice conflicts with statutory correctness, **statutory correctness wins**.

## Research to publication

1. **Brief the reader's question.** Name who it helps, what they'll understand, why it deserves an article and which of the five flexible formats best fits. Do not write a new post simply to pursue search volume.
2. **Research the topic and the reader's language.** Check official sources for legal claims, and inspect a few useful external explainers or genuine questions to learn where readers struggle. Competitors and community threads are writing/intent references, not tax authorities.
3. **Calculate and independently check.** Any worked PAYE scenario uses an exact supported tax year and recorded engine inputs/outputs; validate separately against independent fixtures or statutory workings. For unsupported future years, explain proposals without implying calculator support.
4. **Draft answer-first.** Open with the answer and why it matters; let subsequent sections earn their place. Use the voice guide, not a compulsory summary/table/FAQ template. Choose length to fit the question.
5. **Check relevance and presentation.** Keep material caveats near their claims, cite authoritative sources, and offer genuinely useful existing PayeTax links. Review desktop and mobile readability, especially text, tables and long headings.
6. **One independent review, two verdicts.** Accuracy **and** readability must pass. Reviewers should remove defensive filler as readily as they flag missing load-bearing qualifications.
7. **Maintainer review and publish.** The maintainer reads the intro and a middle section in the rendered page. Run the checks appropriate to the touched files, obtain exact-head independent approval and do not merge or deploy without authorisation.
8. **Learn and revisit proportionately.** Use article-level search and consented engagement data carefully, together with qualitative feedback. `blog_article_read` fires on article mount, **not completion**; site-wide scroll percentages do not prove article completion. Do not invent new tracking just to score an editorial rewrite.

## Retained responsibilities

- **Accuracy / tax years / independent evidence:** [BLOG_GUIDE.md](BLOG_GUIDE.md); never substitute style research for primary tax sources.
- **Voice / formats / editing:** [VOICE_AND_STYLE.md](VOICE_AND_STYLE.md).
- **Images / alt text / Ledger style:** [IMAGE_WORKFLOW.md](IMAGE_WORKFLOW.md).
- **Work tracking:** [../BACKLOG.md](../BACKLOG.md) holds unresolved editorial refreshes; individual posts are handled **one at a time or in small independent batches** after higher-priority correctness work. Existing search-evidence triggers still apply.
- **Quality checks:** follow [BLOG_GUIDE.md](BLOG_GUIDE.md#verification). Keep current frontmatter contracts, slug/redirect guidance, privacy safeguards and existing verification scripts.

Do not turn this guide into a growth-content production schedule. An accurate article that answers a real question is worth more than a large batch of near-identical posts.
