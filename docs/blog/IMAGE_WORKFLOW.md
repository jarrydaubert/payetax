# Blog Image Workflow

Purpose: generate and import consistent PayeTax blog artwork without relying on an external manual handoff.

The current house direction is the Ledger editorial style: warm paper, realistic tax documents, calculators, calendars, coins, restrained public-authority colour, and no fake official branding. The benchmark image is:

```text
public/images/blog/making-tax-digital-income-tax.jpg
```

Use that image as the visual north star when refreshing the older dark neon/isometric images.

## Agent Capability

Codex can generate raster images directly when the image generation tool is available. Future agents should use that capability for blog artwork unless the user explicitly asks to generate images elsewhere.

If image generation is unavailable in the current environment, use another AI image source, then follow the same import and QA steps below. The repo only needs the final normalised `.jpg` in `public/images/blog/`.

## Canonical Files

- Prompt library: `docs/blog/ai-image-prompts.json`
- Import script: `scripts/import-blog-image.sh`
- Bun command: `bun run blog:image:import`
- Output directory: `public/images/blog/`
- Frontmatter fields: `image` and `imageAlt`

## Visual Standard

Every blog image should feel like it belongs to the same editorial set:

- 16:10 composition, imported to `1600x1000`.
- Warm off-white or paper background.
- Subtle ledger grid, ruled forms, receipts, payslips, envelopes, calendars, or calculator tape.
- Ink-blue, muted green, muted red, or muted gold accents.
- Clean daylight, low contrast, no glow.
- Realistic or lightly dimensional still life. Avoid glossy fintech illustration.
- No text, titles, captions, logos, HMRC branding, QR codes, UI screenshots, or invented official marks.
- No dark-slate backgrounds, purple gradients, cyan glow, glassmorphism, 3D dashboards, or floating app scenes.

The website supplies the article title and metadata. Images should support the topic, not make claims.

## Prompt Recipe

Build prompts from:

1. The category prompt in `docs/blog/ai-image-prompts.json`.
2. One or two topic-specific objects from the post.
3. The shared Ledger style constraints.
4. The global avoid list.

Template:

```text
Editorial still life for a UK tax explainer about [topic]. Include [objects].
Warm paper desk, faint ledger grid, realistic documents, calculator, restrained ink-blue and [accent] details.
Clean daylight, low contrast, 16:10 composition, no text, no labels, no logos, no fake HMRC branding.
```

For example:

```text
Editorial still life for a UK tax explainer about Making Tax Digital for Income Tax.
Include self-employment tax forms, a quarterly calendar marker, a calculator, coins, and a small ledger notebook.
Warm paper desk, faint ledger grid, restrained ink-blue and muted-red details.
Clean daylight, low contrast, 16:10 composition, no text, no labels, no logos, no fake HMRC branding.
```

## Recommended Workflow

1. Read the post title, category, excerpt, and current image.
2. Choose the closest category prompt from `docs/blog/ai-image-prompts.json`.
3. Generate one source image using Codex image generation or another approved image source.
4. Visually inspect the source image before importing:
   - no readable or garbled text
   - no fake official branding
   - clear subject signal
   - enough negative space for cropped cards
   - coherent hands, coins, papers, and calculators
5. Save the source image outside the repo, for example in `~/Desktop/` or `/tmp/`.
6. Import it:

```bash
bun run blog:image:import -- ~/Desktop/source-image.png desired-output-name.jpg
```

7. Confirm the final asset:

```bash
sips -g pixelWidth -g pixelHeight public/images/blog/desired-output-name.jpg
file public/images/blog/desired-output-name.jpg
```

8. Reference it in frontmatter:

```yaml
image: "/images/blog/desired-output-name.jpg"
imageAlt: "Tax forms, calendar, calculator, and coins on a warm paper desk"
```

9. Inspect `/blog` and the article route when practical.

## Import Rules

- Output is normalised to `1600x1000` by `scripts/import-blog-image.sh`.
- Output should be `.jpg` unless there is a strong, documented reason not to.
- Prefer short descriptive filenames that match the post slug or topic.
- Keep the original source file outside the repo unless the user explicitly asks to preserve alternates.
- Do not commit raw generated source images, prompt screenshots, or unused alternates.

## Batch Refresh Rules

When refreshing the full blog image library:

- Start with an inventory of every post, current image, category, and target prompt.
- Keep existing image filenames when replacing an image for the same article; this avoids broad MDX churn.
- Use new filenames only when the old filename is misleading or shared by multiple posts.
- Refresh in batches small enough to review visually, usually 5 to 8 images.
- Commit image batches separately from prose/content changes because binary diffs are noisy.
- After each batch, inspect `/blog`, one category page, and at least two changed article pages.

## Quality Bar

Reject and regenerate an image if it has:

- readable text or broken pseudo-text
- logos, crests, fake HMRC marks, or official-looking stamps
- dark neon, purple glow, glass UI, or app-dashboard styling
- incorrect currency symbols or money that distracts from the UK setting
- distorted calculators, calendars, hands, pens, or coins
- a composition that becomes meaningless when cropped in a card
- a sensational tone, for example panic imagery around penalties or debt

## Accessibility

Write `imageAlt` as a literal image description. Do not use it as an SEO field.

Good:

```yaml
imageAlt: "Payslip, calculator tape, and pound coins arranged on ruled paper"
```

Avoid:

```yaml
imageAlt: "Best UK tax calculator 2026 guide"
```

## Troubleshooting

- If `bun run blog:image:import` fails, check that `ffmpeg` and `sips` are installed.
- If the import crops out the subject, regenerate or pre-crop the source image with more central framing.
- If generated text appears on documents, regenerate with stronger "no text, no labels" wording.
- If the image feels too modern-fintech, add "warm paper, public-authority editorial still life, no glow, no digital dashboard" to the prompt.
