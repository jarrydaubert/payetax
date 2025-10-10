# Changelog

All notable changes to PayeTax will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.3] - 2025-10-10

### 🎨 Improved

#### Calculator Layout & UX
- **Container Max-Width** - Increased from 1280px to 1600px for better desktop utilization
  - All 7 periods now visible on 1920px screens without scrolling
  - Grid layout optimized: 380px sidebar + 1fr results area
  - File: `src/components/organisms/CalculatorContainer.tsx:12`

- **Results Table Expansion** - Table now dynamically expands based on selected periods
  - Removed width constraint to allow natural growth
  - Better space utilization on all screen sizes
  - File: `src/components/organisms/CalculatorResults/ResultsTable.tsx:258`

#### Scroll Indicators & Mobile Experience
- **Scroll Indicator Detection** - Fixed to trigger on period selection changes
  - Added `visiblePeriods` to useEffect dependencies
  - Indicators now appear/disappear correctly when toggling periods
  - Enhanced with 5px scroll threshold for smoother transitions
  - File: `src/components/organisms/CalculatorResults/ResultsTable.tsx:93`

- **Mobile Swipe Hint** - Added visual indicator for horizontal scrolling
  - Shows "👈 Swipe to see all periods" on mobile when overflow detected
  - Hidden on desktop (md:hidden class)
  - File: `src/components/organisms/CalculatorResults/ResultsTable.tsx:318-322`

- **Responsive Sizing** - Updated scroll indicators for better mobile experience
  - Changed from w-12 to w-16 (mobile) and md:w-20 (desktop)
  - Icon sizing: size-5 (mobile) to md:size-6 (desktop)
  - File: `src/components/atoms/ScrollIndicator.tsx:26`

### 🐛 Fixed

#### BMC Widget (Critical Fixes)
- **CSP Wildcard Domains** - Added `https://*.buymeacoffee.com` to all CSP directives
  - Fixed blank modal issue where iframe content was blocked
  - Applied to: script-src, style-src, connect-src, frame-src, child-src
  - File: `next.config.ts:165`

- **Sentry Replay Blocking BMC** - Disabled Sentry Replay in development
  - `blockAllMedia: true` was blocking BMC widget modal iframe
  - Replay now only runs in production with BMC iframe exception
  - Added `ignore: ['iframe[src*="buymeacoffee"]']` rule
  - Files: `instrumentation-client.ts:16-30`

- **Sentry Migration** - Moved client config to Turbopack-compatible location
  - Renamed: `sentry.client.config.ts` → `instrumentation-client.ts`
  - Added `onRouterTransitionStart` hook for navigation instrumentation
  - Fixes Next.js deprecation warning for Turbopack
  - Files: `instrumentation.ts:13-15`, `instrumentation-client.ts`

#### Service Worker Development Issues
- **SW Disabled in Dev** - Service Worker now skips registration on localhost
  - Prevents "Failed to fetch" errors during hot-reload
  - Avoids cache conflicts with Next.js dev server
  - Still works normally in production
  - File: `public/register-sw.js:11-15`

#### Vercel Deployment Configuration
- **Ignored Build Step** - Fixed inverted production build logic
  - Changed from: `if production then skip` (WRONG)
  - To: Automatic builds on all commits (CORRECT)
  - Deployments now go directly to production instead of staging
  - Configuration: Vercel Dashboard → Settings → General

### 🧪 Testing

#### Comprehensive Test Coverage (100% Pass Rate)
- **E2E Scroll Indicator Tests** - 14 tests across all viewports
  - Desktop (1920x1080): 3 tests validating 1600px fix
  - Laptop (1366x768): 2 tests for horizontal scroll
  - Mobile (375x667): 3 tests for touch scrolling and swipe hints
  - Scroll position tracking: 2 tests for indicator state changes
  - Container width validation: 2 tests
  - File: `e2e/scroll-indicators.spec.ts` (NEW)

- **Unit Tests for Scroll Components** - 16 tests total
  - ScrollIndicator: 8 tests covering rendering, styling, animations
  - ResultsTable: 8 tests for scroll behavior and period changes
  - Fixed test assertions to match current implementation
  - Files: `src/components/atoms/__tests__/ScrollIndicator.test.tsx`, `src/components/organisms/CalculatorResults/__tests__/ResultsTable.test.tsx`

### 📚 Documentation

- **SBT System** - Added Scenario-Based Testing documentation
  - Comprehensive testing approach for all scenarios
  - Cross-device, cross-browser coverage strategy
  - False-positive prevention techniques
  - File: `docs/SBT_system.md` (NEW)

### 📊 Metrics

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| **Container Width** | 1280px | 1600px | +320px (+25%) |
| **E2E Tests** | 0 scroll tests | 14 scroll tests | +14 (NEW) |
| **Unit Tests** | 1,104 | 1,120 | +16 (+1.4%) |
| **BMC Widget** | ❌ Broken | ✅ Working | Fixed |
| **Scroll Indicators** | ❌ Not working | ✅ Working | Fixed |

