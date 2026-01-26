# Blog Page Redesign - Build Spec v1.3

> **Purpose:** How to build the new PayeTax blog page
> **Design:** Magazine Editorial + Hero Carousel (Mockup 1 + 4 hybrid)
> **Mockup:** `/payetax-web/public/blog-mockup-1-magazine.html`
> **Last Updated:** January 2026
> **Status:** Reviewed - Ready for Implementation

---

## Overview

The blog page redesign combines two layout approaches:
1. **Hero Carousel** (from Mockup 4) - Netflix-style rotating featured articles
2. **Magazine Editorial** (from Mockup 1) - Asymmetric grid with sidebar

**Goal:** Create a visually engaging blog that encourages browsing while maintaining PayeTax brand consistency.

**Current State:** The existing `/blog` page has a functional setup with search modal, category filtering, pagination, and analytics tracking. This redesign enhances the visual presentation while preserving working infrastructure.

---

## Route

| Route | Purpose |
|-------|---------|
| `/blog` | Index page (this redesign) |
| `/blog/[slug]` | Individual articles (existing) |
| `/blog/category/[slug]` | Category hub pages (existing) |

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

### Category Taxonomy (Single Source of Truth)

Define in `src/constants/blogCategories.ts`:

```typescript
// Define the constant first with `as const` for strict literal types
export const BLOG_CATEGORIES = {
  'tax-guide': { key: 'tax-guide', label: 'Tax Guide', slug: 'tax-guides', color: '#f59e0b', textColor: '#000000', navGroup: 'Tax Guides' },
  'ni': { key: 'ni', label: 'National Insurance', slug: 'national-insurance', color: '#8b5cf6', textColor: '#ffffff', navGroup: 'NI & Pension' },
  'pension': { key: 'pension', label: 'Pension', slug: 'pension', color: '#ec4899', textColor: '#ffffff', navGroup: 'NI & Pension' },
  'student-loans': { key: 'student-loans', label: 'Student Loans', slug: 'student-loans', color: '#3b82f6', textColor: '#ffffff', navGroup: 'Student Loans' },
  'guide': { key: 'guide', label: 'Guide', slug: 'guides', color: '#10b981', textColor: '#000000', navGroup: 'Tax Guides' },
  'news': { key: 'news', label: 'News', slug: 'news', color: '#ef4444', textColor: '#ffffff', navGroup: 'News' },
} as const;

// Derive CategoryKey type from the constant keys
export type CategoryKey = keyof typeof BLOG_CATEGORIES;

// Type for individual category config (inferred from const)
export type CategoryConfig = (typeof BLOG_CATEGORIES)[CategoryKey];

// Navigation group configuration with explicit routing
export interface NavGroupConfig {
  label: string;
  slug: string;           // URL slug for the group
  categories: CategoryKey[]; // Categories included in this group
}

export const NAV_GROUPS: NavGroupConfig[] = [
  { label: 'Tax Guides', slug: 'tax-guides', categories: ['tax-guide', 'guide'] },
  { label: 'NI & Pension', slug: 'ni-pension', categories: ['ni', 'pension'] },
  { label: 'Student Loans', slug: 'student-loans', categories: ['student-loans'] },
  { label: 'News', slug: 'news', categories: ['news'] },
];

// Helper to get categories for a nav group
export function getCategoriesForNavGroup(groupSlug: string): CategoryKey[] {
  const group = NAV_GROUPS.find(g => g.slug === groupSlug);
  return group?.categories ?? [];
}
```

### Navigation Group Routing

| Nav Item | URL | Categories Displayed |
|----------|-----|---------------------|
| Tax Guides | `/blog/category/tax-guides` | `tax-guide` + `guide` |
| NI & Pension | `/blog/category/ni-pension` | `ni` + `pension` |
| Student Loans | `/blog/category/student-loans` | `student-loans` |
| News | `/blog/category/news` | `news` |

**Implementation:** The `/blog/category/[slug]` page must:
1. Check `NAV_GROUPS` first (by `slug`) for aggregate pages
2. Fall back to `BLOG_CATEGORIES` (by `slug`, NOT by `CategoryKey`)
3. Filter posts by `category: CategoryKey` in frontmatter

