# 📋 PayeTax - Consolidated TODO List

**Last Updated**: January 17, 2026  
**Purpose**: Single source of truth for all outstanding work  
**Status**: Active - consolidates all previous planning docs

---

## 🎯 Priority System

- 🔴 **CRITICAL** - Blocking issues, security, must do now
- 🟠 **HIGH** - Important features/fixes, do this week
- 🟡 **MEDIUM** - Should do, schedule this month  
- 🟢 **LOW** - Nice to have, backlog

---

## 🔴 CRITICAL PRIORITY

### 1. SEMrush Backlink Opportunities (NEW - Jan 17, 2026)
**Source**: Fresh SEMrush exports analysis  
**Priority**: 🔴 CRITICAL  
**Time**: 2-4 hours over next week  
**Status**: ❌ Not Started

**Issue**: Need backlinks to rank on Page 1 - this is THE most important SEO factor

**High-Priority Targets**:
1. **AccountingWeb** (DA 41) - Follow up on SME Director Tools proposal
2. **MoneySavingExpert Forums** (DA 77) - Join and contribute helpfully
3. **Tax Directories** - Submit to ICAEW, tax.org.uk, ICAS

**Quick Wins**:
- Submit to 3 tax professional directories (1 hour)
- Follow up AccountingWeb email (30 min)
- Join MSE forums, make first helpful post (1 hour)

**Expected Impact**: 5-10 quality backlinks in next month

**Reference**: See `docs/planning/SEMRUSH_ANALYSIS_2025-01-17.md`

---

### 2. Fix Failing Tests
**Source**: Test Coverage Audit  
**Priority**: 🔴 CRITICAL  
**Time**: 30 minutes  
**Status**: ❌ Not Started

**Issue**: 2 API route tests failing due to environment variable handling

**Files**:
- `src/app/api/feedback/__tests__/route.test.ts:226`
- `src/app/api/error-log/__tests__/route.test.ts:131`

**Action**:
```typescript
beforeEach(() => {
  delete process.env.RESEND_API_KEY;
  jest.resetModules();
});
```

---

### 2. Add Rate Limiting to API Routes
**Source**: Security Audit  
**Priority**: 🔴 CRITICAL  
**Time**: 2-3 hours  
**Status**: ❌ Not Started

**Issue**: No rate limiting on `/api/feedback` and `/api/error-log` - vulnerable to abuse

**Action**:
```typescript
// Install: npm install @upstash/ratelimit @upstash/redis
// Or use simple in-memory LRU cache

// Create src/lib/rateLimit.ts
import { LRUCache } from 'lru-cache';

const rateLimit = new LRUCache({
  max: 500,
  ttl: 60000, // 1 minute
});

export function checkRateLimit(ip: string): boolean {
  const requests = rateLimit.get(ip) || 0;
  if (requests >= 10) return false; // 10 requests/min

  rateLimit.set(ip, requests + 1);
  return true;
}
```

**Files to Update**:
- `src/app/api/feedback/route.ts`
- `src/app/api/error-log/route.ts`
- Create `src/lib/rateLimit.ts`

---

### 3. Fix Broken External Link in Blog
**Source**: SEMrush Audit  
**Priority**: 🔴 CRITICAL  
**Time**: 10 minutes  
**Status**: ❌ Not Started

**Issue**: `/blog/higher-rate-taxpayer-guide-uk-2025` has broken external link

**Action**: Find and fix the broken HMRC URL in the blog post

**Files to Check**:
- `content/blog/higher-rate-taxpayer-guide-uk-2025.mdx`

---

## 🟠 HIGH PRIORITY

### 4. Set Secret Detection to Blocking
**Source**: CI/CD Pipeline Audit  
**Priority**: 🟠 HIGH  
**Time**: 5 minutes  
**Status**: ❌ Not Started

