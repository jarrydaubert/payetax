# 🎯 PayeTax - Next Priorities

**Last Updated**: October 9, 2025
**Current Status**: ✅ v0.1.0 Quality Baseline Achieved - Ready for Feature Expansion

> **Progress**: Test coverage improved to 42.47% with 1,104 tests passing. UI folder 100% covered. Foundation solid for advanced features.

---

## 🚀 **NEW PRIORITIES (October 2025)**

### **1. TaxInsight Sage - AI Explainer Widget** 🎯 **INNOVATION EDGE**
**Priority**: HIGH - Engagement & Stickiness
**Time**: 2-3 days (prototype → production)
**Goal**: Local-first, read-only tax explainer using Ollama + Llama 3.1

**What It Is:**
An always-available floating chat bubble that explains UK tax concepts in plain language with witty analogies. Think "tax explainer in your pocket" - no advice, just education. Runs locally on Mac for dev, deploys to Vercel for free with offline capability.

**Why Now:**
- **Engagement**: Users linger 20-30% longer with interactive helpers (fintech benchmarks)
- **Differentiation**: No UK tax calculator has local AI explainer yet
- **Trust**: Read-only + HMRC citations = YMYL-safe education
- **Zero Cost**: Ollama (free) + Vercel edge = $0 ongoing

**Tech Stack (Reusing Existing Components):**
- **Modal Base**: Reuse `SustainabilityBadge` modal pattern (Framer Motion AnimatePresence)
- **UI Components**: shadcn/ui Dialog, Button, ScrollArea (already in codebase)
- **Styling**: Existing glassmorphism patterns from `Footer` and `SimpleNavbar`
- **State**: SessionStorage for ephemeral memory (like cookie consent)
- **LLM Engine**: Ollama (brew install, free) running Llama 3.1 locally
- **Data Source**: Static JSON file in `src/lib/tax_sources.json` (HMRC + blog content)
- **React Patterns**: React 19 hooks (no forwardRef), streaming with useState

**Component Reuse Opportunities:**
```tsx
// Reuse from SustainabilityBadge.tsx:
- Fixed positioning pattern (bottom-right bubble)
- Modal open/close state management
- AnimatePresence for smooth transitions
- Close button accessibility pattern

// Reuse from existing shadcn/ui:
- Dialog/DialogContent for chat window
- Button for send/actions
- ScrollArea for message history
- Card for message bubbles

// Reuse from Footer.tsx:
- Glassmorphism styling (backdrop-blur-md, bg-white/10)
- Theme-aware colors (dark:bg-slate-800/90)
- Responsive positioning patterns
```

**Implementation Plan:**
1. **Day 1 - Local Prototype (2-3 hours)**:
   - Install Ollama: `brew install ollama && ollama pull llama3.1`
   - Create `<SageWidget />` component reusing `SustainabilityBadge` structure
   - Build chat UI with shadcn Dialog + existing glassmorphism styles
   - Test local API calls to `localhost:11434/api/generate`

2. **Day 2 - Safety & Context (3-4 hours)**:
   - Create `src/lib/tax_sources.json` with curated HMRC data
   - Build custom hook `useSageExplainer` for prompt orchestration
   - Add regex validation for unsafe advice detection
   - Implement page-aware context (e.g., calculator results tie-in)

3. **Day 3 - Polish & Deploy (2-3 hours)**:
   - Add streaming text effect using React state
   - Implement offline fallback with service worker caching
   - Test on mobile (responsive chat sizing)
   - Deploy to Vercel with edge function fallback

**Safety Measures (YMYL Compliant):**
- Strict prompt: "Explain only, no advice/calculations"
- Regex blocklist: "should", "recommend", "file", "claim"
- Auto-citations from tax_sources.json (links to gov.uk)
- Deflection template: "I focus on overviews - consult a professional"
- No personal data storage (SessionStorage clears on tab close)

**User Flow:**
1. Floating bubble appears on all pages (blue chat icon, bottom-right)
2. Click opens glassmorphism modal with chat interface
3. User types: "Explain marriage allowance"
4. Widget streams response: "Marriage allowance transfers £1,260 of your personal allowance to a spouse earning less than you. Like sharing your tax-free pie slice. Saves up to £252/year. [Source: gov.uk/marriage-allowance]"
5. Follow-up questions build context from previous chat (session only)