**Important:** Routes use `slug` (URL-safe), frontmatter uses `CategoryKey` (internal). Add a helper:
```typescript
export function getCategoryBySlug(slug: string): CategoryConfig | undefined {
  return Object.values(BLOG_CATEGORIES).find(c => c.slug === slug);
}
```

### Category Badge Contrast

> **Accessibility Note:** Amber (`#f59e0b`) on dark backgrounds passes WCAG AA, but verify contrast when used on gradients or image overlays. Consider using a darker amber variant (`#d97706`) for small text badges.

---

## Page Structure

```
┌──────────────────────────────────────────────────────────────────────┐
│  NAVIGATION (Sticky)                                                  │
│  Logo | Tax Guides | NI & Pension | Student Loans | News | Search    │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  HERO CAROUSEL (65vh desktop / aspect-4/3 mobile)                     │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  [Slide 1]  60% Tax Trap Guide        [⏸] [●] ○ ○ [←] [→]     │  │
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
- Blur backdrop with fallback:
  ```css
  /* Graceful degradation for devices where backdrop-filter is GPU-expensive */
  background: rgba(2, 6, 23, 0.95);
  
  @supports (backdrop-filter: blur(20px)) {
    background: rgba(2, 6, 23, 0.8);
    backdrop-filter: blur(20px);
  }
  ```

**Elements:**
- Logo (links to `/`)
- Category links: Tax Guides, NI & Pension, Student Loans, News (link to `/blog/category/[slug]`)
- Search button (opens existing `BlogSearch` modal)

**Mobile:**
- Hamburger menu for categories
- Search icon remains visible

---

### 2. Hero Carousel

**Accessibility Requirements (Critical):**
- **Pause/Play button:** Visible control, not just hover-to-pause
- **Keyboard navigation:** Left/right arrow keys to change slides
  - Only when carousel container has focus (use roving tabindex)
  - Do NOT capture arrows when user is in search input, email field, or other inputs
- **ARIA attributes:** 
  - Dots must be `<button>` elements with `aria-label="Go to slide N"`
  - Use `aria-live="polite"` region for slide change announcements
  - `aria-hidden="true"` AND `tabIndex={-1}` on inactive slides (prevent focus)
- **Reduced motion:** Respect `prefers-reduced-motion: reduce` - disable auto-rotation and crossfade

**Interactive Element Pattern (Critical):**
Do NOT wrap the entire slide in `<a>` - this creates nested interactive elements (invalid HTML).

Instead, use an overlay link pattern:
```tsx
<div className="slide relative">
  {/* Content layer */}
  <div className="slide-content">
    <Badge>Category</Badge>
    <h2>Title</h2>
    <p>Excerpt</p>
  </div>
  
  {/* Controls layer - outside the link */}
  <div className="slide-controls">
    <button aria-label="Pause">⏸</button>
    <button aria-label="Previous">←</button>
    <button aria-label="Next">→</button>
  </div>
  
  {/* Full-area link overlay - covers content but not controls */}
  <Link 
    href={`/blog/${post.slug}`}
    className="absolute inset-0 z-10"
    aria-label={`Read: ${post.title}`}
  >
    <span className="sr-only">Read article</span>
  </Link>
