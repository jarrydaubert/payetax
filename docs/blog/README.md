# Blog Docs

Purpose: orient agents before they write, refresh, or visually update PayeTax blog content.

Start here, then open the specific guide for the task.

## Reading Order

1. `CONTENT_PHILOSOPHY.md` - the editorial promise and tone.
2. `BLOG_GUIDE.md` - the full authoring, refresh, source-checking, frontmatter, and verification workflow.
3. `IMAGE_WORKFLOW.md` - how to generate, import, inspect, and batch-refresh blog images.
4. `ai-image-prompts.json` - reusable Ledger-style prompt patterns and image rules.

## Common Tasks

- New post: read `BLOG_GUIDE.md`, log the work in `docs/BACKLOG.md` or the PR, then use `IMAGE_WORKFLOW.md`.
- Existing post refresh: use the refresh workflow and accuracy checklist in `BLOG_GUIDE.md`.
- Image-only refresh: use `IMAGE_WORKFLOW.md` and `ai-image-prompts.json`; keep filenames stable unless there is a clear reason not to.
- Full blog audit: run `bun run blog:audit`, inventory posts first, classify each as `keep`, `refresh`, `rewrite`, `merge`, or `retire`, then refresh in small batches.

## Hard Rules

- Accuracy first. Use `src/constants/taxRates.ts` and official sources for unstable tax claims.
- Use UK English.
- Do not invent product, tax, security, provider, or official-endorsement claims.
- Do not leave completed work in `docs/BACKLOG.md`.
- Commit generated image batches separately from content rewrites when practical.