### 🔧 Technical Improvements

- Fixed all Biome linting issues (noUselessConstructor, noExplicitAny)
- Added IntersectionObserver mock for scroll indicator tests
- Updated test snapshots for responsive sizing changes
- Verified production build passes successfully

### 🚀 Deployment

- **Build Status**: All tests passing ✅
- **Bundle Size**: 420 kB vendors chunk (stable)
- **Production URL**: https://payetax.co.uk
- **Vercel**: Auto-deploy on main branch ✅

---

## [1.1.1] - 2025-10-09

### 🐛 Fixed

#### Production Hotfixes (Post v1.1.0 Deployment)
- **CSP Worker-Src Directive** - Added `blob:` to `worker-src` CSP directive to allow Sentry session replay workers
  - Fixes: "Refused to create a worker from blob:" console error
  - Impact: Sentry session replay now fully functional in production
  - File: `next.config.ts:164`

- **SVG Element Type Error** - Fixed `className.includes is not a function` error on SVG elements
  - Changed: `target.className?.includes('bmc')` → `target.classList?.contains('bmc')`
  - Fixes: TypeError when clicking on SVG elements in Buy Me a Coffee handler
  - Impact: No more console errors on SVG interactions
  - File: `src/app/layout.tsx:221`

- **Performance Optimization** - Replaced `delete` operator with undefined assignments in Sentry PII scrubbing
  - Changed: `delete sanitized.email` → `sanitized.email = undefined`
  - Impact: Better performance, satisfies Biome linter rules
  - File: `sentry.client.config.ts:69-72`

### 📊 Deployment Status

- **Deployed**: October 9, 2025
- **Environment Variables Added to Vercel**:
  - `RESEND_API_KEY` (feedback emails working in production)
  - `SENTRY_AUTH_TOKEN` (source maps uploaded successfully)
- **Production Tests**: All passing ✅
- **Console Errors**: Zero critical errors ✅

---

## [1.1.0] - 2025-10-09

### 🚀 Added

#### Error Monitoring & Observability
- **Sentry Integration** - Production error monitoring with source map support
  - Client-side error tracking with session replay
  - Server-side error tracking for API routes
  - Edge runtime support for future features
  - Global error boundary with Sentry integration
  - Privacy-safe configuration (PII scrubbing, localhost filtering)
  - Test page at `/sentry-test` with 6 error scenarios
  - CSP headers updated to allow Sentry domains
  - Source map uploads configured for readable stack traces
  - Files: `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `instrumentation.ts`, `.sentryclirc`

#### Test Coverage Improvements
- **100% UI Folder Coverage** - Added 100 new comprehensive tests
  - Analytics component tests (4 tests)
  - CookieBanner tests (6 tests)
  - PWAInstallPrompt tests (5 tests)
  - SustainabilityBadge tests (6 tests)
  - StructuredData tests (8 tests)
  - Tooltip tests (7 tests)
  - Total: 1,104 tests passing (was 1,004)
  - Coverage improved: 14.77% → 42.47%

#### Component Tests (Atoms, Molecules, Organisms)
- NumberInput component tests (7 tests)
- ScrollIndicator tests (3 tests)
- TaxYearSelect tests (5 tests)
- FeedbackDialog tests (6 tests)
- Footer tests (7 tests)
- ResultCard tests (6 tests)
- ResultTableRow tests (5 tests)
- SimpleNavbar tests (7 tests)
- CalculatorInputs organism tests (5 tests)
- CalculatorResults tests (6 tests)
- All organism tests (4 tests)

#### Documentation
- **CODE_AUDIT_TRACKER.md** - Single source of truth for all code audits
- **SAGE_IMPLEMENTATION_PLAN.md** - Complete blueprint for AI explainer feature (10-12 hours, zero cost)
- **SENTRY_SETUP.md** - Comprehensive Sentry configuration guide
- **SENTRY_WIZARD_COMPARISON.md** - Manual vs wizard setup comparison

### 🔄 Changed

#### Documentation Consolidation (14 → 10 files, -29%)
- Merged `COMPONENT_ARCHITECTURE_ANALYSIS.md` → `CODE_AUDIT_TRACKER.md`
- Merged `UNUSED_COMPONENTS.md` → `CODE_AUDIT_TRACKER.md`
- Updated `README.md` with current state (test counts, file structure)
- Updated `NEXT_PRIORITIES.md` with new priorities:
  - Sage AI Explainer (innovation edge)
  - Sentry error monitoring (reliability)
  - Linear API audit (workflow)
  - Blog optimization with Grammarly (content quality)

#### Global Error Boundary Enhancement
- Added Sentry integration to existing `global-error.tsx`
- Now sends errors to both Sentry dashboard AND email
- Enhanced error context with tags and error IDs

#### Environment Configuration
- Added Sentry environment variables to `.env.template`:
  - `NEXT_PUBLIC_SENTRY_DSN`
  - `SENTRY_AUTH_TOKEN`
  - `SENTRY_ORG`
  - `SENTRY_PROJECT`

#### Next.js Configuration
- Wrapped config with `withSentryConfig` for error monitoring
- Updated CSP headers to allow `https://*.ingest.sentry.io`
- Configured source map uploads with tunnel route `/monitoring`
- Removed deprecated `instrumentationHook` flag (now default in Next.js 15.5+)