</div>
```

**Behavior:**
- Auto-rotates every **8 seconds** (increased from 5s for readability)
- **Pause on hover, focus, and pointer down**
- Manual navigation via dots and arrow buttons
- Smooth crossfade transition (0.8s) - disabled if reduced motion preferred

**Content per slide:**
- Background gradient (unique color per category) OR image with gradient overlay
- Category badge (brand gradient)
- Title (Space Grotesk, 2-3rem)
- Excerpt (1-2 lines)
- Meta: read time + date
- Clickable (entire slide links to article)

**Technical:**
- Desktop: `height: 65vh` (min 450px, max 600px)
- Use **Embla Carousel** (v1 decision - no alternatives)
  - Built-in swipe/drag support for touch devices
  - Lightweight (~3KB gzipped)
  - Predictable accessibility and controls
- Preload first slide image with `priority`, lazy load others
- Reserve fixed dimensions to prevent CLS
- Use `next/font` for Space Grotesk to prevent font-swap layout shift

**Data source:**
- Primary: Posts with `featured: true` frontmatter (manual curation)
- Fallback: If fewer than 3 featured posts, backfill with most recent posts
- Maximum: 5 slides

**Mobile:**
- `aspect-ratio: 4/3` with `min-height: 300px` (not 50vh - allows articles to peek above fold)
- Padding reduced
- Dots repositioned below

---

### 3. Latest Articles Section

**Layout:** Asymmetric 2-column grid

**Desktop (1024px+):**
- Left column (60%): Large featured card
- Right column (40%): 4 stacked small cards

**Tablet (768-1024px):**
- 50% / 50% split
- Large card gets taller OR small cards become 2x2 grid

**Mobile (<768px):**
- Single column stack

**Card Details:**
- Large card: Aspect ratio 16:10 image area, category badge overlay, title, excerpt, meta
- Small cards: Square thumbnail + title + meta, category badge on thumbnail

**Image Sizes (Critical for LCP):**
```tsx
// Large Card
<Image sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 60vw" />

// Small Card  
<Image sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 20vw" />

// Carousel Slide
<Image sizes="100vw" priority={isFirstSlide} />
```

**Behavior:**
- Hover: border highlight, slight lift (translateY -2px) - disabled if `prefers-reduced-motion`
- Click: navigate to article

---

### 4. Pull Quote

**Purpose:** Break up content, add visual interest

**Content Source:** Define in `src/constants/pullQuotes.ts`:

```typescript
export interface PullQuote {
  text: string;
  attribution: string;
  validFrom: string;  // ISO date - quote active from this date
  validUntil: string; // ISO date - quote active until this date
}

export const PULL_QUOTES: PullQuote[] = [
  {
    text: "Understanding your tax code is the first step to taking control of your finances.",
    attribution: "PayeTax Mission",
    validFrom: "2026-01-01",
    validUntil: "2026-01-31"
  },
  // Add monthly quotes here
];

export function getCurrentQuote(): PullQuote {
  const now = new Date().toISOString().split('T')[0];
  return PULL_QUOTES.find(q => q.validFrom <= now && q.validUntil >= now) 
    ?? PULL_QUOTES[0]; // Fallback to first quote
}
```

**Content Guidelines:**
- **v1 decision:** Use monthly rotating quotes from `pullQuotes.ts` (not tied to featured article)
- Rotate monthly (not randomly)
- Keep educational/mission-framed (never tax advice)

**Style:**
- Left border accent (brand gradient)
- Large quote text (Space Grotesk, 1.5rem)
- Attribution below
- Add `role="note"` for screen readers

---

### 5. Deep Dives Section

**Layout:** 3-column grid (equal width), max 6 cards

**Card style:**
- Image area (16:10)
- Category badge
- Title, excerpt, meta
- "View all" link per category to `/blog/category/[slug]`

**Data Source:**
- Primary: Posts with `deepDive: true` frontmatter (manual curation)
- Fallback: If fewer than 3 deep dive posts, backfill from curated slugs array:

```typescript
// src/constants/deepDives.ts
export const DEEP_DIVE_FALLBACK_SLUGS = [
  '100k-tax-trap-avoid-60-percent-tax-2025',
  'understanding-uk-tax-codes',
  'pension-tax-relief-uk-2025-guide',
];
```

**Fetch Logic:**
```typescript
export async function getDeepDives(): Promise<BlogPost[]> {
  const allPosts = await getBlogPosts();
  const deepDives = allPosts.filter(p => p.deepDive);
  
  if (deepDives.length >= 3) return deepDives.slice(0, 6);
  
  // Backfill with curated slugs
  const fallbackPosts = DEEP_DIVE_FALLBACK_SLUGS
    .map(slug => allPosts.find(p => p.slug === slug))
    .filter(Boolean);
  
  return [...deepDives, ...fallbackPosts].slice(0, 6);
}
```

---

### 6. Editor's Picks Sidebar

**Position:** 
- Desktop: Sticky (follows scroll)
- Tablet: Below main content (distinct section, not hidden)
- Mobile: **Accordion** (v1 decision - collapsed by default)
  - Label: "View Editor's Picks"
  - Rationale: Horizontal scrolls for text lists suffer from "banner blindness" on mobile

**Layout:**
- Numbered list (01-05)
- Title + read time per item
- Compact, scannable

**Data source:** 
- Primary: Posts with `editorsPick: true` frontmatter (manual curation)
- Fallback: Most recent posts if insufficient picks

**Behavior:**
- Non-sticky on viewports shorter than sidebar content height (prevent overlap)

---

### 7. Newsletter CTA

**Purpose:** Convert readers to subscribers

**Elements:**
- Headline: "Stay Updated on UK Tax Changes"
- Subtext: "Expert insights. No spam."
- Email input + Subscribe button
- **Privacy consent:** Link to Privacy Policy ("We respect your privacy. Unsubscribe anytime.")
- **Loading state:** Disable button, show spinner during submission
- **Success state:** "Thanks! Check your inbox to confirm."
- **Error state:** "Something went wrong. Please try again."

**Security:**
- Honeypot field for bot protection
- Consider double opt-in for GDPR compliance

**Style:**
- Full brand gradient background
- Centered, prominent placement

**Integration:** Connects to existing Resend newsletter API

---

## Image Fallback System

When a post has no `image` defined, render a category-based SVG fallback that works with Next.js `<Image>` component:

```typescript
// src/lib/blog/imageFallback.ts
import { BLOG_CATEGORIES, type CategoryKey } from '@/constants/blogCategories';

