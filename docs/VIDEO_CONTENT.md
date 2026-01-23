# Video Content Generation

PayeTax has a separate video generation project for creating marketing content using [Remotion](https://remotion.dev).

## Location

```
~/Desktop/payetax-videos/
```

**Not in this repo** - Videos are kept separate to avoid bundle bloat and keep the main app lean.

## Why Separate?

| Concern | Main App | Videos Project |
|---------|----------|----------------|
| Bundle size | Optimized (~300KB) | Not a concern |
| Dependencies | Minimal | Remotion + CLI |
| Deploy frequency | Often | As needed |
| Output | Web app | MP4 files |

## Quick Start

```bash
cd ~/Desktop/payetax-videos

# Install (first time only)
bun install

# Open visual editor
bun run dev

# Render a salary breakdown
bun scripts/render-salary.ts --salary 50000

# Render all salary videos
bun scripts/render-all.ts
```

## Available Templates

### 1. Salary Breakdown
**Use:** "What £Xk looks like after tax" content

```bash
bun scripts/render-salary.ts --salary 50000
bun scripts/render-salary.ts --salary 50000 --format vertical
```

### 2. Blog Promo
**Use:** Promote new blog posts on X/LinkedIn

```bash
bunx remotion render src/index.ts BlogPromo out/blog.mp4 \
  --props='{"title":"What £50k Actually Looks Like","emoji":"💰"}'
```

### 3. Tax Tip
**Use:** Weekly educational content for social

```bash
bunx remotion render src/index.ts TaxTip out/tip.mp4 \
  --props='{"tipNumber":1,"title":"Pension Contributions","description":"..."}'
```

## Video Formats

| Format | Dimensions | Platform |
|--------|------------|----------|
| Square | 1080x1080 | X, LinkedIn, Instagram |
| Vertical | 1080x1920 | TikTok, Reels, Shorts |

## Content Calendar Ideas

### Weekly
- **Tax Tip Tuesday** - Educational tips using `TaxTip` template
- **Salary Breakdown** - Different salary each week

### Event-Driven
- New blog post → `BlogPromo` video
- Budget announcement → Custom announcement video
- Tax deadline approaching → Reminder video

### Batch Content
```bash
# Generate all milestone salaries at once
bun scripts/render-all.ts
# Creates: £25k, £30k, £40k, £50k, £60k, £75k, £100k, £125k, £150k
```

## Output Location

Videos render to `~/Desktop/payetax-videos/out/` (gitignored).

Copy to your preferred location for posting:
```bash
cp out/salary-50000-square.mp4 ~/Downloads/
```

## Brand Consistency

All videos use PayeTax brand theme defined in `src/styles/theme.ts`:
- Colors match the main app
- Fonts: Space Grotesk + Inter
- Footer: "payetax.co.uk • Free UK Tax Calculator"

## Adding New Templates

1. Create component in `payetax-videos/src/compositions/`
2. Register in `src/Root.tsx`
3. Import theme from `src/styles/theme.ts`
4. Test in Remotion Studio (`bun run dev`)

## Troubleshooting

### "Command not found: remotion"
```bash
cd ~/Desktop/payetax-videos && bun install
```

### Videos not rendering
Check Remotion Studio for errors:
```bash
bun run dev
```

### Wrong tax calculations
The render scripts use simplified 2025/26 tax rates. For exact figures, check the main PayeTax calculator.
