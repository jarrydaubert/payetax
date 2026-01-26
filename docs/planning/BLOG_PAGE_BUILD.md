# Blog Page Redesign - Build Spec v1.0

> **Purpose:** How to build the new PayeTax blog page
> **Design:** Magazine Editorial + Hero Carousel (Mockup 1 + 4 hybrid)
> **Mockup:** `/payetax-web/public/blog-mockup-1-magazine.html`
> **Last Updated:** January 2026
> **Status:** Draft - Pending Review

---

## Overview

The blog page redesign combines two layout approaches:
1. **Hero Carousel** (from Mockup 4) - Netflix-style rotating featured articles
2. **Magazine Editorial** (from Mockup 1) - Asymmetric grid with sidebar

**Goal:** Create a visually engaging blog that encourages browsing while maintaining PayeTax brand consistency.

---

## Route

`/blog` (index page)
`/blog/[slug]` (individual articles - existing)

---

## Design System

### Brand Consistency

| Element | Value |
|---------|-------|
| Primary Color | `#06b6d4` (Cyan) |
| Secondary Color | `#10b981` (Emerald) |
| Gradient | `linear-gradient(135deg, #06b6d4 0%, #10b981 100%)` |
| Heading Font | Space Grotesk (600-700) |
| Body Font | Inter (300-600) |
| Background | `#020617` (Deep) / `#0f172a` (Dark) |
| Card Background | `#1e293b` |
| Text Primary | `#f8fafc` |
| Text Secondary | `#94a3b8` |

### Category Colors

| Category | Color | Hex |
|----------|-------|-----|
| Tax Guide | Amber | `#f59e0b` |
| National Insurance | Purple | `#8b5cf6` |
| Pension | Pink | `#ec4899` |
| Student Loans | Blue | `#3b82f6` |
| Guide | Emerald | `#10b981` |
| News | Red | `#ef4444` |

---

## Page Structure

