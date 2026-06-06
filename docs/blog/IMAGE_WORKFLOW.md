# Blog Image Workflow

Purpose: turn AI-generated blog artwork into consistent repo assets with the same shape and naming style as the existing library in `public/images/blog/`.

## What Changed

The old `scripts/blog-images.json` file was not an import pipeline.

It was only a prompt/style library for AI-generated blog art. That library now lives at:

- `docs/blog/ai-image-prompts.json`

There is now a real import command for new blog images:

```bash
bun run blog:image:import -- ~/Desktop/source-image.png spring-statement-2026.jpg
```

## Recommended Workflow

1. Generate the image using the prompt library as a style guardrail.
2. Save the source image anywhere convenient, for example `~/Desktop/`.
3. Import it into the repo with:

```bash
bun run blog:image:import -- ~/Desktop/source-image.png desired-output-name.jpg
```

4. The script writes the final asset to:

```text
public/images/blog/desired-output-name.jpg
```

5. Reference that image in the blog post frontmatter:

```yaml
image: "/images/blog/desired-output-name.jpg"
```

## Import Rules

- Output is normalized to `1600x1000` (`16:10`) for consistency with the current blog image set.
- Output should be `.jpg` unless there is a strong reason not to.
- Prefer short descriptive filenames that match the post slug/topic.
- Keep the original source file outside the repo if you want to preserve alternate versions.

## Prompt Library

Use `docs/blog/ai-image-prompts.json` for:

- Ledger-era visual style guidance
- topic prompt patterns
- filename conventions
- details to avoid, especially old fintech glow and fake official branding

It is a planning/reference file, not executable code.