// Category to Lucide icon mapping
const CATEGORY_ICONS: Record<CategoryKey, string> = {
  'tax-guide': 'calculator',
  'ni': 'shield',
  'pension': 'piggy-bank',
  'student-loans': 'graduation-cap',
  'guide': 'book-open',
  'news': 'newspaper',
};

// Generate inline SVG data URL for use as placeholder/fallback
export function getCategoryFallbackSvg(category: CategoryKey): string {
  const config = BLOG_CATEGORIES[category];
  const color = config.color;
  
  // SVG with gradient background and centered icon placeholder
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:0.3"/>
          <stop offset="100%" style="stop-color:${color};stop-opacity:0.1"/>
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#bg)"/>
      <circle cx="400" cy="225" r="60" fill="${color}" opacity="0.2"/>
    </svg>
  `;
  
  return `data:image/svg+xml,${encodeURIComponent(svg.trim())}`;
}

// Generate blurDataURL for Next.js Image placeholder
export function getCategoryBlurDataUrl(category: CategoryKey): string {
  const config = BLOG_CATEGORIES[category];
  // Tiny 10x6 gradient for blur placeholder
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="6"><rect fill="${config.color}" opacity="0.2" width="10" height="6"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
```

**Usage in ArticleCard:**
```tsx
<Image
  src={post.image ?? getCategoryFallbackSvg(post.category)}
  alt={post.imageAlt ?? post.title}
  placeholder="blur"
  blurDataURL={post.image ? BLUR_DATA_URL : getCategoryBlurDataUrl(post.category)}
  // ...
/>
```

**Fallback behavior:**
- SVG-based (works with Next.js Image component)
- Category color gradient background
- Consistent 16:9 aspect ratio
- Lightweight blur placeholder for perceived performance

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
updatedAt: "2025-01-20"  # Display if >30 days after publishedAt
readTime: 12
featured: true       # Show in carousel (max 5)
editorsPick: true    # Show in sidebar (max 5)
deepDive: true       # Show in Deep Dives section
image: "/blog/60-tax-trap.webp"  # Optional - fallback renders if missing
imageAlt: "Chart showing 60% effective tax rate"
author: "PayeTax Team"
---
```

### TypeScript Interface

```typescript
// src/types/blog.ts
import { z } from 'zod';

// Derive CategoryKey from the constants (strict typing)
export type CategoryKey = keyof typeof BLOG_CATEGORIES;

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: CategoryKey;
  publishedAt: string;  // ISO Date
  updatedAt?: string;   // ISO Date - display if >30 days after publishedAt
  readTime: number;     // Minutes
  featured?: boolean;
  editorsPick?: boolean;
  deepDive?: boolean;
  image?: string;
  imageAlt?: string;
  author?: string;
}
```

### Zod Validation (Frontmatter)

Add schema validation in `src/lib/blog.ts` to catch typos early:

```typescript
import { z } from 'zod';

const PostFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().min(1),
  category: z.enum(['tax-guide', 'pension', 'student-loans', 'ni', 'guide', 'news']),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // ISO date
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  readTime: z.number().positive(),
  featured: z.boolean().optional(),
  editorsPick: z.boolean().optional(),
  deepDive: z.boolean().optional(),
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  author: z.string().optional(),
});

// Use in getBlogPosts():
const parsed = PostFrontmatterSchema.safeParse(frontmatter);
if (!parsed.success) {
  console.error(`Invalid frontmatter in ${filePath}:`, parsed.error.issues);
  // Either throw or skip the post
}
```

**Why:** If a markdown file has a typo (`publisedAt` instead of `publishedAt`), the build passes but the page crashes or sorts incorrectly. Zod catches this at build time.

### Data Fetching Strategy

**Do NOT create API endpoints.** Use server-side data fetching directly in Server Components:

```typescript
// src/lib/blog.ts (existing - extend as needed)
export async function getBlogPosts(): Promise<BlogPost[]>
export async function getFeaturedPosts(): Promise<BlogPost[]>  // featured: true, max 5, backfill with recent
export async function getEditorsPicks(): Promise<BlogPost[]>   // editorsPick: true, max 5
export async function getDeepDives(): Promise<BlogPost[]>      // deepDive: true OR curated slugs
```

Call these directly in `src/app/blog/page.tsx` Server Component.

---

## Date Display Logic

```typescript
// Show "Last updated" if updatedAt is >30 days after publishedAt
function shouldShowUpdatedDate(publishedAt: string, updatedAt?: string): boolean {
  if (!updatedAt) return false;
  const published = new Date(publishedAt);
  const updated = new Date(updatedAt);
  const daysDiff = (updated.getTime() - published.getTime()) / (1000 * 60 * 60 * 24);
  return daysDiff > 30;
}