```
┌──────────────────────────────────────────────────────────────────────┐
│  NAVIGATION (Sticky)                                                  │
│  Logo | Tax Guides | NI & Pension | Student Loans | News | Search    │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  HERO CAROUSEL (65vh)                                                  │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  [Slide 1]  60% Tax Trap Guide            [●] ○ ○              │  │
│  │  [Slide 2]  Pension Contributions                              │  │
│  │  [Slide 3]  Student Loan Plans                                 │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                        │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  MAIN CONTENT                                    SIDEBAR               │
│  ┌─────────────────────────────────────────┐   ┌──────────────────┐  │
│  │  LATEST ARTICLES                        │   │  EDITOR'S PICKS  │  │
│  │  ┌─────────────────┬──────────────────┐ │   │                  │  │
│  │  │                 │  ┌────────────┐  │ │   │  01. Tax Codes   │  │
│  │  │   LARGE CARD    │  │ Small Card │  │ │   │  02. Emergency   │  │
│  │  │   (Pension)     │  ├────────────┤  │ │   │  03. Childcare   │  │
│  │  │                 │  │ Small Card │  │ │   │  04. WFH Relief  │  │
│  │  │                 │  ├────────────┤  │ │   │  05. P60 vs P45  │  │
│  │  │                 │  │ Small Card │  │ │   │                  │  │
│  │  └─────────────────┴──────────────────┘ │   └──────────────────┘  │
│  │                                         │                          │
│  │  ─── PULL QUOTE ───────────────────────│                          │
│  │                                         │                          │
│  │  DEEP DIVES                             │                          │
│  │  ┌──────────┬──────────┬──────────┐    │                          │
│  │  │  Card 1  │  Card 2  │  Card 3  │    │                          │
│  │  └──────────┴──────────┴──────────┘    │                          │
│  │                                         │                          │
│  │  ─── NEWSLETTER CTA ───────────────────│                          │
│  └─────────────────────────────────────────┘                          │
│                                                                        │
├──────────────────────────────────────────────────────────────────────┤
│  FOOTER                                                                │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. Navigation

**Behavior:**
- Sticky on scroll
- Blur backdrop (`backdrop-filter: blur(20px)`)
- Semi-transparent background

**Elements:**
- Logo (links to `/`)
- Category links: Tax Guides, NI & Pension, Student Loans, News
- Search button (opens search modal or navigates to search)

**Mobile:**
- Hamburger menu for categories
- Search icon remains visible

---

### 2. Hero Carousel

**Behavior:**
- Auto-rotates every 5 seconds
- Manual navigation via dots
- Pause on hover (optional)
- Smooth crossfade transition (0.8s)

**Content per slide:**
- Background gradient (unique color per category)
- Category badge (brand gradient)
- Title (Space Grotesk, 2-3rem)
- Excerpt (1-2 lines)
- Meta: read time + date
- Clickable (entire slide links to article)

**Technical:**
- `height: 65vh` (min 450px, max 600px)
- Gradient overlay from left for text readability
- 3 slides minimum, 5 maximum

**Data source:**
- Featured/pinned posts (manual curation)
- OR: Latest 3-5 posts with `featured: true` frontmatter

**Mobile:**
- `height: 50vh` (min 350px)
- Padding reduced
- Dots repositioned

---

### 3. Latest Articles Section

**Layout:** Asymmetric 2-column grid

**Left column (60%):**
- Large featured card
- Aspect ratio 16:10 image area
- Category badge overlay on image
- Title, excerpt, meta below

**Right column (40%):**
- 4 stacked small cards
- Thumbnail (square) + title + meta
- Category badge on thumbnail

**Behavior:**
- Hover: border highlight, slight lift
- Click: navigate to article

---

### 4. Pull Quote

**Purpose:** Break up content, add visual interest

**Content:** Rotating quotes about UK tax, financial literacy, or PayeTax mission

**Style:**
- Left border accent (brand gradient)
- Large quote text (Space Grotesk, 1.5rem)
- Attribution below

---

### 5. Deep Dives Section

**Layout:** 3-column grid (equal width)

**Card style:**
- Image area (16:10)
- Category badge
- Title, excerpt, meta

**Content:** Curated "pillar content" posts

---

### 6. Editor's Picks Sidebar

**Position:** Sticky (follows scroll)

**Layout:**
- Numbered list (01-05)
- Title + read time per item
- Compact, scannable

**Data source:** Manual curation or most-viewed posts

---

### 7. Newsletter CTA

**Purpose:** Convert readers to subscribers

**Elements:**
- Headline: "Stay Updated on UK Tax Changes"
- Subtext: "Expert insights. No spam."
- Email input + Subscribe button

**Style:**
- Full brand gradient background
- Centered, prominent placement

**Integration:** Connects to Resend newsletter API

---

## Data Requirements

### Blog Post Frontmatter

```yaml
---
title: "Understanding the 60% Tax Trap"
slug: "60-percent-tax-trap"
excerpt: "Between £100,000 and £125,140, your effective tax rate jumps to 60%..."
category: "tax-guide"  # tax-guide | pension | student-loans | ni | guide | news
publishedAt: "2025-01-15"
updatedAt: "2025-01-15"
readTime: 12
featured: true  # Show in carousel
editorsPick: true  # Show in sidebar
image: "/blog/60-tax-trap.webp"  # Optional
author: "PayeTax Team"
---
```

### API Endpoints Needed

| Endpoint | Purpose |
|----------|---------|
| `GET /api/blog/posts` | List all posts (paginated) |
| `GET /api/blog/posts/featured` | Featured posts for carousel |
| `GET /api/blog/posts/editors-picks` | Sidebar content |
| `GET /api/blog/posts/category/[slug]` | Filter by category |

**Note:** If using MDX files directly, these can be static at build time.

---

## Interactions

### Carousel

| Action | Result |
|--------|--------|
| Click dot | Jump to that slide |
| Auto-advance | Every 5 seconds |
| Click slide content | Navigate to article |

### Article Cards

| Action | Result |
|--------|--------|
| Hover | Border highlight + slight lift (translateY -2px) |
| Click | Navigate to `/blog/[slug]` |

### Navigation

| Action | Result |
|--------|--------|
| Click category | Filter view OR navigate to category page |
| Click search | Open search modal |

---

## Responsive Breakpoints

| Breakpoint | Changes |
|------------|---------|
| Desktop (1024px+) | Full layout with sidebar |
| Tablet (768-1024px) | Sidebar moves below content |
| Mobile (<768px) | Single column, carousel reduced height, nav collapses |

### Mobile Specifics

- Carousel: 50vh height
- Article grid: Single column stack
- Sidebar: Hidden or moved to bottom
- Navigation: Hamburger menu

---

## Performance Targets

| Metric | Target |
|--------|--------|
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |
| Lighthouse Performance | 90+ |

### Optimizations

- **Images:** WebP format, lazy loading for below-fold
- **Fonts:** Preload Space Grotesk and Inter
- **CSS:** Inline critical styles, defer non-critical
- **JS:** Minimal - only carousel logic
- **Carousel:** Preload adjacent slides

---

## SEO Considerations

### Meta Tags

```html
<title>UK Tax Blog | PayeTax - PAYE Guides & Updates</title>
<meta name="description" content="Expert guides on UK tax, PAYE, National Insurance, pensions, and student loans. Clear explanations with no jargon.">
```

### Structured Data

```json
{
  "@context": "https://schema.org",
  "@type": "Blog",
  "name": "PayeTax Blog",
  "description": "UK tax guides and updates",
  "url": "https://payetax.co.uk/blog",
  "publisher": {
    "@type": "Organization",
    "name": "PayeTax"
  }
}
```

### Individual Posts

Each post should have `Article` schema with:
- `headline`, `datePublished`, `dateModified`
- `author`, `publisher`
- `image` (if available)

---

## Implementation Phases

### Phase 1: Core Layout (MVP)
- [ ] Navigation component
- [ ] Hero carousel (static slides)
- [ ] Latest articles grid
- [ ] Basic responsive styles

### Phase 2: Content Integration
- [ ] Connect to blog post data
- [ ] Dynamic carousel from featured posts
- [ ] Category filtering
- [ ] Editor's picks from data

### Phase 3: Polish
- [ ] Pull quote component
- [ ] Newsletter CTA integration
- [ ] Animations and transitions
- [ ] Accessibility audit

### Phase 4: Optimization
- [ ] Image optimization pipeline
- [ ] Performance audit
- [ ] SEO audit
- [ ] Analytics integration

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/app/blog/page.tsx` | Rewrite with new layout |
| `src/components/organisms/BlogCarousel.tsx` | New component |
| `src/components/organisms/ArticleGrid.tsx` | New component |
| `src/components/molecules/ArticleCard.tsx` | Update styling |
| `src/components/organisms/EditorsPicks.tsx` | New component |
| `src/components/molecules/PullQuote.tsx` | New component |

---

## Open Questions

1. **Category pages:** Separate pages (`/blog/tax-guides`) or filter on main page?
2. **Search:** Modal on current page or dedicated `/blog/search` route?
3. **Pagination vs infinite scroll:** Which approach for "Load More"?
4. **Featured curation:** Manual (CMS) or automatic (latest N posts)?

---

## References

- **Live mockup:** `/payetax-web/public/blog-mockup-1-magazine.html`
- **Content guide:** `/docs/guides/BLOG_GUIDE.md`
- **Design system:** `/docs/guides/STYLING-GUIDELINES.md`

---

*Document owner: PayeTax Team*
*Review cycle: Before implementation begins*