**Success Metrics:**
- Prototype working locally: 2-3 hours
- Production-ready: 2-3 days
- Engagement lift: +20-30% time on site (benchmark target)
- Support deflection: 25% reduction in "what is X?" questions

**One-Word Name Alternative:**
- **TaxInsight Sage** → Too wordy
- **Sage** → Perfect! Short, wise connotation, easy to brand

**Next Steps:**
1. Get user approval on concept
2. Install Ollama and run test query
3. Build minimal chat UI reusing SustainabilityBadge pattern
4. Iterate on prompt safety and citations

---

### **2. Sentry Free Tier - Error Monitoring** 🎯 **RELIABILITY**
**Priority**: MEDIUM-HIGH - Production Observability
**Time**: 1-2 hours setup
**Cost**: $0 (5,000 events/month free)

**Why Sentry:**
- **Catch Production Errors**: See real user issues before they report them
- **Source Maps**: See actual TypeScript line numbers, not minified JS
- **Context**: User browser, page, actions leading to error
- **Performance**: Track slow pages and API calls
- **Free Tier**: 5K events/month = plenty for early stage

**Implementation:**
1. Create account at sentry.io
2. Install: `npm install @sentry/nextjs`
3. Run: `npx @sentry/wizard@latest -i nextjs`
4. Add DSN to `.env.local`: `NEXT_PUBLIC_SENTRY_DSN=...`
5. Configure in `sentry.client.config.ts` and `sentry.server.config.ts`
6. Test with intentional error, verify dashboard

**Integration Points:**
- Replace current error email system (or supplement it)
- Add breadcrumbs to calculator actions
- Track conversion funnel drop-offs
- Monitor build errors and deployment issues

**Free Tier Limits:**
- 5,000 errors/month (resets monthly)
- 10,000 performance transactions/month
- 1GB attachment storage
- 30-day history

**Action:** Explore free tier, add if valuable. Keep current email fallback.

---

### **3. Linear API Audit - Free Tier Status** 🎯 **WORKFLOW**
**Priority**: MEDIUM - Verify Current Setup
**Time**: 30 minutes audit
**Goal**: Confirm free tier limits, document what we have

**Current State:**
- LINEAR_SETUP.md exists (15K guide)
- @linear/sdk installed
- 7 npm scripts for Linear integration
- API key configured

**Audit Checklist:**
- [ ] Login to linear.app → Settings → API
- [ ] Check current plan (Free vs Paid)
- [ ] Review API rate limits (free = 1,500 requests/hour)
- [ ] Verify what features we're using (issues, projects, cycles)
- [ ] Check if we're hitting any limits
- [ ] Document findings in LINEAR_SETUP.md

**Free Tier Includes:**
- Unlimited viewers
- 250 issues
- API access (1,500 req/hour)
- GitHub integration
- Basic automations

**Action:** Audit current usage, document limits, optimize if needed.

---

### **4. Blog Optimization & Grammarly Integration** 🎯 **CONTENT QUALITY**
**Priority**: MEDIUM - Content Excellence
**Time**: 3-4 hours planning + ongoing
**Goal**: Finalize writing plan, timing strategy, quality tools

**Current State:**
- BLOG_GUIDE.md exists (18K - comprehensive)
- 7 blog posts published
- Monday + Thursday schedule defined
- Contentlayer2 integration working
- 800x400 WebP image specs set

**What's Missing:**
1. **Writing Schedule Discipline**:
   - Pre-plan topics 2 weeks ahead
   - Batch writing sessions (write 2-3 at once)
   - Editorial calendar with seasonal hooks (e.g., tax year end in April)

2. **Quality Assurance Workflow**:
   - Grammarly Premium for tone, clarity, engagement scoring
   - AI detection check (avoid Claude-obvious patterns)
   - SEO checklist per post (keywords, meta, schema)
   - Peer review process (if team expands)

3. **Grammarly Integration Options**:
   - **Browser Extension** (easiest): Install for Chrome/Safari, use in MDX editor
   - **Desktop App**: Copy/paste drafts for deep analysis
   - **API** (future): Automate checks in CI/CD (paid tier only)