**Issue**: Secret detection allows failures (won't block commits with secrets)

**Action**:
```yaml
# Update .gitlab-ci.yml line 30
secret_detection:
  allow_failure: false  # Change from true
```

**Files**: `.gitlab-ci.yml`

---

### 5. Add Pre-Push Hook
**Source**: CI/CD Pipeline Audit  
**Priority**: 🟠 HIGH  
**Time**: 5 minutes  
**Status**: ❌ Not Started

**Issue**: No pre-push hook to run full test suite before pushing

**Action**:
```bash
# Create .husky/pre-push
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🧪 Running tests before push..."
npm run test:quick || {
  echo "❌ Tests failed. Fix before pushing."
  exit 1
}
```

**Files**: Create `.husky/pre-push`

---

### 6. Increase Touch Target Sizes (Accessibility)
**Source**: Accessibility Audit  
**Priority**: 🟠 HIGH  
**Time**: 2 hours  
**Status**: ❌ Not Started

**Issue**: Touch targets are 36-42px, below WCAG 2.5.5 standard of 44px

**Action**: Update all interactive elements to minimum 44x44px

**Files**: All button/link components throughout app

---

### 7. Add Autocomplete Attributes to Forms
**Source**: Accessibility Audit  
**Priority**: 🟠 HIGH  
**Time**: 1 hour  
**Status**: ❌ Not Started

**Issue**: Form inputs missing `autocomplete` attributes (WCAG 1.3.5)

**Action**:
```tsx
<Input
  type="email"
  autocomplete="email"  // Add this
/>
```

**Files**:
- `src/components/molecules/FeedbackDialog.tsx`
- Any forms with email/name inputs

---

### 8. Add Icons to Color-Only Indicators
**Source**: Accessibility Audit  
**Priority**: 🟠 HIGH  
**Time**: 2 hours  
**Status**: ❌ Not Started

**Issue**: Error/success states rely on color alone (WCAG 1.4.1)

**Action**:
```tsx
import { AlertCircle, CheckCircle } from 'lucide-react';

<span className="text-red-600">
  <AlertCircle className="inline h-4 w-4" /> Error message
</span>
```

**Files**:
- `src/components/molecules/ResultTableRow.tsx`
- All error/success messages

---

### 9. Add Error Announcements for Screen Readers
**Source**: Accessibility Audit  
**Priority**: 🟠 HIGH  
**Time**: 1 hour  
**Status**: ❌ Not Started

**Issue**: Form errors not announced to screen readers (WCAG 3.3.1)

**Action**:
```tsx
<div role="alert" aria-live="polite" aria-atomic="true">
  {error && <p>{error}</p>}
</div>
```

**Files**:
- `src/components/molecules/FeedbackDialog.tsx`
- Form components with validation

---

### 10. Add CSRF Protection to API Routes
**Source**: Security Audit  
**Priority**: 🟠 HIGH  
**Time**: 2-3 hours  
**Status**: ❌ Not Started

**Issue**: No CSRF tokens on API routes

**Action**:
```typescript
// Install: npm install csrf
// Add CSRF middleware to API routes
import { Csrf } from 'csrf';
const csrf = new Csrf();
```

**Files**:
- `src/app/api/feedback/route.ts`
- `src/app/api/error-log/route.ts`

---

## 🟡 MEDIUM PRIORITY

### 11. TaxInsight Sage - AI Explainer Widget
**Source**: NEXT_PRIORITIES.md  
**Priority**: 🟡 MEDIUM  
**Time**: 9-13 hours (2 days)  
**Status**: ❌ Not Started

**What**: Floating chat widget that explains UK tax concepts using Ollama/Groq

**Why**: 20-30% longer session times, unique differentiator, zero cost

**Implementation**: See `docs/planning/SAGE_IMPLEMENTATION_PLAN.md` for full details

**Phases**:
1. Install Ollama locally (30-45 min)
2. Build SageWidget component (2-3 hours)
3. Add safety validation (3-4 hours)
4. Deploy with Groq fallback (2-3 hours)

**Decision Point**: Wait for user approval before starting

---

### 12. Add Blog System Tests
**Source**: Test Coverage Audit  
**Priority**: 🟡 MEDIUM  
**Time**: 4-6 hours  
**Status**: ❌ Not Started

**Issue**: Blog system under-tested (0-28% coverage)

**Files to Test**:
- `src/lib/blog.ts` (28.87% → 80%+)
- `src/app/blog/BlogPageClient.tsx` (0% → 70%+)

**Tests Needed**:
- Related posts algorithm
- Search functionality
- Pagination logic
- Category filtering
- Client-side state management

---

### 13. Improve Store Function Coverage
**Source**: Test Coverage Audit  
**Priority**: 🟡 MEDIUM  
**Time**: 2-3 hours  
**Status**: ❌ Not Started

**Issue**: calculatorStore.ts has 31% function coverage (18 uncovered functions)

**Action**: Add integration tests for store actions, persistence logic

**Files**: `src/store/__tests__/calculatorStore.test.ts`

---

### 14. Optimize Bundle Size
**Source**: Performance Audit  
**Priority**: 🟡 MEDIUM  
**Time**: 3-4 hours  
**Status**: ❌ Not Started

**Issue**: 281 KB unused JavaScript (71% waste), TBT 590ms

**Actions**:
1. Code splitting with dynamic imports
2. Tree-shake unused exports
3. Defer third-party scripts (GA4/Sentry)
4. Remove unused dependencies

**Target**: Reduce TBT from 590ms → <300ms

---

### 15. Harden CSP (Content Security Policy)
**Source**: Security Audit  
**Priority**: 🟡 MEDIUM  
**Time**: 1-2 hours  
**Status**: ❌ Not Started

**Issue**: CSP allows 'unsafe-inline' and 'unsafe-eval'

**Action**: Remove unsafe directives, use nonces/hashes instead

**Files**: `next.config.ts` (CSP headers)

---

### 16. Add Comprehensive Input Validation
**Source**: Security Audit  
**Priority**: 🟡 MEDIUM  
**Time**: 1-2 hours  
**Status**: ❌ Not Started

**Issue**: Limited input validation on calculator fields

**Action**:
```typescript
// Use Zod schemas
const salarySchema = z.number().min(0).max(10_000_000);
const taxCodeSchema = z.string().regex(/^[0-9]{3,4}[LMPKTY]$/);
```

**Files**: `src/store/calculatorStore.ts`

---

### 17. Set Up Sentry Error Monitoring
**Source**: NEXT_PRIORITIES.md  
**Priority**: 🟡 MEDIUM  
**Time**: 1-2 hours  
**Status**: ❌ Not Started (if not already done)

**Action**:
1. Create Sentry account (free tier: 5K events/month)
2. Install: `npm install @sentry/nextjs`
3. Run: `npx @sentry/wizard@latest -i nextjs`
4. Add DSN to `.env.local`
5. Test with intentional error

**Files**: `sentry.client.config.ts`, `sentry.server.config.ts`

---

### 18. Audit Linear API Usage
**Source**: NEXT_PRIORITIES.md  
**Priority**: 🟡 MEDIUM  
**Time**: 30 minutes  
**Status**: ❌ Not Started

**Action**:
- Login to linear.app → Settings → API
- Check free tier limits (1,500 req/hour)
- Verify current usage
- Document findings in LINEAR_SETUP.md

---

## 🟢 LOW PRIORITY

### 19. Update CI Coverage Thresholds
**Source**: Test Coverage Audit  
**Priority**: 🟢 LOW  
**Time**: 5 minutes  
**Status**: ❌ Not Started

**Issue**: Coverage thresholds too low (90% coverage vs 80% threshold)

**Action**:
```javascript
// jest.config.js
coverageThreshold: {
  global: {
    statements: 85,  // Increase from 80
    branches: 80,    // Increase from 75
    functions: 75,   // Increase from 70
    lines: 85,       // Increase from 80
  }
}
```

---

### 20. Add Keyboard Shortcuts Documentation
**Source**: Accessibility Audit  
**Priority**: 🟢 LOW  
**Time**: 1 hour  
**Status**: ❌ Not Started

**Action**: Document Tab navigation, add help modal with shortcuts list

---

### 21. Add Automated A11y Testing
**Source**: Accessibility Audit  
**Priority**: 🟢 LOW  
**Time**: 2 hours  
**Status**: ❌ Not Started

**Action**:
```bash
npm install --save-dev jest-axe

# Add to component tests
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

test('no a11y violations', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

### 22. Add Pipeline Notifications
**Source**: CI/CD Pipeline Audit  
**Priority**: 🟢 LOW  
**Time**: 15 minutes  
**Status**: ❌ Not Started

**Action**: Configure GitLab → Integrations → Slack for pipeline failures

---

### 23. Scottish Tax Page Creation
**Source**: NEXT_PRIORITIES.md  
**Priority**: 🟢 LOW  
**Time**: 30 minutes  
**Status**: ❌ Not Started

**What**: Dedicated `/scottish-tax` page for regional targeting (20% of UK searches)

**Content**:
- Scottish tax bands (19%, 20%, 21%, 42%, 47%)
- Comparison with England/Wales/NI
- Embedded calculator (Scotland pre-selected)
- Scottish-specific FAQ

---

### 24. Blog Optimization & Grammarly
**Source**: NEXT_PRIORITIES.md  
**Priority**: 🟢 LOW  
**Time**: 3-4 hours planning + ongoing  
**Status**: ❌ Not Started

**Actions**:
- Install Grammarly browser extension
- Create 2-week editorial calendar
- Plan next 10 blog topics
- Add quality checklist to BLOG_GUIDE.md

---

### 25. Table of Contents Component for Blog
**Source**: NEXT_PRIORITIES.md  
**Priority**: 🟢 LOW  
**Time**: 1-2 hours  
**Status**: ❌ Not Started

**What**: Add TOC to blog posts with anchor links (like freeCodeCamp)

**Benefits**: Better navigation, SEO boost, accessibility

---

### 26. Mobile Experience Audit
**Source**: AUDIT_GAPS.md  
**Priority**: 🟢 LOW  
**Time**: 4-6 hours  
**Status**: 30% Complete

**Scope**: Test on real iOS/Android devices, not just Playwright

---

### 27. Browser Compatibility Audit
**Source**: AUDIT_GAPS.md  
**Priority**: 🟢 LOW  
**Time**: 3-4 hours  
**Status**: 40% Complete

**Scope**: Test on real Safari, Edge, Chrome (not just Playwright)

---

### 28. Load Testing
**Source**: AUDIT_GAPS.md  
**Priority**: 🟢 LOW  
**Time**: 3-4 hours  
**Status**: Not Started

**Scope**: Test concurrent user capacity, serverless cold starts

---

## 📊 Quick Wins (< 30 min each)

1. ✅ Fix broken external link (10 min)
2. ✅ Set secret detection to blocking (5 min)
3. ✅ Add pre-push hook (5 min)
4. ✅ Update CI coverage thresholds (5 min)
5. ✅ Add pipeline notifications (15 min)

**Total**: 5 items, ~40 minutes

---

## 🎯 Recommended Execution Order

### Week 1: Critical Fixes
1. Fix failing tests (30 min)
2. Fix broken blog link (10 min)
3. Add rate limiting (2-3 hrs)
4. Set secret detection to blocking (5 min)
5. Add pre-push hook (5 min)

**Total**: ~4 hours

---

### Week 2: Security & Accessibility
6. Add CSRF protection (2-3 hrs)
7. Increase touch targets (2 hrs)
8. Add autocomplete attributes (1 hr)
9. Add icons to color indicators (2 hrs)
10. Add error announcements (1 hr)

**Total**: ~10 hours

---

### Week 3: Testing & Performance
11. Add blog system tests (4-6 hrs)
12. Improve store coverage (2-3 hrs)
13. Optimize bundle size (3-4 hrs)

**Total**: ~12 hours

---

### Week 4: Optional Enhancements
14. TaxInsight Sage widget (9-13 hrs) - **if approved**
15. Sentry setup (1-2 hrs)
16. Linear audit (30 min)
17. Harden CSP (1-2 hrs)

**Total**: ~12-17 hours

---

## 📈 Progress Tracking

### Completed Recently ✅
- ✅ v1.3.0 release (accessibility fixes, accuracy improvements)
- ✅ Color contrast WCAG AA compliance
- ✅ Marriage allowance logic fixed
- ✅ Hreflang conflicts resolved
- ✅ 160+ tests added

---

### In Progress 🚧
- None currently

---

### Blocked ⛔
- None currently

---

## 📝 Notes

- **Test First**: Always run tests before making changes
- **Git Status**: Check `git status` before committing
- **Commit Often**: Small, focused commits
- **Document Decisions**: Update relevant docs when changing architecture

---

## 🗑️ Docs to Archive After Migration

Once all tasks are migrated to this TODO.md, these docs can be moved to `docs/archived/`:

1. ✅ `docs/planning/NEXT_PRIORITIES.md` → Archive after tasks migrated
2. ✅ `docs/planning/SEMRUSH_NEXT_ACTIONS.md` → Archive after link fixed
3. ✅ `docs/audits/CONSOLIDATED_ACTION_ITEMS.md` → Archive after tasks migrated
4. ✅ `docs/audits/AUDIT_GAPS.md` → Archive after tasks migrated
5. ⏳ `docs/planning/SAGE_IMPLEMENTATION_PLAN.md` → Keep until Sage approved/built
6. ⏳ `docs/planning/SEO_STRATEGY.md` → Keep as reference (ongoing strategy)
7. ✅ `docs/proposals/SME_DIRECTOR_TOOLS_PROPOSAL.md` → Keep (external facing)

---

**Last Updated**: January 17, 2026  
**Total Outstanding Tasks**: 28  
**Estimated Total Time**: ~70 hours  
**Next Review**: Weekly on Mondays