### 🗑️ Removed

#### Unused Components (Code Audit Cleanup)
- `src/components/atoms/GlobalError.tsx` - Moved to `app/global-error.tsx`
- `src/components/molecules/CurrencyInput.tsx` - Replaced with NumberInput
- `src/components/ui/Typography.tsx` - Unused (0 imports)
- `src/components/ui/badge.tsx` - Unused (shadcn component, no usage)
- `src/components/ui/form.tsx` - Unused (shadcn component, no usage)

#### Historical Documentation
- `docs/DEPLOYMENT.md` - Outdated deployment info
- `docs/DEPLOYMENT_CHECKLIST.md` - Outdated checklist
- `docs/DOMAIN_SETUP_GUIDE.md` - Domain migrated, no longer needed
- `docs/SCRIPT_GUIDE.md` - Outdated script reference
- `docs/TEST_QUALITY_AUDIT.md` - Historical audit (Oct 8), issues fixed
- `docs/TEST_QUALITY_FIXES.md` - Historical fixes (Oct 8), changes applied
- `docs/COMPONENT_ARCHITECTURE_ANALYSIS.md` - Consolidated into tracker
- `docs/UNUSED_COMPONENTS.md` - Consolidated into tracker

Total removed: -1,311 lines of historical/unused code and docs

### 🐛 Fixed

#### Test Quality
- Fixed PeriodSelectorCard test (checkbox click handler)
- Updated all E2E tests for better stability
- Removed false positives and bad test practices
- Test quality improved: C+ → A-

#### TypeScript Strict Mode
- Fixed unused parameter warnings in Sentry config (`hint` → `_hint`)
- Fixed type errors in form data sanitization (added type assertion)
- All builds passing with zero TypeScript errors

### 📊 Metrics

**Before (v0.1.0) → After (v0.2.0):**

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| **Total Tests** | 1,004 | 1,104 | +100 (+10%) |
| **Test Coverage** | 14.77% | 42.47% | +27.7pp (↑188%) |
| **UI Coverage** | ~50% | 100% | +50pp (↑100%) |
| **Docs Files** | 14 | 10 | -4 (-29%) |
| **Unused Components** | 5 | 0 | -5 (-100%) |
| **Bundle Size** | 504 kB | 504 kB | 0 (stable) |

**Code Quality:**
- Zero TypeScript errors ✅
- Zero linting errors ✅
- Build successful ✅
- Test quality: A- ✅

### 🔐 Security & Privacy

- Sentry configured with privacy-first approach:
  - PII scrubbing (email, name, phone, address)
  - Localhost errors filtered (dev only)
  - Query strings removed from URLs
  - Form data sanitized before sending
- All sensitive tokens in `.sentryclirc` (ignored by git)

### 📝 Future Features (Documented, Not Implemented)

- **Sage AI Explainer** - 10-12 hour implementation plan ready
  - Local-first with Ollama + Llama 3.1
  - Zero cost (Groq free tier for production)
  - YMYL-safe with strict validation
  - Reuses existing components (SustainabilityBadge pattern)

---

## [1.0.0] - 2025-10-03

### Initial Production Release
- Complete UK PAYE tax calculator
- Scottish tax rates support
- Student loan calculations (all plans)
- National Insurance calculations
- Blog system with 7 articles
- Mobile-responsive design
- PWA support
- SEO optimized with schema markup
- Accessibility compliant (WCAG 2.1 AA)
- React 19 + Next.js 15.5
- Tailwind CSS v4
- 1,004 tests passing
- Linear integration for project management

---

## Version Comparison: v1.0.0 → v1.1.0

### Summary of Changes

**Major Additions:**
1. ✅ **Sentry Error Monitoring** - Production observability
2. ✅ **100 New Tests** - UI folder at 100% coverage
3. ✅ **Code Cleanup** - 5 unused components removed
4. ✅ **Docs Consolidation** - 29% reduction, better organization

**Impact:**
- **Reliability**: Can now catch production errors before users report them
- **Quality**: Test coverage nearly tripled (14% → 42%)
- **Maintainability**: Cleaner codebase, consolidated documentation
- **Future-Ready**: AI explainer implementation plan ready to execute

**Breaking Changes:** None
**Migration Required:** No

**Recommended Actions:**
1. Add Sentry DSN to Vercel environment variables
2. Generate Sentry auth token for source map uploads
3. Test error monitoring at `/sentry-test`
4. Review new priorities in `NEXT_PRIORITIES.md`

---

**Next Planned Release: v1.2.0 or v2.0.0 (with Sage AI)**
- Sage AI Explainer (TaxInsight feature)
- Blog optimization with Grammarly
- Linear API deep integration
- Performance optimizations