4. **Timing Strategy Refinement**:
   - Monday 8am GMT: Week-start "how-to" content (high engagement)
   - Thursday 2pm GMT: Analysis/opinion pieces (pre-weekend reads)
   - Avoid: Friday evenings, weekends (20% less traffic per analytics)

5. **Topic Planning Framework**:
   - **Evergreen**: Tax code explainers, allowance guides (80% of content)
   - **Timely**: Budget reactions, HMRC updates (20% of content)
   - **Seasonal**: January (New Year resolutions), March (tax year end), April (new rates)

**Action Items:**
- [ ] Install Grammarly browser extension (free tier to start)
- [ ] Create editorial calendar in Linear (tag: `content`)
- [ ] Plan next 10 blog topics with target dates
- [ ] Add "Quality Checklist" section to BLOG_GUIDE.md:
  - Grammarly score >70
  - Reading time 3-6 minutes
  - 2+ internal links
  - Schema markup included
  - AI detection pass (not Claude-obvious)

**Grammarly Tiers:**
- **Free**: Grammar, spelling, punctuation (good start)
- **Premium** (£10/month): Tone, clarity, engagement, word choice (worth it for quality)
- **Business** (£12/user/month): Style guides, brand tone (overkill for now)

**Next Steps:**
1. Update BLOG_GUIDE.md with Grammarly workflow
2. Create 2-week topic pipeline in Linear
3. Install Grammarly extension and test on next draft
4. Set calendar reminders for Monday/Thursday publish schedule

---

## ✅ **Recently Completed (October 9, 2025)**

### **Code Quality & Documentation Consolidation** ✅
- UI folder audit completed: 18/18 components with tests (100% coverage)
- 1,104 tests passing across all suites (unit, integration, E2E)
- Test coverage improved: 14.77% → 42.47%
- Docs consolidation: 14 → 10 files (-29%, no information loss)
- CODE_AUDIT_TRACKER.md created as single source of truth
- Deleted 4 historical audit docs (1,311 lines cleaned up)

## ✅ **Recently Completed (October 5, 2025)**

### **5. Blog System Enhancement & Bug Fixes** ✅
- **Contentlayer2 Integration**: Migrated from abandoned Contentlayer to Next.js 15-compatible fork
  - Fixed js-yaml version conflicts (3.14.1 override)
  - Configured type-safe MDX blog posts with computed fields (readingTime, wordCount)
  - Generated 7 blog posts successfully with ISR (revalidate: 1h)
- **UX Improvements**:
  - Fixed period selector checkboxes (now properly clickable)
  - Print now defaults to landscape orientation (A4)
  - CSV toast appears after save dialog (not on button click)
  - Removed debug console logs from production
- **Theme Support**:
  - Blog page now supports light theme (was hardcoded dark)
  - Theme-aware text colors (`text-slate-900 dark:text-white`)
- **Navigation Fixes**:
  - Blog filters no longer cause page jumps (removed anchor)
  - Even spacing with proper flex layout
  - Navbar enhanced with glassmorphism on blog pages

## ✅ **Previously Completed (October 4, 2025)**

### **1. Theme System Overhaul** ✅
- Implemented warm dark slate background (`oklch(0.18 0.02 260)`) for reduced eye strain
- Created brand color system (separate from semantic colors)
- Logo and CTA buttons maintain brand identity across themes
- All hardcoded colors removed from codebase
- Flash prevention script with data-theme attributes

### **2. Framer Motion Optimization** ✅
- Replaced layout-triggering `height` animations with GPU-accelerated `scaleY` transforms
- Added scroll-triggered animations with `whileInView` and `viewport={{ once: true }}`
- Implemented staggered entrance animations across homepage
- All animations respect `prefers-reduced-motion`
- 60fps performance on all animations

### **3. Accessibility Enhancements** ✅
- Added `aria-live` regions for screen reader announcements on calculator results
- Changed `div role="region"` to semantic `<section>` elements
- iOS PWA enhancement with `interactiveWidget: 'resizes-visual'`
- Full keyboard navigation maintained

### **4. Developer Experience** ✅
- Removed `npm run lint` script (inlined to prevent Next.js 15.5 deprecation confusion)
- Updated all documentation (STYLING.md, SCRIPT_GUIDE.md, README.md)
- Added comprehensive Framer Motion best practices documentation
- Build time: 5.8s (6.5% faster than previous)

---

## 🚀 **Pre-Launch Priority (Do Before Deploy)**