// UI: "Last updated: Jan 2026" builds trust for tax content
```

---

## Interactions

### Carousel

| Action | Result |
|--------|--------|
| Click dot | Jump to that slide |
| Click arrow | Previous/next slide |
| Click pause/play | Toggle auto-rotation |
| Press left/right arrow keys | Previous/next slide (when focused) |
| Auto-advance | Every 8 seconds (disabled if paused or reduced motion) |
| Hover/focus | Pause auto-rotation |
| Click slide content | Navigate to article |

### Article Cards

| Action | Result |
|--------|--------|
| Hover | Border highlight + slight lift (translateY -2px) |
| Click | Navigate to `/blog/[slug]` |

### Navigation

| Action | Result |
|--------|--------|
| Click category | Navigate to `/blog/category/[slug]` |
| Click search | Open `BlogSearch` modal (existing component) |

---

## Responsive Breakpoints

| Breakpoint | Layout Changes |
|------------|----------------|
| Desktop (1024px+) | Full layout with sticky sidebar |
| Tablet (768-1024px) | Sidebar moves below content as distinct section, grid becomes 50/50 |
| Mobile (<768px) | Single column, carousel aspect-ratio, sidebar as horizontal scroll |

### Mobile Specifics

- Carousel: `aspect-ratio: 4/3`, `min-height: 300px`
- Article grid: Single column stack
- Sidebar: Horizontal scrollable carousel for Editor's Picks
- Navigation: Hamburger menu

---

## Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| LCP | < 2.5s | First carousel slide is LCP candidate |
| INP | < 200ms | Replaced FID (Core Web Vitals 2024+) |
| CLS | < 0.1 | Reserve carousel dimensions |
| Lighthouse Performance | 90+ | |

### Optimizations

- **Carousel:** First slide image with `priority`, others lazy loaded
- **Images:** WebP format, Next.js Image component with proper `sizes`
- **Fonts:** Preload Space Grotesk and Inter (already configured)
- **CSS:** Inline critical styles, defer non-critical
- **JS:** Minimal - use Embla Carousel or CSS scroll-snap (avoid heavy libraries)
- **Bundle:** Carousel as only client component, rest as Server Components

---

## Accessibility Checklist

- [ ] Carousel has visible pause/play button
- [ ] Carousel dots are `<button>` elements with `aria-label`
- [ ] Carousel respects `prefers-reduced-motion`
- [ ] Keyboard navigation works (arrows, tab, enter)
- [ ] All images have meaningful `alt` text (from `imageAlt` or `title`)
- [ ] Skip-to-content link at page top
- [ ] Category badge colors pass WCAG AA contrast (4.5:1 for small text)
- [ ] Focus indicators visible on all interactive elements
- [ ] Screen reader announces slide changes via `aria-live`

---

## SEO Considerations

### Meta Tags (existing - verify)

```html
<title>TaxInsights by PayeTax | UK Tax Guidance</title>
<meta name="description" content="Expert UK tax guides based on official HMRC rates. PAYE, self-assessment, tax planning, and financial insights for 2025-26.">
<link rel="canonical" href="https://payetax.co.uk/blog">
```

### Structured Data

Use `CollectionPage` for index (better than generic `Blog` for aggregated content):

```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "TaxInsights by PayeTax",
  "description": "UK tax guides and updates",
  "url": "https://payetax.co.uk/blog",
  "publisher": {
    "@type": "Organization",
    "name": "PayeTax"
  },
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "url": "https://payetax.co.uk/blog/post-1" },
      { "@type": "ListItem", "position": 2, "url": "https://payetax.co.uk/blog/post-2" }
    ]
  }
}
```

### Individual Posts (existing)

Each post should have `Article` schema with `headline`, `datePublished`, `dateModified`, `author`, `publisher`, `image`.

---

## Analytics Integration

Extend existing `trackEvent()` calls to measure redesign effectiveness:

| Event | Data |
|-------|------|
| `carousel_slide_view` | slide_index, post_slug, auto_advanced (bool) |
| `carousel_interaction` | action (dot_click, arrow_click, pause, play) |
| `article_card_click` | section (latest, deep_dives, editors_picks), post_slug, position |
| `newsletter_cta_view` | |
| `newsletter_cta_submit` | success (bool) |

**Privacy Considerations:**
- All analytics data is aggregated, not personally identifiable
- `post_slug` is public content identifier, not user data
- Ensure analytics respects user cookie consent preferences
- Do not track: email addresses, IP addresses, or session identifiers in custom events
- Review events against GDPR Article 6 (lawful basis) - legitimate interest for site improvement

---

## Implementation Phases

### Phase 1: Core Layout (MVP)
- [ ] Category taxonomy constants file (`as const` + Zod schema)
- [ ] Hero carousel with accessibility (Embla)
- [ ] Asymmetric latest articles grid
- [ ] **Standard pagination** (< Prev 1 2 3 Next >) - pure Server Components
- [ ] Basic responsive styles
- [ ] Image fallback system (SVG-based)

### Phase 2: Content Integration
- [ ] Connect to blog post data (extend existing `lib/blog.ts`)
- [ ] Zod validation for frontmatter
- [ ] Featured posts logic with fallback
- [ ] Editor's picks sidebar (accordion on mobile)
- [ ] Category navigation links (nav groups)

### Phase 3: Polish & Accessibility
- [ ] Pull quote component (monthly rotation)
- [ ] Newsletter CTA with GDPR compliance
- [ ] Animations (with reduced motion support)
- [ ] Accessibility audit (axe/Lighthouse)
- [ ] Contrast verification for category badges
- [ ] Carousel interactive pattern (overlay link, not nested)

### Phase 4: Optimization & Analytics
- [ ] Performance audit (LCP, INP, CLS)
- [ ] Analytics events integration
- [ ] SEO audit (structured data, canonical)
- [ ] Bundle size verification
- [ ] Optional: "Load More" progressive enhancement (requires client state + Server Actions)

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/constants/blogCategories.ts` | **New** - Category taxonomy + nav groups |
| `src/constants/pullQuotes.ts` | **New** - Monthly rotating quotes |
| `src/constants/deepDives.ts` | **New** - Fallback slugs for deep dives |
| `src/app/blog/page.tsx` | Modify - new layout structure |
| `src/app/blog/BlogPageClient.tsx` | Modify or replace |
| `src/app/blog/category/[slug]/page.tsx` | Modify - handle nav group slugs |
| `src/components/organisms/BlogCarousel.tsx` | **New** - Accessible carousel (Embla) |
| `src/components/organisms/LatestArticles.tsx` | **New** - Asymmetric grid |
| `src/components/organisms/EditorsPicks.tsx` | **New** - Sidebar component |
| `src/components/molecules/ArticleCard.tsx` | Modify - add variants |
| `src/components/molecules/PullQuote.tsx` | **New** |
| `src/lib/blog.ts` | Extend - add getFeaturedPosts, getEditorsPicks, getDeepDives |
| `src/lib/blog/imageFallback.ts` | **New** - SVG fallback system |