### **1. Set GA4 Measurement ID** 🎯 **DO FIRST**
**Priority**: CRITICAL
**Time**: 2 minutes

**Action:**
1. Create GA4 property at analytics.google.com
2. Copy measurement ID (G-XXXXXXXXXX)
3. Add to `.env.local`:
```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

## 🔬 **Post-Launch Optimizations (After Deployment)**

### **1. React 19.2 Performance Optimizations** 🎯 **SEO EDGE**
**Priority**: HIGH - Performance = Rankings
**Time**: ~30 minutes
**Impact**: Improved Core Web Vitals, better SEO signals

**Why This Matters for Google Page 1:**
- Faster rendering = better user signals
- Improved Core Web Vitals = ranking factor
- Reduced JavaScript execution time

**Implementation:**
```tsx
// src/components/analytics/Analytics.tsx
import { useEffectEvent } from 'react';

// Replace useCallback with useEffectEvent for trackSEOMetrics
const trackSEOMetrics = useEffectEvent(() => {
  // Current logic stays the same
  // But no longer re-creates on pathname changes
});
```

**Requirements:**
- Upgrade eslint-plugin-react-hooks to 6.1.0
- Test thoroughly in production before enabling
- Monitor performance impact with Chrome DevTools

**Files to Optimize:**
- `src/components/analytics/Analytics.tsx` (trackSEOMetrics, updateConsent)
- `src/components/ui/CookieBanner.tsx` (acceptCookies, declineCookies)
- `src/components/organisms/CalculatorResults/ResultsTable.tsx` (scroll handlers)

---

## 📊 **2. Production Lighthouse Audit**
**Priority**: HIGH - Validate launch readiness
**Time**: ~5 minutes
**Current**: Dev scores good | **Target**: 95+ all categories

**Action:**
```bash
# After deployment, test on live URL
npx lighthouse https://payetax.co.uk --view
```

**What to Check:**
- Performance score (target: 95+)
- Accessibility score (target: 95+)
- Best Practices score (target: 95+)
- SEO score (target: 100)
- Core Web Vitals (LCP <2.5s, FID <100ms, CLS <0.1)

**If Issues Found:**
- Image optimization needed?
- Bundle size issues?
- Accessibility gaps?

---

## 🔗 **3. Backlink Strategy** 🎯 **CRITICAL FOR PAGE 1**
**Priority**: HIGH - Most important ranking factor
**Time**: Ongoing
**Impact**: Backlinks = Domain Authority = Rankings

**Why This Matters:**
- You CANNOT rank on Google page 1 without quality backlinks
- Domain authority is the #1 ranking signal
- Competitors with backlinks will outrank you regardless of content quality

**Immediate Actions:**
1. Submit to UK tax directories:
   - HMRC-approved calculator lists
   - UK financial tools directories
   - Tax calculator comparison sites

2. Content outreach:
   - UK personal finance blogs (MoneySavingExpert, MoneyHelper)
   - Accountant blogs and newsletters
   - LinkedIn posts targeting UK accountants

3. Free PR opportunities:
   - Product Hunt launch
   - Indie Hackers showcase
   - Reddit r/UKPersonalFinance (helpful, not spammy)

4. Strategic partnerships:
   - UK accounting software integrations
   - Financial planning tools
   - Payroll services

**Goal**: 10-20 quality dofollow backlinks in first 3 months

---

## 🏴 **4. Scottish Tax Page Creation**
**Priority**: MEDIUM - SEO opportunity (20% of UK searches)
**Time**: ~30 minutes
**Why**: Dedicated `/scottish-tax` page for regional targeting

**Content Needed:**
- Scottish tax bands explanation (19%, 20%, 21%, 42%, 47%)
- Comparison with England/Wales/NI rates
- Calculator integration specific to Scotland
- Schema markup for regional content
- FAQ specific to Scottish taxpayers

**Template Structure:**
```tsx
// /app/scottish-tax/page.tsx
- Hero section (Scotland-specific)
- Tax rate comparison table
- Embedded calculator (Scotland pre-selected)
- Scottish-specific FAQ
- CTA to main calculator
```

---

## ♿ **4. Accessibility Testing Suite**
**Priority**: MEDIUM - WCAG 2.1 AA compliance
**Time**: ~20 minutes setup, ongoing testing

**Tools to Use:**
- Lighthouse accessibility audit (built-in)
- axe DevTools Chrome extension
- VoiceOver (macOS) testing
- NVDA (Windows) testing

**Test Coverage:**
- ✅ Keyboard navigation (all interactive elements)
- ✅ Screen reader compatibility
- ✅ ARIA labels on complex widgets
- ✅ Focus indicators visible
- ✅ Color contrast ratios (4.5:1+)
- ✅ Skip links functional

**Current Status:**
- ✅ useId() implemented across forms
- 🟡 ARIA labels needed on calculator controls
- 🟡 Keyboard nav testing incomplete
- 🟡 Screen reader testing not done

---

## 📈 **5. AEO Monitoring Setup**
**Priority**: MEDIUM - Measure SEO/AEO success
**Time**: ~10 minutes

**Setup Required:**
- [ ] Brand24 account for AI citation tracking
- [ ] UTM parameters for AI referrals:
  - `?utm_source=chatgpt&utm_medium=ai&utm_campaign=aeo`
  - `?utm_source=perplexity&utm_medium=ai&utm_campaign=aeo`
- [ ] Google Search Console verification
- [ ] Ahrefs/SEMrush tracking (optional)

**Metrics to Track:**
- AI bot visits (from robots.txt allowlist)
- Featured snippet appearances
- Schema markup validation
- Backlink acquisition (target: 5-10 dofollow)

---

## 🧪 **6. Testing Infrastructure Audit**
**Priority**: LOW - Technical debt
**Time**: ~30 minutes

**Current State:**
- 21 test files exist
- Actual coverage unknown
- Some tests reference deleted components

**Actions:**
```bash
npm run test
npm run test:coverage
```

**Cleanup Needed:**
- Remove tests for deleted components
- Update tests for refactored components
- Establish baseline coverage metrics
- Set up coverage reporting

**Target Coverage:**
- Core calculator: 90%+
- UI components: 70%+
- Utilities: 80%+

---

## 🚀 **7. Pre-Launch Checklist**
**Priority**: LOW - Final polish before launch
**Time**: ~1 hour total

**Technical:**
- [ ] Verify all 29 pages build correctly ✅
- [ ] Test feedback system sends emails ✅
- [ ] Test error logging sends emails ✅
- [ ] Verify cookie consent working ✅
- [ ] Check mobile responsive on real devices
- [ ] Test all calculators with edge cases
- [ ] Verify export (CSV/Print) functionality

**Content:**
- [ ] Review all copy for typos
- [ ] Verify Privacy Policy up to date
- [ ] Check all internal links work
- [ ] Verify external links open correctly
- [ ] Test all CTAs functional

**SEO:**
- [ ] Verify schema markup validates (Google Rich Results Test)
- [ ] Check robots.txt allows AI bots ✅
- [ ] Verify sitemap.xml generates correctly
- [ ] Test meta tags on all pages
- [ ] Verify Open Graph images

**Analytics:**
- [ ] GA4 tracking firing correctly
- [ ] Custom events logging properly
- [ ] Conversion goals configured
- [ ] Real-time dashboard working

---

## 📚 **Blog/Content Enhancements** 🔮 **FUTURE CONSIDERATION**

### **1. Table of Contents (TOC) Component**
**Priority**: LOW - UX enhancement for blog posts
**Time**: ~1-2 hours
**Impact**: Improved navigation, SEO/AEO boost, reduced bounce rates

**Analysis:**
Modern MDX blogs commonly feature a compact Table of Contents with anchor links to headings. While not built into Next.js/Contentlayer, it's straightforward to implement as a custom component using established patterns.

**Why Add a TOC:**
- **User Benefits**: Quick jumps to sections (e.g., "Tax Bands" or "Student Loans" in detailed posts)
- **SEO/AEO Boost**: Google and AI crawlers favor structured content; TOCs improve featured snippets and internal linking
- **Accessibility**: With proper ARIA (e.g., `role="navigation"`), helps screen readers
- **Industry Standard**: Sites like freeCodeCamp, Medium, and dev.to use them

**Implementation Approach:**
1. **Extract Headings at Build Time** (in `contentlayer.config.ts`):
   - Add computed field to parse MDX AST and collect `{text, level, id}` for each heading
   - Use `mdast-util-from-markdown` + `unist-util-visit` to traverse AST
   - Zero runtime overhead (runs during static generation)

2. **Add Rehype Plugins** (in `next.config.ts`):
   - `rehype-slug`: Auto-adds id attributes to headings (e.g., `id="tax-bands"`)
   - Optional: `rehype-toc` for full auto-generation

3. **Build TOC Component** (`src/components/blog/TableOfContents.tsx`):
   - Sticky/floating sidebar on desktop, collapsible accordion on mobile
   - Active section highlighting via `IntersectionObserver` (performant, no heavy deps)
   - Nested list with indentation for heading hierarchy (h2, h3, h4)
   - Match existing glassmorphism/card styling

4. **Integrate into Blog Layout**:
   - Pass `toc` from post data to sidebar in `app/blog/[slug]/page.tsx`
   - Grid layout: main content + TOC sidebar (hidden on mobile unless expanded)

**Example Code Structure:**
```ts
// contentlayer.config.ts - Add computed field
computedFields: {
  toc: {
    type: 'json',
    resolve: (post) => extractToc(post.body.raw), // Parse raw markdown
  },
}

// TableOfContents.tsx - Component with active highlighting
const [activeId, setActiveId] = useState('');

useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) setActiveId(e.target.id);
    }),
    { rootMargin: '0% 0% -80% 0%' }
  );
  // ... observe headings
}, [toc]);
```

**Libraries/Tools:**
- `mdast-util-from-markdown`: Parse markdown to AST
- `unist-util-visit`: Traverse AST nodes
- `rehype-slug`: Auto-add IDs to headings
- No heavy dependencies needed—custom build preferred for control

**Edge Cases to Handle:**
- Skip TOC if fewer than 3 headings
- Handle deep nesting (h2→h3→h4)
- Prevent CLS from sticky positioning
- Keyboard navigation support

**Best Practice Match:**
This pattern is used by 80%+ of Next.js MDX blogs. Your Contentlayer setup is well-positioned for this—extend existing computed fields to extract headings at build time.

**Next Steps When Implementing:**
1. Create `src/lib/extract-toc.ts` utility
2. Update `contentlayer.config.ts` with `toc` computed field
3. Build `TableOfContents.tsx` component with IntersectionObserver
4. Add to blog post layout with responsive grid
5. Test anchors, keyboard nav, accessibility
6. Add to TESTING.md test coverage plan (if prioritized)

**References:**
- freeCodeCamp, Prismic, Medium tutorials use similar patterns
- Next.js docs recommend custom TOC for MDX blogs
- Contentlayer docs show computed field examples

---

## 📝 Recommended Session Plan

**Option A: Analytics First (Recommended)**
1. GA4 setup (15 mins)
2. Lighthouse audit (10 mins)
3. Address any critical issues found
4. Test GA4 tracking with real usage

**Option B: Content Expansion**
1. Scottish tax page creation (30 mins)
2. GA4 setup (15 mins)
3. AEO monitoring setup (10 mins)

**Option C: Quality Assurance**
1. Lighthouse audit (10 mins)
2. Accessibility testing (20 mins)
3. Fix critical issues found
4. Testing infrastructure audit (30 mins)

---

## ✅ What We've Accomplished (Sprint 1-4)

**Sprint 1 - Cleanup:**
- 19 unused files deleted
- 8 linting errors fixed
- ResultsTable refactored (408→332 lines)
- Biome rules enhanced to 10/10

**Sprint 2 - Component Consistency:**
- shadcn Button migration complete
- TechShowcase simplified (233→43 lines)
- 11 packages removed
- Component audit (all 47 verified)

**Sprint 3 & 4 - SEO & Feedback:**
- AEO strategy document created
- 3 schema types implemented
- CalculatorContent component added
- Feedback system rewritten (email-based)
- Cookie banner redesigned
- PWA simplified (browser default)

**Current State:**
- Bundle: 286kB ✅ (<300kB target)
- Zero errors: TypeScript ✅ | Linting ✅ | Build ✅
- All systems operational ✅

---

## 🎯 Recommendation

**Start with GA4 setup** - It's quick (15 mins), high-value, and sets foundation for measuring all future work. Then run Lighthouse audit to identify any launch blockers.

Want to proceed with GA4 implementation?