---

## Resolved Questions

| Question | Decision | Rationale |
|----------|----------|-----------|
| Category pages | Separate routes (`/blog/category/[slug]`) | Already exist; better SEO as hub pages |
| Search | Modal on current page | Existing `BlogSearch` component works well |
| Pagination | **Standard pagination** (Phase 1), Load More optional (Phase 4) | See details below |
| Featured curation | Hybrid: `featured: true` first, backfill with recent | Ensures carousel never breaks |
| Editor's Picks | Manual via `editorsPick: true` frontmatter | Maintains editorial quality |
| Nav group routing | Aggregate category pages | See Navigation Group Routing section |

### Pagination Implementation Details

**Phase 1 (v1): Standard Server-Side Pagination**

Keep architecture as pure Server Components - no client state needed.

```
/blog                    → Page 1 (12 posts)
/blog?page=2             → Page 2 (crawlable URL)
/blog?page=3             → Page 3 (crawlable URL)
```

**UI Components:**
```tsx
{/* Standard pagination - Server Component */}
<nav aria-label="Pagination">
  <a href="/blog?page=1" aria-current={page === 1}>« Prev</a>
  <a href="/blog?page=1">1</a>
  <a href="/blog?page=2">2</a>
  <a href="/blog?page=3">3</a>
  <a href="/blog?page=4">Next »</a>
</nav>
```

**SEO:**
- Each `?page=N` is crawlable
- Add `<link rel="canonical" href="/blog">` on all pages
- Add `<link rel="prev">` and `<link rel="next">` hints

**Phase 4 (Optional): "Load More" Enhancement**

If desired later, requires:
- Converting to Client Component
- Server Actions or API route for fetching
- Client state management for appended posts
- Focus management after load (`aria-live`)

---

## References

- **Live mockup:** `/payetax-web/public/blog-mockup-1-magazine.html`
- **Content guide:** `/docs/guides/BLOG_GUIDE.md`
- **Design system:** `/docs/guides/STYLING-GUIDELINES.md`
- **Current implementation:** `src/app/blog/page.tsx`, `src/app/blog/BlogPageClient.tsx`

---

## Review History

| Version | Date | Changes |
|---------|------|---------|
| v1.0 | Jan 2026 | Initial draft |
| v1.1 | Jan 2026 | Incorporated feedback from 3 AI reviewers (Grok, ChatGPT, Gemini): accessibility improvements, carousel timing, taxonomy, GDPR, performance metrics, resolved open questions |
| v1.2 | Jan 2026 | Second review pass: Navigation group routing clarified, pagination mechanism detailed, pull quote sourcing defined, deep dives fallback logic added, SVG-based image fallbacks for Next.js compatibility, analytics privacy considerations |
| v1.3 | Jan 2026 | Final review: All "OR" decisions made explicit (Embla, accordion, monthly quotes), carousel interactive pattern (overlay link), keyboard scoping, badge textColor for contrast, backdrop-filter fallback, image sizes for LCP, `as const` + Zod validation, standard pagination for Phase 1 |

---

*Document owner: PayeTax Team*
*Status: Ready for implementation*
